// node compile.js
//
// compile script that outputs the contract's ABI, byte code etc
// reads: escrow.sol 
// writes: ./build/CONTRACT.json and ./build/CONTRACT.abi.json for each contract found

const sourceFile = 'escrow.sol';

const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

// read Solidity contracts
const sourcePath = path.resolve(__dirname, 'contracts', sourceFile);
const source = fs.readFileSync(sourcePath, 'utf8');

// compile with optimizer on (1)
const output = solc.compile(source, 1).contracts;
// stop here if compilation failed
if (Object.keys(output).length == 0) {
    console.log('Solc: compilation failed.', output);
    process.exit(1); // and tell the caller (e.g. make)
}

// remove and recreate ./build/ directory
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

// write JSON files to build directory
for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.substring(1) + '.json'),
        output[contract]
    );
    fs.outputJsonSync(
        path.resolve(buildPath, contract.substring(1) + '.abi.json'),
        output[contract].interface
    );
}

