import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export type RouteNode = {
  path: string;
  component?: React.ComponentType<any>;
  children?: RouteNode[];
  optionsNavigator?: NavigatorOptions;
  options?: NativeStackNavigationOptions;
};

export type StackType = 'stack' | 'tabs' | 'drawer' | null | undefined;

export type NavigatorOptions = {
  type: StackType,
  options: NativeStackNavigationOptions;
};
