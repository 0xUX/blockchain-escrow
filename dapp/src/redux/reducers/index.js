import { combineReducers } from "redux";
import { drizzleReducers } from 'drizzle';
import balances from './balance';
import fiat from './fiat';
import currency from './currency';
import domain from './domain';
import showBalance from './toggle-balance';

export default combineReducers({ balances, fiat, currency, domain, showBalance, ...drizzleReducers });
