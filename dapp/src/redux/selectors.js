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

export const userIsAgent = store => {
    return userExists(store) && store.currentUser.indexOf('AGENT') === 0;
};

export const userExists = store => {
    return !!store.currentUser;
};

export const userIsOwner = store => {
    return userExists(store) && store.currentUser === 'OWNER';
};
