import React, {PureComponent} from 'react'
import {
    View, StyleSheet, NativeModules, Platform, FlatList, ActivityIndicator, TouchableWithoutFeedback
} from 'react-native'
import { colors } from '../../../constants/colors';
import HBText from "../../../components/HBText";
import NavigationService from "../../../NavigationService";

export default class HighLight extends PureComponent {
    _currentPage = 1;

    constructor(props) {
        super(props)
        this.state = {
            loadMore: false,
            refresh: true
        }
    }

    componentDidMount() {
        this.props.getHighlight(1, 10);
    }



    _keyExtractor = (item, index) => index.toString();

    _renderListItem = ({item}) => {
        return (
            <TouchableWithoutFeedback onPress={() => NavigationService.navigate("Reader", {_id: item.articleId})}>
                <View style={{flexDirection:'column'}}>
                    {
                        item.highlights && item.highlights.map((x)=> <HBText style={{fontSize: 18, color: colors.blackHeader, marginTop: 10}}>{x.core}</HBText>)
                    }
                    <HBText style={{fontSize: 13, color: colors.blackText, marginVertical: 5}}>{item.article.title}</HBText>
                </View>
            </TouchableWithoutFeedback>
        )
    };

    __renderListFooter = () => {
        const {highLight} = this.props;
        const {loadMore} = this.state;
        if (highLight.isFetching && loadMore) {
            return (
                <View
                    style={{height: 30, width: '100%' ,justifyContent:'center', alignItems:'center'}}>
                    <ActivityIndicator size={"small"} color={colors.darkBlue}/>
                </View>
            )
        } else {
            return null;
        }
    };

    _fetchMore = () => {
        const {highLight} = this.props;
        if (highLight.noMore)
            return;
        this.setState({loadMore: true, refresh: false})
        let currentPage = highLight.page;
        currentPage++
        this.props.getHighlight(currentPage, 10);

    };

    _onRefresh = () => {
        this.setState({loadMore: false, refresh: true})
        this.props.getHighlight(1, 10)
    }

    render() {
        const {highLight} = this.props;
        const {refresh} = this.state
        return (
            <View style={styles.container}>
                <FlatList
                    refreshing={highLight.isFetching && refresh}
                    onRefresh={this._onRefresh}
                    showsVerticalScrollIndicator={false}
                    renderItem={this._renderListItem}
                    ListFooterComponent={this.__renderListFooter}
                    onEndReached={this._fetchMore}
                    onEndReachedThreshold={0.5}
                    data={highLight.data}
                    keyExtractor={this._keyExtractor}/>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.mainWhite,
        alignItems:'center',
        width:'85%'
    },
    descriptionText: {
        fontSize: 13,
        color: colors.blackHeader,
    },
    partHeader: {
        fontSize: 25,
        color: colors.blackHeader,
        marginTop: 10,
    },
});

const tempData = [
    {title: 'Why so Many Developers Quit Before Ever Getting a Job. Please - don’t.', highLight: 'The rest is Googling the right words. In this case, “css add shadow” and “javascript callback form submit”.'},
    {title: 'Why so Many Developers Quit Before Ever Getting a Job. Please - don’t.', highLight: 'The rest is Googling the right words. In this case, “css add shadow” and “javascript callback form submit”.'},
    {title: 'Why so Many Developers Quit Before Ever Getting a Job. Please - don’t.', highLight: 'The rest is Googling the right words. In this case, “css add shadow” and “javascript callback form submit”.'},
    {title: 'Why so Many Developers Quit Before Ever Getting a Job. Please - don’t.', highLight: 'The rest is Googling the right words. In this case, “css add shadow” and “javascript callback form submit”.'},
    {title: 'Why so Many Developers Quit Before Ever Getting a Job. Please - don’t.', highLight: 'The rest is Googling the right words. In this case, “css add shadow” and “javascript callback form submit”.'}
];
