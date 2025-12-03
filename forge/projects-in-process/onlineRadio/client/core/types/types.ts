declare global {
    interface Window {
      root: import('react-dom/client').Root;
    }
}

export interface RouteNode {
    path: string;
    children?: RouteNode[];
    component?: React.ComponentType;
    options?: any;
};
