import { AGENT_FEES, HANDLING_FEE } from '../constants';

export const getSalesPrice = asset => (
    Number(asset.price) + Number(asset.escrowfee) + Number(asset.handlingfee)
);

export const getPriceBreakdown = (price, agentKey) => {
    const escrowfee = agentKey ? AGENT_FEES[agentKey] / 1000 * price : 0;
    const handlingfee = HANDLING_FEE / 1000 * price;
    const salesPrice = Number(price) + Number(escrowfee) + Number(handlingfee);
    return { escrowfee, handlingfee, salesPrice };
};
