import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { AmountPlusFiat } from './ui';
import { CurrencySelector } from './currency-selector';
import { getMyBalance } from '../redux/selectors';

class Balance extends Component {
    handleWithdraw = (e) => {
        e.preventDefault();
        const { web3 } = this.context.drizzle;
        // TBI @@@@
    }

    render() {
        const { balance, fiat, currency } = this.props;
        const { web3 } = this.context.drizzle;

        if(!balance) return null;
        const balanceInEther = Number(web3.utils.fromWei(balance.value));
        return (
            <div className="card p-3 mt-1">
                <p>Current balance: <AmountPlusFiat amountInEther={balanceInEther} /></p>
                <CurrencySelector />
                {balance.value > 0 && <div className="mt-3"><Button onClick={this.handleWithdraw}>withdraw</Button></div>}
            </div>
        );
    }
};

Balance.contextTypes = {
    drizzle: PropTypes.object
};

Balance.propTypes = {
    Escrow: PropTypes.object.isRequired,
    fiat: PropTypes.object.isRequired,
    currency: PropTypes.string.isRequired,
    balance: PropTypes.object
};

const mapStateToProps = state => {
    const balance = getMyBalance(state);
    return {
        Escrow: state.contracts.Escrow,
        fiat: state.fiat,
        currency: state.currency,
        balance
    };
};

export default drizzleConnect(Balance, mapStateToProps);
