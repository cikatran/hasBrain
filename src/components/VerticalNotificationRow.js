import React from "react";
import {Image, TouchableOpacity, View, StyleSheet} from "react-native";
import {blackTextStyle, grayTextStyle, titleCardStyle} from "../constants/theme";
import {getPublishDateDescription} from "../utils/dateUtils";
import {colors} from "../constants/colors";
import HBText from './HBText'

export default class VerticalNotificationRow extends React.PureComponent {

    _getImage = () => {
        return (this.props.image != null) ? {uri:this.props.image} : require('../assets/ic_hasbrain.png');
    };

    _openWebView = () => {
        this.props.navigation.navigate('Reader', {url: this.props.url})
    };

    render() {
        return (
            <TouchableOpacity onPress={()=>this._openWebView()}>
                <View style={[styles.cardView, this.props.style]}>
                    <View style={styles.horizontalView}>
                        <HBText style={[titleCardStyle, {flex: 2, flexWrap: "wrap"}]}>{(this.props.title == null) ? "" : this.props.title}</HBText>
                        <Image source={this._getImage()}
                               style={styles.thumbnailImage}/>
                    </View>
                    <View style={[styles.horizontalView, {marginTop: 15}]}>
                        <View style={styles.subTextView}>
                            <HBText style={blackTextStyle}>{(this.props.highlight == null) ? "" : this.props.highlight}</HBText>
                            <HBText style={grayTextStyle}>{getPublishDateDescription(this.props.time)}</HBText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    cardView: {
        shadowOffset: {width: 2, height: 2},
        shadowColor: colors.mainDarkGray,
        shadowOpacity: 0.5,
        flexDirection: 'column',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10,
        marginHorizontal: 10,
        backgroundColor: colors.mainWhite,
        borderRadius: 5,
    },
    horizontalView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    thumbnailImage: {
        aspectRatio: 1.2,
        marginRight: 0,
        resizeMode: 'cover',
        borderRadius: 5,
        flex: 1,
        alignSelf: 'flex-end',
        overflow: 'hidden'
    },
    titleText: {
        marginLeft: 0,
        marginRight: 20,
        height: '100%'
    },
    subTextView: {
        flexDirection: 'column'
    },
    savedButton: {
        marginRight: 10,
        marginLeft: 'auto'
    },
    saveImage: {
        width: 20,
        height: 30,
        resizeMode: 'contain'
    }
});
