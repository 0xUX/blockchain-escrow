import { SET_CURRENT_USER, UPDATE_BALANCE, ADD_ASSET, REMOVE_ASSET, UPDATE_ASSET_PRICE, UPDATE_ASSET_STATE, SET_CURRENCY, UPDATE_DOMAIN } from "./actionTypes";

export const setCurrentUser = user => ({ type: SET_CURRENT_USER, payload: { user } });

export const updateBalance = (address, balance) => ({ type: UPDATE_BALANCE, payload: { address, balance } });

export const addAsset = (assetName, asset) => ({ type: ADD_ASSET, payload: { assetName, asset } });

export const removeAsset = assetName => ({ type: REMOVE_ASSET, payload: { assetName } });

export const updateAssetPrice = (assetName, price, escrowfee, handlingfee) => ({ type: UPDATE_ASSET_PRICE, payload: { assetName, price, escrowfee, handlingfee } });

export const updateAssetState = (assetName, assetState, buyer) => ({ type: UPDATE_ASSET_STATE, payload: { assetName, assetState, buyer } });

export const setCurrency = currency => ({ type: SET_CURRENCY, payload: { currency } });

export const updateDomain = domain => ({ type: UPDATE_DOMAIN, payload: { domain } });
