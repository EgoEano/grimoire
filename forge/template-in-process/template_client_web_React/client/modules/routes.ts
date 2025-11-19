import type {RouteNode} from '../core/types/types';

import mainRoutes from '../modules/main/routes'

const appRoot: RouteNode = {
    path: '',
    children: [
        mainRoutes,
    ]
};

export default appRoot;