import { combineReducers } from "redux";
import currentUser from "./currentUser";
import balances from './balance';

export default combineReducers({ currentUser, balances });
