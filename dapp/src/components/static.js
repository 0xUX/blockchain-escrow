import React from "react";
import { USERS, ASSET_STATES } from "../constants";
import { Link } from 'react-router-dom';
import { getSalesPrice, getPriceBreakdown } from '../lib/util';

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
        <li>Net price: {asset.price}</li>
        <li>Escrow fee: {asset.escrowfee}</li>
        <li>Handling fee: {asset.handlingfee}</li>
        <li>Sales price: {getSalesPrice(asset)}</li>
    </ul>
);

export const PriceBreakdown = ({ price, agentKey }) => {
    if(!price) price = 0;
    const { escrowfee, handlingfee, salesPrice } = getPriceBreakdown(price, agentKey);

    return (
        <div className="border rounded small p-1 mt-2">
            Net price: {price} | Escrow fee: {escrowfee} | Handling fee: {handlingfee} | Sales price: {salesPrice}
        </div>
    );
}
