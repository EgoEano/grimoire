import { AppRegistry } from 'react-native';
import { name as appName } from '../../app.json';
import MobileApp from './mobile_Init';

import { enableScreens } from 'react-native-screens';


export default function initMobileApp() {
    enableScreens(true);
    AppRegistry.registerComponent(appName, () => MobileApp);
}