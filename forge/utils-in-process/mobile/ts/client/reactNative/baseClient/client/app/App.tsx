import { AppRegistry } from 'react-native';
import { name as appName } from '../../app.json';
import App from './mobile_Init';
import { enableScreens } from 'react-native-screens';

enableScreens(true);

function init() {
  AppRegistry.registerComponent(appName, () => App);
}

export default init;