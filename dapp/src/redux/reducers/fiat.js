import { FIAT_CALL_REQUEST, FIAT_CALL_SUCCESS, FIAT_CALL_FAILURE } from '../actionTypes';

const initialState = {
    fetching: false,
    fiat: null,
    error: null
};

const fiat = (state = initialState, action) => {
    switch (action.type) {
        case FIAT_CALL_REQUEST:
            return { ...state, fetching: true, error: null };
        case FIAT_CALL_SUCCESS:
            return { ...state, fetching: false, fiat: action.fiat };
        case FIAT_CALL_FAILURE:
            return { ...state, fetching: false, fiat: null, error: action.error };
        default:
            return state;
    }
}

export default fiat;
