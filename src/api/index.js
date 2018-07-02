import config, {getExploreArticlesQuery} from './config';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {onError} from 'apollo-link-error'
import {InMemoryCache} from 'apollo-cache-inmemory';
import {NativeModules} from "react-native";
import {strings} from "../constants/strings";
import _ from 'lodash';
import {forkJoin} from 'rxjs';
import axios from 'axios'

const {RNCustomWebview, RNUserKit} = NativeModules;

let globalAppoloClient = null;


export const resetAuthToken = () => {
    globalAppoloClient = null;
};

const getAuthToken = () => {
    return new Promise((resolve, reject) => {
        NativeModules.RNUserKitIdentity.getProfileInfo((error, result) => {
            if (error) {
                reject(error)
            } else {
                let authToken = result[0].authToken;
                resolve(authToken);
            }
        })
    });
};

const getApolloClient = () => {
    return new Promise((resolve, reject) => {
        if (globalAppoloClient) {
            resolve(globalAppoloClient);
            return;
        }
        console.log("Create new Token");
        getAuthToken().then((authToken) => {
            console.log("Auth", authToken);
            globalAuthToken = authToken;
            const httpLinkContentkit = new HttpLink({
                uri: config.serverURL,
                headers: {
                    authorization: config.authenKeyContentKit,
                    usertoken: authToken,
                }
            });
            globalAppoloClient = new ApolloClient({
                link: errorHandler.concat(httpLinkContentkit),
                cache: new InMemoryCache()
            });
            resolve(globalAppoloClient);
        })
    });
};

const postApolloClient = (body) => {
    return new Promise((resolve, reject) => {
        getAuthToken().then((authToken) => {
            const httpLinkContentkit = new HttpLink({
                uri: config.serverURL,
                headers: {
                    authorization: config.authenKeyContentKit,
                    usertoken: authToken
                },
                method: 'POST',
                body: JSON.stringify(body)
            });
            resolve(new ApolloClient({
                link: httpLinkContentkit,
                cache: new InMemoryCache()
            }))
        })
    });

};

const gqlPost = (query) => {
    return new Promise((resolve, reject) => {
        postApolloClient().then((client) => {
            client.mutate(query).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    });
};

const errorHandler = onError(({networkError}) => {
    if (networkError == null) {
        return {error: {message: 'Unknown error'}};
    }
    switch (networkError.statusCode) {
        case 404:
            return {error: {message: 'Cannot connect to server'}};
        default:
            return {error: {message: 'Unknown error'}};
    }
});

const gqlQuery = (query) => {
    return new Promise((resolve, reject) => {
        getApolloClient().then((client) => {
            client.query({fetchPolicy: 'network-only', ...query}).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    });
};

export const getArticles = (page, perPage) => {
    return gqlQuery({
        query: config.queries.articles,
        variables: {page: page, perPage: perPage}
    })
};

export const getPlaylist = () => {
    return gqlQuery({
        query: config.queries.playlist,
    })
};

export const getUserHighLight = (page, perPage) => {
    return gqlQuery({
        query: config.queries.userHighlight,
        variables: {page: page, perPage: perPage}
    })
};

export const postBookmark = (id) => {
    return gqlPost({
        mutation: config.mutation.bookmark,
        variables: {id: id}
    })
};

export const postUnbookmark = (id) => {
    return gqlPost({
        mutation: config.mutation.unbookmark,
        variables: {id: id}
    })
};


export const postCreateIntent = (name) => {
    return gqlPost({
        mutation: config.mutation.createIntent,
        variables: {name: name}
    });
};

export const postCreateUser = () => {
    return new Promise((resolve, reject) => {
        Promise.all([_getProfileId(), getUserName()]).then((values)=>{
            gqlPost({
                mutation: config.mutation.createUser,
                variables: {profileId:values[0], name: values[1]}
            }).then(value => {resolve(value)}).catch((e)=>reject(e));
        }).catch((err)=>{
            reject(err);
        });
    });
};

export const postUserInterest = (segments, intents) => {
    return gqlPost({
        mutation: config.mutation.userInterest,
        variables: {segments: segments, intentIds: intents}
    })
};

export const postArticleCreateIfNotExist = (article) => {
    return gqlPost({
        mutation: config.mutation.articleCreateIfNotExist,
        variables: {record: article}
    })
};

export const postHighlightText = (articleId, text, position, comment, note) => {
    return gqlPost({
        mutation: config.mutation.highlightText,
        variables: {articleId: articleId, highlightedText: text, comment: comment, note: note, position: position}
    })
};

_getProfileId = () => {
    return new Promise((resolve, reject) => {
        NativeModules.RNUserKitIdentity.getProfileInfo((error, result) => {
            console.log("Profile", result);
            let profileId = result[0].id;
            resolve(profileId);
        })
    });
};

export const getUserProfile = () => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.mekey, (error, result) => {
            if (error) {
                reject(error);
            } else {
                let userProfile = _.get(result[0], strings.mekey, null);
                resolve(userProfile);
            }
        });
    });
};

export const getUserName = () => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.name, (error, result) => {
            if (error) {
                reject(error);
            } else {
                let userName = _.get(result[0], strings.name, null);
                resolve(userName);
            }
        });
    });
};

//Currently just simple for updating role and summary only. TODO: update user object
export const updateUserProfile = (role, summary) => {
    let jsonString = `{ "${strings.mekey}.role": "${role}", "${strings.mekey}.about": "${summary}" }`;
    return new Promise((resolve, reject) => {
        RNUserKit.storeProperties(jsonString, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve("Update Successfully");
            }
        });
    });
};


export const getUserAnalyst = () => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.readingTagsKey, (error, result) => {
            if (error) {
                reject(error);
            } else {
                let userAnalyst = _.get(result[0], strings.readingTagsKey, null);
                resolve(userAnalyst);
            }
        });
    });
}

export const getOnboardingInfo = () => {
    return gqlQuery({
        query: config.queries.onboardingInfo
    })
};

export const getSaved = (page, perPage, kind) => {
    return gqlQuery({
        query: config.queries.bookmark,
        variables: {page: page, perPage: perPage, kind: kind}
    });
};

export const getIntents = (segments) => {
    return gqlQuery({
        query: config.queries.intents,
        variables: {segments: segments}
    });
};

export const getUrlInfo = (url) => {
    return fetch('https://w4gpgbc6mb.execute-api.ap-southeast-1.amazonaws.com/production/v1/metadata/extract?url=' + url, {
        method: 'GET',
    }).then(response => {
        return response.json()
    }).then((responseJson) => {
        return responseJson;
    })
};

export const getLastReadingPosition = (contentId) => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.readingPositionKey + "." + contentId, (error, result) => {
            if (error == null && result != null) {
                let lastReadingPosition = _.get(result[0], strings.readingPositionKey + "." + contentId, {x: 0, y: 0});
                resolve(lastReadingPosition == null ? {x: 0, y: 0} : lastReadingPosition)
            } else {
                reject(error);
            }
        });
    });
};


export const getUserPath = (id) => {
    return gqlQuery({
        query: config.queries.userPath,
        variables: {id: id}
    })
};

export const getPathRecommend = (page, perPage) => {
    return gqlQuery({
        query: config.queries.pathRecommend,
        variables: {page: page, perPage: perPage}
    })
};

export const postCreateBookmark = (contentId, kind) => {
    return gqlPost({
        mutation: config.mutation.createBookmark,
        variables: {contentId: contentId, kind: kind}
    });
};

export const postRemoveBookmark = (contentId, kind) => {
    return gqlPost({
        mutation: config.mutation.removeBookmark,
        variables: {contentId: contentId, kind: kind}
    });
};

export const getRecommendSource = (ids) => {
    return gqlQuery({
        query: config.queries.sourceRecommend,
        variables: {ids: ids}
    })
};

export const updateRecommendSoureToProfile = (ids) => {
    return new Promise((resolve, reject) => {
        getRecommendSource(ids).then(value => {
            let articleFilter = {[strings.articleFilter]: value.data.viewer.sourceRecommend};
            RNUserKit.storeProperty(articleFilter, (err, results) => {
                if (err == null && results != null) {
                    resolve(articleFilter);
                } else {
                    reject(err);
                }
            })
        }).catch(err => {
            reject(err);
        });
    });
};

export const getSourceList = () => {
    return gqlQuery({
        query: config.queries.sourceList
    });
}

export const getTopicList = () => {
    return gqlQuery({
        query: config.queries.topicList
    });
}

export const getUserFollow = (kind) => {
    return gqlQuery({
        query: config.queries.userFollow,
        variables: {kind: kind}
    })
}

export const updateUserFollow = (kind, sourceIds) => {
    return gqlPost({
        mutation: config.mutation.updateUserFollow,
        variables: {kind: kind, sourceIds: sourceIds}
    })
}

export const getExploreArticles = (limit, skip, sources, tags) => {
    if (_.isEmpty(sources) || _.isEmpty(tags)) {
        return new Promise((resolve, reject) => {
            const observable = forkJoin([getUserFollow("sourcetype"), getUserFollow("categorytype")]);
            observable.subscribe(
                value => {
                    let followSourceData = value[0].data.viewer.userFollowMany;
                    let followCategoryData = value[1].data.viewer.userFollowMany;
                    let chosentags = followCategoryData.map(item => {
                        return item.sourceId
                    });
                    let chosenSources = followSourceData.map(item => {
                        return item.sourceId
                    });
                    resolve(getExploreFunc(limit, skip, chosenSources, chosentags));
                },
                err => {
                    reject(err)
                }
            )
        })
    } else {
        return getExploreFunc(limit, skip, sources, tags);
    }
}

const getExploreFunc = (limit, skip, sources, tags) => {
    let destSources;
    let destTags;
    if (!_.isEmpty(sources))
        destSources = sources.map((source) => ({value: source}));
    if (!_.isEmpty(tags))
        destTags = tags.map((tag) => ({value: tag}));
    let query = getExploreArticlesQuery(!_.isEmpty(sources), !_.isEmpty(tags));
    let variables;
    if (!_.isEmpty(sources) && !_.isEmpty(tags)) {
        variables = {skip: skip, limit: limit, sources: destSources, tags: destTags}
    } else if (!_.isEmpty(tags)) {
        variables = {skip: skip, limit: limit, tags: destTags}
    } else if (!_.isEmpty(sources)) {
        variables = {skip: skip, limit: limit, sources: destSources}
    } else {
        variables = {skip: skip, limit: limit}
    }
    return gqlQuery({
        query: query,
        variables: variables
    })

};

export const getWatchingHistory = (contentId) => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.readingHistoryKey, (error, result) => {
            if (error == null && result != null) {
                let readingHistory = _.get(result[0], strings.readingHistoryKey, []);
                if (readingHistory == null) {
                    resolve({});
                    return;
                }

                // Get last reading position
                let foundIndex = _.findIndex(readingHistory, {id: contentId});
                if (foundIndex === -1) {
                    resolve({});
                    return;
                }
                resolve(readingHistory[foundIndex]);
            } else {
                reject(error);
            }
        });
    });
};

export const getCategory = () => {
    return gqlQuery({
        query: config.queries.category
    })
};

export const getFeed = (page, perPage, rank, topics) => {
    let variables = {page: page, perPage: perPage}
    if (rank) {
        variables["currentRank"] = rank;
    }
    if (topics) {
        variables["topics"] = topics;
    }
    return gqlQuery({
        query: config.queries.feed,
        variables: variables
    })
};

export const getBookmarkedIds = (page, perPage) => {
    return gqlQuery({
        query: config.queries.bookmaredIds,
        variables: {page: page, perPage: perPage}
    })
};

export const getChosenTopics = () => {
    return new Promise((resolve, reject) => {
        RNUserKit.getProperty(strings.chosenTopicsKey, (error, result) => {
            if (error) {
                reject(error);
            } else {
                let chosenTopics = _.get(result[0], strings.chosenTopicsKey, null);
                resolve(chosenTopics);
            }
        });
    });
};


//Axios

const instance = axios.create({
    baseURL: `${config.userkitURL}`,
    headers: {'X-USERKIT-TOKEN': config.authenKeyUserKit}
});


const requestResponse = (response) => {
    switch (response.status) {
        case 403:
            return {error: {message: 'Invalid token'}};
        case 404:
            return {error: {message: 'Cannot connect to server'}};
        default:
            return response.data;
    }
};

const requestError = (err) => {
    throw err;
};

const post = (endpoints, params) => {
    return instance.post(`${endpoints}`, params)
        .then(requestResponse)
        .catch(requestError);
};

export const getUserKitProfile = (accountRole = 'contributor', offset = 0, limit = 20) => {
    return post(`${config.USERKIT_PROFILE_SEARCH}`,
        {
            query: {
                _account_role: accountRole
            },
            limit: limit,
            offset: offset
        }
    );
};

export const getAvatar = () => {
    return new Promise((resolve, reject) => {
        NativeModules.RNUserKitIdentity.getProfileInfo((error, result) => {
            let avatar = result[0].avatars;
            resolve(avatar);
        })
    });
};

export const followByPersonas = (personaIds) => {
    return gqlPost({
        mutation: config.mutation.followByPersonas,
        variables: {ids: personaIds}
    })
};

