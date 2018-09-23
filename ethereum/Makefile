hi:
	echo "make {tests,compile,deploy}"

tests: build/Escrow.json
#	nvm use 10
	npm run test

deploy: build/Escrow.json build/Escrow.abi.json
	node deploy.js

build/Escrow.json build/Escrow.abi.json: contracts/escrow.sol
	node compile.js

compile: build/Escrow.json build/Escrow.abi.json


# export NVM_DIR="/Users/stan/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

