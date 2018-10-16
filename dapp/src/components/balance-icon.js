import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { drizzleConnect } from 'drizzle-react';
import { formatAmount } from '../lib/util';
import { toggleBalance } from '../redux/actions';


class BalanceIcon extends Component {

    state = { dataKey: null };

    componentDidMount() {
        const { Escrow } = this.context.drizzle.contracts;
        const dataKey = Escrow.methods["myBalance"].cacheCall();
        this.setState({ dataKey });
    }

    render() {
        const { toggleBalance, Escrow } = this.props;
        const { web3 } = this.context.drizzle;

        const balance = Escrow.myBalance[this.state.dataKey];
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
    Escrow: PropTypes.object.isRequired
};


const mapStateToProps = state => {
    return {
        Escrow: state.contracts.Escrow
    };
};

const BalanceIconContainer = drizzleConnect(BalanceIcon, mapStateToProps, { toggleBalance });

export default BalanceIconContainer;
