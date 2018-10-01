import { UPDATE_DOMAIN } from '../actionTypes';

const initialState = '';

const domain = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DOMAIN: {
            return action.payload.domain;
        }
        default: {
            return state;
        }
    }
};

export default domain;
