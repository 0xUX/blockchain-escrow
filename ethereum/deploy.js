// node deploy.js
//
// deploy script, grabs the compiled contract and deploys it on the network

const util = require('util');
const assert = require('assert');

const network = process.argv[2]; // rinkeby or main
assert.ok(network, "usage: "+process.argv[1]+" <network>");

const compiledContract = require('./build/Escrow.json');

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

//const walletKeys = require('./rinkeby-keys.json');
const walletKeys = require(util.format('./%s-keys.json', network));
const provider = new HDWalletProvider(walletKeys.phrase, walletKeys.api);
const web3 = new Web3(provider);

const deploy = async () => {
    const contractFee = 5;
    accounts = await web3.eth.getAccounts();
    console.log('Deploying on', network);
    if (network == "main") {
        console.log('From:', 'https://etherscan.io/address/'+accounts[0]);
    }
    else {
        console.log(util.format('From: https://%s.etherscan.io/address/%s', network, accounts[0]));
    }

//     var contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface));
//     var contractData = contract.new.getData(contractFee, {data: '0x'+compiledContract.bytecode});
//     var estimate = web3.eth.estimateGas({data: contractData});
//     console.log(estimate);

    try {
        const contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: '0x'+compiledContract.bytecode, arguments: [contractFee] })
            .send({ from: accounts[0], gas: '5000000', gasPrice: web3.utils.toWei('2', 'gwei') });
        console.log('Deployed :) Contract at', contract.options.address);
    } catch (error) {
        console.log(error);
        console.log('Failed to deploy :(');
        process.exit(1);
    }

    // const fs = require('fs');
    // fs.appendFileSync('deployed.txt', contract.options.address + '\n');

    process.exit(0);
};

deploy();
