import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { drizzleConnect } from 'drizzle-react';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router';
import { networkDetails } from '../lib/network';
import { getEventAbi, getEventAbiInputs } from '../lib/eth';
import { Message } from './ui';
import { userExists } from '../redux/selectors';
import { FIAT_CALL_REQUEST, ADD_ASSET, REMOVE_ASSET } from "../redux/action-types";
import { FROM_BLOCK, ADDRESS } from '../constants';
import Balance from './balance';
import ABI from '../../contracts/Escrow.abi.json';


class Main extends Component {
    constructor(props, context) {
        super(props);
        this.web3 = context.drizzle.web3;
        this.contracts = context.drizzle.contracts;
    }

    state = {
        pastLogsLoading: true,
        domains: {}, // contains relevant dn:dataKey attributes,
        dnFromPath: null // dn from path when on /domain page
    }

    async componentDidMount() {

        console.log('START componentDidMount Main!!!!!!!!!!!', this.props, this.context);

        const { onRequestFiat, account } = this.props;
        const { Escrow } = this.context.drizzle.contracts;

        // get domain from path
        const m = location.pathname.match(/^\/domain\/(.+)\s*$/);
        if(m && m[1]) {
            this.setState({ dnFromPath: m[1] });
        }

        // get fiat conversion rate
        onRequestFiat('USD');

        // Get past logs, uses the metamask provider
        await this.getPastLogs();

        // Prefetch essential data, to be retrieved via selectors
        Escrow.methods.myBalance.cacheCall();
        Escrow.methods.handling_permillage.cacheCall();
        Escrow.methods.whois.cacheCall(account);

        console.log('END componentDidMount Main!!!!!!!!!!!', this.props, this.context);
    }

    getPastLogs = async () => {
        const web3 = this.web3;
        const { account } = this.props;

        // Get the topic0 for the Offered event
        // const accountTopic = web3.utils.padLeft(account, 64);
        // const offeredEventABI = getEventAbi(ABI, 'Offered');
        // console.log(offeredEventABI);
        // const offeredTopic0 = web3.eth.abi.encodeEventSignature(offeredEventABI);
        // console.log(offeredTopic0, accountTopic);

        // Get the topic0 for the Bought event
        // const boughtEventABI = getEventAbi(ABI, 'Bought');
        // console.log(boughtEventABI);
        // const boughtTopic0 = web3.eth.abi.encodeEventSignature(boughtTopic0);

        // Keep track of last processed block
        let lastRelevantBlock = FROM_BLOCK;

        // Get all relevant assets through Involve event
        const involveEventABI = getEventAbi(ABI, 'Involve');
        const accountTopic = web3.utils.padLeft(account, 64).toLowerCase();
        const involveTopic0 = web3.eth.abi.encodeEventSignature(involveEventABI);

        // try {
        // Get past logs for Involve(*, account)
        const involvedEvents = await web3.eth.getPastLogs({
            fromBlock: web3.utils.numberToHex(FROM_BLOCK),
            address: ADDRESS,
            topics: [involveTopic0, null, accountTopic]
        });

        // Get decoded events
        const eventAbiInputs = getEventAbiInputs(ABI, 'Involve');
        const domains = {};
        for(const evt of involvedEvents) {
            lastRelevantBlock = Math.max(lastRelevantBlock, evt.blockNumber);
            const decodedEvent = web3.eth.abi.decodeLog(eventAbiInputs, evt.data, evt.topics);
            const dn = decodedEvent.name;
            // Get details for asset
            try {
                domains[dn] = this.contracts.Escrow.methods.details.cacheCall(dn);
            } catch(error) {
                console.warn(`Error getting details for ${dn}: ${error}.`);
            }
        }
        if (_.isEmpty(domains)) {
            this.setState({ pastLogsLoading: false });
        } else {
            this.setState({ domains });
        }
        console.log('lastRelevantBlock', lastRelevantBlock);

        // Check if still relevant (still a party? not too old?). If not, remove from store somehow (LATER!)
        // Preload data??? (LATER)



        // Get raw event logs for Offered as a seller
        // const sellerEvents = await web3.eth.getPastLogs({
        //     fromBlock: web3.utils.numberToHex(FROM_BLOCK),
        //     address: ADDRESS,
        //     topics: [offeredTopic0, null, accountTopic]
        // });
        //         console.log(sellerEvents);
        //             // Get raw event logs for Offered as an agent
        //             const agentEvents = web3.eth.getPastLogs({
        //                 fromBlock: web3.utils.numberToHex(FROM_BLOCK),
        //                 address: ADDRESS,
        //                 topics: [offeredTopic0, null, account]
        //             });

//             // Get raw event logs for Bought (any role)
//             const boughtEvents = web3.eth.getPastLogs({
//                 fromBlock: web3.utils.numberToHex(FROM_BLOCK),
//                 address: ADDRESS,
//                 topics: [boughtTopic0]
//             });

//             const events = await Promise.all([sellerEvents, agentEvents, boughtEvents]);


        // } catch(error) {
        //     console.log('pastLogs error', error);
        // }
    }

    componentDidUpdate(prevProps, prevState) {
        const { domains, dnFromPath } = this.state;
        const { Escrow, account, addAsset, removeAsset, assets, match } = this.props;

        if(account !== prevProps.account) {
            // MetaMask account switch, refresh web page
            window.location.reload();
        }

        // Check for non-Involved domain (potential buyer)
        console.log('=========== MAIN componentDidUpdate ================');
        if(dnFromPath && !domains[dnFromPath]) {
            // we are at the domain page for domain m[1], but it is not in the domains dict
            console.log('domain name not in domains: ', dnFromPath);
            // Get the details for asset
            try {
                domains[dnFromPath] = this.contracts.Escrow.methods.details.cacheCall(dnFromPath);
                this.setState({ domains });
            } catch(error) {
                console.warn(`Error getting details for ${dnFromPath}: ${error}.`);
            }
        }

        if(Escrow.details !== prevProps.Escrow.details) {
            // for each potential asset, wait for values, check if still relevant and add to store
            this.setState({ pastLogsLoading: true });
            console.log('~~~~~~~~~~~~~~~~~', domains);
            for(const dn in domains) {
                if(!dn) console.error('EMPTY domains property', domains);
                const dataKey = domains[dn];
                const details = Escrow.details[dataKey];
                if(details) {
                    const dv = details.value;
                    // still relevant?
                    console.log(dn, dnFromPath, dv);
                    if(dv && ([dv.seller, dv.agent, dv.buyer].indexOf(account) > -1) || (dn == dnFromPath)) {
                        // add to store
                        addAsset(dataKey, dn);
                    } else {
                        console.warn('removing dn:', dn);
                        removeAsset(dataKey);
                        delete domains[dataKey];
                        this.setState({ domains });
                    }
                }
            }
            this.setState({ pastLogsLoading: false });
        }

        if(Escrow.events !== prevProps.Escrow.events) {
            console.log('**************** Events!: ', Escrow.events);
            this.setState({ pastLogsLoading: true });
            for (const event of Escrow.events) {
                console.warn(event);
                if(event.event === 'Involve' && event.returnValues) { // relevant for us
                    const dn = event.returnValues.name;
                    // Get latest details for asset
                    try {
                        domains[dn] = this.contracts.Escrow.methods.details.cacheCall(dn);
                        this.setState({ domains });
                    } catch(error) {
                        console.warn(`Error getting details for ${dn}: ${error}.`);
                    }
                    console.warn(event.logIndex, event.returnValues);
                } else if(event.returnValues) {
                    // Check if one of domains is relevant for current user
                    const dn = event.returnValues.name;
                    const domainKey = assets[dn];
                    if(domainKey) { // relevant
                        const details = Escrow.details[domainKey];
                        if(details) {

                            console.log('*** are details updated now? ***', details);

                            const dv = details.value;
                            // still relevant?
                            if(dn === 'new.nu') console.warn(dv);
                            if(dv && [dv.seller, dv.agent, dv.buyer].indexOf(account) > -1) {
                                // nada
                            } else {
                                console.warn('removing dn:', dn);
                                removeAsset(domainKey);
                                delete domains[domainKey];
                                this.setState({ domains });
                            }
                        }
                    }
                }
            }
            this.setState({ pastLogsLoading: false });
        }
    }

    showMessages = () => {
        const { isUser, fiat, currency } = this.props;
        if(!isUser) return <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />;
        if(fiat.error) return <Message color="danger" msg={`Unable to load the conversion rate for ETH to ${currency}.`} />;
        return null;
    }

    render() {

        console.warn('Main RENDER', this.state.pastLogsLoading); // @@@

        const { isUser, showBalance, Escrow } = this.props;

        const pendingSpinner = this.state.pastLogsLoading ? <strong>................PASTLOGS_LOADING................</strong> : '';

        return (
            <Container className="pb-5">
                {pendingSpinner}
                {showBalance && <Balance />}
                {this.showMessages()}
                {isUser && !this.state.pastLogsLoading && this.props.children}
            </Container>
        );
    }
}

Main.contextTypes = {
    drizzle: PropTypes.object
};

Main.propTypes = {
    isUser: PropTypes.bool.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired,
    showBalance: PropTypes.bool.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    account: PropTypes.string.isRequired,
    Escrow: PropTypes.object.isRequired,
    assets: PropTypes.object.isRequired,
    addAsset: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    return { isUser,
             currency: state.currency,
             fiat: state.fiat,
             showBalance: state.showBalance,
             account: state.accounts[0],
             Escrow: state.contracts.Escrow,
             assets: state.assets
           };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        addAsset: (dataKey, domain) => dispatch({ type: ADD_ASSET, payload: {dataKey, domain} }),
        removeAsset: dataKey => dispatch({ type: REMOVE_ASSET, payload: {dataKey} })
    };
};

const MainContainer = drizzleConnect(Main, mapStateToProps, mapDispatchToProps);

export default withRouter(MainContainer);
