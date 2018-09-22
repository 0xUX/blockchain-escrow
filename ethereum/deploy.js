// node deploy.js
//
// deploy script, grabs the compiled contract and deploys it on the Rinkeby network

const compiledContract = require('./build/Escrow.json');

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const provider = new HDWalletProvider(
    'control repair master prize hello rapid tackle pony liquid offer title slab',
    'https://rinkeby.infura.io/v3/adf3f446cec440bd8975fa9214391db3'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const contractFee = 5;
    accounts = await web3.eth.getAccounts();
//     console.log('Interface', compiledContract.interface);    
    console.log('Deploying from', accounts[0]);

//     var contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface));
//     var contractData = contract.new.getData(contractFee, {data: '0x'+compiledContract.bytecode});
//     var estimate = web3.eth.estimateGas({data: contractData});
//     console.log(estimate);

    const contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
        .deploy({ data: '0x'+compiledContract.bytecode, arguments: [contractFee] })
        .send({ from: accounts[0], gas: '2000000', gasPrice: web3.utils.toWei('2', 'gwei') });
    console.log('Deployed to', contract.options.address);
    console.log(contract);
};

deploy();
