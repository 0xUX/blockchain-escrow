export function networkDetails(networkId) {
    switch (networkId) {
        case 'main':
            return {
                id: networkId,
                name: 'Ethereum Main Net',
                shortName: 'Main Net',
                etherscanUrl: 'https://etherscan.io',
                websocketUrl: 'wss://mainnet.infura.io/ws'
            };
        case 'ropsten':
            return {
                id: networkId,
                name: 'Ropsten Test Net',
                shortName: 'Ropsten',
                etherscanUrl: 'https://ropsten.etherscan.io',
                websocketUrl: 'wss://ropsten.infura.io/ws'
            };
        case 'rinkeby':
            return {
                id: networkId,
                name: 'Rinkeby Test Net',
                shortName: 'Rinkeby',
                etherscanUrl: 'https://rinkeby.etherscan.io',
                websocketUrl: 'wss://rinkeby.infura.io/ws'
            };
        case 'kovan':
            return {
                id: networkId,
                name: 'Kovan Test Net',
                shortName: 'Kovan',
                etherscanUrl: 'https://kovan.etherscan.io',
                websocketUrl: 'wss://kovan.infura.io/ws'
            };
        default:
            return {
                id: networkId,
                name: 'unknown',
                etherscanUrl: '',
                websocketUrl: ''
            };
    }
}
