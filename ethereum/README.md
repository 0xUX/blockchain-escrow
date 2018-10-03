# Escrow Contract

## Seting up

Set-up the compile, test and deploy functionality:

```
cd ethereum
# nvm use 10
yarn
```

## Testing the contract

Run the tests for the contracts:

```
cd ethereum
make tests
```

If all tests succeed, you're ready for to deploy the contract on the Rinkeby test network.
To play with the contract locally, just open `ethereum/escrow.sol` in [Remix](http://remix.ethereum.org/), compile and deploy on the JavaScript VM.

## Deploy on the Rinkeby network

As we use the [HD Wallet-enabled Web3 provider](https://github.com/trufflesuite/truffle-hdwallet-provider), before deploying on the Rinkeby network the first time, you need to create the following config file: `ethereum/rinkeby-keys.json`.

This file contains the endpoint used to submit transactions, and the credentials of an Ethereum wallet used for these transactions.

### Create an endpoint

You can get your personal API key and endpoint here: [Infura dashboard](https://infura.io/dashboard):

- create an account if needed
- sign in to the dashboard
- click on "Create New Project" and name it
- select "Rinkeby" on the endpoint dropdown of the newly created project
- copy the URL displayed right under it: `https://rinkeby.infura.io/v3/API_KEY`

Use this URL in the next step.

### Create the HDWallet file

Created a file `ethereum/rinkeby-keys.json` with the following contents:

```
{
  "phrase": "SEED PHRASE OF WALLET",
  "api": "https://rinkeby.infura.io/v3/API_KEY"
}
```

The `phrase` is the *seed phrase* of your Ethereum wallet.
[TODO: steps to set up a test account, e.g. with Metamask and get the seed]

The `api` is the Infura API endpoint that is used to submit transactions, the URL you copied on the [Infura dashboard](https://infura.io/dashboard).

Note that the endpoint includes the _network_ you are deploying to, next to the API key. Check this is indeed the *Rinkeby* test network.

### Deploy the contract

Make sure there is enough Ether on the account to deploy the contract on the chosen network, in this case the Rinkeby network. If the balance is too low, get more Ether from the [Faucet](https://www.rinkeby.io/#faucet) on this test network.

Then deploy the contract on the Rinkeby network like this:
```
cd ethereum
make deploy
```

Make a note of the address of the contract after deployment and optionally save it in `contracts/address.txt`.

Note: In case the deploy scripts times out, most of the time, the deployment still continues. You can check the status on Etherscan. The Etherscan link to the deploying account is shown by the deploy script as well.

[TODO: fix deploy script so it stops after succesful deploy]

[TODO: tell about interacting with the contract from Remix using the Injected Web3 from MetaMask]

## Deploy on the Main network

[TODO: describe & implement make target `deploy-main`]

Then deploy the contract on the Main network like this:
```
cd ethereum
make deploy-main
```




