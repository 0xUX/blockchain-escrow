import { combineReducers } from "redux";
import { drizzleReducers } from 'drizzle';
import fiat from './fiat';
import currency from './currency';
import domain from './domain';
import showBalance from './toggle-balance';

export default combineReducers({ fiat, currency, domain, showBalance, ...drizzleReducers });
