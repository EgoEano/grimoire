import {
    ViewStyle,
    TextStyle
} from 'react-native';
import type { MarkdownProps } from 'react-native-markdown-display';
import { InitDBQueries } from './SQLiteTypes';
import { Dispatch, SetStateAction, ReactNode, ReactElement, MutableRefObject } from 'react';

//#region MessengerScreen
//#endregion

//#region MessengerProvider
//#endregion

//#region MessengerContext
//#endregion

export interface Chat {
    id?: number;
    id_server?: string;

    title: string;
    
    is_group: boolean;
    created_at: number;
    is_deleted: boolean;
    
    last_message_id: number | null;
    last_message_body?: string;
    last_message_sender?: string;
    last_message_created_at?: number;
};

export type ServerChat = Chat & {
    chat_id: string;
}

export type ServerMessage = Message;

export type ChatListAreaProps = {
    styles?: Record<string, ViewStyle | TextStyle>,
    onCreate: () => void;
};

export type ChatTileProps = {
    item: Chat;
    isSelected: boolean;
    onPress: (type: string, item: Chat) => void;
    onLongPress: (type: string, item: Chat) => void;
};

export type ChatAreaProps = {
    styles?: Record<string, ViewStyle | TextStyle>,
    lables?: {
        textInputPlaceholder: string,
        sendPlaceholder: string,
    },
};

export type CreateBubbleParam = {
    item: Message,
    isUserSender: boolean;
};

export type NewMessage = {
    body: string;
};

export type NewMessageData = {
    chat_id: number;
    sender_id: string;

    body: string;
    type: number;

    created_at: number;
    status: number;
};

export type Message = {
    id?: number;
    id_server?: number;

    chat_id?: number;
    sender_id?: number;
    sender_name?: string;

    body: string;
    type?: string;
    status?: string;

    created_at: number;
    updated_at?: number | null;
    edited_at?: number | null;
    is_edited?: boolean;
    is_deleted?: boolean;
    
    reply_to_id?: number;
    forwarded_from?: number;
    
    is_pinned?: boolean;
    extra?: string;
};

export type CreateMessageParam = {
    body: string;
};

//TODO Проверить - возможно можно объединить типы в один
export type MessengerScreenProps = {
    handleControl: (control: MessengerScreenProps_HandleControl) => void;
    tick: number;
    isNeedToOpenChat: boolean;

    isLoading: boolean;
    error: string[];
    
    userID: string;
    currentChatID: number | null;

    chats: Chat[];
    messages: Message[];

    createChat: () => void;
    // createChat: (title: string, isGroup: boolean) => Promise<boolean>;
    selectChat: (item: Chat) => Promise<boolean>;
    refreshChats: () => Promise<boolean>;
    updateChat: (id: number, data: Partial<Chat>) => Promise<boolean>;
    deleteChat: (ids: number[]) => Promise<boolean>;

    createMessage: (message: NewMessage) => Promise<boolean>;
    clearMessages: () => void;

    components: MessengerScreenProps_Components;
};
export type MessengerScreenProps_HandleControl = {
    setChatState: (s: boolean) => void;
};
export type MessengerScreenProps_Components = ({
    ChatListHeader: () => ReactElement;
    ChatListHeaderAction: () => ReactElement;
    ChatListItem: (props: ChatTileProps) => ReactElement;
    ChatCreate: (p: MessengerScreen_ChatCreateProps) => ReactElement;
    ChatHeader: () => ReactElement;
    MessageItem: (props: CreateBubbleParam) => ReactElement;
});
export type MessengerScreen_ChatCreateProps = {
    onCreate: () => void;
    onCancel: () => void;
}

//TODO Проверить - возможно можно объединить типы в один
export type MessengerContextProps = {
    tick: number;
    isLoading: boolean;
    error: string[];
    
    userID: string;
    currentChatID: number | null;

    chats: Chat[];
    selectedChats: number[];
    setSelectedChats: Dispatch<SetStateAction<number[]>>;
    isChatsActionActive: boolean;
    setIsChatsActionActive: Dispatch<SetStateAction<boolean>>;

    messages: Message[];
    selectedMessages: number[];
    setSelectedMessages: Dispatch<SetStateAction<number[]>>;
    isMessagesActionActive: boolean;
    setIsMessagesActionActive: Dispatch<SetStateAction<boolean>>;
    clearMessages: () => void;

    addChatToSelected: (id: number) => void;
    removeChatFromSelected: (id: number) => void;
    clearChatSelected: () => void;

    isChatOpened: boolean;
    setIsChatOpened: Dispatch<SetStateAction<boolean>>; 
    isShowChatEdit: boolean;
    setIsShowChatEdit: Dispatch<SetStateAction<boolean>>; 
    isShowChatCreate: boolean;
    setIsShowChatCreate: Dispatch<SetStateAction<boolean>>; 

    createChat: () => void;
    // createChat: (title: string, isGroup: boolean) => Promise<boolean>;
    selectChat: (type: string, item: Chat) => Promise<boolean>;
    refreshChats: () => Promise<boolean>;
    updateChat: () => Promise<void>;
    deleteChat: () => Promise<void>;

    createMessage: (message: NewMessage) => Promise<boolean>;

    components: MessengerScreenProps_Components;
    
    children: ReactNode;
};

//TODO Проверить - возможно можно объединить типы в один
export type MessengerContext = {
    tick: number;
    isLoading: boolean;
    error: string[];
    
    userID: string;
    currentChatID: number | null;

    chats: Chat[];
    selectedChats: number[];
    setSelectedChats: Dispatch<SetStateAction<number[]>>;
    isChatsActionActive: boolean;
    setIsChatsActionActive: Dispatch<SetStateAction<boolean>>;

    messages: Message[];
    selectedMessages: number[];
    setSelectedMessages: Dispatch<SetStateAction<number[]>>;
    isMessagesActionActive: boolean;
    setIsMessagesActionActive: Dispatch<SetStateAction<boolean>>;
    clearMessages: () => void;

    addChatToSelected: (id: number) => void;
    removeChatFromSelected: (id: number) => void;
    clearChatSelected: () => void;

    isChatOpened: boolean;
    setIsChatOpened: Dispatch<SetStateAction<boolean>>; 
    isShowChatEdit: boolean;
    setIsShowChatEdit: Dispatch<SetStateAction<boolean>>; 
    isShowChatCreate: boolean;
    setIsShowChatCreate: Dispatch<SetStateAction<boolean>>; 

    createChat: () => void;
    // createChat: (title: string, isGroup: boolean) => Promise<boolean>;
    selectChat: (type: string, item: Chat) => Promise<boolean>;
    refreshChats: () => Promise<boolean>;
    updateChat: () => Promise<void>;
    deleteChat: () => Promise<void>;

    createMessage: (message: NewMessage) => Promise<boolean>;

    components: MessengerScreenProps_Components;
};


export type MessengerProviderContext = {
    tick: number;
    handleControl: (control: MessengerScreenProps_HandleControl) => void;
    
    init: ({userID}: ChatContextData_initProps) => Promise<boolean>;
    initChat: (prompt: string) => void;
    isNeedToOpenChat: React.MutableRefObject<boolean>;
    close:() => Promise<boolean>;

    isLoading: boolean;
    error: string | null;
    
    userID: MutableRefObject<string>;
    chatID: React.MutableRefObject<number | null>;

    chats: Chat[];
    messages: Message[];
    
    createChat: (title: string, isGroup: boolean) => Promise<number>;
    refreshChats: () => Promise<boolean>;
    updateChat: (id: number, data: Partial<Chat>) => Promise<boolean>;
    updateChatsBulk: (chat:ServerChat[]) => Promise<boolean>;
    deleteChat: (ids: number[]) => Promise<boolean>;
    
    selectChat: (id: number) => Promise<boolean>;
    refreshMessages: () => Promise<boolean>;
    clearMessages: () => void;
    updateMessagesBulk: (chat:ServerMessage[]) => Promise<boolean>;
    addMessage: (message: NewMessage) => Promise<number | null>;
};

export type ChatContextData_initProps = {
    userID: string;
    migration: InitDBQueries;
};

