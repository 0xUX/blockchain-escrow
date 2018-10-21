import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Input, Col } from 'reactstrap';
import { updateDomain } from '../redux/actions';
import { getWhoAmI } from '../redux/selectors';
import { AGENT_FEES, HANDLING_FEE, INPUT_ETHER_DECIMALS } from '../constants';
import PriceBreakdown from './price-breakdown';
import { PriceInput } from './price-input';
import { precisionRound } from '../lib/util';
import { DelayedSpinner } from './ui';


class DomainNameForm extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;

        if(props.agentAccount) this.agentDataKey = this.contracts.Escrow.methods.whois.cacheCall(props.agentAccount);
        this.web3 = context.drizzle.web3;
    }

    state = {
        price: '', // price in Ether (string)
        fiatInput: '',
        activeInput: null, // either eth or fiat, field we're typing in
        done: false,
        mode: null // either sell or buy
    }

    componentDidMount = () => {
        // this.contracts.Escrow.events
        //     .Offered({/* eventOptions */}, (error, event) => {
        //         console.log(error, event);
        //     })
        //     .on('data', (event) => console.log(event))
        //     .on('changed', (event) => console.log(event))
        //     .on('error', (error) => console.error(error));
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { account, agentAccount, domain, updateDomain } = this.props;
        if(!this.state.price || !domain) return;
        let stackId = null;
        if(agentAccount) {
            stackId = this.contracts.Escrow.methods.offerViaAgent.cacheSend(domain, this.web3.utils.toWei(this.state.price), agentAccount, {from: account});
        } else {
            stackId = this.contracts.Escrow.methods.offerDirect.cacheSend(domain, this.web3.utils.toWei(this.state.price), {from: account});
            // // Use the dataKey to display the transaction status.
            // if (state.transactionStack[stackId]) {
            //     const txHash = state.transactionStack[stackId]

            //     return state.transactions[txHash].status
            // }
        }

        updateDomain('');
        this.setState({ price: '', fiatInput: '', done: true, mode: null });
    }

    handlePriceChange = (e) => {
        const { fiat } = this.props;
        const name = e.target.name;
        const value = e.target.value;
        if(name === 'price') { // typing in ETH input
            if(value && !/^[0-9]{1,7}\.?[0-9]{0,18}$/.test(value)) return;
            const fiatValue = String(precisionRound(value * fiat.fiat, 2));
            this.setState({ activeInput: 'eth', price: value, fiatInput: fiatValue });
        } else if (name === 'fiat') { // typing in fiat input
            if(fiat.fiat !== null) {
                if(value && !/^[0-9]{1,10}\.?[0-9]{0,2}$/.test(value)) return;
                const ethValue = String(precisionRound(value / fiat.fiat, INPUT_ETHER_DECIMALS));
                this.setState({ activeInput: 'fiat', price: ethValue, fiatInput: value });
            }
        }
    }

    isFQDN = () => {
        // VERY loose check
        const { domain } = this.props;
        return /.+\..{2,}$/.test(domain);
    }

    render() {
        const { agentAccount, fiat, domain, updateDomain, transactions, transactionStack, Escrow, whoami } = this.props;
        const { mode, done } = this.state;
        if(agentAccount && done) return <Redirect to="/" />;
        if(mode === 'buy') return <Redirect to={`/domain/${domain}`} />;

        if(!whoami) return null;
        const { enrolled } = whoami.value;

        let permillage = null;
        if(agentAccount) {
            const whoisAgent = Escrow.whois[this.agentDataKey];
            if(!whoisAgent) return null;
            permillage = whoisAgent.value.permillage
        }

        let txs = []

        transactionStack.forEach(txHash => {
            const tx = transactions[txHash];
            console.log('tx', txHash, tx);
            if(tx && tx.status === 'success') {
                const events = tx.receipt.events;
                txs.push(events);
            }
        });
        // const txs = transactionStack.map(txHash => {
        //     const tx = transactions[txHash];
        //     console.log(tx);
        //     if(tx && tx.status === 'success') {
        //         const event = tx.receipt.events;
        //         return event;
        //     }
        // });

        console.log(txs);

        return (
            <div className="card p-3 mt-1">
                {(agentAccount || mode === 'sell') && <h3>Sell a domain name:</h3>}
                <Form  onSubmit={this.handleSubmit}>
                    <DomainInput />
                    {!mode && !agentAccount &&
                     <FormGroup row>
                         <Col sm={6} className="mt-3">
                             <Button color="success" size="lg" onClick={() => this.setState({ mode: 'buy' }) } block disabled={!this.isFQDN()} >buy</Button>
                         </Col>
                         <Col sm={6} className="mt-3">
                             <Button color="success" size="lg" onClick={() => this.setState({ mode: 'sell' }) } block disabled={!this.isFQDN()} >sell</Button>
                         </Col>
                     </FormGroup>
                    }
                    {(agentAccount || mode === 'sell') &&
                     <div>
                         <PriceInput price={this.state.price}
                                     fiatInput={this.state.fiatInput}
                                     activeInput={this.state.activeInput}
                                     handlePriceChange={this.handlePriceChange} />
                         <Button type="submit" color="success">create offer</Button>
                         <PriceBreakdown price={this.state.price} agentAccount={agentAccount} agentPermillage={permillage} />
                     </div>
                    }
                </Form>
                {mode === 'sell' && !agentAccount && !enrolled &&
                 <div className="mt-5"><Link to="/agent">Limit your risk, sell via an agent >></Link></div>
                }
            </div>
        );
    }
};

DomainNameForm.contextTypes = {
    drizzle: PropTypes.object
};

DomainNameForm.propTypes = {
    account: PropTypes.string.isRequired,
    agentAccount: PropTypes.string,
    fiat: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    updateDomain: PropTypes.func.isRequired,
    Escrow: PropTypes.object.isRequired,
    transactions: PropTypes.object.isRequired,
    transactionStack: PropTypes.array.isRequired,
    whoami: PropTypes.object
};

const mapStateToProps = state => {
    const whoami = getWhoAmI(state);
    return { account: state.accounts[0],
             fiat: state.fiat,
             domain: state.domain,
             Escrow: state.contracts.Escrow,
             transactions: state.transactions,
             transactionStack: state.transactionStack,
             whoami
    };
};

export default drizzleConnect(DomainNameForm, mapStateToProps, { updateDomain });


let DomainInput = props => {
    const { domain, updateDomain } = props;

    const handleChange = (e) => {
        const value = e.target.value.trim();
        props.updateDomain(value);
    };

    return (
        <FormGroup row>
            <Col sm={12}>
                <Input name="domain" id="domain"
                       placeholder="enter domain name"
                       onChange={handleChange}
                       value={props.domain}
                />
                <small>Enter a FQDN, for example: yahoo.com</small>
            </Col>
        </FormGroup>
    );
};

DomainInput.propTypes = {
    domain: PropTypes.string.isRequired,
    updateDomain: PropTypes.func.isRequired
};

const mapStateToPropsDomain = state => {
    return { domain: state.domain };
};

DomainInput = drizzleConnect(DomainInput, mapStateToPropsDomain, { updateDomain });
