const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const interfaceOnlyPath = path.resolve(__dirname, '../dapp/src/contracts/abi');
fs.removeSync(interfaceOnlyPath);

const contractPath = path.resolve(__dirname, 'contracts', 'escrow.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);
fs.ensureDirSync(interfaceOnlyPath);

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.substring(1) + '.json'),
        output[contract]
    );
    fs.outputJsonSync(
        path.resolve(interfaceOnlyPath, contract.substring(1) + '.json'),
        output[contract].interface
    );
}
