import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { updateBalance } from '../redux/actions';
import { getUserBalance } from '../redux/selectors';
import { AmountPlusFiat } from './ui.js';
import { CurrencySelector } from './static';
import { utils as web3utils } from 'web3';  // for now @@@@@@

class Balance extends Component {
    handleWithdraw = (e) => {
        e.preventDefault();
        const { currentUser, balance, updateBalance } = this.props;
        updateBalance(currentUser, web3utils.toWei('0'));
    }

    render() {
        const { currentUser, balance, fiat, currency } = this.props;
        const balanceInEther = Number(web3utils.fromWei(balance));
        return (
            <div className="card p-3 mt-1">
                <p>Current balance: <AmountPlusFiat amountInEther={balanceInEther} /></p>
                <CurrencySelector />
                {balance > 0 && <div className="mt-3"><Button onClick={this.handleWithdraw}>withdraw</Button></div>}
            </div>
        );
    }
};

Balance.propTypes = {
    currentUser: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    updateBalance: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired,
    currency: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    const balance = getUserBalance(state);
    return { currentUser: state.currentUser, balance, fiat: state.fiat, currency: state.currency };
};

export default drizzleConnect(Balance, mapStateToProps, { updateBalance });
