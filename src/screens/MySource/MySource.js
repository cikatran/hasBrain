import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    SectionList,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Dimensions,
    Share, NativeModules, Platform, Image,
    Alert
} from 'react-native'
import {colors} from '../../constants/colors'
import _ from 'lodash'
import {strings} from "../../constants/strings";
import {rootViewTopPadding} from "../../utils/paddingUtils";
import {navigationTitleStyle} from "../../constants/theme";
import CheckComponent from '../../components/CheckComponent'

export default class MySource extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checkedState: (new Map(): Map<string, boolean>)
        }
    }

    componentDidMount() {
        this.props.getSourceList();
    }

    componentWillUnmount() {
    }

    _onPressItem = (id) => {
        const {source} = this.props;
        const {chosenSources} = source;

        this.setState((state) => {
            let checkedState = state.checkedState;
            if (checkedState.size < 1) {
                let sources = source.data.map(item => {
                    return item.sourceId
                });
                for (let key of sources) {
                    checkedState.set(key, chosenSources.includes(key));
                }
            }
            let checkedSourcesValues = Array.from(checkedState.values());
            // checkedSourcesValues = _.filter(checkedSourcesValues, (item) => {
            //     return item == true;
            // })
            // if (checkedSourcesValues.length < 2) {
            //     if (checkedState.get(id)) {
            //         Alert.alert('Oops!', 'You must have at least 1 source', [
            //             {text: 'Got it!'},
            //         ])
            //     } else {
            //         let checked = !checkedState.get(id);
            //         checkedState.set(id, checked);
            //
            //     }
            // } else {
            let checked = !checkedState.get(id);
            checkedState.set(id, checked);
            // }
            return {checkedState}
        });
    }

    _keyExtractor = (item, index) => index.toString();
    _renderListItem = ({item}) => {
        const {checkedState} = this.state;
        const {source} = this.props;
        const {chosenSources} = source;
        let checkedItem = false;
        if (checkedState.size < 1) {
            checkedItem = chosenSources.includes(item.sourceId);

        } else {
            checkedItem = checkedState.get(item.sourceId);
        }

        return (
            <View style={styles.listRow}>
                <Image resizeMode='contain' sytle={styles.iconImage} source={{uri: item.sourceImage, width: 60, height: 60}}/>
                <Text style={styles.sourceText}>{item.title}</Text>
                <CheckComponent id={item.sourceId} checkedItem={checkedItem} onPressItem={this._onPressItem}/>
            </View>
        )
    }

    _onBackPress = () => {
        const {checkedState} = this.state;
        const {source} = this.props;
        let newSources = source.data.map((item) => {
            if (checkedState.get(item.sourceId)) {
                return item.sourceId;
            }
        });
        newSources = _.compact(newSources);
        if (!_.isEmpty(newSources))
            this.props.updateSourceList(newSources);
        this.props.getFeed(1, 10);
        this.props.navigation.goBack();
    }

    render() {
        const {source} = this.props;
        if (!source.data)
            return null;
        return (
            <View style={styles.rootView}>
                <View style={styles.headerView}>
                    <TouchableOpacity style={styles.backButton} onPress={() => this._onBackPress()}>
                        <Image style={styles.backIcon} source={require('../../assets/ic_arrow_left.png')}/>
                    </TouchableOpacity>
                    <View style={styles.searchBar}>
                        <Image style={styles.searchIcon} source={require('../../assets/ic_search.png')}/>
                        <Text style={styles.searchText}>Search for sources, people and topics</Text>
                    </View>
                </View>
                <View style={{backgroundColor: colors.lightGray}}>
                    <FlatList
                        refreshing={source.isFetching}
                        onRefresh={() => this.props.getSourceList()}
                        style={{marginHorizontal:10}}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        horizontal={false}
                        data={source.data}
                        renderItem={this._renderListItem}
                        showsVerticalScrollIndicator={false}/>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    rootView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.mainWhite
    },
    headerView: {
        flexDirection: 'row',
        marginTop: rootViewTopPadding() + 10,
        alignItems: 'center',
        backgroundColor: colors.mainWhite,
        paddingBottom: 10
    },
    backIcon: {
        width: 16,
        height: 12,
        resizeMode: 'contain'
    },
    backButton: {
        padding: 10,
        marginRight: 5
    },
    searchText: {
        marginLeft: 15,
        fontSize: 20,
        color: colors.grayTextSearch
    },
    listRow: {
        flexDirection: 'row',
        width:'100%',
        alignItems:'center',
        marginVertical: 10,
        backgroundColor: colors.mainWhite,
        borderRadius: 5,
        marginHorizontal: 10,
        height: 60,
        overflow: 'hidden'
    },
    iconImage: {
        height: 60,
        width: 60,
        overflow: 'hidden'
    },
    sourceText: {
        color: colors.darkBlue,
        fontFamily: 'CircularStd-Book',
        fontSize: 18,
        marginLeft: 20,
        width: '60%'
    },
    searchBar: {
        flexDirection: 'row',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: colors.whiteGray,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
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
        fontFamily: 'CircularStd-Book',
        opacity: 0.5
    },
});
