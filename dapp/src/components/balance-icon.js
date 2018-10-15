import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { drizzleConnect } from 'drizzle-react';
import { formatAmount } from '../lib/util';
import { toggleBalance } from '../redux/actions';
import { getUserBalance } from '../redux/selectors';
import { DelayedSpinner } from './ui';


class BalanceIcon extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.web3 = context.drizzle.web3;
        this.dataKey = this.contracts.Escrow.methods.myBalance.cacheCall();
    }

    render() {
        const { toggleBalance, Escrow } = this.props;

        // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
        if(!(this.dataKey in Escrow.myBalance)) return <DelayedSpinner />;
        const balance = Escrow.myBalance[this.dataKey].value;

        return (
            <Button outline size="sm" onClick={toggleBalance}>
                {formatAmount('eth', Number(this.web3.utils.fromWei(balance)))}
            </Button>
        );
    }
};

BalanceIcon.contextTypes = {
    drizzle: PropTypes.object
};

BalanceIcon.propTypes = {
    toggleBalance: PropTypes.func.isRequired,
    Escrow: PropTypes.object.isRequired
};


const mapStateToProps = state => {
    return {
        Escrow: state.contracts.Escrow
    };
};

const BalanceIconContainer = drizzleConnect(BalanceIcon, mapStateToProps, { toggleBalance });

export default BalanceIconContainer;
