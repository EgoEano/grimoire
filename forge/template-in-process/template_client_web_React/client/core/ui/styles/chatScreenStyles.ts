import { Dimensions, StyleSheet } from 'react-native';


export const ChatScreenStyles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#fff' },
    flatList: { 
        flexGrow: 1, 
        justifyContent: 'flex-end', 
        padding: 10, 
    },
    bubble_sender : {
        alignSelf: 'flex-start',
        backgroundColor: 'transparent',
        // backgroundColor: '#ECECEC',
        marginVertical: 4,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 10,
        maxWidth: '100%',
    },
    bubble_user : {
        alignSelf: 'flex-end',
        backgroundColor: '#ECECEC',
        // backgroundColor: '#DCF8C6',
        marginVertical: 4,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 10,
        maxWidth: '90%',
    },
    bubble_deleted_color : {
        backgroundColor: '#b3b3b3',
    },
    bubble_wide: {width: Dimensions.get('window').width * 0.95},
    
    bubble_text: {
        fontSize: 16,
        //color: '#000000'
    },
    inputArea: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    sendButton: { 
        backgroundColor: '#1e8fff00',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginLeft: 10,
        borderRadius: 0,
        justifyContent: 'center',
    },
    sendButtonText: { 
        color: '#007AFF', 
        fontWeight: 'bold', 
        fontSize: 16,
    },
});
