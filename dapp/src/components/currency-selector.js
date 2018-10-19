import React from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Button, ButtonGroup } from 'reactstrap';
import { CURRENCIES } from "../constants";
import { FIAT_CALL_REQUEST, SET_CURRENCY } from '../redux/action-types';
import { setCurrency } from "../redux/actions";
import { DelayedSpinner } from './ui';


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

const mapStateToProps = state => {
    return { currency: state.currency, fiat: state.fiat };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        setCurrency: currency => dispatch({ type: SET_CURRENCY, payload: {currency} })
    };
};

CurrencySelector = drizzleConnect(CurrencySelector, mapStateToProps, mapDispatchToProps);
