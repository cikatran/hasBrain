import { StackNavigator, TabNavigator } from 'react-navigation'
import ExploreStack from './screenStacks/ExploreStack'
import SaveStack from './screenStacks/SaveStack'
import UserPathStack from './screenStacks/UserPathStack'
import { Image, StyleSheet, NativeModules } from 'react-native'
import React from 'react'
import { colors } from './constants/colors'
import { strings } from './constants/strings'
import { defaultHeaderStyle } from './constants/theme'
import AuthenticationEmail from './screens/Authentication/AuthenticationEmail'
import Authentication from './screens/Authentication/Authentication'
import MeStack from './screenStacks/MeStack'
import BackNavigationButton from "./components/BackNavigationButton";
import Launch from "./screens/Launch/Launch";
import Onboarding from "./screens/Onboarding";
import Reader from "./screens/Reader";

const TabNav = TabNavigator({
    ExploreTab: {
        screen: ExploreStack,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: strings.exploreHeader,
            headerLeft: null,
            ...defaultHeaderStyle,
            tabBarIcon: ({ tintColor }) => (<Image source={require('./assets/ic_menu_explore.png')}
                                                   style={[{ tintColor: tintColor }, styles.tabBarIcon]}/>)
        })
    },
    SaveTab: {
        screen: SaveStack,
        navigationOptions: ({ navigation }) => ({
            title: 'SAVED',
            headerLeft: null,
            tabBarLabel: strings.bookmarkHeader,
            ...defaultHeaderStyle,
            tabBarIcon: ({ tintColor }) => (<Image source={require('./assets/ic_menu_saved.png')}
                                                   style={[{ tintColor: tintColor }, styles.tabBarIcon]}/>)
        })
    },
    UserPathTab: {
        screen: UserPathStack,
        navigationOptions: ({ navigation }) => ({
            header: null,
            tabBarLabel: strings.userPathHeader,
            ...defaultHeaderStyle,
            tabBarIcon: ({ tintColor }) => (<Image source={require('./assets/ic_path.png')}
                                                   style={[{ tintColor: tintColor }, styles.tabBarIcon]}/>)
        })
    },
    MeTab: {
        screen: MeStack,
        navigationOptions: ({ navigation }) => ({
            header: null,
            tabBarLabel: strings.meHeader,
            ...defaultHeaderStyle,
            tabBarIcon: ({ tintColor }) => (<Image source={require('./assets/ic_menu_me.png')}
                                                   style={[{ tintColor: tintColor }, styles.tabBarIcon]}/>)
        })
    }
}, {
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
        style: {
            backgroundColor: colors.mainWhite
        },
        labelStyle: {
            fontSize: 8,
            fontWeight: 'bold'
        },
        showIcon: true,
        upperCaseLabel: true,
        activeTintColor: colors.blueText,
        inactiveTintColor: colors.blackHeader,
        indicatorStyle: {
            backgroundColor: 'transparent',
        },
    }
});

const styles = StyleSheet.create({
    tabBarIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain'
    }
});

export const ScreenStack = StackNavigator({

    Root: {
        screen: Launch,
        navigationOptions: {
            header: null,
        }
    },
    Authentication: {
        screen: Authentication,
        navigationOptions: {
            header: null,
        }
    },
    AuthenticationEmail: {
        screen: AuthenticationEmail,
        navigationOptions: {
            header: null,
        }
    },
    Home: {
        screen: TabNav
    },
    Onboarding: {
        screen: Onboarding,
        navigationOptions: {
            header: null,
        }
    },
    Reader: {
        screen: Reader,
        navigationOptions: ({navigation}) => ({
            title: Math.round(navigation.state.params.readingTime) + " Min Read",
            headerStyle: {
                backgroundColor: colors.mainWhite
            },
            headerTitleStyle: {
                color: colors.blackHeader,
                fontSize: 25,
                fontWeight: "bold"
            },
            headerLeft: <BackNavigationButton goBack={()=>navigation.goBack()}/>
        })
    }
}, {
    navigationOptions: {
        gesturesEnabled: false
    }
});
