import { AGENT_FEES, HANDLING_FEE, DISPLAY_ETHER_DECIMALS } from '../constants';
import { utils as web3utils } from 'web3';  // for now @@@@@@

export const getPriceBreakdownInWei = (priceInEther, agentKey) => {
    if(!priceInEther) priceInEther = '0';
    const netPrice = web3utils.toWei(priceInEther, 'ether');
    const netPriceBN = web3utils.toBN(netPrice); // needed for math with big wei numbers
    const escrowfee = agentKey ? netPriceBN.divn(1000).muln(AGENT_FEES[agentKey]) : web3utils.toBN('0');
    const handlingfee = netPriceBN.divn(1000).muln(HANDLING_FEE);
    const salesPrice = netPriceBN.add(escrowfee).add(handlingfee);
    return { netPrice, escrowfee:escrowfee.toString(10), handlingfee: handlingfee.toString(10), salesPrice: salesPrice.toString(10) };
};

export const getPriceBreakdownInEther = (priceInEther, agentKey) => {
    if(typeof priceInEther !== 'number') console.warn('priceInEther must be a number. Only use BN or strings for high precision calc.');
    const precision = 10 ** DISPLAY_ETHER_DECIMALS;
    if(!priceInEther) priceInEther = 0;
    const escrowfee = agentKey ? priceInEther / 1000 * AGENT_FEES[agentKey] : 0;
    const handlingfee = priceInEther / 1000 * HANDLING_FEE;
    const salesPrice = priceInEther + escrowfee + handlingfee;
    return { priceInEther, escrowfee, handlingfee, salesPrice };
};

export const getSalesPriceInWei = (asset) => {
    const priceInEther = web3utils.fromWei(asset.price);
    const { salesPrice } = getPriceBreakdownInWei(priceInEther, asset.agent);
    return salesPrice;
};

export const getSalesPriceInEther = (asset) => {
    const priceInEther = Number(web3utils.fromWei(asset.price));
    const { salesPrice } = getPriceBreakdownInEther(priceInEther, asset.agent);
    return salesPrice;
};

export const formatAmount = (currency, amount) => {
    if(typeof amount !== 'number') console.warn('Amount must be a number. Only use BN or strings for high precision calc.');
    const precision = 10 ** DISPLAY_ETHER_DECIMALS;
    if(currency === null) return String(Math.round(amount * precision) / precision);
    if(currency === 'eth') return '\u039E ' + Math.round(amount * precision) / precision;
    // Fiat below
    let locale = navigator.language || 'en-US';
    if(!Intl) return currency + ' ' + amount.toFixed(2);
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};
