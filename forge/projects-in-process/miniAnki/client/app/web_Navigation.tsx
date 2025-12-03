import React, { lazy, Suspense, useMemo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { View, Text } from "react-native";

import type { ViewStyle } from "react-native";
import type { RouteNode } from "@client/core/types/types";

export function RootNavigator({ rootNode }: { rootNode: RouteNode }) {
    const memoizedRoutes = useMemo(() => renderNode(rootNode), [rootNode]);
  
    return (
        <Routes>
            {memoizedRoutes}
            <Route path="*" element={<PlaceholderScreen name="Where did you find this page?"/>} />
        </Routes>
    );
}

function renderNode(
    node: RouteNode, 
): React.ReactNode {
    if (!node) throw new Error("RootNavigator. Invalid node");

    if (Array.isArray(node.children) && node.children.length > 0) {
        return (
            <Route
                key={node.path}
                path={node.path}
                element={node.component ? <LazyWrapper component={node.component} /> : undefined}
            >
                {node.children.map((child) => renderNode(child))}
            </Route>
        );
    }

    if (node.component) {
        return (
            <Route
                key={node.path}
                path={node.path}
                element={<LazyWrapper component={node.component} />}
            />
        );
    }

    throw new Error("RootNavigator. Invalid node");
}

export function PagesTabRootNavigatorRouter({ 
    routes, 
    Default, 
    NotFound }: {
        routes: RouteNode[];
        Default?: React.ComponentType;
        NotFound?: React.ComponentType;
    }) {
    const memoizedRoutes = useMemo(() => routes, [routes]);
    const DefaultComponent = Default ?? memoizedRoutes[0]?.component ?? (() => <></>);
    const NotFoundComponent = NotFound ?? (() => <></>);

	return (
		<Routes>
			<Route path="/" element={<DefaultComponent />} />
			{memoizedRoutes?.map((r) => {
                const pathSelect = r.path;
                const paths = Array.isArray(pathSelect) ? pathSelect : [pathSelect];
				return paths.map((path, idx) => (
					<Route
						key={`${path}_${idx}`}
						path={path}
						element={
							r.component
								? React.createElement(r.component)
								: <PlaceholderScreen name="invalid_node" />
						}
					/>
				));
			})}
			<Route path="*" element={<NotFoundComponent />} />
		</Routes>
	);
}

function PlaceholderScreen({ 
    name, 
    style 
}: { 
    name: string, 
    style?: ViewStyle 
}) {
    return (
        <View style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            ...style
        }}>
            <Text>{name}</Text>
        </View>
    )
}

function LazyWrapper({ component: Component }: { component: React.ComponentType }) {
    return (
        <Suspense fallback={<PlaceholderScreen name="Loading..." />}>
            <Component />
        </Suspense>
    );
}