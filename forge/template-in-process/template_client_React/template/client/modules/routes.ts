import type { RouteNode } from '../core/types/types';

import MainRoutes from '../modules/main/routes'

const appRoot: RouteNode = {
    path: '',
    optionsNavigator: {
        type: 'stack',
        options: {
            headerShown: false,
        }
    },
    children: [
        MainRoutes,
    ]
};

export default appRoot;