import { useMemo } from "react";
import { Route, Routes } from "react-router-dom";

type RouteItem = {
    route?: string;
    url?: string | string[];
    component: React.ComponentType;
  };

export function PagesTabRootNavigatorRouter({ 
    routes, 
    Default, 
    NotFound }: {
        routes: RouteItem[];
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
                const pathSelect = r.url || r.route;
                const paths = Array.isArray(pathSelect) ? pathSelect : [pathSelect];
				return paths.map((path, idx) => (
					<Route key={`${path}_${idx}`} path={path} element={<r.component />} />
				));
			})}
			<Route path="*" element={<NotFoundComponent />} />
		</Routes>
	);
}
