import { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function useBackRedirect(targetRoute: string) {
    let isNavigating = false;
    const navigation = useNavigation();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!isNavigating && targetRoute?.length > 0) {
                isNavigating = true;
                navigation.navigate(targetRoute as never);
                setTimeout(() => (isNavigating = false), 500);
            }
            return true;
        });

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isNavigating && targetRoute?.length > 0) {
                e.preventDefault();
                isNavigating = true;
                navigation.navigate(targetRoute as never);
                setTimeout(() => (isNavigating = false), 500);
            }
        });

        return () => {
            backHandler.remove();
            unsubscribe();
        };
    }, [navigation, targetRoute]);
}

export function useBackIntercept(callback: () => void) {
    useEffect(() => {
        const handler = () => {
            callback();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handler);

        return () => subscription.remove();
    }, [callback]);
}

export function useBackExit(fallbackRoute: string) {
    const navigation = useNavigation<any>();
    const lastPressRef = useRef(0);

    const onBackPress = useCallback(() => {
        if (Platform.OS === 'ios') {
        // На iOS сбрасываем стек
            navigation.reset({
                index: 0,
                routes: [{ name: fallbackRoute }],
            });
            return true;
        } else {
        // На Android двойное нажатие для выхода
            const now = Date.now();
            if (now - lastPressRef.current < 2000) {
                BackHandler.exitApp();
            } else {
                ToastAndroid.show('Нажмите назад ещё раз для выхода', ToastAndroid.SHORT);
                lastPressRef.current = now;
            }
            return true; // перехватываем
        }
    }, [fallbackRoute, navigation]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [onBackPress]);
}


