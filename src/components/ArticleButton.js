import React from "react";
import {Image, View, StyleSheet, TouchableOpacity} from "react-native";

export default class ArticleButton extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[this.props.style, styles.buttonView]}>
                <TouchableOpacity style={styles.saveButton} onPress={this.props.onBookmark}>
                    <Image style={styles.image} source={ this.props.bookmarked ? require('../assets/ic_saved.png') : require('../assets/ic_save.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={this.props.onShare}>
                    <Image style={styles.image} source={require('../assets/ic_share.png')}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    buttonView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    saveButton: {
        marginLeft: 'auto',
        padding: 10
    },
    shareButton: {
        marginRight: 0,
        marginLeft: 'auto',
        padding: 10
    },
    image: {
        width: 15,
        height: 25,
        resizeMode: 'contain'
    }
});
