import * as getSaved from './getSaved'
import * as getArticles from './getArticles'
import * as getPlaylist from './getPlaylist'
import * as getOnboarding from './getOnboarding'
import * as getLastReadingPosition from './getLastReadingPosition'
import * as getIntention from './getIntention'
import * as getPathRecommend from './getPathRecommend'
import * as getPathBookmarked from './getPathBookmarked'
import * as updateRecommendSource from './updateRecommendSource'
import * as getAllIntention from './getAllIntention'
import * as getUserPath from './getUserPath'
import * as createBookmark from './createBookmark'
import * as removeBookmark from './removeBookmark'
import * as getWatchingHistory from './getWatchingHistory'
import * as getCategory from './getCategory'
import * as getFeed from './getFeed'
import * as getBookmarkedIds from './getBookmarkedIds'
import * as createHighlight from './createHightlight'
import * as createUser from './createUser'
import * as updateFollowPersona from './updateFollowPersona'
import * as getOwnpath from './getOwnpath'
import * as signOut from './signOut'
import * as getContinueReading from './getContinueReading'
import * as getArticleDetail from './getArticleDetail'
import * as trackUserkitEvent from './userkitTracking'
import * as updateReadingHistory from './updateReadingHistory';
import * as getHighlightByArticle from './getHighlightByArticle'
import * as removeHighlight from './removeHighlight'
import * as updateVisitFreq from './updateVisitFreq'
import * as authenticationActions from './authenticationAction'

export default actions = {
    getSaved,
    getArticles,
    getPlaylist,
    getOnboarding,
    getLastReadingPosition,
    getIntention,
    getAllIntention,
    getPathRecommend,
    getPathBookmarked,
    updateRecommendSource,
    getUserPath,
    createBookmark,
    removeBookmark,
    getWatchingHistory,
    getCategory,
    getFeed,
    getBookmarkedIds,
    createHighlight,
    createUser,
    updateFollowPersona,
    getOwnpath,
    signOut,
    getContinueReading,
    getArticleDetail,
    trackUserkitEvent,
    updateReadingHistory,
    getHighlightByArticle,
    removeHighlight,
    updateVisitFreq,
    authenticationActions
}
