import { combineReducers } from "redux";
import { drizzleReducers } from 'drizzle';
import balances from './balance';
import fiat from './fiat';
import currency from './currency';
import domain from './domain';
import showBalance from './toggle-balance';
import assets from './assets';

export default combineReducers({ balances, assets, fiat, currency, domain, showBalance, ...drizzleReducers });
