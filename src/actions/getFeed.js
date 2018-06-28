import * as actionTypes from './actionTypes';

export function getFeed(page, perPage) {
    return {
        type: actionTypes.FETCHING_FEED,
        page: page,
        perPage: perPage,
        skip: page * perPage
    }
}

export function getFeedSuccess(data, skip) {
    return {
        type: actionTypes.FETCH_FEED_SUCCESS,
        data: data.viewer.feedPagination.items,
        skip: skip,
        count: data.viewer.feedPagination.count
    }
}


export function getFeedFailure(error) {
    return {
        type: actionTypes.FETCH_FEED_FAILURE,
        errorMessage: error
    }
}