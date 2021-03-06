import React from 'react'
import {
    View, StyleSheet, NativeModules, Platform, TouchableWithoutFeedback, Image, TextInput
} from 'react-native'
import { colors } from '../../constants/colors'
import {NavigationActions, StackActions} from "react-navigation";
import CircleImage from '../../components/CircleImage'
import About from './About'
import HighLight from './HighLight'
import _ from 'lodash'
import {rootViewTopPadding} from '../../utils/paddingUtils';
import HBText from "../../components/HBText";
import {resetAuthToken} from "../../api"
import NavigationServices from '../../NavigationService'

export default class Me extends React.Component {
    _titleTextInput = null;
    _about = null;

    constructor(props) {
        super(props)
        this.state = {
            selectedTab: 0,
            editMode: false
        }
    }

    componentDidMount() {
        this.props.getUserProfile();
        this.props.getUserAnalyst();
        this.props.getAvatar()
    }

    _signOut = () => {
        this.props.signOut();
        NavigationServices.reset('Authentication');
    };

    _toggleTab = () => {
        const {selectedTab} = this.state;
        selectedTab == 0 ? this.setState({selectedTab: 1}) : this.setState({selectedTab: 0});
    }

    _renderTabContain (){
        const  {selectedTab, editMode} = this.state;
        if (selectedTab == 0) {
            return (
                <About onRef={component => this._about = component} editMode={editMode} style={{width:'85%', marginTop: 10}}/>
            )
        } else {
            return  <HighLight style={{width:'85%', marginTop: 10}}/>;
        }
    }

    _renderEditButton () {
        const {editMode} = this.state;
        if (editMode) {
            return (
                <Image style={{width: 20, height: 20, margin: 7}} source={require('../../assets/btn_edit_on.png')}/>
            )
        } else {
            return (
                <Image style={{width: 20, height: 20, margin: 7}} source={require('../../assets/btn_edit.png')}/>
            )
        }
    }

    _toggleEdit = () => {
        const {editMode} = this.state;
        const {user} = this.props;
        if (editMode) {
            let title = "";
            let description = "";
            if (user.userProfileData) {
                title = user.userProfileData.role;
                description = user.userProfileData.about;
            };
            if (this._titleTextInput._lastNativeText)
                title = this._titleTextInput._lastNativeText;
            if (this._about != null) {
                let summary = this._about._getSummaryValue();
                description = summary ? summary : "";
            }
            this.props.updateUserProfile(title, description);
        }
        this.setState({editMode: !editMode});
    }

    render() {
        const {selectedTab, editMode} = this.state;
        const {user} = this.props;
        let title = null;
        if (user.userProfileData) {
            title = user.userProfileData.role
        };
        if (_.isEmpty(title)) {
            title = "Enter your title here"
        }
        let avatar = require('../../assets/ic_circle_placeholder.png');
        if (user.avatar) {
            avatar = {uri: user.avatar}
        }
        return (
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <CircleImage
                        size={75}
                        source={avatar}/>

                    <View pointerEvents={editMode ? 'auto' : 'none'} style={styles.profileTextContainer}>
                        <HBText numberOfLines={1} style={styles.profileName}>{user.userName ? user.userName : ''}</HBText>
                        <TextInput ref={component => this._titleTextInput = component}  multiline={true} underlineColorAndroid="transparent" numberOfLines={2} style={styles.profileTitle} defaultValue={title} editable={editMode}/>
                    </View>

                    <View style={styles.profileActionButtonContainer}>
                        <TouchableWithoutFeedback onPress={this._toggleEdit}>
                            {this._renderEditButton()}
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback style={{marginTop: 10}} onPress={this._signOut}>
                            <Image style={{width: 25, height: 25, marginLeft: 5, marginRight: 0, tintColor: colors.grayText}}source={require('../../assets/ic_signout.png')}/>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                <View style={styles.toggleButtonContainer}>
                    <TouchableWithoutFeedback onPress={this._toggleTab}>
                        <View style={[
                            styles.toggleTab,
                            {borderBottomLeftRadius: 3, borderTopLeftRadius: 3},
                            selectedTab == 0 ? styles.activeTab : styles.inactiveTab]}>
                            <HBText style={[
                                styles.toggleTabTitle,
                                selectedTab == 0 ? {color: colors.mainWhite} : {color: colors.darkBlue}
                            ]}>About</HBText>
                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={this._toggleTab}>
                        <View style={[
                            styles.toggleTab,
                            {borderBottomRightRadius: 3, borderTopRightRadius: 3},
                            selectedTab == 1 ? styles.activeTab : styles.inactiveTab]}>
                            <HBText style={[
                                styles.toggleTabTitle,
                                selectedTab == 1 ? {color: colors.mainWhite} : {color: colors.darkBlue}
                            ]}>Highlights</HBText>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {this._renderTabContain()}
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
        paddingTop: 25 + rootViewTopPadding()
    },
    profileContainer: {
        flexDirection: 'row',
        width: '85%',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    profileTextContainer: {
        flexDirection: 'column',
        width: '60%',
        marginTop: -5,
        alignSelf: 'center'
    },
    profileName: {
        fontSize: 20,
        color: colors.blackText,
    },
    profileTitle: {
        color: colors.blackHeader,
        fontSize: 18,
        marginTop: -5,
        fontFamily: 'CircularStd-Book'
    },
    profileActionButtonContainer: {
        flexDirection: 'column',
        alignItems:'center',
        height: 75
    },
    toggleButtonContainer: {
        flexDirection: 'row',
        marginBottom: 10
    },
    signOut: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: (Platform.OS === 'ios') ? 17 : 30,
        backgroundColor: colors.redButton,
        fontSize: 17,
        color: '#ffffff',
        overflow: 'hidden',
        textAlign: 'center',
        paddingTop: 8,
        paddingBottom: 8
    },
    toggleTab: {
        height: 30,
        width: 110,
        borderColor: colors.darkBlue,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    toggleTabTitle: {
        fontSize: 13
    },
    activeTab: {
        backgroundColor: colors.darkBlue
    },
    inactiveTab: {
        backgroundColor: colors.mainWhite
    }
})
