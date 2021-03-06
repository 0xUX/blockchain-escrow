import { combineReducers } from "redux";
import currentUser from "./currentUser";
import balances from './balance';
import assets from './assets';
import fiat from './fiat';
import currency from './currency';
import domain from './domain';

export default combineReducers({ currentUser, balances, assets, fiat, currency, domain });
