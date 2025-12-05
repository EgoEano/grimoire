/**
 * Web implementation of back redirect adapter
 * Provides browser-compatible stubs and implementations where possible
 */

import type { BackHandlerAdapter, PlatformAdapter, ToastAdapter, BackHandlerSubscription } from './backRedirectAdapter';

// Uses browser's popstate event to handle back button
export const BackHandler: BackHandlerAdapter = {
    addEventListener: (eventName: string, handler: () => boolean): BackHandlerSubscription => {
        if (eventName === 'hardwareBackPress') {
            // On web, we intercept the browser's back button using popstate
            const popstateHandler = (event: PopStateEvent) => {
                const shouldPrevent = handler();
                if (shouldPrevent) {
                    // Push a new state to prevent actual navigation
                    event.preventDefault?.();
                    window.history.pushState(null, '', window.location.href);
                }
            };

            // Push initial state to enable popstate interception
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', popstateHandler);

            return {
                remove: () => {
                    window.removeEventListener('popstate', popstateHandler);
                },
            };
        }

        return {
            remove: () => { },
        };
    },

    exitApp: () => {
        if (typeof window !== 'undefined') {
            //window.close();
        }
    },
};

export const Platform: PlatformAdapter = {
    OS: 'web',
};

export const Toast: ToastAdapter = {
    show: (message: string, _duration: number) => {
        if (typeof window !== 'undefined') {
            alert(`Toast: ${message}`);
        }
    },
    SHORT: 2000, // 2 seconds
    LONG: 3500,  // 3.5 seconds
};
