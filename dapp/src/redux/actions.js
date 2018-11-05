import { SET_CURRENCY, UPDATE_DOMAIN, TOGGLE_BALANCE, ADD_ASSET, REMOVE_ASSET } from "./action-types";

export const setCurrency = currency => ({ type: SET_CURRENCY, payload: { currency } });

export const updateDomain = domain => ({ type: UPDATE_DOMAIN, payload: { domain } });

export const toggleBalance = () => ({ type: TOGGLE_BALANCE });

export const addAsset = (dataKey, domain) => ({ type: ADD_ASSET, payload: { dataKey, domain } });

export const removeAsset = dataKey => ({ type: REMOVE_ASSET, payload: { dataKey } });
