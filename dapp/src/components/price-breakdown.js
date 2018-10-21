import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { getPriceBreakdownInWei } from '../lib/util';
import { AmountPlusFiat } from './ui';
import { getHandlingPermillage } from '../redux/selectors';


class PriceBreakdown extends Component {
    render() {
        const { price, agentAccount, handlingPermillage, agentPermillage } = this.props;
        const { web3 } = this.context.drizzle;

        if(!handlingPermillage || (agentAccount && !agentPermillage)) return null;

        const { netPrice, escrowfee, handlingfee, salesPrice } =
              getPriceBreakdownInWei(web3, price, agentAccount, handlingPermillage, agentPermillage);


        return (
            <div className="border rounded small p-1 mt-2">
              Net price: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(netPrice))} /><br />
              Escrow fee: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(escrowfee))} /><br />
              Handling fee: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(handlingfee))} /><br />
              Sales price: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(salesPrice))} />
            </div>
        );
    }
}

PriceBreakdown.contextTypes = {
    drizzle: PropTypes.object
};

PriceBreakdown.propTypes = {
    price: PropTypes.string.isRequired,
    agentAccount: PropTypes.string,
    handlingPermillage: PropTypes.string,
    agentPermillage: PropTypes.object
};

const mapStateToProps = state => {
    const handlingPermillage = getHandlingPermillage(state);
    return { handlingPermillage };
};

const PriceBreakdownContainer = drizzleConnect(PriceBreakdown, mapStateToProps);

export default PriceBreakdownContainer;
