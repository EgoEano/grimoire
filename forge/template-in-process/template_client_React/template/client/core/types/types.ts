import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

declare global {
    interface Window {
        root: import('react-dom/client').Root;
    }
}

export type RouteNode = {
    path: string;
    mobileName?: string; // Optional: explicit mobile screen name (auto-generated if not provided)
    component?: React.ComponentType<any>;
    children?: RouteNode[];
    optionsNavigator?: NavigatorOptions;
    options?: any;
};

export type StackType = 'stack' | 'tabs' | 'drawer' | null | undefined;
export type NavigatorOptions = {
    type: StackType,
    options: NativeStackNavigationOptions;
};
