// run `npm run test` in main project directory
// which runs mocha as defined in package.json and executes up these tests
//
// Stan P. van de Burgt
// (C) 2018 0xUX.com

// suppress MaxListeners warning, is bug in this web3 version (1.0.0-beta.26)
require('events').EventEmitter.defaultMaxListeners = 0;

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledContract = require('../build/Escrow.json');

const CONTRACT_FEE = 5;                           // parameter to contract, the escrow fee of it, in 1/1000 (0.5%)
const AGENT_FEE = 150;                            // parameter to enroll(), the agent escrow fee, in 1/1000 (15%)
const INITBAL = web3.utils.toWei('1', 'ether');   // amount buyer funds het account with
const A_NAME = 'test.com';                        // name of asset to sell / buy
const A_PRICE = web3.utils.toWei('0.1', 'ether'); // net price of asset, as set by seller
const A_PRICE_TTL = String(Number(A_PRICE) + Number(A_PRICE)/1000*CONTRACT_FEE);
const A_PRICE_AGENT_TTL = String(Number(A_PRICE_TTL) + Number(A_PRICE)/1000*AGENT_FEE);
const ADDR0 = '0x0000000000000000000000000000000000000000';

let accounts;
let owner, walletacct, agent, seller, buyer, bystander, otheracct;
let contract;

beforeEach(async () => {
    // get a set of accounts, in this case from ganache
    accounts = await web3.eth.getAccounts();
    // give first 5 accounts (0..4) a name
    [owner, walletacct, agent, seller, buyer, bystander, otheracct] = accounts;
    // parse the ABI and deploy the associated contract from account 0
    contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
        .deploy({ data: compiledContract.bytecode, arguments: [CONTRACT_FEE] })
        .send({ from: owner, gas: '4000000' });
    // set default gas price to 2 Gwei
    contract.options.gasPrice = web3.utils.toWei('2', 'gwei');
    contract.options.gas = '4000000';
    // set destination for contract fees
    await contract.methods.setWallet(walletacct).send({ from: owner });
    // enroll account[1] as agent with 15% fee
    await contract.methods.enroll(agent, AGENT_FEE).send({ from: owner });
});

describe('Escrow', () => {
    it('deploys a contract', () => {
        assert.ok(contract.options.address);
    });
    it('initial account balance of owner is 0', async () => {
        const bal = await contract.methods.myBalance().call();
        assert.strictEqual(bal, '0');
    });
    it('checks contract fee bounds upon creation', async () => {
        try {
            await new web3.eth.Contract(JSON.parse(compiledContract.interface))
                .deploy({ data: compiledContract.bytecode, arguments: [256] })
                .send({ from: owner, gas: '4000000' });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "can create a contract with fee > 255");
        }
        try {
            await new web3.eth.Contract(JSON.parse(compiledContract.interface))
                .deploy({ data: compiledContract.bytecode, arguments: [0] })
                .send({ from: owner, gas: '4000000' });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "can create a contract with fee 0");
        }
    });
    it('contract does not accept ether outside fund()/buy()', async () => {
        try {
            // try to send ether to the contract - should revert
            await web3.eth.sendTransaction({ value: 1, to: contract.options.address, from: bystander });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "could send ether to fallback()");
        }
    });
    it('emergency break: exit() should send contract balance to owner', async () => {
        await contract.methods.fund().send({ from: buyer, value: INITBAL });
        const ownerBalStart = await web3.eth.getBalance(owner); // get the account balance of owner
        const tx = await contract.methods.exit().send({ from: owner });
        // console.log("TX:", tx); used 13638 gas, at 2 gwei
        const ownerBalEnd = await web3.eth.getBalance(owner);   // get the account balance of owner
        const used = INITBAL-(ownerBalEnd-ownerBalStart);       // used in the exit() call
        assert.ok(used < web3.utils.toWei('0.001', 'ether'), "owner did not get contract balance upon exit()");
    });
    it('after selfdestruct contact should not be active', async () => {
        const tx = await contract.methods.exit().send({ from: owner });
        const code = await web3.eth.getCode(contract.options.address);
//         console.log("contract code address:", code);
        assert.strictEqual(code, "0x0", "contract still live after exit()");
    });
    it('only owner can set fee wallet', async () => {
        await contract.methods.setWallet(walletacct).send({ from: owner });
        try {
            // try to set fee wallet while not owner - should fail
            await contract.methods.setWallet(bystander).send({ from: bystander });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "non owner could enroll an account");
        }
    });
    it('can enroll and dismiss an escrow agent as an owner', async () => {
        var isAgent;
        await contract.methods.enroll(bystander, AGENT_FEE).send({ from: owner });
        isAgent = await contract.methods.isAgent(bystander).call();
        assert.strictEqual(isAgent, true, "account is not an agent after enroll");
        await contract.methods.dismiss(bystander).send({ from: owner });
        isAgent = await contract.methods.isAgent(bystander).call();
        assert.strictEqual(isAgent, false, "account is an agent after dismiss");
        isAgent = await contract.methods.isAgent(owner).call();
        assert.strictEqual(isAgent, false, "owner is an agent without enroll");
    });
    it('cannot register an escrow agent if not owner', async () => {
        try {
            // try to enroll an account while not owner - should fail
            await contract.methods.enroll(otheracct, AGENT_FEE).send({ from: bystander });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "non owner could enroll an account");
        }
        const isAgent = await contract.methods.isAgent(otheracct).call();
        assert.strictEqual(isAgent, false, "account is enrolled by bystander");
    });
    it('can fund and withdraw to/from an escrow account', async () => {
        const startBal = await web3.eth.getBalance(buyer); // get the account balance
        await contract.methods.fund().send({ from: buyer, value: INITBAL });
        const walletBal = await contract.methods.myBalance().call({ from: buyer });
        assert.strictEqual(walletBal, INITBAL);
        await contract.methods.withdraw().send({ from: buyer });
        // money should be back, wallet should be empty
        const walletEmpty = await contract.methods.myBalance().call({ from: buyer });
        assert.strictEqual(walletEmpty, '0');
        const endBal = await web3.eth.getBalance(buyer); // get the account balance again
        // console.log("Buyer spent on gas:", web3.utils.fromWei(startBal, 'ether')-web3.utils.fromWei(endBal, 'ether'), "ether");
        const contractBal = await web3.eth.getBalance(contract.options.address); // get the contract balance
        assert.strictEqual(contractBal, '0'); // Contract balance is 0 again
    });
    it('E2E: can sell a domain via agent', async () => {
        const walletBalStart = await web3.eth.getBalance(walletacct); // get the contract fee account balance
        await contract.methods.offerViaAgent(A_NAME, A_PRICE, agent).send({ from: seller });
        // check the storage record
        var info = await contract.methods.details(A_NAME).call({ from: owner });
        assert.strictEqual(info['seller'], seller);
        assert.strictEqual(info['agent'], agent);
        assert.ok(info['forsale']); // should be for sale
        assert.ok(!info['paid']); // should not be paid
        assert.strictEqual(info['netprice'], String(A_PRICE));
        assert.strictEqual(info['price'], String(A_PRICE_AGENT_TTL));
        // check the generated event
        var events = await contract.getPastEvents('Offered');
        assert.strictEqual(events[0].returnValues['agent'], agent);
        assert.strictEqual(events[0].returnValues['seller'], seller);
        assert.strictEqual(events[0].returnValues['name'], A_NAME);
        assert.strictEqual(events[0].returnValues['price'], A_PRICE_AGENT_TTL);
        // now the buyer acquires it
        await contract.methods.fund().send({ from: buyer, value: INITBAL });
        await contract.methods.buy(A_NAME).send({ from: buyer });
        // check asset state
        info = await contract.methods.details(A_NAME).call({ from: owner });
        assert.ok(!info['forsale']); // should not be for sale
        assert.ok(info['paid']); // should  be paid
        // check for a Bought event
        events = await contract.getPastEvents('Bought');
        assert.ok(events[0]) // should return one
        // agent should not be able to confirm delivery yet
        try {
            await contract.methods.release(A_NAME).send({ from: agent });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "agent could confirm delivery too soon");
        }
        // skip 10 blocks
        for (var i = 0; i < 10; i++) {
            await contract.methods.fund().send({ from: owner, value: 1 });
        }
        // seller should not be able to confirm delivery
        try {
            await contract.methods.release(A_NAME).send({ from: seller });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "seller could confirm delivery");
        }
        // agent can confirm delivery
        await contract.methods.release(A_NAME).send({ from: agent });
        // check balances of all parties
        const sellerBal = await contract.methods.myBalance().call({ from: seller });
        assert.strictEqual(sellerBal, A_PRICE);
        const agentBal = await contract.methods.myBalance().call({ from: agent });
        assert.strictEqual(agentBal, String(Number(A_PRICE)/1000*AGENT_FEE));
        const buyerBal = await contract.methods.myBalance().call({ from: buyer });
        assert.strictEqual(buyerBal, String(Number(INITBAL)-Number(A_PRICE_AGENT_TTL)));
        // check the contract fee account too
        const walletBalEnd = await web3.eth.getBalance(walletacct); // get the contract fee account balance
        const earned = Number(walletBalEnd)-Number(walletBalStart); // earned fee
        assert.strictEqual(earned, Number(A_PRICE)/1000*CONTRACT_FEE);
        // check the generated event
        var events = await contract.getPastEvents('FundsReleased');
        assert.strictEqual(events[0].returnValues['agent'], agent);
        assert.strictEqual(events[0].returnValues['buyer'], buyer);
        assert.strictEqual(events[0].returnValues['price'], A_PRICE);
        // now someone can put the domain up for sale again
        await contract.methods.offerDirect(A_NAME, A_PRICE).send({ from: bystander });
        var info = await contract.methods.details(A_NAME).call({ from: owner });
        assert.strictEqual(info['seller'], bystander);
        assert.ok(info['forsale']); // should be for sale
        assert.ok(!info['paid']); // should not be paid
        // check the generated event
        var events = await contract.getPastEvents('Offered'); // note the old offer at [1] 
        assert.strictEqual(events[0].returnValues['agent'], ADDR0); // not via agent
        assert.strictEqual(events[0].returnValues['seller'], bystander);
        assert.strictEqual(events[0].returnValues['name'], A_NAME);
        assert.strictEqual(events[0].returnValues['price'], A_PRICE_TTL);
    });
    it('can sell a domain to specific buyer', async () => {
        await contract.methods.offerBuyerDirect(A_NAME, A_PRICE, buyer).send({ from: seller });
        // now a bystander tries to acquire it, should fail
        try {
            await contract.methods.buy(A_NAME).send({ from: bystander, value: INITBAL });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "bystander could buy");
        }
        // now the buyer acquires it
        await contract.methods.buy(A_NAME).send({ from: buyer, value: INITBAL });
        info = await contract.methods.details(A_NAME).call({ from: owner });
        assert.ok(!info['forsale']); // should not be for sale
    });
    it('can offer a domain without an agent', async () => {
        await contract.methods.offerDirect(A_NAME, A_PRICE).send({ from: seller });
        // check the storage
        var info = await contract.methods.details(A_NAME).call({ from: owner });
        assert.strictEqual(info['seller'], seller);
        assert.strictEqual(info['agent'], ADDR0); // not via agent
        assert.ok(info['forsale']); // should be for sale
        assert.ok(!info['paid']); // should not be paid
        assert.strictEqual(info['netprice'], A_PRICE);
        assert.strictEqual(info['price'], A_PRICE_TTL);
        // console.log(info);
    });
    it('seller can retract when not sold, but bystander cannot', async () => {
        await contract.methods.offerDirect(A_NAME, A_PRICE).send({ from: seller });
        // bystander cannot retract the offer
        try {
            await contract.methods.retract(A_NAME).send({ from: bystander });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "bystander could retract");
        }
        // seller can retract the offer, as it's not sold yet
        await contract.methods.retract(A_NAME).send({ from: seller });
        // check for a Retracted event
        events = await contract.getPastEvents('Retracted');
        assert.ok(events[0]) // should return one
        // the asset should be removed from storage
        try {
            var info = await contract.methods.details(A_NAME).call({ from: owner });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "asset found");
        }
    });
    it('agent can retract when not sold', async () => {
        await contract.methods.offerViaAgent(A_NAME, A_PRICE, agent).send({ from: seller });
        // agent can retract the offer, as it's not sold yet
        await contract.methods.retract(A_NAME).send({ from: agent });
        // the asset should be removed from storage
        try {
            var info = await contract.methods.details(A_NAME).call({ from: owner });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "asset found");
        }
    });
    it('seller cannot retract when sold, but (only) owner can cleanup', async () => {
        await contract.methods.offerDirect(A_NAME, A_PRICE).send({ from: seller });
        await contract.methods.buy(A_NAME).send({ from: buyer, value: INITBAL });
        // retract is not allowed anymore after asset is bought
        try {
            await contract.methods.retract(A_NAME).send({ from: seller });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "bystander could retract");
        }
        // only owner is allowed to cleanup
        try {
            await contract.methods.cleanup(A_NAME).send({ from: seller });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "bystander could retract");
        }
        await contract.methods.cleanup(A_NAME).send({ from: owner });
        // now there should be no record anymore
        try {
            var info = await contract.methods.details(A_NAME).call({ from: owner });
            assert.fail() // should not be reached
        } catch (error) {
            assert.ok(/revert/.test(error.message), "asset found");
        }
        // buyer should have her money back
        const walletBal = await contract.methods.myBalance().call({ from: buyer });
        assert.strictEqual(walletBal, INITBAL);
    });
});
