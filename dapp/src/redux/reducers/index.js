import { combineReducers } from "redux";
import currentUser from "./currentUser";
import balances from './balance';
import assets from './assets';

export default combineReducers({ currentUser, balances, assets });
