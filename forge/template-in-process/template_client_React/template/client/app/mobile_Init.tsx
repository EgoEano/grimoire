import React, { useEffect, useState, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    StatusBar,
    StyleSheet,
    useColorScheme,
    View,
    Text,
} from 'react-native';

import config from '../../app.json';
import { SuperProvider } from '../core/services/providers/superProviderService';
import { useSystemData } from '../core/services/providers/systemDataProviderService';
import { useStyleContext } from '../core/services/providers/styleProvider';
import { useLanguage } from '../core/services/providers/languageProviderService';

import gstyles from '../core/ui/styles/styles';
import languages from '../core/ui/locales/languages';

import RootNavigator from './mobile_Navigation';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <SuperProvider>
                        <AppInit />
                    </SuperProvider>
                </KeyboardAvoidingView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function AppInit({ }) {
    const { setSysValue, setSysValues } = useSystemData();
    const { setLanguagePack } = useLanguage();
    const { styles, dimensions, addGroup } = useStyleContext();

    const [ready, setReady] = useState(false);

    const init = async () => {
        try {
            addGroup(StyleSheet.create(gstyles));
            setLanguagePack(languages['en-US']);
            setSysValues(initSysValues());
            setSysValue('config', config);
            setReady(true);
        } catch (e) {
            console.error('Ошибка инициализации', e);
        }
    };

    useEffect(() => {
        init();
    }, []);

    console.log('[AppInit] render, ready=', ready);
    return (ready) ? <RootView /> : <AppLoadingPlaceholder />
}

function RootView({ }) {
    const isDarkMode = useColorScheme() === 'dark';
    const { styles } = useStyleContext();
    const { getSysValue } = useSystemData();

    useEffect(() => {
        const isHidden = getSysValue('isStatusBarHidden') ?? false;
        StatusBar.setHidden(isHidden, 'slide');
    }, []);

    return (
        <View
            style={styles.flexContainer}
        >
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={styles.statusBar?.color ?? 'red'}
                animated={true}
                hidden={false}
            />
            <RootNavigator />
        </View>
    );
}

function AppLoadingPlaceholder() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
            <Text style={{ fontSize: 18, color: "#999" }}>{'Loading... (set your app logo)'}</Text>
        </View>
    );
}

function initSysValues() {
    return {
        isStatusBarHidden: true,
        defaultNavigatorScreenOptions: {
            stack: {
                headerShown: false,
                title: 'My Screen',
                animation: 'fade',
                gestureEnabled: true,
                presentation: 'modal',
                headerStyle: { backgroundColor: 'tomato' },
                headerTintColor: '#fff',
            },
            tabs: {
                //title: 'Main', // Need to set in node
                //tabBarLabel: 'Home', // Need to set in node
                tabBarIcon: () => null, // Need to set return Component
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: '#f8f8f8',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarActiveTintColor: '#007aff',
                tabBarInactiveTintColor: '#999',
                tabBarBadge: null,
                tabBarBadgeStyle: {
                    backgroundColor: 'red',
                    color: 'white',
                    fontSize: 10,
                },
                headerShown: false,
                //headerTitle: 'Welcome', // Need to set in node
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: '#ffffff',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                },
                //headerRight: null, // Need to set return Component
                lazy: true,
                freezeOnBlur: true,
                popToTopOnBlur: false,
                sceneContainerStyle: {
                    backgroundColor: '#fff',
                },
            },
            drawer: {
            },
        },
        defaultRootNavigatorType: 'stack',
        defaultNavigatorType: 'tabs',
    }
}