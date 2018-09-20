## Set up

Set-up the compile and deploy functionality:

```
cd ethereum
nvm use 10
yarn
```

## Compile

Every time the contract(s) in the contracts directory change they need to be compiled:

```
cd ethereum
nvm use 10
node compile.js
```

The resulting compiled contracts can be found in the `build` directory.

## Test

Run the tests for the contracts:

```
cd ethereum
nvm use 10
yarn test
```

## Deploy

The escrow

```
cd ethereum
nvm use 10
node deploy.js
```

Make a note of the address of the contract after deployment.
