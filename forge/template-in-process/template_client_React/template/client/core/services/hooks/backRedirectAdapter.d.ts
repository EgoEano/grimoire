// Platform adapter for back button handling
// Provides cross-platform support for hardware back button (mobile) and browser back (web)

export interface BackHandlerSubscription {
    remove(): void;
}

export interface BackHandlerAdapter {
    /**
     * Add event listener for hardware/browser back button press
     * @param eventName - Event name (e.g., 'hardwareBackPress')
     * @param handler - Handler function that returns true to prevent default behavior
     * @returns Subscription object with remove() method
     */
    addEventListener(eventName: string, handler: () => boolean): BackHandlerSubscription;

    /**
     * Exit the application (mobile only, no-op on web)
     */
    exitApp(): void;
}

export interface PlatformAdapter {
    /**
     * Platform OS identifier
     */
    OS: 'ios' | 'android' | 'web';
}

export interface ToastAdapter {
    /**
     * Show a toast message (Android only, uses alert/console on other platforms)
     */
    show(message: string, duration: number): void;
    SHORT: number;
    LONG: number;
}

declare const BackHandler: BackHandlerAdapter;
declare const Platform: PlatformAdapter;
declare const Toast: ToastAdapter;

export { BackHandler, Platform, Toast };
