import { SET_CURRENCY, UPDATE_DOMAIN, TOGGLE_BALANCE } from "./action-types";

export const setCurrency = currency => ({ type: SET_CURRENCY, payload: { currency } });

export const updateDomain = domain => ({ type: UPDATE_DOMAIN, payload: { domain } });

export const toggleBalance = () => ({ type: TOGGLE_BALANCE });
