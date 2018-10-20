import { DISPLAY_ETHER_DECIMALS } from '../constants';


export const getPriceBreakdownInWei = (web3, priceInEther, agentAccount, handlingPermillage, agentPermillage) => {
    if(!priceInEther) priceInEther = '0';

    console.log(web3, priceInEther, agentAccount, agentPermillage); // @@@

    const netPrice = web3.utils.toWei(priceInEther, 'ether');
    const netPriceBN = web3.utils.toBN(netPrice); // needed for math with big wei numbers
    const escrowfee = agentAccount ? netPriceBN.divn(1000).muln(agentPermillage) : web3.utils.toBN('0');
    const handlingfee = netPriceBN.divn(1000).muln(handlingPermillage);
    const salesPrice = netPriceBN.add(escrowfee).add(handlingfee);
    return { netPrice, escrowfee:escrowfee.toString(10), handlingfee: handlingfee.toString(10), salesPrice: salesPrice.toString(10) };
};

export const getPriceBreakdownInEther = (priceInEther, agentAccount, handlingPermillage, agentPermillage) => {
    if(typeof priceInEther !== 'number') console.warn('priceInEther must be a number. Only use BN or strings for high precision calc.');
    if(!priceInEther) priceInEther = 0;
    const escrowfee = agentAccount ? priceInEther / 1000 * agentPermillage : 0;
    const handlingfee = priceInEther / 1000 * handlingPermillage;
    const salesPrice = priceInEther + escrowfee + handlingfee;
    return { priceInEther, escrowfee, handlingfee, salesPrice };
};

export const getSalesPriceInWei = (web3, asset) => {
    const priceInEther = web3.utils.fromWei(asset.price);
    const { salesPrice } = getPriceBreakdownInWei(priceInEther, asset.agent);
    return salesPrice;
};

export const getSalesPriceInEther = (web3, asset) => {
    const priceInEther = Number(web3.utils.fromWei(asset.price));
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
