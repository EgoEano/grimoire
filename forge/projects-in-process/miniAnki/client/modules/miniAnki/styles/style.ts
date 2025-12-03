import { StyleSheet } from 'react-native';


const COLOR_BACKGROUND = '#FFF';
const COLOR_PRIMARY = '#1f1f1f';
const COLOR_ON_PRIMARY = '#FFF';
const COLOR_SECONDARY = '#DDDDDD';
const COLOR_SUCCESS = '#2cb67d';
const COLOR_ERROR = '#f25f4c';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 20,
        gap: 20,
        userSelect: 'none',
    },
    title: {
        fontSize: 22,
    },
    list: {
        width: '100%',
    },
    listContent: {
        width: '100%',
        gap: 10,
    },
    collectionButton: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        userSelect: 'none',
    },
    collectionTextArea: {
        alignItems: 'flex-start'
    },
    cardContextDots: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderColor: 'transparent'
    },
    newCollectionButton: {
        width: '100%',
    },
    newCollectionButtonText: {
        userSelect: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    modalView: {
        width: 300,
        gap: 20,
    },
    input: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: '100%',
    },
    contextMenuView: {
        gap: 10,
    },
    contextMenuTitle: {
        marginBottom: 15,
    },
    buttonMaxWidth: {
        width: '100%',
    },
    addCardInput: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: '100%',
    },
    dialogText: {
        textAlign: 'center',
    },
    dialogButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 10,
    },
    modalFullWidth: {
        width: '100%',
    },
    wordsListContainer: {
        width: '100%',
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 20,
        gap: 30
    },
    backToCollectionsButton: {
        alignSelf: 'flex-start',
    },
    wordItemView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    wordItem: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
    },
    gameContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 1,
        width: '100%',
        gap: 30
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    gameActionRow: {
        flexDirection: 'row',
        gap: 10
    },
    failButtonText: {
        color: COLOR_ERROR,
    },
    successButtonText: {
        color: COLOR_SUCCESS,
    },
    flipCardPressable: {
        alignItems: 'center',
        width: '100%',
    },
    flipCardFront: {
        backfaceVisibility: 'hidden',
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: COLOR_PRIMARY,
        borderWidth: 1,
        borderColor: COLOR_SECONDARY,
        width: '100%',
        minHeight: 180,
        borderRadius: 16,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipCardBack: {
        backfaceVisibility: 'hidden',
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: COLOR_PRIMARY,
        borderWidth: 1,
        borderColor: COLOR_SECONDARY,
        width: '100%',
        minHeight: 180,
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameEndView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    gameEndText: {
        textAlign: 'center',
    },
});

export default styles;