import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Link } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { updateAssetPrice, updateAssetState, removeAsset, updateBalance } from '../redux/actions'; // @@@
import { getAsset, getHandlingPermillage, getRole, getMyBalance } from '../redux/selectors';
import { ASSET_STATES, INPUT_ETHER_DECIMALS } from '../constants';
import { AssetInfo } from './asset-info';
import PriceBreakdown from './price-breakdown';
import { PriceInput } from './price-input';
import { CurrencySelector } from './currency-selector';
import { getSalesPriceInEther, getSalesPriceInWei, formatAmount, getPriceBreakdownInWei, precisionRound } from '../lib/util';
import { AmountPlusFiat } from './ui';


const NotForSale = props => (
    <div className="card p-3 mt-1">
        The domain {props.domain} is not for sale. Do you own this domain? <Link to="/">Offer this domain for sale >>></Link>
    </div>
);

class Domain extends Component {
    render() {

        console.log('RENDER Domain'); // @@@

        const { match, account, asset, role, handlingPermillage, balance, updateAssetPrice, updateAssetState, removeAsset, updateBalance, fiat } = this.props;
        const { web3 } = this.context.drizzle;
        const { domain } = match.params;

        if(_.isEmpty(asset)) return <div><h1>Not for sale</h1><NotForSale domain={domain} /></div>;


        console.log('asset', asset);

        const header = <h1>{ASSET_STATES[asset.state]}: <a href={`https://whois.domaintools.com/${domain}`} target="_blank">{domain}</a></h1>;
        const cost = getSalesPriceInEther(web3, asset, handlingPermillage);

        if(!balance) return null;

        return (
            <div>
                {header}
                {cost > 0 && <div><h4><AmountPlusFiat amountInEther={cost} /></h4> <CurrencySelector /></div>}
                {asset.agent && role !== 'agent' && <h3>Escrow service provided by <Link to={`/agent/${asset.agent}`}>{asset.agent}</Link></h3>}
                {role === 'seller' &&
                 <SellerActions
                     asset={asset}
                     domain={domain}
                     updateAssetPrice={updateAssetPrice}
                     removeAsset={removeAsset}
                     fiat={fiat} />
                }
                {role === 'prospect' &&
                 <ProspectActions
                     account={account}
                     asset={asset}
                     handlingPermillage={handlingPermillage}
                     domain={domain}
                     balance={balance}
                     updateAssetState={updateAssetState}
                     updateBalance={updateBalance} />
                }
                {role === 'buyer' &&
                 <BuyerActions
                     account={account}
                     asset={asset}
                     domain={domain}
                     updateAssetState={updateAssetState}
                     updateBalance={updateBalance} />
                }
                {role === 'agent' &&
                 <AgentActions
                     asset={asset}
                     domain={domain}
                     updateAssetState={updateAssetState}
                     removeAsset={removeAsset}
                     updateBalance={updateBalance} />
                }
            </div>
        );
    }
};

Domain.contextTypes = {
    drizzle: PropTypes.object
};

Domain.propTypes = {
    account: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    role: PropTypes.string,
    handlingPermillage: PropTypes.number.isRequired,
    balance: PropTypes.string,
    updateAssetPrice: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired,
    updateBalance: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};

class ProspectActions extends Component {
    constructor(props, context) {
        super(props);
        this.web3 = context.drizzle.web3;
    }


    buy = () => {
        const { account, balance, asset, updateBalance, updateAssetState, domain, handlingPermillage } = this.props;
        const web3 = this.web3;
        const cost = getSalesPriceInWei(web3, asset, handlingPermillage);

        // assume the transaction has exactly the value needed to pay
        const value = Math.max(cost - balance, 0);

        // substract from balance
        const newBalance = Math.max(balance - cost, 0);
        updateBalance(account, newBalance);

        // all money moves to the contract
        updateBalance('CONTRACT', cost);

        // update the state to PAID
        updateAssetState(domain, 'PAID', account);
    }

    render() {
        const { balance, asset, handlingPermillage } = this.props;
        const web3 = this.web3;

        const cost = getSalesPriceInWei(web3, asset, handlingPermillage);
        const required = web3.utils.toBN(String(cost)).sub(web3.utils.toBN(String(balance))).toString(10);
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'FORSALE' ?
                 <div>
                     <p>Buy this domain:</p>
                     <ul>
                         <li>Domain price: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(cost))} /></li>
                         <li>Current balance: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(balance))} /></li>
                         {Number(required) > 0 && <li>Additional Ether required: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(required))} /></li>}
                     </ul>
                     <div><Button color="success" onClick={this.buy}>buy</Button></div>
                 </div> :
                 <p>This domain is sold.</p>
                }
            </div>
        );
    }
};

ProspectActions.contextTypes = {
    drizzle: PropTypes.object
};

ProspectActions.propTypes = {
    account: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    handlingPermillage: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    balance: PropTypes.string,
    updateBalance: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired
};


class BuyerActions extends Component {

    release = () => {
        const { domain, account, updateAssetState, updateBalance, asset } = this.props;

        // pay the seller the net amount, the handling fee stays in the contract
        updateBalance(asset.seller, asset.price);

        // pay the agent
        if (asset.agent) updateBalance(asset.agent, asset.escrowfee);

        // update the state to RELEASED
        updateAssetState(domain, 'RELEASED', account);
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
    account: PropTypes.string.isRequired,
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
    constructor(props, context) {
        super(props);
        this.web3 = context.drizzle.web3;
    }

    state = {
        price: null,
        fiatInput: '',
        activeInput: null // either eth or fiat, field we're typing in
    }

    componentDidMount() {
        const price = this.web3.utils.fromWei(this.props.asset.price);
        this.setState({ price });
    }

    updatePrice = (e) => {
        e.preventDefault();
        const { asset, domain, updateAssetPrice } = this.props;
        const price = this.state.price;
        const { netPrice, escrowfee, handlingfee } = getPriceBreakdownInWei(this.web3, price, asset.agent);
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
                     <PriceBreakdown price={this.state.price} agentAccount={asset.agent} />
                     <Button className="mt-3" color="danger" onClick={this.retractOffer}>retract offer</Button>
                 </div>
                }
            </div>
        );
    }
};

SellerActions.contextTypes = {
    drizzle: PropTypes.object
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
    const handlingPermillage = getHandlingPermillage(state);
    const balance = getMyBalance(state);
    return { account: state.accounts[0], asset, role, handlingPermillage, balance, fiat: state.fiat };
};

export default drizzleConnect(Domain, mapStateToProps, { updateAssetPrice, updateAssetState, removeAsset, updateBalance });
