import type {RouteNode} from '../../core/types/types';

import {RadioPlayer} from './player';

const routes: RouteNode = {
    path: '',
    children: [
        {
            path: '',
            component: RadioPlayer
        }
    ]
};


export default routes;