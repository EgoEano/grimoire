import { RouteNode } from '../../core/types/types';
import { HomeScreen } from './screens/HomeScreen';
import { AddTransactionScreen } from './screens/AddTransactionScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const miniBudgetRoutes: RouteNode = {
    path: 'BudgetMicro',
    optionsNavigator: {
        type: 'stack',
        options: {
            headerShown: false,
        },
    },
    children: [
        {
            path: 'Home',
            component: HomeScreen,
        },
        {
            path: 'AddTransaction',
            component: AddTransactionScreen,
            options: {
                presentation: 'modal',
            },
        },
        {
            path: 'Stats',
            component: StatsScreen,
        },
        {
            path: 'Settings',
            component: SettingsScreen,
        },
    ],
};

export default miniBudgetRoutes;
