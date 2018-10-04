import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { updateAssetPrice, updateAssetState, removeAsset, updateBalance } from '../redux/actions';
import { getAsset, getRole, getUserBalance } from '../redux/selectors';
import { ASSET_STATES, USERS, AGENT_FEES, HANDLING_FEE, INPUT_ETHER_DECIMALS } from '../constants';
import { AssetInfo, PriceInput, PriceBreakdown, CurrencySelector } from './static';
import { getSalesPriceInEther, getSalesPriceInWei, formatAmount, getPriceBreakdownInWei, precisionRound } from '../lib/util';
import { AmountPlusFiat } from './ui.js';
import { utils as web3utils } from 'web3';  // for now @@@@@@

const NotForSale = props => (
    <div className="card p-3 mt-1">
        The domain {props.domain} is not for sale. Do you own this domain? <Link to="/">Offer this domain for sale >>></Link>
    </div>
);

class Domain extends Component {
    render() {
        const { match, currentUser, asset, role, balance, updateAssetPrice, updateAssetState, removeAsset, updateBalance, fiat } = this.props;
        const { domain } = match.params;
        const header = <h1>{ASSET_STATES[asset.state]}: <a href={`https://whois.domaintools.com/${domain}`} target="_blank">{domain}</a></h1>;
        if(asset.state === 'NOTFORSALE') return <div>{header}<NotForSale domain={domain} /></div>;
        const cost = getSalesPriceInEther(asset);
        return (
            <div>
                {header}
                {cost > 0 && <div><h4><AmountPlusFiat amountInEther={cost} /></h4> <CurrencySelector /></div>}
                {asset.agent && role !== 'agent' && <h3>Escrow service provided by <Link to={`/agent/${asset.agent}`}>{USERS[asset.agent]}</Link></h3>}
                {role === 'seller' &&
                 <SellerActions asset={asset} domain={domain} updateAssetPrice={updateAssetPrice} removeAsset={removeAsset} fiat={fiat} />
                }
                {role === 'prospect' &&
                 <ProspectActions currentUser={currentUser} asset={asset} domain={domain} balance={balance} updateAssetState={updateAssetState} updateBalance={updateBalance} />
                }
                {role === 'buyer' &&
                 <BuyerActions currentUser={currentUser} asset={asset} domain={domain} updateAssetState={updateAssetState} updateBalance={updateBalance} />
                }
                {role === 'agent' &&
                 <AgentActions asset={asset} domain={domain} updateAssetState={updateAssetState} removeAsset={removeAsset} updateBalance={updateBalance} />
                }
            </div>
        );
    }
};

Domain.propTypes = {
    currentUser: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    role: PropTypes.string,
    balance: PropTypes.string.isRequired,
    updateAssetPrice: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired,
    updateBalance: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};

class ProspectActions extends Component {

    buy = () => {
        const { currentUser, balance, asset, updateBalance, updateAssetState, domain } = this.props;
        const cost = getSalesPriceInWei(asset);

        // assume the transaction has exactly the value needed to pay
        const value = Math.max(cost - balance, 0);

        // substract from balance
        const newBalance = Math.max(balance - cost, 0);
        updateBalance(currentUser, newBalance);

        // all money moves to the contract
        updateBalance('CONTRACT', cost);

        // update the state to PAID
        updateAssetState(domain, 'PAID', currentUser);
    }

    render() {
        const { balance, asset } = this.props;
        const cost = getSalesPriceInWei(asset);
        const required = web3utils.toBN(String(cost)).sub(web3utils.toBN(String(balance))).toString(10);
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'FORSALE' ?
                 <div>
                     <p>Buy this domain:</p>
                     <ul>
                         <li>Domain price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(cost))} /></li>
                         <li>Current balance: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(balance))} /></li>
                         {Number(required) > 0 && <li>Additional Ether required: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(required))} /></li>}
                     </ul>
                     <div><Button color="success" onClick={this.buy}>buy</Button></div>
                 </div> :
                 <p>This domain is sold.</p>
                }
            </div>
        );
    }
};

ProspectActions.propTypes = {
    currentUser: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    updateBalance: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired
};


class BuyerActions extends Component {

    release = () => {
        const { domain, currentUser, updateAssetState, updateBalance, asset } = this.props;

        // pay the seller the net amount, the handling fee stays in the contract
        updateBalance(asset.seller, asset.price);

        // pay the agent
        if (asset.agent) updateBalance(asset.agent, asset.escrowfee);

        // update the state to RELEASED
        updateAssetState(domain, 'RELEASED', currentUser);
    }

    render() {
        const { asset } = this.props;
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'PAID' &&
                 <div>
                     <p>Buying this domain!</p>
                     <p>When the domain name has been transferred to you, you can release the funds to the seller:</p>
                     <Button color="success" onClick={this.release}>release</Button>
                 </div>
                }
                {asset.state === 'RELEASED' &&
                 <div>
                     <p>Bought this domain!</p>
                 </div>
                }
            </div>
        );
    }
};

BuyerActions.propTypes = {
    currentUser: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    updateBalance: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired
};

class AgentActions extends Component {

    release = () => {
        const { domain, updateAssetState, updateBalance, asset } = this.props;

        // pay the seller the net amount, the handling fee stays in the contract
        updateBalance(asset.seller, asset.price);

        // pay the agent (current user)
        updateBalance(asset.agent, asset.escrowfee);

        // update the state to RELEASED
        updateAssetState(domain, 'RELEASED', asset.buyer);
    }

    retractOffer = () => {
        const { domain, removeAsset } = this.props;
        removeAsset(domain);
    }

    render() {
        const { asset, domain } = this.props;
        return (
            <div className="card p-3 mt-1">
                <p>We are the escrow agent for this offer:</p><AssetInfo domain={domain} asset={asset} />
                {asset.state === 'PAID' &&
                 <div>
                     <p>Buyer has moved funds into escrow for this domain!</p>
                     <p>When the domain name has been transferred to us, we can release the funds to the seller:</p>
                     <Button color="success" onClick={this.release}>release</Button>
                 </div>
                }
                {asset.state === 'FORSALE' &&
                 <div><Button className="mt-3" color="danger" onClick={this.retractOffer}>retract offer</Button></div>
                }
                {asset.state === 'RELEASED' &&
                 <div>
                     <p>Domain sold! Make sure to transfer the domain to the buyer!</p>
                 </div>
                }
            </div>
        );
    }
};

AgentActions.propTypes = {
    asset: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    updateBalance: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired
};


class SellerActions extends Component {
    state = {
        price: web3utils.fromWei(this.props.asset.price),
        fiatInput: '',
        activeInput: null // either eth or fiat, field we're typing in
    }

    updatePrice = (e) => {
        e.preventDefault();
        const { asset, domain, updateAssetPrice } = this.props;
        const price = this.state.price;
        const { netPrice, escrowfee, handlingfee } = getPriceBreakdownInWei(price, asset.agent);
        updateAssetPrice(domain, netPrice, escrowfee, handlingfee);
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


    retractOffer = () => {
        const { domain, removeAsset } = this.props;
        removeAsset(domain);
    }

    render() {
        const { asset, domain } = this.props;
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'RELEASED' ? <p>Sold this domain!</p> :
                 <div>
                     <p>Manage your offer:</p><AssetInfo domain={domain} asset={asset} />
                 </div>
                }
                {asset.state === 'FORSALE' &&
                 <div>
                     <Form onSubmit={this.updatePrice}>
                         <PriceInput price={this.state.price}
                                     fiatInput={this.state.fiatInput}
                                     activeInput={this.state.activeInput}
                                     handlePriceChange={this.handlePriceChange} />
                         <Button type="submit">update price</Button>
                     </Form>
                     <PriceBreakdown price={this.state.price} agentKey={asset.agent} />
                     <Button className="mt-3" color="danger" onClick={this.retractOffer}>retract offer</Button>
                 </div>
                }
            </div>
        );
    }
};

SellerActions.propTypes = {
    asset: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    updateAssetPrice: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = (state, props) => {
    const { domain } = props.match.params;
    const asset = getAsset(state, domain);
    const role = getRole(state, domain);
    const balance = getUserBalance(state);
    return { currentUser: state.currentUser, asset, role, balance, fiat: state.fiat };
};

export default drizzleConnect(Domain, mapStateToProps, { updateAssetPrice, updateAssetState, removeAsset, updateBalance });
