const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledEscrow = require('./build/Escrow.json');

const provider = new HDWalletProvider( // @@@ TODO import our own from file outside version control
    'call glow acoustic vintage front ring trade assist shuffle mimic volume reject',
    'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledEscrow.interface))
                                 .deploy({ data: '0x' + compiledEscrow.bytecode })
                                 .send({ from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
};
deploy();
