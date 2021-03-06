import React from 'react'
import {
    View, FlatList, StyleSheet, TouchableOpacity, Dimensions
} from 'react-native'
import {colors} from "../../../constants/colors";
import {onboardingItemStyle} from "../../../constants/theme";
import _ from 'lodash'
import HBText from "../../../components/HBText";

export default class OnboardingSectionListItem extends React.PureComponent {

    constructor(props) {
        super(props);
    }


    render() {
        const {selected, style, title, onChangedSelected} = this.props;
        if (!selected) {
            return (<TouchableOpacity style={[style, {borderColor: colors.grayOnboarding}]}
                                      onPress={onChangedSelected}>
                <View style={[styles.item]}>
                    <HBText style={styles.itemText}>{title}</HBText>
                </View>
            </TouchableOpacity>);
        } else {
            return (<TouchableOpacity style={[style, {borderColor: colors.blueText}]}
                                      onPress={onChangedSelected}>
                <View style={[styles.item]}>
                    <HBText style={styles.itemHighlightedText}>{title}</HBText>
                </View>
            </TouchableOpacity>);
        }
    }

}

const styles = StyleSheet.create({
    item: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        ...onboardingItemStyle,
        color: colors.blackOnboarding
    },
    itemHighlightedText: {
        ...onboardingItemStyle,
        color: colors.blueText
    }
});
