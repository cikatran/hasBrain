import Save from './Save'
import {connect} from 'react-redux';
import {getSaved} from '../../actions/getSaved'
import {removeBookmark} from "../../actions/removeBookmark";
import {createBookmark} from "../../actions/createBookmark";

function mapStateToProps(state) {
    return {
        saved: state.savedReducer,
        bookmarkedIds: state.bookmarkedIdsReducer
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getSaved: (page, perPage) => dispatch(getSaved(page, perPage)),
        removeBookmark: (id, type, trackingType) => (dispatch(removeBookmark(id, type, trackingType))),
        createBookmark: (id, type, trackingType) => dispatch(createBookmark(id, type, trackingType)),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Save);
