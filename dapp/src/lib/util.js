import { AGENT_FEES, HANDLING_FEE } from '../constants';

import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8546"); // for now @@@@@@

export const getPriceBreakdownInWei = (priceInEther, agentKey) => {
    if(!priceInEther) priceInEther = '0';
    const netPrice = web3.utils.toWei(priceInEther, 'ether');
    const netPriceBN = web3.utils.toBN(netPrice); // needed for math with big wei numbers
    const escrowfee = agentKey ? netPriceBN.divn(1000).muln(AGENT_FEES[agentKey]) : web3.utils.toBN('0');
    const handlingfee = netPriceBN.divn(1000).muln(HANDLING_FEE);
    const salesPrice = netPriceBN.add(escrowfee).add(handlingfee);
    return { netPrice, escrowfee:escrowfee.toString(10), handlingfee: handlingfee.toString(10), salesPrice: salesPrice.toString(10) };
};

export const getSalesPriceInWei = (asset) => {
    const priceInEther = web3.utils.fromWei(asset.price);
    const { salesPrice } = getPriceBreakdownInWei(priceInEther, asset.agent);
    return salesPrice;
};

export const formatAmount = (currency, amount) => {
    const BN = web3.utils.BN;
    if(currency === 'eth') {
        return '\u039E ' + amount;
        // @@@@@@@@@@@@@@@@ vvvvvvv
        amount = '31415926500000000000';
        const balanceWeiBN = new BN(amount);
        const decimals = 18;
        const decimalsBN = new BN(decimals);
        const divisor = new BN(10).pow(decimalsBN);

        const beforeDecimal = balanceWeiBN.div(divisor);
        const afterDecimal  = balanceWeiBN.mod(divisor);
        return `${beforeDecimal}.${afterDecimal} wei`;
    }
    // Fiat below
    let locale = navigator.language || 'en-US';
    if(!Intl) return currency + amount.toFixed(2);
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};
