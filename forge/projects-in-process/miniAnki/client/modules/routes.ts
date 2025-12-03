import type {RouteNode} from '../core/types/types';

import ankiRoutes from '../modules/miniAnki/routes'

const appRoot: RouteNode = {
    path: '',
    children: [
        ankiRoutes,
    ]
};

export default appRoot;