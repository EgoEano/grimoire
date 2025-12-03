declare global {
    interface Window {
      root: import('react-dom/client').Root;
    }
}

type NativeStackNavigationOptions = {/* plug from RN */}

export type RouteNode = {
    path: string;
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
