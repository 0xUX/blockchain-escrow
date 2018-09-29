import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { Button, ButtonGroup, Form, FormGroup, Input, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { USERS, ASSET_STATES, CURRENCIES } from "../constants";
import { getPriceBreakdownInWei, getSalesPriceInWei } from '../lib/util';
import { utils as web3utils } from 'web3';  // for now @@@@@@
import { FIAT_CALL_REQUEST, SET_CURRENCY } from '../redux/actionTypes';


export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);


export const AgentLink = ({ agentKey }) => (
    <div className="card p-3 mt-1">
        <div>Hello {USERS[agentKey]}! <Link to="/agent">My personal agent page >></Link></div>
    </div>
);


export const AssetInfo = ( { asset } ) => (
    <ul>
        <li>Status: {ASSET_STATES[asset.state]}</li>
        <li>Escrow agent: {asset.agent ? USERS[asset.agent] : '-'}</li>
        <li>Net price: {web3utils.fromWei(asset.price)}</li>
        <li>Escrow fee: {web3utils.fromWei(asset.escrowfee)}</li>
        <li>Handling fee: {web3utils.fromWei(asset.handlingfee)}</li>
        <li>Sales price: {web3utils.fromWei(getSalesPriceInWei(asset))}</li>
    </ul>
);


export const PriceBreakdown = ({ price, agentKey }) => {
    const { netPrice, escrowfee, handlingfee, salesPrice } = getPriceBreakdownInWei(price, agentKey);

    return (
        <div className="border rounded small p-1 mt-2">
            Net price: {web3utils.fromWei(netPrice)} | Escrow fee: {web3utils.fromWei(escrowfee)} | Handling fee: {web3utils.fromWei(handlingfee)} | Sales price: {web3utils.fromWei(salesPrice)}
        </div>
    );
}


export let PriceInput = props => {
    const { price, handlePriceChange, setCurrency, currency, onRequestFiat, fiat } = props;
    let fiatValue = String(Math.round(price * fiat.fiat));
    if(fiatValue === '0') fiatValue = '';

    return (
        <FormGroup row>
            <Col>
                <div className="input-group">
                    <div className="input-group-prepend">
                        <div className="input-group-text">ETH</div>
                    </div>
                    <Input name="price"
                           placeholder="enter price in Ether"
                           onChange={handlePriceChange}
                           value={price}
                    />
                </div>
            </Col>
            <Col>
                <div className="input-group">
                    <div className="input-group-prepend">
                        <div className="input-group-text">{currency}</div>
                    </div>
                    <Input name="fiat"
                           placeholder={`enter price in ${currency}`}
                           onChange={handlePriceChange}
                           value={fiatValue}
                    />
                </div>
                <CurrencySelector currency={currency} setCurrency={setCurrency} onRequestFiat={onRequestFiat} fiat={fiat} />
            </Col>
        </FormGroup>
    );
};

PriceInput.propTypes = {
    price: PropTypes.string.isRequired,
    handlePriceChange: PropTypes.func.isRequired,
    currency: PropTypes.string.isRequired,
    setCurrency: PropTypes.func.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return { currency: state.currency, fiat: state.fiat };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        setCurrency: currency => dispatch({ type: SET_CURRENCY, payload: {currency} })
    };
};

PriceInput = connect(
    mapStateToProps, mapDispatchToProps
)(PriceInput);

const CurrencySelector = props => {
    const { currency, setCurrency, onRequestFiat, fiat } = props;

    const handleClick = (c) => {
        setCurrency(c);
        onRequestFiat(c);
    };

    return (
        <ButtonGroup size="sm" className="mt-1">
            {CURRENCIES.map(c => {
                 const buttonTxt = fiat.fetching && c === currency ? <span><FontAwesomeIcon icon="circle-notch" spin /> {c}</span> : c;
                 return (
                     <Button onClick={() => handleClick(c)} outline key={c} active={c === currency}>{buttonTxt}</Button>
                 );
            })}
        </ButtonGroup>
    );
};

CurrencySelector.propTypes = {
    currency: PropTypes.string.isRequired,
    setCurrency: PropTypes.func.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};
