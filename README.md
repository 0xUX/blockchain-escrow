# Blockchain Escrow

## Installation for development of front-end

Prerequisites:

* node 10.10
* yarn

First clone this repository, then:

```
cd blockchain-escrow/dapp
yarn
yarn start
```

Visit the development site at [localhost:8080](http://localhost:8080/).

## Using a local development blockchain

```
nvm use 10
ganache-cli -b 3
```

Now we have an RPC interface on [127.0.0.1:8545](http://127.0.0.1:8545/).

On MetaMask import a couple of accounts (by private key). Copy the private keys from the ganache-cli output. Make sure one account is named `owner` (the one you deploy with) and one `agent`.

To keep these accounts valid the next time, reuse this HD wallet:

```
HD Wallet
==================
Mnemonic:      item weekend dizzy firm brave trigger merry piece patch dash large liar
Base HD Path:  m/44'/60'/0'/0/{account_index}
```

Like so:

```
ganache-cli -b 3 --mnemonic="item weekend dizzy firm brave trigger merry piece patch dash large liar"
```

Copy the escrow.sol source to Remix and deploy it on "Injected web3". Make sure you use the `owner` account.

Copy the address of the contract and set it to `ADDRESS` in `constants.js.`
Also set the `agent` address to `AGENTS` in that file, and enroll the agent in the contract (via Remix).

Now make sure the MetaMask network is set to `Private Network`.

Finally figure out the networkId, e.g. by adding `console.log(networkId);` in the `Loading` compoment, and update the corresponding constant in `constants.js`.

## Build for production

To build for production:

```
cd blockchain-escrow/dapp
yarn run build
open dist/index.html
```
