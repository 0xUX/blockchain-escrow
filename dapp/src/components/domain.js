import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { Button, Form, FormGroup, Input } from 'reactstrap';
import Balance from './balance';
import { updateAssetPrice, updateAssetState, removeAsset, updateBalance } from '../redux/actions';
import { getAsset, getRole, getUserBalance } from '../redux/selectors';
import { ASSET_STATES, USERS, AGENT_FEES, HANDLING_FEE } from '../constants';

const NotForSale = props => (
    <div className="card p-3 mt-1">
      The domain {props.domain} is not for sale. Do you own this domain? <Link to="/">Offer this domain for sale >>></Link>
    </div>
);

class Domain extends Component {
    render() {
        const { match, currentUser, asset, role, balance, updateAssetPrice, updateAssetState, removeAsset, updateBalance } = this.props;
        const { domain } = match.params;
        const header = <h1>{ASSET_STATES[asset.state]}: <a href={`https://whois.domaintools.com/${domain}`} target="_blank">{domain}</a></h1>;
        if(asset.state === 'NOTFORSALE') return <div>{header}<NotForSale domain={domain} /></div>;
        const cost = Number(asset.price) + Number(asset.escrowfee) + Number(asset.handlingfee);
        return (
            <div>
                {header}
                {cost > 0 && <h3>{cost} Ether</h3>}
                {role === 'seller' &&
                 <SellerActions asset={asset} domain={domain} updateAssetPrice={updateAssetPrice} removeAsset={removeAsset} />
                }
                {role === 'prospect' &&
                 <ProspectActions currentUser={currentUser} asset={asset} domain={domain} balance={balance} updateAssetState={updateAssetState} updateBalance={updateBalance} />
                }
                {role === 'buyer' &&
                 <BuyerActions currentUser={currentUser} asset={asset} domain={domain} updateAssetState={updateAssetState} updateBalance={updateBalance} />
                }
                <Balance />
            </div>
        );
    }
};

Domain.propTypes = {
    currentUser: PropTypes.string.isRequired,
    asset: PropTypes.object.isRequired,
    role: PropTypes.string,
    balance: PropTypes.number.isRequired,
    updateAssetPrice: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired,
    removeAsset: PropTypes.func.isRequired,
    updateBalance: PropTypes.func.isRequired
};

class ProspectActions extends Component {

    buy = () => {
        const { currentUser, balance, asset, updateBalance, updateAssetState, domain } = this.props;
        const cost = Number(asset.price) + Number(asset.escrowfee) + Number(asset.handlingfee);

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
        const cost = Number(asset.price) + Number(asset.escrowfee) + Number(asset.handlingfee);
        const required = cost - balance;
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'FORSALE' ?
                 <div>
                     <p>Buy this domain:</p>
                     <ul>
                         <li>Domain price: {cost}</li>
                         <li>Current balance: {balance}</li>
                         {required > 0 && <li>Additional Ether required: {required}</li>}
                     </ul>
                     {required > 0 && <p>You can either top up your balance first, or pay the difference in the transaction.</p>}
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
    balance: PropTypes.number.isRequired,
    updateBalance: PropTypes.func.isRequired,
    updateAssetState: PropTypes.func.isRequired
};


class BuyerActions extends Component {

    release = () => {
        const { domain, currentUser, updateAssetState, updateBalance, asset } = this.props;

        // pay the seller the net amount, the handling fee stays in the contract
        updateBalance(asset.seller, asset.price);

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


class SellerActions extends Component {
    state = {
        price: this.props.asset.price
    }

    updatePrice = (e) => {
        e.preventDefault();
        const { asset, domain, updateAssetPrice } = this.props;
        const price = this.state.price;
        const escrowfee = asset.agent ? AGENT_FEES[asset.agent] / 1000 * this.state.price : 0;
        const handlingfee = HANDLING_FEE / 1000 * this.state.price;
        updateAssetPrice(domain, price, escrowfee, handlingfee);
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ price: value });
    }

    releaseAsset = () => {
        const { domain, updateAssetState } = this.props;
        updateAssetState(domain, '', null);
    }

    retractOffer = () => {
        const { domain, removeAsset } = this.props;
        removeAsset(domain);
    }

    render() {
        const { asset } = this.props;
        return (
            <div className="card p-3 mt-1">
                {asset.state === 'RELEASED' ? <p>Sold this domain!</p> : <p>Manage your offer:</p>}
                <ul>
                    <li>Net price: {asset.price} (for you)</li>
                    <li>Escrow fee: {asset.escrowfee} (for agent)</li>
                    <li>Handling fee: {asset.handlingfee} (for us)</li>
                    <li>Sales price: {Number(asset.price) + Number(asset.escrowfee) + Number(asset.handlingfee)}</li>
                </ul>
                {asset.state === 'FORSALE' &&
                 <div>
                     <Form inline onSubmit={this.updatePrice}>
                         <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                             <Input name="price"
                                    placeholder="enter amount in Ether"
                                    onChange={this.handleChange}
                                    value={this.state.price}
                             />
                         </FormGroup>
                         <Button type="submit">update price</Button>
                     </Form>
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
    removeAsset: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => {
    const { domain } = props.match.params;
    const asset = getAsset(state, domain);
    const role = getRole(state, domain);
    const balance = getUserBalance(state);
    return { currentUser: state.currentUser, asset, role, balance };
};

export default connect(
    mapStateToProps,
    { updateAssetPrice, updateAssetState, removeAsset, updateBalance }
)(Domain);
