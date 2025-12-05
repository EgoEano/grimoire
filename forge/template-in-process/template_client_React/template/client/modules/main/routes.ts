import type { RouteNode } from '../../core/types/types';

import { FirstScreen } from './first';
import { SecondScreen } from './second';

const routes: RouteNode = {
    path: '',
    optionsNavigator: {
        type: 'tabs',
        options: {
            headerShown: false,
        }
    },
    children: [
        {
            path: '',
            mobileName: 'First',
            component: FirstScreen
        },
        {
            path: 'Second',
            mobileName: 'Second',
            component: SecondScreen
        },
    ]
};


export default routes;