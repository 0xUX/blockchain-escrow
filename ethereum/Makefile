# (C) 2018 0xUX.com
#
# Stan P. van de Burgt

hi:
	echo "make {setup,tests,compile,deploy,deploy-main,clean}"

# setup node modules
setup:
	yarn

# run tests
tests: build/Escrow.json
	npm run test

# deploy contract on Rinkeby network
deploy: build/Escrow.json build/Escrow.abi.json rinkeby-keys.json
	node deploy.js rinkeby

# deploy contract on main network
deploy-main: build/Escrow.json build/Escrow.abi.json main-keys.json
	node deploy.js main

# ABI and compiled code dependencies
build/Escrow.json build/Escrow.abi.json: contracts/escrow.sol
	node compile.js

# convenience target to create the ABI, EVM code etc.
compile: build/Escrow.json build/Escrow.abi.json

clean:
	/bin/rm -rf ./build

# export NVM_DIR="/Users/stan/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

