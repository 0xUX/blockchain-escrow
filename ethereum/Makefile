hi:
	echo "make test | make deploy"

test: build/Escrow.json
#	nvm use 10
	npm run test

deploy: contracts/escrow.sol
	node deploy.js

build/Escrow.json: contracts/escrow.sol
	node compile.js

build/Escrow.abi.json: contracts/escrow.sol
	node compile.js



# export NVM_DIR="/Users/stan/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

