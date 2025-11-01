import React, { useMemo, useState, useRef, createContext, useContext, useEffect } from 'react';

import {
    View,
    Text, 
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Alert,
    Image,
} from 'react-native';

import {ChatScreenStyles} from '../../styles/chatScreenStyles';

import type {
    Chat,
    ChatListAreaProps,
    ChatTileProps,

    ChatAreaProps,
    CreateBubbleParam,
    Message,
    CreateMessageParam,
    NewMessage,

    MessengerScreenProps,
    MessengerContextProps,
    MessengerContext,
} from '../../../types/ChatScreenTypes';

import { Button, ModalCard } from '../interfaceComponents';
import { useBackIntercept } from '../../../services/hooks/useBackRedirect';


const tst_style = StyleSheet.create({
    searchScreen: {
        flex: 1,
        height: '100%',
    },
    searchHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 0,
    },
    chatScreen: {
        flex: 1,
        height: '100%',
    },
    chatScreenSendButton: {
        backgroundColor: '#1e90ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    
});

//#region OUTER COMPONENTS REMOVE OUTSIDE AFTER TESTING
function ChatCreateView({}) {
    const {
        //initChat,
        setIsShowChatCreate,
    } = useMessengerContext();



    const [title, settitle] = useState('');
    const [isGroup, setIsGroup] = useState<boolean>(false);

    const style = useMemo(() => StyleSheet.create({
        wrapper: {
            flex: 1,
        },
        header: {
            height: 48,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
        },
        headerTile: {

        },
        body: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
        },
        bodyGreet: {
            width: '80%'
        },
        bodyGreetText: {
            fontWeight: 'bold',
            fontSize: 28,
            color: '#000',
            textAlign: 'center',
        },
        inputArea: {
            width: '90%',
            borderColor: '#bababaff',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        input: {
            maxHeight: 150,
        },
        inputAreaFooter: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 16,
            paddingHorizontal: 16,
            paddingBottom: 5,
        },
        inputAreaBtn: {
            paddingVertical: 5,
            paddingHorizontal: 10,
        },
        examplesArea: {
            width: '90%',
            gap: 12,
        },
        examplesTile: {
            width: '100%',
            backgroundColor: '#e0e0e0ff',
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        examplesTileText: {
            color: '#000',
        },
    }), []);

    const onCreate = () => {
        setIsShowChatCreate(false)
        //initChat(title);
    }

    const onCancel = () => {
        setIsShowChatCreate(false)
    }

    return (
        <View style={style.wrapper}>
            <View style={style.header}>
                <View>
                    <Text style={{
                        fontWeight: 'bold',
                        fontSize: 24,
                        color: '#000',
                    }}>Accio</Text>
                </View>
                <View>
                    <Button
                        onPress={onCancel}
                    >
                        <Text>h</Text>
                    </Button>
                </View>
            </View>
            <View style={style.body}>
                <View style={style.bodyGreet}>
                    <Text style={style.bodyGreetText}>
                        Find products and B2B insights with AI
                    </Text>
                </View>
                <View style={style.inputArea}>
                    <TextInput
                        style={style.input}
                        value={title}
                        onChangeText={settitle}
                        placeholder={'Describe youtr needs...'}
                        multiline={true}
                        numberOfLines={5}
                        textAlignVertical="top"
                    />
                    <View style={style.inputAreaFooter}>
                        <Button
                            style={{
                                button: style.inputAreaBtn
                            }}
                            onPress={() => null}
                        >
                            <Text>pic</Text>
                        </Button>
                        <Button
                            style={{
                                button: style.inputAreaBtn
                            }}
                            onPress={onCreate}
                        >
                            <Text>send</Text>
                        </Button>
                    </View>
                </View>
                <View style={style.examplesArea}>
                    <View style={style.examplesTile}>
                        <Text style={style.examplesTileText}>
                            Premium ankle band
                        </Text>
                    </View>
                    <View style={style.examplesTile}>
                        <Text style={style.examplesTileText}>
                            Baby product ranking</Text>
                    </View>
                    <View style={style.examplesTile}>
                        <Text style={style.examplesTileText}>
                            GPS technology Trends</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

function ChatEditView({}) {
    const style = useMemo(() => StyleSheet.create({
        wrapper: {
            width: '100%',
            //flexDirection: 'row',
            //justifyContent: 'flex-start',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            borderWidth: 0,
        },
        headerLogo: {
            paddingVertical: 0,
            backgroundColor: 'transparent',
        },
        headerLogoText: {
            fontSize: 24,
            fontWeight: 'bold',
        },
    }), []);

    return (
        <View style={style.wrapper}>
            <Button
                style={{
                    button: style.headerLogo
                }}
            >
                <Text
                    style={style.headerLogoText}
                >ACCIO</Text>
            </Button>
        </View>
    );
}
//#endregion


//#region Messenger
export function MessengerScreen({
    tick,
    handleControl,
    isNeedToOpenChat,
    
    isLoading,
    error,
    
    userID,
    currentChatID,

    chats,
    messages,

    createChat,
    selectChat,
    refreshChats,
    updateChat,
    deleteChat,

    createMessage,
    clearMessages,


    components
}: MessengerScreenProps) {
    const [isChatOpened, setIsChatOpened] = useState<boolean>(isNeedToOpenChat ?? false);
    const [isShowChatCreate, setIsShowChatCreate] = useState<boolean>(false);
    const [isShowChatEdit, setIsShowChatEdit] = useState<boolean>(false);

    const [selectedChats, setSelectedChats] = useState<number[]>([]);
    const [isChatsActionActive, setIsChatsActionActive] = useState(false);

    const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
    const [isMessagesActionActive, setIsMessagesActionActive] = useState(false);

    const addChatToSelected = (id: number) => {
        setIsChatsActionActive(true);
        setSelectedChats(prev => [...prev, id]);
    };

    const removeChatFromSelected = (id: number) => {
        const newState = selectedChats.filter(cid => cid !== id);
        setSelectedChats(newState);
        if (newState.length == 0) setIsChatsActionActive(false);
    };

    const toggleChatSelected = (id: number) => {
        selectedChats.includes(id) ? 
            removeChatFromSelected(id) : 
            addChatToSelected(id);
    };

    const clearChatSelected = () => {
        setSelectedChats([]);
        setIsChatsActionActive(false);
    };

    const onChatDelete = async(): Promise<void> => {
        Alert.alert(
            'Delete',
            'Are you sure?',
            [
                {text: 'CANCEL', style: 'cancel'},
                {text: 'DELETE', style: 'default', onPress: () => {
                    chatDeleteAction();
                }},
            ],
            {cancelable: true}
        );
    };

    const chatDeleteAction = async () => {
        await deleteChat?.(selectedChats);
        clearChatSelected();
    };

    const onChatPress = async (type: string, item: Chat) => {
        switch (type) {
            case 'long':
                toggleChatSelected(item?.id ?? 0);
                break;

            case 'short':
            default:
                if (isChatsActionActive) {
                    toggleChatSelected(item?.id ?? 0);
                } else {
                    setIsChatOpened(true);
                    await selectChat?.(item);
                }
                break;
            
        }
        return true;
    }

    const onChatUpdate = async (): Promise<void> => {
        //Сделать открытие окошка редактирвоания, которое уже будет вызывать функцию ниже
        await updateChat?.(selectedChats[0], {});
    }

    useEffect(() => {
        // обратное замыкание
        handleControl?.({
            setChatState: (s: boolean) => {
                setIsChatOpened(s);
            },
        });
    }, []);

    // useEffect(() => {
    //     setIsChatOpened(isNeedToOpenChat);
    // }, [isNeedToOpenChat]);

    return (
        <MessengerProvider 
            tick={tick}
            isLoading={isLoading}
            error={error}
            
            userID={userID}
            currentChatID={currentChatID}

            chats={chats}
            selectedChats={selectedChats}
            setSelectedChats={setSelectedChats}
            isChatsActionActive={isChatsActionActive}
            setIsChatsActionActive={setIsChatsActionActive}

            messages={messages}
            selectedMessages={selectedMessages}
            setSelectedMessages={setSelectedMessages}
            isMessagesActionActive={isMessagesActionActive}
            setIsMessagesActionActive={setIsMessagesActionActive}
            clearMessages={clearMessages}

            addChatToSelected={addChatToSelected}
            removeChatFromSelected={removeChatFromSelected}
            clearChatSelected={clearChatSelected}

            isChatOpened={isChatOpened}
            setIsChatOpened={setIsChatOpened}
            isShowChatEdit={isShowChatEdit}
            setIsShowChatEdit={setIsShowChatEdit}
            isShowChatCreate={isShowChatCreate}
            setIsShowChatCreate={setIsShowChatCreate}

            createChat={createChat}
            selectChat={onChatPress}
            refreshChats={refreshChats}
            updateChat={onChatUpdate}
            deleteChat={onChatDelete}

            createMessage={createMessage}

            components={components}
        >
            <MessengerArea />
        </MessengerProvider>
    );
}

export function MessengerArea() {
    const {
        isLoading,
        error,
        
        userID,
        currentChatID,

        chats,
        selectedChats,
        setSelectedChats,
        isChatsActionActive,
        setIsChatsActionActive,

        messages,
        selectedMessages,
        setSelectedMessages,
        isMessagesActionActive,
        setIsMessagesActionActive,

        isChatOpened, 
        setIsChatOpened,

        createChat,
        selectChat,
        refreshChats,
        updateChat,
        deleteChat,

        createMessage,
    } = useMessengerContext();

  return (
    <View style={tst_style.searchScreen}>
        {isChatOpened ?
            <ChatScreen/> :
            <ChatListScreen />
        }
    </View>
  );
}
//#endregion

//#region ChatList
function ChatListScreen() {
    const {
        createChat,
        isChatsActionActive,
        isShowChatEdit, setIsShowChatEdit,
        isShowChatCreate, setIsShowChatCreate,
        components
    } = useMessengerContext();

    const style = useMemo(() => StyleSheet.create({
        wrapper: { flex: 1, backgroundColor: '#fff' },
        listScreen: {
            flex: 1,
            height: '100%',
        },
        listHeader: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            borderWidth: 0,
        },
        headerLogo: {
            paddingVertical: 0,
            backgroundColor: 'transparent',
        },
        headerLogoText: {
            fontSize: 24,
            fontWeight: 'bold',
        },
        newButton: {
            backgroundColor: '#1e90ff',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        chatModalWrapepr: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000cf',
            
        },
        chatModal: {
            position: 'absolute',
            width: '50%',
            height: '50%',
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#ff0000',
        },
        
    }), []);

    const ChatListHeaderView = () => {
        const Imported = components?.ChatListHeader;
        return (Imported != null) ? <Imported/> : null;
    };
    
    const ChatListHeaderActionView = () => {
        const Imported = components?.ChatListHeaderAction;
        return (Imported != null) ? <Imported/> : null;
    };
    
    const chatEditViewStyle = useMemo(() => StyleSheet.create({
        modal: {
            justifyContent: 'flex-end',
        },
        wrapper: {
            width: '100%',
        },
        card: {
            height: Dimensions.get('screen').height * 0.75,
            borderBottomEndRadius: 0,
            borderBottomStartRadius: 0,
        }
    }), []);

    const chatCreateViewStyle = useMemo(() => StyleSheet.create({
        modal: {
            justifyContent: 'flex-end',
        },
        wrapper: {
            height: '100%',
            width: '100%',
        },
        card: {
            height: '100%',
            borderRadius: 0,
        }
    }), []);

    return (
        <View style={style.listScreen}>
            {isChatsActionActive ?
                <ChatListHeaderActionView /> : 
                <ChatListHeaderView />
            }
            <ChatListArea 
                styles={style}
                onCreate={createChat}
            />
            <ModalCard
                isShow={isShowChatEdit}
                setIsShow={setIsShowChatEdit}
                closable={false}
                isHasCross={false}
                style={chatEditViewStyle}
            >
                <ChatEditView 
                />
            </ModalCard>
            <ModalCard
                isShow={isShowChatCreate}
                setIsShow={setIsShowChatCreate}
                closable={false}
                style={chatCreateViewStyle}
            >
                <ChatCreateView 
                />
            </ModalCard>
        </View>
    )
}

function ChatListArea({
    styles = {},
}: ChatListAreaProps) {
    const {
        chats,
        selectChat,
        selectedChats,
        components,
    } = useMessengerContext();
    
    const flatListRef = useRef<FlatList>(null);

    const ChatTileView = (props: ChatTileProps) => {
        const Imported = components?.ChatListItem;
        return (Imported != null) ? <Imported {...props}/> : null;
    };
    
    const renderItem = ({ item }: { item: Chat }) => {
        const isSelected = selectedChats.includes(item?.id ?? 0);

        return (<ChatTileView 
            item={item}
            isSelected={isSelected}
            onPress={selectChat}
            onLongPress={selectChat}
        />)
    };

    return (
        <KeyboardAvoidingView
            style={styles?.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            <FlatList
                ref={flatListRef}
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item) => (item?.id ?? 0).toString()}
                inverted={false}
                initialNumToRender={20}
                maxToRenderPerBatch={10}
                contentContainerStyle={styles?.flatList}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                scrollEventThrottle={100}
            />
        </KeyboardAvoidingView>
    );
}
//#endregion

//#region Chat
function ChatScreen() {
    const {
        components
    } = useMessengerContext();
    
    const defaultChatLables = useMemo(() => ({
        textInputPlaceholder: "Input your message...",
        sendPlaceholder: "Send",
    }), []);
    
    const ChatHeaderView = () => {
        const Imported = components?.ChatHeader;
        return (Imported != null) ? <Imported /> : null;
    };

    const chatStyles = useMemo(() => StyleSheet.create({
        chatScreen: {
            flex: 1,
            height: '100%',
        },
    }), []);
    
    return (
        <View style={chatStyles.chatScreen}>
            <ChatHeaderView />
            <ChatArea 
                styles={ChatScreenStyles}
                lables={defaultChatLables}
            />
        </View>
    );
}

function ChatArea({
    styles,
    lables,
}: ChatAreaProps) {
    const {
        tick,
        isLoading,
        userID,
        messages,
        createMessage,
        components,
    } = useMessengerContext();

    const flatListRef = useRef<FlatList>(null);
    const isNewMessage = useRef(false);
    const [inputText, setInputText] = useState('');

    const isNearBottom = useRef(true);
    const previousContentHeight = useRef(0);
    const scrollOffset = useRef(0);

    const MessageItemView = (props: CreateBubbleParam) => {
        const Imported = components?.MessageItem;
        return (Imported != null) ? <Imported {...props}/> : null;
    };
    
    const createNewMessage = ({
        body
    }: CreateMessageParam): NewMessage => {
        return {
            body,
        }
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: NewMessage = createNewMessage({
            body: inputText.trim(),
        });
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });

        createMessage?.(newMessage);
        setInputText('');
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset } = event.nativeEvent;
        const paddingToBottom = Dimensions.get('screen').height / 2; // допустимое расстояние до низа

        scrollOffset.current = contentOffset.y;
        isNearBottom.current = contentOffset.y < paddingToBottom;
    };    
    //#FIXME_13 не удается сделать контрсдвиг при новом сообщении
    // h ведет себя нестабильно и не дает стабильный результат
    const handleContentSizeChange = (w: number, h: number) => {
        //console.lo(isLoading, h, previousContentHeight.current);
        
        // if (isLoading) {
        //     console.lo('scrl - load');
        //     //flatListRef.current?.scrollToEnd({ animated: false });
        //     flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
        // } else {
        //     console.lo('scrl - native');
        //     if (shouldScrollToEnd.current || isNearBottom.current) {
        //         flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
        //         // flatListRef.current?.scrollToEnd({ animated: true });
        //         shouldScrollToEnd.current = false;
        //     }
        // }

        // if (!isNearBottom.current && isNewMessage.current) {
        //     isNewMessage.current = false;
        //     const heightDiff = h - previousContentHeight.current;

        //     console.lo('new scroll! - ', heightDiff);
        
        //     if (heightDiff > 0) {
        //         flatListRef.current?.scrollToOffset({
        //             offset: scrollOffset.current + heightDiff,
        //             animated: false,
        //         });
        //     }
        // }

        previousContentHeight.current = h;
    };   
    
    useEffect (() => {
        if (!isLoading) {
            isNewMessage.current = true;
        } 
    }, [messages]);

    // const setOffset = (val: number) => {
    //     if (isNewMessage.current) {
    //         isNewMessage.current = false;
    //         flatListRef.current?.scrollToOffset({
    //             offset: previousContentHeight.current + val,
    //             animated: false,
    //         });
    //     }
    // }

    const renderItem = ({ item }: { item: Message }) => (
        <MessageItemView 
            item={item}
            isUserSender={(item?.sender_id ?? 0).toString() === userID}
        />
    );

    return (
        <KeyboardAvoidingView
            style={styles?.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            {/* #FIXME реализовать дозагрузку сообщений по onEndReached  */}
            <FlatList
                ref={flatListRef}
                extraData={tick}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => (item?.id ?? 0).toString()}
                inverted={true}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={6}
                removeClippedSubviews={true}
                contentContainerStyle={styles?.flatList}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                onContentSizeChange={handleContentSizeChange}
                onEndReached={() => null} 
                onScroll={handleScroll}
                scrollEventThrottle={100}
                showsVerticalScrollIndicator={!isLoading}
                showsHorizontalScrollIndicator={!isLoading}
            />

            <View
                style={styles?.inputArea}
            >
                <TextInput
                    style={styles?.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={lables?.textInputPlaceholder || ''}
                />
                <Button 
                    title={lables?.sendPlaceholder || ''}
                    onPress={sendMessage}
                    style={{
                        button: styles?.sendButton,
                        text: styles?.sendButtonText,
                    }}
                />
            </View>
        </KeyboardAvoidingView>
    );
};
//#endregion

//#region Provider
const MessengerContext = createContext<MessengerContext | undefined>(undefined);

const MessengerProvider = ({
    tick,
    isLoading,
    error,
    
    userID,
    currentChatID,

    chats,
    selectedChats,
    setSelectedChats,
    isChatsActionActive,
    setIsChatsActionActive,

    messages,
    selectedMessages,
    setSelectedMessages,
    isMessagesActionActive,
    setIsMessagesActionActive,
    clearMessages,
    
    addChatToSelected,
    removeChatFromSelected,
    clearChatSelected,
    
    isChatOpened, 
    setIsChatOpened,
    isShowChatEdit,
    setIsShowChatEdit,
    isShowChatCreate, 
    setIsShowChatCreate,

    createChat,
    refreshChats,
    updateChat,
    deleteChat,

    selectChat,
    createMessage,

    components,

    children
}: MessengerContextProps) => {
    return (
        <MessengerContext.Provider value={{
            tick,
            isLoading,
            error,
            
            userID,
            currentChatID,

            chats,
            selectedChats,
            setSelectedChats,
            isChatsActionActive,
            setIsChatsActionActive,

            messages,
            selectedMessages,
            setSelectedMessages,
            isMessagesActionActive,
            setIsMessagesActionActive,
            clearMessages,

            addChatToSelected,
            removeChatFromSelected,
            clearChatSelected,
            
            isChatOpened, 
            setIsChatOpened,
            isShowChatEdit,
            setIsShowChatEdit,
            isShowChatCreate, 
            setIsShowChatCreate,

            createChat,
            selectChat,
            refreshChats,
            updateChat,
            deleteChat,

            createMessage,

            components,
        }}>
            {children}
        </MessengerContext.Provider>
    );
}

export const useMessengerContext = () => {
  const ctx = useContext(MessengerContext);
  if (!ctx) throw new Error('useMessengerContext must be used within MessengerProvider');
  return ctx;
};
//#endregion
