pragma solidity ^0.4.24;

// Basic Escrow contract between 2 (seller & buyer) or 3 (& agent) parties.
//
// seller offers an asset (e.g. a domain) for sale at a certain price.
// - seller can opt to sell to a specific buyer or any buyer
// - seller can opt to assign an escrow agent to the listing
// - or any combination of these
// buyer can then buy a listed asset by committing the total price to the contract.
// upon receiving the asset, buyer (or assigned agent) release the payment to seller & agent.
// seller and agent can retract their listings while still for sale. @@@ or paid - by returning money
//
// all parties have an account balance in this contract which they can fund and witdraw from
// contract owner can enroll (and dismiss) agents
//
// (C) 2018 0xUX.com
// Stan P. van de Burgt

// not implemented: seller can set a guarantee, additional commitment that 
// both seller and buyer deposit, only returned upon release of funds. 

contract Escrow {
    event Offered (                         // domain (asset) was published
        string indexed iname,               // name of asset (will be hashed)
        address indexed seller,             // seller address
        address indexed agent,              // escrow agent (nil if direct sale)
        address buyer,                      // buyer address (nil if no designated buyer)
        string name,                        // name of asset (not hashed)
        uint price                          // total (!) price in wei
    );
    event Retracted (                       // domain (asset) listing was retracted
        string indexed iname,               // name of asset (will be hashed)
        address indexed seller,             // seller address
        address indexed agent,              // escrow agent (nil if direct sale)
        address buyer                       // buyer address (nil if no designated buyer)
    );
    event Bought (                          // domain (asset) was bought
        string indexed iname,               // name of asset (will be hashed)
        address indexed seller,             // seller address
        address indexed agent,              // escrow agent (nil if direct sale)
        address buyer                       // buyer address
    );
    event FundsReleased (                   // funds were released
        string indexed iname,               // name of asset (will be hashed)
        address indexed seller,             // seller address
        address indexed agent,              // escrow agent (nil if direct sale)
        address buyer,                      // buyer address
        uint price                          // net (!) price in wei
    );

    enum AssetState {
        FORSALE,                            // asset is put up for sale by seller
        PAID,                               // asset is paid by buyer, funds not yet released
        RELEASED                            // asset is received, funds released
    }

    struct Asset {
        address seller;                     // owner of the asset
        uint price;                         // net price of asset in wei
        uint escrowfee;                     // agent fee (in wei)
        uint handlingfee;                   // fee charged by this contract (in wei)
        address agent;                      // escrow agent - nill if direct sale
        address buyer;                      // buyer, if nill (only state=FORSALE): anyone can buy
        uint blocknumber;                   // block number when asset was PAID
        AssetState state;                   // current state
    }

//    struct Agent {
//        string name;                      // name of escrow agent
//        string url;                       // escrow agent site
//        uint8 fee;                        // fee (promilage, >0 <256)
//    }
//    Agent [] all_agents

    address contract_owner;                 // owner of this contract
    address handling_wallet;                // where eth for handling fees goes
    uint8 handling_promillage;              // owner fee on transactions
    uint constant min_blocks = 10;          // minimum number of blocks before payout

    mapping(address => uint) balances;      // wallets of all participants (including contract owner)
    mapping(address => uint8) agents;       // agents and their fee (promilage, >0 <256)
    mapping(bytes32 => Asset) assets;       // all assets offered, index by keccak256(asset_name)
    
    // Note that keccak256() is 30 gas + 6 gas for each word (rounded up) for input data

    modifier ownerOnly() {
        require(msg.sender == contract_owner, "not authorized.");
        // only contract owner is allowed to call this
        _;
    }

    constructor(uint promilage) public payable {
        // initialize contract
        require(promilage > 0, "fee too low");
        require(promilage < 256, "fee too high");
        // set contract owner, fee and fee destination account
        contract_owner = msg.sender;
        handling_wallet = msg.sender;
        handling_promillage = uint8(promilage);
        // store any ether sent in contract owner's wallet
        balances[msg.sender] += msg.value;
    }

    function () external payable {
        // fallback function. could do: balances[msg.sender] += msg.value;
        // but would take more than 2300 gas, so we opt to revert
        revert("use fund() to fund your escrow account");
    }

    /// kill this contract, send any funds left to owner (!)
    /// note: this is not sent to the handling_wallet
    /// 
    function exit() external ownerOnly {
        selfdestruct(contract_owner);
    }

    /// set destination account for handling fees
    ///
    /// @param account  Address of account receiving the fees
    /// 
    function setWallet(address account) external ownerOnly {
        handling_wallet = account;
    }

    /// offer an asset directly (no escrow agent), to any buyer
    ///
    /// @param name  Name of asset
    /// @param price Price in wei (uint)
    /// 
    function offerDirect(string name, uint price) public {
        offer(name, price, address(0), address(0)); // no specific buyer and no agent
    }

    /// offer an asset to a specific buyer directly, (no escrow agent)
    ///
    /// @param name  Name of asset
    /// @param price Price in wei (uint)
    /// @param buyer Address of buyer
    /// 
    function offerBuyerDirect(string name, uint price, address buyer) public {
        offer(name, price, buyer, address(0)); // no agent
    }

    /// offer an asset via an escrow agent, to any buyer
    ///
    /// @param name  Name of asset
    /// @param price Price in wei (uint)
    /// @param agent Address of agent
    /// 
    function offerViaAgent(string name, uint price, address agent) public {
        offer(name, price, address(0), agent); // no specific buyer
    }

    /// offer an asset to a specific buyer via an escrow agent
    ///
    /// @param name  Name of asset
    /// @param price Price in wei (uint)
    /// @param buyer Address of buyer (nil if no designated buyer)
    /// @param agent Address of agent (nil if direct sale)
    /// 
    function offer(string name, uint price, address buyer, address agent) public {
        // put the asset up for sale (or update it)
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(bytes(name).length != 0, "no name specified"); // minimum string length 1, no maximum
        if (a.seller == address(0) || a.state == AssetState.RELEASED) {
            // this is a new offer as otherwise seller field would be defined
            // or otherwise the asset is released soe we can reuse this record
            a.seller = msg.sender;
            a.state = AssetState.FORSALE;
            a.blocknumber = 0;              // not paid yet, so set to 0 (if not already) @@@ set to 2^256-1?
        }
        else {
            // update offer - only possible when still FORSALE and update by same seller 
            // alternatively the contract owner can call cleanup() first
            require(a.seller == msg.sender, "already listed, only seller can update");
            require(a.state == AssetState.FORSALE, "updates not allowed anymore");
        }
        a.price = price;
        a.buyer = buyer;
        if (agent == address(0)) {
            a.agent = address(0);
            a.escrowfee = 0;                // direct sale, no agent fees
        }
        else {
            require(agents[agent] > 0, "agent not enrolled");
            a.agent = agent;
            a.escrowfee = computeFee(price, agents[a.agent]);
        }
        a.handlingfee = computeFee(price, handling_promillage);

        // final check for uint overflow of price + fees
        uint cost = a.price + a.escrowfee + a.handlingfee;
        require(cost > a.price, "price unit overflow");
        emit Offered(name, msg.sender, agent, buyer, name, cost);
    }

    /// computeFee helper function to avoid uint overflow
    ///
    /// @param price        Net price of asset
    /// @param promillage   Fee promillage (1/1000, uint8)
    ///
    /// @return fee         Computed fee (uint)
    /// 
    function computeFee(uint price, uint8 promillage) private pure returns (uint fee) {
        fee = price * promillage;
        assert(fee / promillage == price); // check for overflow in fee computation
        fee /= 1000;
    }

    /// details of a given asset
    ///
    /// @param name  Name of asset
    ///
    /// @return address     Seller
    /// @return address     Agent
    /// @return uint        Net price
    /// @return uint        Price
    /// @return bool        For sale?
    /// @return bool        Paid by buyer?
    /// 
    function details(string name) external view 
        returns (
            address seller, address agent,
            uint netprice, uint price,
            bool forsale, bool paid
        ) {
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(a.seller != address(0), "no listing found"); // @@@ or fine to return empty record?
        seller = a.seller;
        agent = a.agent;
        netprice = a.price;
        price = a.price + a.escrowfee + a.handlingfee;
        forsale = a.state == AssetState.FORSALE;
        paid = a.state == AssetState.PAID;
    }

    /// retract an offer - by seller or agent
    ///
    /// @param name  Name of asset
    /// 
    function retract(string name) external {
        // seller or agent can retract while still for sale
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(a.seller != address(0), "no listing found");
        // only seller or agent can retract, and only while still in FORSALE state
        require(a.seller == msg.sender || a.agent == msg.sender, "not your listing");
        require(a.state == AssetState.FORSALE, "updates not allowed anymore"); //@@@ or should the money be returned
        // clears the entry in the assets mapping
        delete assets[hash];
        emit Retracted(name, a.seller, a.agent, a.buyer);
    }

    /// cleanup an offer - only by contract owner
    /// - will revert previous buy action, if any, and delete the asset record
    ///
    /// @param name  Name of asset
    /// 
    function cleanup(string name) external ownerOnly {
        // revert paid amount to buyer and remove listing (contract owner only)
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(a.seller != address(0), "no listing found");
        if (a.state == AssetState.PAID) {
            // pay back to buyer, return to FORSALE state
            uint cost = a.price + a.escrowfee + a.handlingfee;
            balances[a.buyer] += cost;
            a.state = AssetState.FORSALE;
        }
        // clears the entry in the assets mapping
        delete assets[hash];
        emit Retracted(name, a.seller, a.agent, a.buyer);
    }

    /// buy an asset with caller's account balance and sent ether, if any
    /// ether sent to this transaction is first added to the sender's balance
    ///
    /// @param name  Name of asset
    /// ether sent to this contract is added to the account balance first
    /// 
    function buy(string name) external payable {
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(a.seller != address(0), "no listing found");
        require(a.state == AssetState.FORSALE, "not for sale");
        require(a.buyer == address(0) || a.buyer == msg.sender, "not authorized to buy");

        // add any ether sent to sender's balance first, before deducting asset price
        balances[msg.sender] += msg.value;

        // ensure there is enough balance to buy now
        uint cost = a.price + a.escrowfee + a.handlingfee;
        require(balances[msg.sender] >= cost, "fund your escrow account");

        // all set, take the money in escrow (held in contract account), and set asset to PAID
        balances[msg.sender] -= cost;
        a.buyer = msg.sender;                   // sets buyer if not already
        a.state = AssetState.PAID;              // asset is now paid for by buyer
        a.blocknumber = block.number;           // makes note when it was paid
        emit Bought(name, a.seller, a.agent, a.buyer);
    }

    /// release funds to seller (and fees) after asset received - only buyer or agent can call
    /// fees will be released to agent and contract owner
    ///
    /// @param name  Name of asset
    /// 
    function release(string name) external {
        bytes32 hash = keccak256(bytes(name));
        Asset storage a = assets[hash];

        require(a.seller != address(0), "no listing found");
        // only agent or buyer can release funds of paid asset to seller
        require(a.agent == msg.sender || a.buyer == msg.sender, "not authorized to release");
        require(a.state == AssetState.PAID, "no funds pending");
        // only release after 'min_blocks' blocks mined since getting PAID
        require(block.number > a.blocknumber + min_blocks, "please retry in a few blocks");

        balances[a.seller] += a.price;              // pay seller
        if (a.agent != address(0)) {
            balances[a.agent] += a.escrowfee;       // pay agent
        }
        a.state = AssetState.RELEASED;              // asset record can be reused now
        emit FundsReleased(name, a.seller, a.agent, a.buyer, a.price);
        handling_wallet.transfer(a.handlingfee);    // pay and deposit handling fees
        // OR (not paid out directly, but increase balance):
        // balances[handling_wallet] += a.handlingfee;
    }

    /// fund caller's escrow account
    /// 
    function fund() external payable {
        require(msg.value > 0, "send more than 0 to fund your escrow account");
        balances[msg.sender] += msg.value;
    }
    
    /// withdraw (pay out) all funds from callers's escrow account
    /// 
    function withdraw() external {
        require(balances[msg.sender] > 0, "no funds in your escrow account");
        uint amount = balances[msg.sender];
        // zero the balance before sending to prevent re-entrancy attacks
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    /// myBalance get caller's escrow account balance
    ///
    /// @return balance (uint) Caller's escrow account balance
    /// 
    function myBalance() view external returns(uint) {
        return balances[msg.sender];
    }

    /// enroll or update escrow agent - only contract owner can call
    ///
    /// @param agent Address of agent
    /// @param promilage Fee of agent, in 1/1000 (uint)
    /// 
    function enroll(address agent, uint promilage) external ownerOnly {
        //@@@ allow non-owner too, possibly charging an enrollment fee
        require(agent != address(0), "illegal agent address");
        require(promilage > 0, "fee too low");
        require(promilage < 256, "fee too high");
        agents[agent] = uint8(promilage);
    }

    /// dismiss escrow agent - only contract owner can call
    ///
    /// @param agent Address of agent
    /// 
    function dismiss(address agent) external ownerOnly {
        require(agent != address(0), "illegal agent address");
        // clears the entry in the agents mapping
        delete agents[agent];
        // any assets still for sale will still pay out to agent listed upon release
    }

    /// isAgent check if someone is enrolled as agent - anyone can call
    ///
    /// @param agent Address of agent (or nill to check is caller is enrolled)
    /// @return enrolled (bool) If agent (if nil: caller) is indeed listed as agent.
    /// 
    function isAgent(address agent) external view returns (bool enrolled) {
        //@@@ replace by whois() when we store more than address & fee 
        if (agent == address(0)) {
            // check if the caller is listed as agent
            enrolled = agents[msg.sender] > 0;
        }
        else {
            enrolled = agents[agent] > 0;
        }
    }
}

// END
