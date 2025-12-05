// Native (React Native) implementation of back redirect adapter
// Uses React Native's BackHandler, Platform, and ToastAndroid

import { BackHandler as RNBackHandler, Platform as RNPlatform, ToastAndroid } from 'react-native';
import type { BackHandlerAdapter, PlatformAdapter, ToastAdapter } from './backRedirectAdapter';

export const BackHandler: BackHandlerAdapter = RNBackHandler;
export const Platform: PlatformAdapter = RNPlatform as PlatformAdapter;

// Toast adapter for Android
export const Toast: ToastAdapter = {
    show: (message: string, duration: number) => {
        if (RNPlatform.OS === 'android') {
            ToastAndroid.show(message, duration);
        }
    },
    SHORT: ToastAndroid.SHORT,
    LONG: ToastAndroid.LONG,
};
