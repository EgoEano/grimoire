import type {RouteNode} from '../../core/types/types';

import {FirstScreen} from './first';
import {SecondScreen} from './second';

const routes: RouteNode = {
    path: '',
    children: [
        {
            path: '',
            component: FirstScreen
        },
        {
            path: 'first',
            component: FirstScreen
        },
        {
            path: 'second',
            component: SecondScreen
        },
    ]
};


export default routes;