import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Container } from 'reactstrap';
import { networkDetails } from '../lib/network';
import { getEventAbi, getEventAbiInputs } from '../lib/eth';
import { Message } from './ui';
import { userExists } from '../redux/selectors';
import { FROM_BLOCK, ADDRESS } from '../constants';
import Balance from './balance';
import ABI from '../../contracts/Escrow.abi.json';

let subscriptionNetwork = networkDetails('rinkeby');
let web3websocket; // web3 interface for subscription network (Infura)

class Body extends Component {
    constructor(props, context) {
        super(props);
        this.web3 = context.drizzle.web3;
        this.contracts = context.drizzle.contracts;
    }

    state = {
        pastLogsLoading: false // @@@ needed?
    }

    async componentDidMount() {
        // get fiat conversion rate
        const { onRequestFiat } = this.props;
        onRequestFiat('USD');

        // Get past logs, uses the metamask provider
        this.getPastLogs();
    }

    getPastLogs = async () => {
        const web3 = this.web3; // this uses the web3 provider passed in from drizzle context, so MM
        const { account } = this.props;
        this.setState({ pastLogsLoading: true });

        // Get the topic0 for the Offered event
        const accountTopic = web3.utils.padLeft(account, 64);
        const offeredEventABI = getEventAbi(ABI, 'Offered');
        console.log(offeredEventABI);
        const offeredTopic0 = web3.eth.abi.encodeEventSignature(offeredEventABI);
        console.log(offeredTopic0, accountTopic);

        // Get the topic0 for the Bought event
        // const boughtEventABI = getEventAbi(ABI, 'Bought');
        // console.log(boughtEventABI);
        // const boughtTopic0 = web3.eth.abi.encodeEventSignature(boughtTopic0);


        // @@@ THE STEPS
        // Get all relevant assets through Involve event
        // Get details for all assets
        // Check if still relevant (still a party? not too old?). If not, remove from store somehow (LATER!)
        // Store the dataKeys in the asset state
        // Preload data??? (LATER)

        // try {

            // Get raw event logs for Offered as a seller
            const sellerEvents = await web3.eth.getPastLogs({
                fromBlock: web3.utils.numberToHex(FROM_BLOCK),
                address: ADDRESS,
                topics: [offeredTopic0, null, accountTopic]
            });
        console.log(sellerEvents);
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

            // Get decoded events
            const eventAbiInputs = getEventAbiInputs(ABI, 'Offered');
            for(const evt of sellerEvents) {
                console.log(evt);
                const decodedEvent = web3.eth.abi.decodeLog(eventAbiInputs, evt.data, evt.topics);
                const dn = decodedEvent.name;
                console.log(decodedEvent, dn);
                const dataKey = this.contracts.Escrow.methods.details.cacheCall(dn);
                console.log(dataKey);
            }

        // } catch(error) {
        //     console.log('pastLogs error', error);
        // }

        this.setState({ getPastLogs: false });
    }

    showMessages = () => {
        const { isUser, fiat, currency } = this.props;
        if(!isUser) return <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />;
        if(fiat.error) return <Message color="danger" msg={`Unable to load the conversion rate for ETH to ${currency}.`} />;
        return null;
    }

    render() {
        const { isUser, currency, showBalance } = this.props;

        return (
            <Container className="pb-5">
                {showBalance && <Balance />}
                {this.showMessages()}
                {isUser && this.props.children}
            </Container>
        );
    }
}

Body.contextTypes = {
    drizzle: PropTypes.object
};

Body.propTypes = {
    isUser: PropTypes.bool.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired,
    showBalance: PropTypes.bool.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    account: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    return { isUser,
             currency: state.currency,
             fiat: state.fiat,
             showBalance: state.showBalance,
             account: state.accounts[0],
           };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: "FIAT_CALL_REQUEST", payload: {currency} })
    };
};

const BodyContainer = drizzleConnect(Body, mapStateToProps, mapDispatchToProps);

export default BodyContainer;
