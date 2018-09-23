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
