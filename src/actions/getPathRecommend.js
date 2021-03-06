import * as actionTypes from './actionTypes';

export function getPathRecommend(page, perPage) {
    return {
        type: actionTypes.FETCHING_PATH_RECOMMEND,
        page: page,
        perPage: perPage
    }
}

export function getPathRecommendSuccess(data, page) {
    return {
        type: actionTypes.FETCH_PATH_RECOMMEND_SUCCESS,
        data: data.viewer.pathRecommendPagination.items,
        count: data.viewer.pathRecommendPagination.count,
        page: page
}
}


export function getPathRecommendFailure(error) {
    return {
        type: actionTypes.FETCH_PATH_RECOMMEND_FAILURE,
        errorMessage: error
    }
}