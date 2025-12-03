import type {RouteNode} from '../core/types/types';

import radioRoutes from '../modules/radioPlayer/routes';

const appRoot: RouteNode = {
    path: '',
    children: [
        radioRoutes,
    ]
};

export default appRoot;