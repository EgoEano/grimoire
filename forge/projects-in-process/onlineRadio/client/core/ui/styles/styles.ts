import type { ViewStyle, TextStyle } from 'react-native';

const styles: { [key: string]: ViewStyle | TextStyle } = {
    flexContainer: {
        flex: 1,
    },
    flexCenterContainer: {
        flex: 1,
        alignItems: 'center', 
        justifyContent: 'center'
    },
    statusBar: {
        color: '#00000050',
    },
};

export default styles;