import { TOGGLE_BALANCE } from '../action-types';

const initialState = false;

const toggleBalance = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_BALANCE: {
      return !state;
    }
    default:
      return state;
  }
};

export default toggleBalance;
