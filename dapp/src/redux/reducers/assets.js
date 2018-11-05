import { ADD_ASSET, REMOVE_ASSET } from '../action-types';

const initialState = {};

const assets = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case ADD_ASSET:
            console.log('>>>>>>>>>>>>>>>>', action);
            newState = { ...state }
            newState[action.payload.domain] = action.payload.dataKey;
            return newState;
        case REMOVE_ASSET:
            newState = { ...state }
            delete newState[action.payload.domain];
            return newState;
        default:
            return state;
    }
}

export default assets;
