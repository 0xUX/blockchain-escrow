import _ from 'lodash-es';


export const getUserAssets = store => {
    const user = store.accounts[0];
    const details = store.contracts.Escrow.details;
    const userAssets = {};
    _.forOwn(details, function(value, key) {
        const dn = value.args[0];
        userAssets[dn] = key;
    });

    return userAssets;
};


//
// export const getUserBalance = store => {
//     const user = store.currentUser;
//     if(!user || !store.balances[user]) return '0';
//     return store.balances[user];
// };


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
//
// export const getRole = (store, dn) => {
//     if(!store.assets[dn]) return null; // not for sale
//     if(userIsOwner(store)) return 'owner';
//     if(store.assets[dn].seller === store.currentUser) return 'seller';
//     if(store.assets[dn].buyer === store.currentUser) return 'buyer';
//     if(store.assets[dn].agent === store.currentUser) return 'agent'; // for this dn
//     return 'prospect';
// };
