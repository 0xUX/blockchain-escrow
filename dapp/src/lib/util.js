import { AGENT_FEES, HANDLING_FEE, DISPLAY_ETHER_DECIMALS } from '../constants';
import { utils as web3utils } from 'web3';  // for now @@@@@@

export const getPriceBreakdownInWei = (priceInEther, agentAccount) => {
    if(!priceInEther) priceInEther = '0';

    console.log(priceInEther, agentAccount, AGENT_FEES[agentAccount]);

    const netPrice = web3utils.toWei(priceInEther, 'ether');
    const netPriceBN = web3utils.toBN(netPrice); // needed for math with big wei numbers
    const escrowfee = agentAccount ? netPriceBN.divn(1000).muln(AGENT_FEES[agentAccount]) : web3utils.toBN('0');
    const handlingfee = netPriceBN.divn(1000).muln(HANDLING_FEE);
    const salesPrice = netPriceBN.add(escrowfee).add(handlingfee);
    return { netPrice, escrowfee:escrowfee.toString(10), handlingfee: handlingfee.toString(10), salesPrice: salesPrice.toString(10) };
};

export const getPriceBreakdownInEther = (priceInEther, agentAccount) => {
    if(typeof priceInEther !== 'number') console.warn('priceInEther must be a number. Only use BN or strings for high precision calc.');
    if(!priceInEther) priceInEther = 0;
    const escrowfee = agentAccount ? priceInEther / 1000 * AGENT_FEES[agentAccount] : 0;
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
    if(currency === null) return String(precisionRound(amount, DISPLAY_ETHER_DECIMALS));
    if(currency === 'eth') return '\u039E ' + String(precisionRound(amount, DISPLAY_ETHER_DECIMALS));
    // Fiat below
    let locale = navigator.language || 'en-US';
    if(!Intl) return currency + ' ' + amount.toFixed(2);
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};

export const precisionRound = (number, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
};
