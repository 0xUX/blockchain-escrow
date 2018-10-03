import { ADD_ASSET, REMOVE_ASSET, UPDATE_ASSET_PRICE, UPDATE_ASSET_STATE } from '../actionTypes';

const initialState = {};

const assets = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ASSET: {
            const { assetName, asset } = action.payload;
            return {
                ...state,
                [assetName]: asset
            };
        }
        case REMOVE_ASSET: {
            const { assetName } = action.payload;
            const { [assetName]: discard, ...rest } = state;
            return { ...rest };
        }
        case UPDATE_ASSET_PRICE: {
            const { assetName, price, escrowfee, handlingfee } = action.payload;
            return {
                ...state,
                [assetName]: {
                    ...state[assetName],
                    price: price,
                    escrowfee: escrowfee,
                    handlingfee: handlingfee
                }
            };
        }
        case UPDATE_ASSET_STATE: {
            const { assetName, assetState, buyer } = action.payload;
            return {
                ...state,
                [assetName]: {
                    ...state[assetName],
                    state: assetState,
                    buyer: buyer
                }
            };
        }
        default:
            return state;
    }
};

export default assets;
