import type {RouteNode} from '../../core/types/types';

import {MainScreen} from './main';

const routes: RouteNode = {
    path: '',
    children: [
        {
            path: '',
            component: MainScreen
        },
    ]
};


export default routes;