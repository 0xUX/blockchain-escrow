import { UPDATE_BALANCE } from '../actionTypes';

const initialState = {};

const balances = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_BALANCE: {
      const { address, balance } = action.payload;
      return {
          ...state,
          [address]: balance
      };
    }
    default:
      return state;
  }
};

export default balances;
