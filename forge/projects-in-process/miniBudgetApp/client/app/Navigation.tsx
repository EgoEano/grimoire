import React, { useMemo } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import type { RouteNode, StackType } from '../core/types/types';
import { useSystemData } from '../core/services/providers/systemDataProviderService';
import { useStyleContext } from '../core/services/providers/styleProvider';

import appRoot from '../modules/routes';

type ScreenOptions = NativeStackNavigationOptions | DrawerNavigationOptions | BottomTabNavigationOptions | undefined;


export default function RootNavigator() {
    const { getSysValue } = useSystemData();
    const { styles } = useStyleContext();

    const RootScreenComponent = useMemo(() => createScreenComponent(appRoot, getSysValue, styles), [getSysValue, styles]);

    return (
        <NavigationContainer>
            <RootScreenComponent />
        </NavigationContainer>
    );
}

const renderStack = ({
    node,
    Stack,
    isRoot = false,
    parentKey = '',
    defaultNavigatorType,
    defaultNavigatorScreenOptions,
    styles
}: {
    node: RouteNode,
    Stack?: any,
    isRoot?: boolean,
    parentKey?: string
    defaultNavigatorType: StackType
    defaultNavigatorScreenOptions: any,
    styles: Record<string, Record<string, any>>
}): React.ReactElement | null => {
    if (!node) {
        return <PlaceholderScreen name="invalid_node" style={styles.flexCenterContainer} />;
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
        const stackType: StackType = node?.optionsNavigator?.type ?? defaultNavigatorType;

        const sysScreenOptions = defaultNavigatorScreenOptions;
        const stackTypeScreenOptions =
            (stackType && sysScreenOptions?.[stackType])
                ? sysScreenOptions[stackType]
                : {};
        const screenOptions = {
            ...stackTypeScreenOptions,
            ...(node?.optionsNavigator ?? {})
        };

        const NestedStack = createNavigatorByType(stackType);

        if (isRoot) {
            return (
                <NestedStack.Navigator screenOptions={screenOptions}>
                    {node.children.map((child) => renderStack({
                        node: child,
                        Stack: NestedStack,
                        isRoot: false,
                        parentKey: node.path,
                        defaultNavigatorType,
                        defaultNavigatorScreenOptions,
                        styles
                    })
                    )}
                </NestedStack.Navigator>
            );
        }

        return (
            <Stack.Screen
                key={`${parentKey}-${node.path}`}
                name={node.path}
                options={node.options}
            >
                {() => (
                    <NestedStack.Navigator screenOptions={screenOptions}>
                        {node.children!.map((child) => renderStack({
                            node: child,
                            Stack: NestedStack,
                            isRoot: false,
                            parentKey: `${parentKey}-${node.path}`,
                            defaultNavigatorType,
                            defaultNavigatorScreenOptions,
                            styles
                        })
                        )}
                    </NestedStack.Navigator>
                )}
            </Stack.Screen>
        );
    }

    if (node.component) {
        return (
            <Stack.Screen
                key={`${parentKey}-${node.path}`}
                name={node.path}
                component={node.component}
                options={node.options}
            />
        );
    }

    return (
        <PlaceholderScreen
            name={node.path}
            style={styles.flexCenterContainer}
        />
    );
};

function createScreenComponent(
    node: RouteNode = { path: 'bad' },
    getSysValue: (key: string) => any | null,
    styles: Record<string, Record<string, any>>
): React.ComponentType<any> {
    const defaultNavigatorType: StackType = getSysValue('defaultNavigatorType');
    const defaultNavigatorScreenOptions = getSysValue('defaultNavigatorScreenOptions');

    return function ScreenComponentWrapper() {
        return renderStack({
            node,
            Stack: undefined,
            isRoot: true,
            parentKey: '',
            defaultNavigatorType,
            defaultNavigatorScreenOptions,
            styles
        });
    }
}

function PlaceholderScreen({
    name,
    style
}: { name: string, style: ViewStyle }) {
    return (
        <View style={style}>
            <Text>{name}</Text>
        </View>
    )
};

function createNavigatorByType(type: StackType = 'stack') {
    switch (type) {
        case 'tabs':
            return createBottomTabNavigator();
        case 'drawer':
            return createDrawerNavigator();
        case 'stack':
        default:
            return createNativeStackNavigator();
    }
}