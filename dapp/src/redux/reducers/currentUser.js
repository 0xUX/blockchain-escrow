import { SET_CURRENT_USER } from '../actionTypes';
import { USERS } from "../../constants";

const initialState = USERS.USER1;

const currentUser = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_USER: {
            return action.payload.user;
        }
        default: {
            return state;
        }
    }
};

export default currentUser;
