export const AGENT_FEES = { // @@@ replace with call to contract
    '0x6c5b75696fe3c78e6b151180b38d9905098b7167': 10, // promilage
    '0xd023dbe4b4d09537a60d655cf6969679dc732b6e': 20
};

export const ASSET_STATES = {
    forsale: 'For sale',
    paid: 'Paid (in escrow)',
    released: 'Sold',
    notforsale: 'Not for sale'
};

export const HANDLING_FEE = 5; // promilage @@@

export const CURRENCIES = ['AUD', 'CNY', 'EUR', 'GBP', 'JPY', 'USD'];

export const DISPLAY_ETHER_DECIMALS = 3;
export const INPUT_ETHER_DECIMALS = 18;

// TODO @@@ move below this line to config file
export const NETWORK_ID = 1539157016453;
export const FROM_BLOCK = 0;
export const ADDRESS = '0x8c338c228d33048d59d6c78bed6b76418132c8ff';
export const AGENTS = ['0x6c5b75696fe3c78e6b151180b38d9905098b7167']

// export const NETWORK_ID = 4; // Rinkeby
// export const FROM_BLOCK = 3100000; // No need to look before this block on rinkeby
// export const ADDRESS = '0x7e1F1EC2F7FB6ff9a6EE30556f75c9589141a05d'; // contract address on Rinkeby
// export const AGENTS = ['0xd023dbe4b4d09537a60d655cf6969679dc732b6e', '0x6c5b75696fe3c78e6b151180b38d9905098b7167']
