import React from "react";
import {Image, View, StyleSheet, TouchableOpacity} from "react-native";

export default class ArticleButton extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    _render3dots = () => {
        if (this.props.show3Dots) {
            return (<TouchableOpacity style={styles.shareButton} onPress={this.props.onMore}>
                <Image style={styles.image} source={require('../assets/ic_3dots.png')}/>
            </TouchableOpacity>)
        }
        return null;

    };

    render() {
        return (
            <View style={[this.props.style, styles.buttonView]}>
                <TouchableOpacity style={styles.saveButton} onPress={this.props.onBookmark}>
                    <Image style={styles.image}
                           source={this.props.bookmarked ? require('../assets/ic_saved.png') : require('../assets/ic_save.png')}/>
                </TouchableOpacity>
                {this._render3dots()}

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
        height: 15,
        resizeMode: 'contain'
    }
});
