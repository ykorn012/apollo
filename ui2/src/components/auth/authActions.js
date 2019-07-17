import {
    SIGNUP_REQUEST,
    SIGNUP_SUCCESS,
    SIGNUP_FAILURE,
    GET_DEP_ROLE_REQUEST,
    GET_DEP_ROLE_SUCCESS,
    GET_DEP_ROLE_FAILURE
} from '../../actions';
import * as API from '../../api/api';


export const signup = (userDetails) => {
    return async dispatch => {
        dispatch({
            type: SIGNUP_REQUEST
        });
        try {
            const data = await API.signup(userDetails);
            dispatch({
                type: SIGNUP_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: SIGNUP_FAILURE,
                error
            });
            throw error;
        }
    };
};

export const getDeploymentRoles = () => {
    return async dispatch => {
        dispatch({
            type: GET_DEP_ROLE_REQUEST
        });
        try {
            const data = await API.getDeploymentRoles();
            dispatch({
                type: GET_DEP_ROLE_SUCCESS,
                payload: data
            });
        } catch (error) {
            dispatch({
                type: GET_DEP_ROLE_FAILURE,
                error
            });
        }
    };
};