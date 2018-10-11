import { UPDATE_BALANCE, SET_CURRENCY, UPDATE_DOMAIN, TOGGLE_BALANCE } from "./action-types";

export const updateBalance = (address, balance) => ({ type: UPDATE_BALANCE, payload: { address, balance } });

export const addAsset = (assetName, asset) => ({ type: ADD_ASSET, payload: { assetName, asset } });

export const removeAsset = assetName => ({ type: REMOVE_ASSET, payload: { assetName } });

export const updateAssetPrice = (assetName, price, escrowfee, handlingfee) => ({ type: UPDATE_ASSET_PRICE, payload: { assetName, price, escrowfee, handlingfee } });

export const updateAssetState = (assetName, assetState, buyer) => ({ type: UPDATE_ASSET_STATE, payload: { assetName, assetState, buyer } });

export const setCurrency = currency => ({ type: SET_CURRENCY, payload: { currency } });

export const updateDomain = domain => ({ type: UPDATE_DOMAIN, payload: { domain } });

export const toggleBalance = () => ({ type: TOGGLE_BALANCE });
