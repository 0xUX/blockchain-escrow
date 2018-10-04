import { SET_CURRENCY } from '../action-types';
import { CURRENCIES } from "../../constants";

const initialState = 'USD';

const currency = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENCY: {
            if(CURRENCIES.indexOf(action.payload.currency) >= 0) {
                return action.payload.currency;
            }
        }
        default: {
            return state;
        }
    }
};

export default currency;
