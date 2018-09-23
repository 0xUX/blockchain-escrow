import { UPDATE_ASSET } from '../actionTypes';

const initialState = {};

const assets = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ASSET: {
      const { assetName, asset } = action.payload;
      return {          
          ...state,
          [assetName]: asset
      };
    }
    default:
      return state;
  }
};

export default assets;
