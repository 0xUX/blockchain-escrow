import EscrowABI from './Escrow.abi.json';
import { ADDRESS } from './constants';
import Web3 from 'web3';

const web3 = new Web3(window.web3);

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
        Escrow: ['Offered', 'Retracted', 'Bought', 'FundsReleased']
    },
    polls: {
        accounts: 1500
    }
};

export default drizzleOptions;
