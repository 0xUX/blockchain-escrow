import React from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Button, ButtonGroup, FormGroup, Input, Col } from 'reactstrap';
import { CURRENCIES, DISPLAY_ETHER_DECIMALS } from "../constants";
import { precisionRound } from '../lib/util';
import { FIAT_CALL_REQUEST, SET_CURRENCY } from '../redux/action-types';
import { setCurrency } from "../redux/actions";
import { DelayedSpinner } from './ui';
import { CurrencySelector } from './currency-selector';

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
