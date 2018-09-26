import _ from 'lodash-es';

export const getUserAssets = store => {
    const userAssets = {};
    _.forOwn(store.assets, function(value, key) {
        if (value.seller == store.currentUser) {
            userAssets[key] = value;
        }
    });
    return userAssets;
};

export const getAgentAssets = store => {
    const agentAssets = {};
    _.forOwn(store.assets, function(value, key) {
        if (value.agent == store.currentUser) {
            agentAssets[key] = value;
        }
    });
    return agentAssets;
};

export const getUserBalance = store => {
    const user = store.currentUser;
    if(!user || !store.balances[user]) return 0;
    return Number(store.balances[user]);
};

export const userIsAgent = store => {
    return userExists(store) && store.currentUser.indexOf('AGENT') === 0;
};

export const userExists = store => {
    return !!store.currentUser;
};

export const userIsOwner = store => {
    return userExists(store) && store.currentUser === 'OWNER';
};

export const getAsset = (store, dn) => {
    return store.assets[dn] || {
        seller: null,
        price: null,
        escrowfee: null,
        handlingfee: null,
        agent: null,
        buyer: null,
        blocknumber: null,
        state: 'NOTFORSALE'
    };
};

export const getRole = (store, dn) => {
    if(!store.assets[dn]) return null; // not for sale
    if(userIsOwner(store)) return 'owner';
    if(store.assets[dn].seller === store.currentUser) return 'seller';
    if(store.assets[dn].buyer === store.currentUser) return 'buyer';
    if(store.assets[dn].agent === store.currentUser) return 'agent'; // for this dn
    return 'prospect';
};
