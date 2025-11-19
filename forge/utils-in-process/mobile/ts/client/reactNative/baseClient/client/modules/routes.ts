import type {RouteNode} from '../core/types/types';

import mainRoutes from '../modules/main/routes'

const appRoot:RouteNode = {
    name: 'AppShell',
    optionsNavigator: {
        type: 'stack',
        options: {
            headerShown: false,
        }
    },
    children: [
        mainRoutes,
    ]
};

export default appRoot;