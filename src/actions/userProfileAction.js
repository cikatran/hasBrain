import * as actionTypes from './actionTypes'

export function getUserProfile() {
    return {
        type: actionTypes.FETCHING_USER_PROFILE,
    }
}

export function getUserProfileSuccess(data) {
    return {
        type: actionTypes.FETCH_USER_PROFILE_SUCCESS,
        data: data,

    }
}

export function getUserProfileFailure(error) {
    return {
        type: actionTypes.FETCH_USER_PROFILE_FAILURE,
        errorMessage: error
    }
}

export function getUserName() {
    return {
        type: actionTypes.FETCHING_USER_NAME,
    }
}

export function getUserNameSuccess(data) {
    return {
        type: actionTypes.FETCH_USER_NAME_SUCCESS,
        data: data,

    }
}

export function getUserNameFailure(error) {
    return {
        type: actionTypes.FETCH_USER_NAME_FAILURE,
        errorMessage: error
    }
}

export function getAvatar() {
    return {
        type: actionTypes.FETCHING_AVATAR,
    }
}

export function getAvatarSuccess(data) {
    return {
        type: actionTypes.FETCH_AVATAR_SUCCESS,
        data: data,

    }
}

export function getAvatarFailure(error) {
    return {
        type: actionTypes.FETCH_AVATAR_FAILURE,
        errorMessage: error
    }
}


export function updateUserProfile(role, summary) {
    return {
        type: actionTypes.UPDATING_USER_PROFILE,
        role: role,
        summary: summary
    }
}

export function updateUserProfileSuccess() {
    return {
        type: actionTypes.UPDATE_USER_PROFILE_SUCCESS,
    }
}

export function updateUserProfileFailure(error) {
    return {
        type: actionTypes.UPDATE_USER_PROFILE_FAILURE,
        errorMessage: error
    }
}


export function getUserAnalyst() {
    return {
        type: actionTypes.FETCHING_USER_ANALYST,
    }
}

export function getUserAnalystSuccess(data) {
    return {
        type: actionTypes.FETCH_USER_ANALYST_SUCCESS,
        data: data,
    }
}

export function getUserAnalystFailure(error) {
    return {
        type: actionTypes.FETCH_USER_ANALYST_FAILURE,
        errorMessage: error
    }
}