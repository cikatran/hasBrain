import * as actionTypes from '../actions/actionTypes';

const initialState = {
    data: null,
    updated: false,
    isUpdating: false,
    error: false,
};

export default function updateRecommendSourceReducer(state = initialState, action) {

    switch (action.type) {
        case actionTypes.UPDATING_RECOMMEND_SOURE:
            return {
                ...state,
                isUpdating: true
            };
        case actionTypes.UPDATE_RECOMMEND_SOURE_SUCCESS:
            return {
                ...state,
                isUpdating: false,
                updated: true,
                data: action.data
            };
        case actionTypes.UPDATE_RECOMMEND_SOURE_FAILURE:
            return {
                ...state,
                isUpdating: false,
                updated: true,
                error: true,
                errorMessage: action.errorMessage
            };
        default:
            return state
    }
};