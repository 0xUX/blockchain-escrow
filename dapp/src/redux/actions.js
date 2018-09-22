import { SET_CURRENT_USER } from "./actionTypes";
import { UPDATE_BALANCE } from './actionTypes';

export const setCurrentUser = user => ({ type: SET_CURRENT_USER, payload: { user } });

export const updateBalance = (address, balance) => ({ type: UPDATE_BALANCE, payload: { address, balance} });
