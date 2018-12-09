import _ from 'lodash-es';


export const getUserAssets = store => {
    const account = store.accounts[0];
    const details = store.contracts.Escrow.details;
    const userAssets = {};
    _.forOwn(details, function(value, key) {
        // check if account is seller/agent/buyer
        const detail = value.value;
        if(detail && [detail.seller, detail.agent, detail.buyer].indexOf(account) > -1) {
            const dn = value.args[0];
            userAssets[dn] = key;
        }
    });
    return userAssets;
};


export const getAsset = (store, domain) => {
    const account = store.accounts[0];
    const details = store.contracts.Escrow.details;

    console.log(store.assets);
    if(!store.assets[domain]) return {};

    let asset = null;

    _.forOwn(details, function(value, key) {
        const dn = value.args[0];
        if(dn === domain) {
            const detail = value.value;
            // check if account is seller/agent/buyer
            if(detail && [detail.seller, detail.agent, detail.buyer].indexOf(account) > -1) {
                asset = detail;
            }
        }
    });
    return asset;
};


export const getRole = (store, domain) => {
    const account = store.accounts[0];
    const asset = getAsset(store, domain);
    if(_.isEmpty(asset, true)) return null; // not for sale
    // if(userIsOwner(store)) return 'owner';    // @@@
    if(asset.seller === account) return 'seller';
    if(asset.buyer === account) return 'buyer';
    if(asset.agent === account) return 'agent';
    return 'prospect';
};


export const getMyBalance = store => {
    const myBalance = store.contracts.Escrow.myBalance;
    if(myBalance && myBalance['0x0']) return myBalance['0x0'].value;
    return null;
};


export const getHandlingPermillage = store => {
    const handlingPermillage = store.contracts.Escrow.handling_permillage;
    if(handlingPermillage && handlingPermillage['0x0']) return handlingPermillage['0x0'].value;
    return null;
};


export const getWhoAmI = store => {
    const account = store.accounts[0];
    const whois = store.contracts.Escrow.whois;
    if(whois) {
        for (const [key, value] of Object.entries(whois)) {
            if(value && value.args && value.args[0] === account) {
                return value;
            }
        }
    }
    return null;
};


export const userExists = store => {
    return !!store.accounts[0];
};

// export const userIsOwner = store => {
//     return userExists(store) && store.currentUser === 'OWNER';
// };

//
// export const getAsset = (store, dn) => {
//     return store.assets[dn] || {
//         seller: null,
//         price: null,
//         escrowfee: null,
//         handlingfee: null,
//         agent: null,
//         buyer: null,
//         blocknumber: null,
//         state: 'NOTFORSALE'
//     };
// };
