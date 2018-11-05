import { combineReducers } from "redux";
import { drizzleReducers } from 'drizzle';
import fiat from './fiat';
import currency from './currency';
import domain from './domain';
import showBalance from './toggle-balance';
import assets from './assets';


export default combineReducers({ fiat, currency, domain, assets, showBalance, ...drizzleReducers });
