import React from 'react'
import {
    FlatList,
    SectionList,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Dimensions,
    Share, NativeModules, Platform, Image,
    Animated,
    StatusBar, Alert, AppState
} from 'react-native'
import {colors} from '../../constants/colors'
import VerticalRow from '../../components/VerticalRow'
import HorizontalCell from '../../components/HorizontalCell'
import Carousel from '../../components/CustomCarousel'
import {getImageFromArray} from "../../utils/imageUtils";
import _ from 'lodash'
import {strings} from "../../constants/strings";
import {formatReadingTimeInMinutes, getIDOfCurrentDate} from "../../utils/dateUtils";
import {extractRootDomain} from "../../utils/stringUtils";
import LoadingRow from "../../components/LoadingRow";
import * as moment from 'moment';
import {rootViewTopPadding} from "../../utils/paddingUtils";
import HBText from '../../components/HBText'
import {DotsLoader} from 'react-native-indicator';
import ActionSheet from "react-native-actionsheet";
import ToggleTagComponent from "../../components/ToggleTagComponent";
import {getChosenTopics} from "../../api";
import LoadingSquareItem from "../../components/LoadingSquareItem";
import {trackDislike, trackSharing} from "../../actions/userkitTracking";
import NoDataView from "../../components/NoDataView";
import {STAGING} from "../../constants/environment";

const horizontalMargin = 6;

const sliderWidth = Dimensions.get('window').width;
const itemViewWidth = 150;
const itemWidth = itemViewWidth + horizontalMargin * 2;

const {RNUserKit} = NativeModules;

const CONTINUE_SECTION_HEIGHT = 195;
const TOPBAR_HEIGHT = 67;

export default class Explore extends React.Component {

    static navigationOptions = ({navigation}) => {
        const {params} = navigation.state;
        return {
            title: params ? params.title : '00:00',
        }
    };

    constructor(props) {
        super(props);
        this.currentPage = 1;
        this.haveMore = true;
        this.state = {
            bookmarked: [],
            _animated: new Animated.Value(1),
            continueReadingCollapse: true
        };
        this.offset = 0;
        this._currentPositionVal = 1;
        this._scrollView = null;
        this.rank = null;
        this._debounceReloadAndSave = _.debounce(this._reloadAndSaveTag, 500);
        this._collapseAnimated = new Animated.Value(CONTINUE_SECTION_HEIGHT);
    }

    componentDidMount() {
        this.props.getSaved();
        this.props.getSourceList();
        this.props.getTopics();
        // this.props.getPathCurrent();
        this.props.getContinueReading();

        this.props.getBookmarkedIds();
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            StatusBar.setBarStyle('dark-content');
            (Platform.OS !== 'ios') && StatusBar.setBackgroundColor('transparent');
        });
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.updateVisitFreq();
    }

    componentWillUnmount() {
        this._navListener.remove();
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.props.updateVisitFreq();
        }
    };

    _keyExtractor = (item, index) => index + '';

    _openReadingView = (item) => {
        const {bookmarkedIds} = this.props;
        let bookmarkedArticles = _.get(bookmarkedIds, 'data.articles', []);

        this.props.navigation.navigate("Reader", {
            ...item,
            bookmarked: _.findIndex(bookmarkedArticles, (o) => (o === item._id)) !== -1
        });
    };

    _compareArr = (array1, array2) => {
        if (array1 == null || array2 == null) {
            return true;
        }
        if (array1.length !== array2.length) return false;
        for (let i = 0; i < array1.length; i++) {
            if (array2.indexOf(array1[i]) < 0) return false;
        }
        return true;
    };

    _compareMaps = (map1, map2) => {
        let testVal;

        if (map1.size !== map2.size) {
            return false;
        }
        for (let [key, val] of map1) {
            testVal = map2.get(key);
            if (testVal !== val || (testVal === undefined && !map2.has(key))) {
                return false;
            }
        }
        return true;
    }

    componentWillReceiveProps(nextProps) {

        const {source, userFollowedTopic, userFollowedContributor} = this.props;
        const {tagMap} = source;

        const newTagMap = _.get(nextProps, 'source.tagMap');
        const newChosenSources = _.get(nextProps, 'source.chosenSources');
        if (tagMap == null && newTagMap != null) {
            this._reloadData(newTagMap)
        }
        if (!newTagMap) {
            return;
        }
        if ((source.updating === true && nextProps.source.updating === false) ||
            (userFollowedTopic.isUpdating === true && nextProps.userFollowedTopic.isUpdating === false) ||
            (userFollowedContributor.isUpdating === true && nextProps.userFollowedContributor.isUpdating === false) ||
            !this._compareMaps(tagMap, newTagMap) ||
            !this._compareArr(source.chosenSources, newChosenSources)) {
            this._reloadData(newTagMap);
        }
    }

    _reloadData = (tagMap) => {
        let topics = null;
        if (!tagMap.get('ALL')) {
            topics = [];
            tagMap.forEach((value, key, map) => {
                if (value) {
                    topics = topics.concat([key]);
                }
            });
            topics = _.compact(topics)
        }
        this.props.getFeed(1, 10, null, topics);
    };

    _onMoreButtonClicked = (item) => {
        this.ActionSheet.show();
        this.currentInteractionItem = item;
    };

    _onActionSheetButtonClicked = (index) => {
        if (index === 0) {
            this._onShareItem();
        } else {
            this._onDislikeItem();
        }
    };

    _onShareItem = () => {
        let content = {
            message: _.get(this.currentInteractionItem, 'shortDescription', ''),
            title: _.get(this.currentInteractionItem, 'title', ''),
            url: _.get(this.currentInteractionItem, 'contentId', 'http://www.hasbrain.com/')
        };
        Share.share(content, {subject: 'HasBrain - ' + _.get(this.currentInteractionItem, 'title', '')}).then(({action}) => {
            if(action !== Share.dismissedAction) {
                trackSharing(_.get(this.currentInteractionItem, '_id', ''), strings.trackingType.article)
            }
        });
    };

    _onDislikeItem = () => {
        trackDislike(_.get(this.currentInteractionItem, '_id', ''), strings.trackingType.article);
    };

    _onBookmarkItem = (id) => {
        const {bookmarkedIds} = this.props;
        let bookmarkedArticles = _.get(bookmarkedIds, 'data.articles', []);
        if (_.findIndex(bookmarkedArticles, (o) => (o === id)) !== -1) {
            this.props.removeBookmark(id, strings.bookmarkType.article, strings.trackingType.article);
        } else {
            this.props.createBookmark(id, strings.bookmarkType.article, strings.trackingType.article);
        }
    };

    _renderVerticalItem = ({item, index}) => {
        const {bookmarkedIds, source} = this.props;
        let bookmarkedArticles = _.get(bookmarkedIds, 'data.articles', []);

        let category = _.get(item, 'topicData.title', '');
        if (source.tagMap.get('ALL')) {
            category = item.reason;
        }

        let author = _.get(item, 'contentData.sourceData.title');
        if (author == null) {
            author = extractRootDomain(_.get(item, 'contentData.contentId'))
        }

        return (
            <VerticalRow style={{marginTop: (index === 0) ? 0 : 0}}
                         action={STAGING ? _.get(item, 'contentData', {}) :_.get(item, 'contentData.lastActionData', {})}
                         title={_.get(item, 'contentData.title', '')}
                         shortDescription={_.get(item, 'contentData.shortDescription', '')}
                         sourceName={author}
                         sourceCommentCount={_.get(item, 'contentData.sourceCommentCount')}
                         sourceActionName={_.get(item, 'contentData.sourceActionName')}
                         sourceActionCount={_.get(item, 'contentData.sourceActionCount')}
                         sourceImage={_.get(item, 'contentData.sourceData.sourceImage', '')}
                         category={category}
                         time={_.get(item, 'contentData.sourceCreatedAt', '')}
                         readingTime={_.get(item, 'contentData.readingTime', '')}
                         onClicked={() => this._openReadingView({...item.contentData})}
                         onMore={() => this._onMoreButtonClicked(item.contentData)}
                         onBookmark={() => this._onBookmarkItem(_.get(item, 'contentData._id', ''))}
                         bookmarked={_.findIndex(bookmarkedArticles, (o) => (o === _.get(item, 'contentData._id'))) !== -1}
                         image={_.get(item, 'contentData.sourceImage', '')}/>
        );
    }

    _renderVerticalSeparator = () => (
        <View style={styles.horizontalItemSeparator}/>
    );

    _renderEmptyList = () => {
        const {feed} = this.props;
        if (feed.isFetching || !feed.fetched)
            return null;
        return (
            <View style={{justifyContent: 'center', alignItems: 'center', padding: 20, height: '100%'}}>
                <NoDataView text={'Oops! Nothing to show.\nPlease change your following sources'}/>
            </View>
        );
    };

    _renderVerticalSection = ({item}) => (
        <FlatList
            style={{flex: 1}}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            data={item}
            ListEmptyComponent={this._renderEmptyList}
            ItemSeparatorComponent={() => this._renderVerticalSeparator()}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderVerticalItem}/>
    );

    _renderHorizontalItem = ({item}) => {
        if (item == null) {
            return null
        }
        return (
            <HorizontalCell style={{alignSelf: 'center', width: itemViewWidth, height: 170}}
                            title={item.title}
                            onClicked={() => this._openReadingView(item)}
                            image={item.sourceImage}/>)
    };

    _toggleCollapse = () => {
        this.setState((state) => {
            let continueReadingCollapse = state.continueReadingCollapse;
            let expanded = continueReadingCollapse;
            continueReadingCollapse = !continueReadingCollapse;
            let initialValue = expanded ? CONTINUE_SECTION_HEIGHT : 0;
            let finalValue = expanded ? 0 : CONTINUE_SECTION_HEIGHT;
            this._collapseAnimated.setValue(initialValue);
            if (this.state.continueReadingCollapse) {
                Animated.timing(
                    this._collapseAnimated,
                    {
                        toValue: finalValue,
                    }
                ).start();
            } else {
                Animated.spring(
                    this._collapseAnimated,
                    {
                        toValue: finalValue,
                        fiction: 1.0
                    }
                ).start();
            }
            return {continueReadingCollapse}
        });

    };

    _renderHorizontalSection = ({item, section}) => {
        if (section.loading) {
            return (
                <View>
                    <HBText style={styles.sectionTitle}>{section.title.toUpperCase()}</HBText>
                    <View style={{flexDirection: 'row'}}>
                        <LoadingSquareItem style={{width: 150}}/>
                    </View>
                </View>)
        }
        if (_.isEmpty(item)) {
            return null;
        }
        let arrowIcon = this.state.continueReadingCollapse ? require('../../assets/ic_arrow_up.png') : require('../../assets/ic_arrow_down.png')

        return (
            <View>
                <TouchableWithoutFeedback onPress={() => this._toggleCollapse()}>
                    <View style={styles.sectionHeader}>
                        <HBText style={styles.sectionTitle}>{section.title.toUpperCase()}</HBText>
                        <Image style={styles.collapseArrow} source={arrowIcon}/>
                    </View>
                </TouchableWithoutFeedback>
                <Animated.View style={{height: this._collapseAnimated, overflow: 'hidden'}}>
                    <View style={{height: CONTINUE_SECTION_HEIGHT, marginTop: 0, marginBottom: 20}}>
                        <Carousel
                            data={item}
                            keyExtractor={this._keyExtractor}
                            sliderWidth={sliderWidth}
                            itemWidth={itemWidth}
                            layout={'default'}
                            shouldOptimizeUpdates={false}
                            inactiveSlideOpacity={1}
                            inactiveSlideScale={1}
                            layoutCardOffset={5}
                            superPaddingHorizontal={19}
                            renderItem={this._renderHorizontalItem}
                            containerCustomStyle={styles.horizontalCarousel}/>
                    </View>
                </Animated.View>
                <View style={[styles.horizontalItemSeparator, {marginHorizontal: 0, marginTop: 5}]}/>
            </View>)
    };

    _fetchMore = () => {
        const {feed, source} = this.props;
        const {tagMap, tags} = source;
        const {data, count, isFetching, rank} = feed;
        let topics = null;
        if (!tagMap.get('ALL') && tags != null) {
            topics = tags.map((item) => {
                if (tagMap.get(item)) {
                    return item;
                }
            });
            topics = _.compact(topics)
        }
        if (data != null && count >= 10 && !isFetching) {

            this.props.getFeed(1, 10, rank, topics);
            //this.props.getBookmarkedIds();
        }
    };

    _onRefresh = () => {
        const {source} = this.props;
        const {tagMap, tags} = source;
        let topics = null;
        if (!tagMap.get('ALL') && tags != null) {
            topics = tags.map((item) => {
                if (tagMap.get(item)) {
                    return item;
                }
            });
            topics = _.compact(topics)
        }
        this.props.getFeed(1, 10, null, topics);
        this.props.getBookmarkedIds();
        this.props.getContinueReading();
    };

    _renderListFooter = (isFetching) => {
        if (isFetching) {
            return (
                <LoadingRow/>
            )
        } else {
            return <View style={{height: 200}}/>;
        }

    };

    _renderTagsItem = ({item}) => {
        const {source, topics} = this.props;
        if (item == null)
            return null;
        if (!source.tagMap)
            return null;

        let title = "";
        try {
            title = topics.tagTitle.get(item);
        } catch (err) {
            console.log(err);
        }

        if (item === "ALL" || item === "_filter") {
            title = item;
        }
        if (_.isEmpty(title)) {
            return null;
        }
        return (
            <ToggleTagComponent id={title} onPressItem={(id) => this._onTagItemPress(item)}
                                isOn={source.tagMap.get(item)}/>
        )
    };

    _onTagItemPress = (id) => {
        if (id === "_filter") {
            this.props.navigation.navigate('MySource')
            return;
        }
        const {source} = this.props;
        const {tags} = source;
        let isOn = source.tagMap.get(id);
        let tagMap = new Map(source.tagMap);

        if (id === 'ALL') {
            if (!isOn) {
                tagMap.set(id, !isOn);
                let tagKeyArray = Array.from(tagMap.keys());
                this._debounceReloadAndSave(null);
                for (let tagKey of tagKeyArray) {
                    if (tagKey !== 'ALL') {
                        tagMap.set(tagKey, false);
                    }
                }
            }
        } else {

            let newTagsArray = tags.map((item) => {
                if (tagMap.get(item)) {
                    return item;
                }
            });
            newTagsArray = _.compact(newTagsArray);
            if (isOn && newTagsArray.length < 2) {
                Alert.alert('Oops!', 'You must select at least 1 tag', [
                    {text: 'Got it!'},
                ])
            } else {
                tagMap.set(id, !isOn);
                if (!isOn) {
                    newTagsArray.push(id);
                } else {
                    _.remove(newTagsArray, (x) => x === id);
                }
                this._debounceReloadAndSave(newTagsArray);
            }
            if (tagMap.get('ALL')) {
                tagMap.set('ALL', false);
            }
        }
        this.props.updateUserSourceTag(tagMap);

    };

    _reloadAndSaveTag = (topics) => {
        this.props.getFeed(1, 10, null, topics)
        RNUserKit.storeProperty({[strings.chosenTopicsKey]: topics}, (e, r) => {
        })
    };

    _onScroll = (event) => {
        const {feed} = this.props;
        let currentOffset = event.nativeEvent.contentOffset.y;
        const dif = currentOffset - (this.offset || 0);
        let endOffset = event.nativeEvent.layoutMeasurement.height + currentOffset;

        const feedData = _.get(feed, 'data', [])
        if (feedData == null || feedData.length < 5) {
            return
        }

        // Check data is not null
        if (feed.data == null || feed.data.length === 0) {
            this._currentPositionVal = 0;
            Animated.spring(this.state._animated, {
                toValue: 0,
                friction: 7,
                tension: 40,
            }).start();
            return
        }
        if ((dif < 0 || currentOffset <= 0) && (endOffset < event.nativeEvent.contentSize.height)) {
            // Show
            this._currentPositionVal = Math.max(this._currentPositionVal - Math.abs(dif) / TOPBAR_HEIGHT, 0);
            Animated.spring(this.state._animated, {
                toValue: this._currentPositionVal * TOPBAR_HEIGHT,
                friction: 7,
                tension: 40,
                //useNativeDriver: true,
            }).start();
        } else {

            // Hide
            this._currentPositionVal = Math.min(Math.abs(dif) / TOPBAR_HEIGHT + this._currentPositionVal, 1);
            Animated.spring(this.state._animated, {
                toValue: this._currentPositionVal * TOPBAR_HEIGHT,
                friction: 7,
                tension: 40,
                //useNativeDriver: true,
            }).start();
        }
        this.offset = currentOffset;
    };

    _onScrollEnd = (event) => {
        const {feed} = this.props;
        let feedData = _.get(feed, 'data', [])
        if (!feedData) feedData = [];
        if (this._currentPositionVal < 0.5 || feedData.length < 5) {
            // Show
            this._currentPositionVal = 0;
            Animated.spring(this.state._animated, {
                toValue: 0,
                friction: 7,
                tension: 40,
            }).start();
        } else {
            // Hide
            this._currentPositionVal = 1;
            Animated.spring(this.state._animated, {
                toValue: TOPBAR_HEIGHT,
                friction: 7,
                tension: 40,
            }).start();
        }
    };

    _animatedStyle = () => ([
        styles.topView,
        {
            opacity: this.state._animated.interpolate({
                inputRange: [0, 50, TOPBAR_HEIGHT],
                outputRange: [1, 0.9, 0],
                extrapolate: 'clamp',
            }),
            transform: [{
                translateY: this.state._animated.interpolate({
                    inputRange: [0, TOPBAR_HEIGHT],
                    outputRange: [0, -TOPBAR_HEIGHT],
                    extrapolate: 'clamp',
                }),
            }],
        }
    ]);

    _renderLoading = (fetching) => (
        <View style={[styles.loadingView, {opacity: fetching ? 1 : 0}]}>
            <DotsLoader color={colors.mainDarkGray} size={10} betweenSpace={10}/>
        </View>);

    render() {
        const {feed, saved, source, continueReading} = this.props;
        return (
            <View style={styles.rootView}>
                <StatusBar
                    translucent={true}
                    backgroundColor='#00000000'
                    barStyle='dark-content'/>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    options={['Share via ...', 'Show fewer articles like this', 'Cancel']}
                    cancelButtonIndex={2}
                    onPress={this._onActionSheetButtonClicked}
                />
                <View style={styles.headerBackgroundView}/>
                <View style={styles.contentView}>
                    <SectionList
                        ref={(ref) => this._scrollView = ref}
                        contentContainerStyle={{marginTop: TOPBAR_HEIGHT, marginBottom: 0}}
                        refreshing={false}
                        onRefresh={this._onRefresh}
                        onScrollEndDrag={this._onScrollEnd}
                        onMomentumScrollEnd={this._onScrollEnd}
                        onScroll={this._onScroll}
                        scrollEventThrottle={16}
                        keyExtractor={this._keyExtractor}
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                        onEndReached={this._fetchMore}
                        ListHeaderComponent={this._renderLoading(feed.isFetching)}
                        ListFooterComponent={() => this._renderListFooter(feed.isFetching)}
                        onEndReachedThreshold={0.5}
                        sections={[
                            {
                                data: [continueReading.data],
                                title: "CONTINUE",
                                loading: continueReading.isFetching,
                                renderItem: this._renderHorizontalSection
                            },
                            {
                                data: [feed.data],
                                renderItem: this._renderVerticalSection
                            }
                        ]}
                    />
                    <Animated.View style={this._animatedStyle()}>
                        {/*<TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('MySource')}>*/}
                        {/*<View style={styles.searchBar}>*/}
                        {/*<Image style={styles.searchIcon} source={require('../../assets/ic_search.png')}/>*/}
                        {/*<HBText style={styles.searchText}>For you</HBText>*/}

                        {/*</View>*/}
                        {/*</TouchableWithoutFeedback>*/}
                        <FlatList
                            style={{marginLeft: 25, marginBottom: 0, marginTop: 10, height: 50}}
                            keyExtractor={this._keyExtractor}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            data={['_filter'].concat(source.tags)}
                            renderItem={this._renderTagsItem}
                        />
                    </Animated.View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    loadingView: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        width: 60,
        height: 20,
    },
    headerBackgroundView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: rootViewTopPadding(),
        backgroundColor: colors.mainWhite
    },
    rootView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.lightGray,

    },
    contentView: {
        flex: 1,
        flexDirection: 'column',
        marginTop: rootViewTopPadding(),
        overflow: 'hidden'
    },
    topView: {
        flexDirection: 'column',
        position: 'absolute',
        backgroundColor: colors.mainWhite,
        height: TOPBAR_HEIGHT,
        left: 0,
        right: 0
    },
    sectionView: {
        width: '100%',
        flexDirection: 'column'
    },
    alertWindow: {
        backgroundColor: colors.mainWhite,
    },
    horizontalCarousel: {},
    horizontalItemSeparator: {
        backgroundColor: colors.grayLine,
        flex: 1,
        marginHorizontal: 20,
        height: 1
    },
    sectionTitle: {
        color: colors.articleCategory,
        fontSize: 12,
        paddingVertical: 5,
        marginLeft: 25
    },
    searchBar: {
        flexDirection: 'row',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: colors.whiteGray,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
        marginBottom: 15,
        marginHorizontal: 25,
        backgroundColor: colors.lightGray,
        height: 49,
        alignItems: 'center'
    },
    searchIcon: {
        width: 20,
        resizeMode: 'contain',
        aspectRatio: 1,
        tintColor: '#A6B2C4'
    },
    searchText: {
        marginLeft: 15,
        fontSize: 14,
        color: colors.grayTextSearch,
        opacity: 0.5
    },
    sectionHeader: {
        flexDirection: 'row',
        width: '100%',
        height: 30,
        alignItems: 'center',
        marginTop: -10
    },
    collapseArrow: {
        position: 'absolute',
        right: 25,
        top: 15,
        width: 8,
        height: 5
    }
});
