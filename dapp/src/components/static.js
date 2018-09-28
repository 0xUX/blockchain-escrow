import React from "react";
import { USERS, ASSET_STATES } from "../constants";
import { Link } from 'react-router-dom';
import { getPriceBreakdownInWei, getSalesPriceInWei } from '../lib/util';
import { utils as web3utils } from 'web3';  // for now @@@@@@

export const NoMatch = ({ location }) => (
    <div>Page not found: <code>{location.pathname}</code></div>
);

export const AgentLink = ({ agentKey }) => (
    <div className="card p-3 mt-1">
        <div>Hello {USERS[agentKey]}! <Link to="/agent">My personal agent page >></Link></div>
    </div>
);

export const AssetInfo = ( { asset } ) => (
    <ul>
        <li>Status: {ASSET_STATES[asset.state]}</li>
        <li>Escrow agent: {asset.agent ? USERS[asset.agent] : '-'}</li>
        <li>Net price: {web3utils.fromWei(asset.price)}</li>
        <li>Escrow fee: {web3utils.fromWei(asset.escrowfee)}</li>
        <li>Handling fee: {web3utils.fromWei(asset.handlingfee)}</li>
        <li>Sales price: {web3utils.fromWei(getSalesPriceInWei(asset))}</li>
    </ul>
);

export const PriceBreakdown = ({ price, agentKey }) => {
    const { netPrice, escrowfee, handlingfee, salesPrice } = getPriceBreakdownInWei(price, agentKey);

    return (
        <div className="border rounded small p-1 mt-2">
            Net price: {web3utils.fromWei(netPrice)} | Escrow fee: {web3utils.fromWei(escrowfee)} | Handling fee: {web3utils.fromWei(handlingfee)} | Sales price: {web3utils.fromWei(salesPrice)}
        </div>
    );
}
