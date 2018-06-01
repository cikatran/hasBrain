import React, {PureComponent} from 'react'
import {
    Text, View, StyleSheet, NativeModules, Platform, SectionList, TextInput
} from 'react-native'
import { colors } from '../../../constants/colors';
import RadarChart from '../../../components/RadarChart'
import PropTypes from 'prop-types';

type Props = {
    editMode: PropTypes.bool
}


export default class About extends PureComponent<Props> {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
    }

    _renderDescription = () => {
        return (
            <TextInput multiline={true} underlineColorAndroid="transparent" numberOfLines={3} style={styles.descriptionText} value={'Enter your summary here'} editable={this.props.editMode}/>
        )
    }

    _renderAnalyst = () => {
        return (
            <View style={{flexDirection:'column', width:'100%'}}>
                <View style={{alignItems:'center', width: '100%', flexDirection:'row', marginTop:-20, marginBottom: -20}}>
                    <RadarChart
                        size={300}
                        firstValue={{name: 'React Native', color: '#F56C2E', percentage: 100}}
                        secondValue={{name: 'Java', color: '#FAB84A', percentage: 80}}
                        thirdValue={{name: 'Javascript', color: '#50DE72', percentage: 50}}
                        fourthValue={{name: 'Python', color: '#41E9F8', percentage: 10}}
                        fifthValue={{name: 'Golang', color: '#B45D95', percentage: 90}}
                        sixthValue={{name: 'React', color: '#F43651', percentage: 30}}/>
                </View>
            </View>
        )
    }

    _renderExperience = ({item}) => {
        if (item == null || item[0] == null) {
            return null;
        }
        let renderExperience = item.map((data, i) => {
            return (
                <View key={i} style={{flexDirection:'column'}}>
                    <Text style={{fontSize: 15, color: colors.grayTextExpTitle, marginTop: 5, marginLeft: 3}}>
                        {data.title}
                    </Text>
                    <Text style={{fontSize: 10, color: colors.grayTextExpYear, marginVertical: 5, marginLeft: 5}}>
                        {data.exp}
                    </Text>
                </View>
            )
        });
        return (
            <View style={{flexDirection: 'column', marginTop: 10}}>
                {renderExperience}
            </View>
        );

    }

    _keyExtractor = (item, index) => index.toString();

    _renderSectionHeader = ({section}) => {
        if (section.showHeader && section.data != null && section.data[0] != null) {
            return (
                <Text style={styles.partHeader}>{section.title}</Text>
            )
        } else {
            return null
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <SectionList
                    keyExtractor={this._keyExtractor}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    renderSectionHeader={this._renderSectionHeader}
                    sections={[
                        {
                            data: ['Description'],
                            renderItem: this._renderDescription,
                            showHeader: false
                        },
                        {
                            data: ['Analyst'],
                            renderItem: this._renderAnalyst,
                            showHeader: true,
                            title: "Time Spent"
                        },
                        {
                            data: [tempExperienceData],
                            renderItem: this._renderExperience,
                            showHeader: true,
                            title: "Experience"
                        },
                    ]}
                />
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

const tempExperienceData = [{title: 'Android Developer', exp: '5 years'}, {title: 'React Native Developer', exp: '2 years'}];