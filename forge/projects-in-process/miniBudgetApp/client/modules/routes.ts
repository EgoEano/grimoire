import type { RouteNode } from '../core/types/types';

import miniBudgetRoutes from './miniBudget/routes';

const appRoot: RouteNode = {
    path: 'AppShell',
    optionsNavigator: {
        type: 'stack',
        options: {
            headerShown: false,
        },
    },
    children: [
        miniBudgetRoutes,
    ]
};

export default appRoot;