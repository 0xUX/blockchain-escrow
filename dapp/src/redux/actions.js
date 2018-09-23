import { SET_CURRENT_USER } from "./actionTypes";
import { UPDATE_BALANCE } from './actionTypes';
import { UPDATE_ASSET } from './actionTypes';

export const setCurrentUser = user => ({ type: SET_CURRENT_USER, payload: { user } });

export const updateBalance = (address, balance) => ({ type: UPDATE_BALANCE, payload: { address, balance} });

export const updateAsset = (assetName, asset) => ({ type: UPDATE_ASSET, payload: { assetName, asset} });
