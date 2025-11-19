import type {RouteNode} from '../../core/types/types';

import {FirstScreen} from './first';
import {SecondScreen} from './second';

const routes: RouteNode = {
    name: 'MainRoutes',
    optionsNavigator: {
        type: 'tabs',
        options: {
            headerShown: false,
        }
    },
    children: [
        {
            name: 'First',
            component: FirstScreen
        },
        {
            name: 'Second',
            component: SecondScreen
        },
    ]
};


export default routes;