import * as actionTypes from '../actions/actionTypes';

const initialState = {
    data: null,
    fetched: false,
    isFetching: false,
    error: false,
};

export default function pathBookmarkedReducer(state = initialState, action) {



    switch (action.type) {
        case actionTypes.FETCHING_PATH_BOOKMARKED:
            return {
                ...state,
                isFetching: true
            };
        case actionTypes.FETCH_PATH_BOOKMARKED_SUCCESS:
            let newData = [...((state.data != null) ? state.data: []), ...action.data];
            if (action.page === 1) {
                newData = action.data;
            }
            return {
                ...state,
                isFetching: false,
                fetched: true,
                data: newData
            };
        case actionTypes.FETCH_PATH_BOOKMARKED_FAILURE:
            return {
                ...state,
                isFetching: false,
                fetched: true,
                error: true,
                errorMessage: action.errorMessage
            };
        default:
            return state
    }
};