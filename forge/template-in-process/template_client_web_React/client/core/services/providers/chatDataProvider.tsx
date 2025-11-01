import React, { createContext, useContext, useRef, useMemo, ReactNode } from "react";
import { useAuthFetch } from "./authFetchProvider";
import { NewMessage, ServerChat, ServerMessage } from "../../types/ChatScreenTypes";

export interface ProviderResponse<T = any> {
    success: boolean,
    payload?: T | null,
    message?: string | null
}

export interface ChatDataContext {
    fetchChats: () => Promise<ProviderResponse<ServerChat[] | null>>;
    fetchMessages: (chatId: number, lastId: number | null) => Promise<ProviderResponse<ServerMessage[] | null>>;
    sendMessage: (chatId: number, msg: NewMessage) => Promise<ProviderResponse<ServerMessage[] | null>>
}

const ChatDataContext = createContext<ChatDataContext | null>(null);

export const ChatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { fetcher } = useAuthFetch();

    const fetchChats = async (): Promise<ProviderResponse<ServerChat[] | null>> => {
        const res = await fetcher.request<ServerChat[]>({ method: "GET", url: "/chats" });
        return {
            success: res.status === 200,
            payload: res.status === 200 ? res?.data ?? [] : null,
            message: res.message
        };
    };

    const fetchNewChat = async ({
        title, isGroup
    }: {
        title: string;
        isGroup: boolean;
    }): Promise<ProviderResponse<any>> => {
        const res = await fetcher.request<any>({
            method: 'POST',
            url: '/chats',
            data: {
                title,
                is_group: isGroup,
            }
        });
        return {
            success: res.status === 200,
            payload: res.status === 200 ? res?.data ?? [] : null,
            message: res.message
        };
    };

    const fetchMessages = async (chatId: number, lastId: number | null): Promise<ProviderResponse<ServerMessage[] | null>> => {
        const res = await fetcher.request<ServerMessage[]>({
            method: 'GET',
            url: `/chats/${chatId}/messages`,
            data: {
                last_id: lastId
            }
        });
        return {
            success: res.status === 200,
            payload: res.status === 200 ? res?.data ?? [] : null,
            message: res.message
        };
    };

    const sendMessage = async (chatId: number, msg: NewMessage): Promise<ProviderResponse<ServerMessage[] | null>> => {
        const res = await fetcher.request<ServerMessage[]>({
            method: "POST",
            url: `/chats/${chatId}/messages`,
            data: msg
        });
        return {
            success: res.status === 200,
            payload: res.status === 200 ? res?.data ?? [] : null,
            message: res.message
        };
    };

    //#FIXME Пустить value через мемо

    return (
        <ChatDataContext.Provider value={{ 
            fetchChats, 
            fetchMessages, 
            sendMessage 
        }}>
            {children}
        </ChatDataContext.Provider>
    );
};

export const useChatData = () => {
    const ctx = useContext(ChatDataContext);
    if (!ctx) throw new Error("useChatData must be used inside ChatDataProvider");
    return ctx;
};
