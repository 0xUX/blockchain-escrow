import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { drizzleConnect } from 'drizzle-react';
import { formatAmount } from '../lib/util';
import { toggleBalance } from '../redux/actions';
import { getMyBalance } from '../redux/selectors';


class BalanceIcon extends Component {
    render() {
        const { toggleBalance, balance } = this.props;
        const { web3 } = this.context.drizzle;

        if(!balance) return null;
        return (
            <Button outline size="sm" onClick={toggleBalance}>
                {formatAmount('eth', Number(web3.utils.fromWei(balance.value)))}
            </Button>
        );
    }
};

BalanceIcon.contextTypes = {
    drizzle: PropTypes.object
};

BalanceIcon.propTypes = {
    toggleBalance: PropTypes.func.isRequired,
    balance: PropTypes.object
};


const mapStateToProps = state => {
    const balance = getMyBalance(state);
    return { balance };
};

const BalanceIconContainer = drizzleConnect(BalanceIcon, mapStateToProps, { toggleBalance });

export default BalanceIconContainer;
