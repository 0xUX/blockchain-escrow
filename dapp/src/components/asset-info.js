import React from "react";
import PropTypes from 'prop-types';
import { AmountPlusFiat } from './ui';
import { ASSET_STATES } from "../constants";


export const AssetInfo = (props, context) => {
    const { asset } = props;
    const { web3 } = context.drizzle;
    const agent = Number(asset.agent) ? asset.agent : '-';

    return (
        <ul>
            <li>Status: {ASSET_STATES[asset.state]}</li>
            <li>Escrow agent: {agent}</li>
            <li>Net price: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(asset.netprice))} /></li>
            <li>Sales price: <AmountPlusFiat amountInEther={Number(web3.utils.fromWei(asset.price))} /></li>
        </ul>
    );
};

AssetInfo.contextTypes = {
    drizzle: PropTypes.object
};
