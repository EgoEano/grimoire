import React, { createContext, useContext, useEffect, ReactNode, FC, useRef } from "react";
import SocketService from "../connection/socketService";
import type { Socket } from "socket.io-client";

type SocketContextType = Socket;

export function createSocketProvider() {
    const Context = createContext<SocketContextType | null>(null);

    interface SocketProviderProps {
        children: ReactNode;
    }

    const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
        const socket = useRef(SocketService.getInstance());

        useEffect(() => {
            const onConnect = () => console.log('Connected to socket:', socket.current.id);
            socket.current.on("connect", onConnect);

            return () => {
                socket.current.off("connect", onConnect);
            };
        }, []);

        return (
            <Context.Provider value={socket.current}>
                {children}
            </Context.Provider>
        );
    };

    const useSocket = (): SocketContextType => {
        const ctx = useContext(Context);
        if (!ctx) throw new Error('useSocket must be used within its SocketProvider');
        return ctx;
    };

    return {
        SocketProvider,
        useSocket,
    };
}

// Создание экземпляра на экспорт
export const {
    SocketProvider,
    useSocket,
} = createSocketProvider();
