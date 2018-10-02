import EscrowABI from './Escrow.abi.json';
import Web3 from 'web3';

const web3 = new Web3(window.web3);

const ADDRESS = '0x8D3bE215DCf9905cBe3F65f15a8F3DDAc85c1A5A';

const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
            type: 'ws',
            url: 'ws://127.0.0.1:8545'
        }
    },
    contracts: [
        {
            contractName: 'Escrow',
            web3Contract: new web3.eth.Contract(JSON.parse(EscrowABI), ADDRESS) // An instance of a Web3 contract
        }
    ],
    events: {
        //SimpleStorage: ['StorageSet']
    },
    polls: {
        accounts: 1500
    }
};

export default drizzleOptions;
