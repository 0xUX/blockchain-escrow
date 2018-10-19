import React from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ASSET_STATES } from "../constants";
import { getPriceBreakdownInWei } from '../lib/util';
import { utils as web3utils } from 'web3';  // for now @@@@@@
import { AmountPlusFiat } from './ui';


export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);


export const AgentLink = ({ agentAccount }) => (
    <div className="card p-3 mt-1">
        <div>Hello {agentAccount}! <Link to="/agent">My personal agent page >></Link></div>
    </div>
);


export const AssetInfo = ( { asset } ) => {
    const agent = Number(asset.agent) ? asset.agent : '-';

    return (
        <ul>
            <li>Status: {ASSET_STATES[asset.state]}</li>
            <li>Escrow agent: {agent}</li>
            <li>Net price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(asset.netprice))} /></li>
            <li>Sales price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(asset.price))} /></li>
        </ul>
    );
};


export const PriceBreakdown = ({ price, agentAccount }) => {
    const { netPrice, escrowfee, handlingfee, salesPrice } = getPriceBreakdownInWei(price, agentAccount);

    return (
        <div className="border rounded small p-1 mt-2">
            Net price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(netPrice))} /><br />
            Escrow fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(escrowfee))} /><br />
            Handling fee: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(handlingfee))} /><br />
            Sales price: <AmountPlusFiat amountInEther={Number(web3utils.fromWei(salesPrice))} />
        </div>
    );
}
