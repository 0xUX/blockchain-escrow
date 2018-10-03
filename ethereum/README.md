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

## Deploy on the Rinkeby network

```
cd ethereum
```

Created a file `rinkeby-keys.json` with the following contents:

```
{
  "phrase": "SEED PHRASE OF WALLET",
  "api": "https://rinkeby.infura.io/v3/API_KEY"
}
```

The `phrase` is the *seed phrase* of your Ethereum wallet. 
Make sure there is enough Ether on account 0 to deploy the contract on the chosen network.

The `api` is the Infura API endpoint that is used to submit transactions. You can get your API key and endpoint here: https://infura.io/dashboard

Note that the endpoint includes the _network_ you are deploying to, next to the API key. Make sure to select the *Rinkeby* network.

Then deploy the contract like this:
```
make deploy
```

Make a note of the address of the contract after deployment.

In case the deploy scripts times out, most of the time, the deployment still continues. You can check the status on Etherscan. The Etherscan link to the deploying account is shown by the deploy script as well.

