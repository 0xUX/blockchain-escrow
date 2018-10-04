import React from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Link } from 'react-router-dom';
import { Button, ButtonGroup, Form, FormGroup, Input, Col } from 'reactstrap';
import { USERS, ASSET_STATES, CURRENCIES, DISPLAY_ETHER_DECIMALS } from "../constants";
import { getPriceBreakdownInWei, getSalesPriceInEther, precisionRound } from '../lib/util';
import { utils as web3utils } from 'web3';  // for now @@@@@@
import { FIAT_CALL_REQUEST, SET_CURRENCY } from '../redux/action-types';
import { setCurrency, updateDomain } from "../redux/actions";
import { DelayedSpinner, AmountPlusFiat } from './ui.js';


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
        <li>Net price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(asset.price))} /></li>
        <li>Escrow fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(asset.escrowfee))} /></li>
        <li>Handling fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(asset.handlingfee))} /></li>
        <li>Sales price: <AmountPlusFiat amountInEther={getSalesPriceInEther(asset)} /></li>
    </ul>
);


export const PriceBreakdown = ({ price, agentKey }) => {
    const { netPrice, escrowfee, handlingfee, salesPrice } = getPriceBreakdownInWei(price, agentKey);

    return (
        <div className="border rounded small p-1 mt-2">
            Net price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(netPrice))} /><br />
            Escrow fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(escrowfee))} /><br />
            Handling fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(handlingfee))} /><br />
            Sales price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(salesPrice))} />
        </div>
    );
}

export let DomainInput = props => {
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


export let PriceInput = props => {
    const { price, fiatInput, activeInput, handlePriceChange, currency, fiat } = props;
    let fiatValue, ethValue;
    if(activeInput === 'fiat') {
        fiatValue = fiatInput;
        ethValue = String(precisionRound(fiatValue / fiat.fiat, DISPLAY_ETHER_DECIMALS));
        if(ethValue === '0') ethValue = '';
    } else { // either 'eth' or null
        fiatValue = String(precisionRound(price * fiat.fiat, 2));
        ethValue = price;
        if(fiatValue === '0') fiatValue = '';
    }
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
                           value={ethValue}
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
                <CurrencySelector />
            </Col>
        </FormGroup>
    );
};

PriceInput.propTypes = {
    price: PropTypes.string.isRequired,
    fiatInput: PropTypes.string.isRequired,
    activeInput: PropTypes.oneOf(['eth', 'fiat']),
    handlePriceChange: PropTypes.func.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return { currency: state.currency, fiat: state.fiat };
};

PriceInput = drizzleConnect(PriceInput, mapStateToProps, { setCurrency });

export let CurrencySelector = props => {
    const { currency, setCurrency, onRequestFiat, fiat } = props;

    const handleClick = (c) => {
        setCurrency(c);
        onRequestFiat(c);
    };

    return (
        <ButtonGroup size="sm" className="mt-1">
            {CURRENCIES.map(c => {
                 const buttonTxt = fiat.fetching && c === currency ? <span><DelayedSpinner /> {c}</span> : c;
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

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        setCurrency: currency => dispatch({ type: SET_CURRENCY, payload: {currency} })
    };
};

CurrencySelector = drizzleConnect(CurrencySelector, mapStateToProps, mapDispatchToProps);
