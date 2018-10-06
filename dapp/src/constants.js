export const AGENT_FEES = {
    AGENT1: 10, // promilage
    AGENT2: 20
};

export const ASSET_STATES = {
    FORSALE: 'For sale',
    PAID: 'Paid (in escrow)',
    RELEASED: 'Sold',
    NOTFORSALE: 'Not for sale'
};

export const HANDLING_FEE = 5; // promilage

export const CURRENCIES = ['AUD', 'CNY', 'EUR', 'GBP', 'JPY', 'USD'];

export const DISPLAY_ETHER_DECIMALS = 3;
export const INPUT_ETHER_DECIMALS = 18;

// TODO @@@ move below this line to config file
export const NETWORK_ID = 4; // Rinkeby
export const FROM_BLOCK = 3100000; // No need to look before this block on rinkeby
export const ADDRESS = '0xa5388c8f64a6898b3b9fb5885baca6a36ffe2a08'; // contract address on Rinkeby
