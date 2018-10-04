import EscrowABI from './Escrow.abi.json';

// TODO @@@, make sure EscrowABI is de laatste:
// Wat we eerder besproken hadden,  is dat jij in de dapp deploy flow iets hebt dat kijkt of er een verschil is tussen de ABI van ./ethereum/build/Escrow.abi.json (*) en de ABI in ./dapp/src/Escrow.abi.json (**) en als er een verschil (***) is de deploy niet uitvoert. Zodat je zeker weet dat je niet deployed als ABI anders is geworden.
//
// *) die kan je in jouw scripts / makefiles gemaakt worden met make compile - ik check deze met opzet niet in omdat die afgeleid is
// **) mag ook op een andere plek staan binnen ./dapp/ - aan jouw. Idee is dat je die copieert uit ./ethereum/build / en daar commit - als een marker voor waar je tegen test.
// ***) makkelijkste met cmp -s file1 file2

import Web3 from 'web3';

const web3 = new Web3(window.web3);

const ADDRESS = '0xa5388c8f64a6898b3b9fb5885baca6a36ffe2a08';

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
