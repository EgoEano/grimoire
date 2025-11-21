import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { DialogView, NotifyView } from "@client/core/ui/components/notificationComponents";

import type { NotificationProviderContextType, NotificationProviderProps, NotifyItem, DialogItem } from "@client/core/types/notificationTypes";


const NotifyContext = createContext<NotificationProviderContextType | null>(null);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const MAX_STACK_SIZE: number = 3;
    const NOTIFY_TIMEOUT_SECONDS = 7;
    
    const notifyQueue = useRef<NotifyItem[]>([]); 
    const dialogQueue = useRef<DialogItem[]>([]);

    const [currentNotify, setCurrentNotify] = useState<NotifyItem[]>([]); 
    const [currentDialog, setCurrentDialog] = useState<DialogItem | null>(null);

    const pushNotify = (item: Omit<NotifyItem, "id">) => {
        const fullItem: NotifyItem = {
            ...item,
            id: String(Math.random() * 1000),
        };

        if (currentNotify.length >= MAX_STACK_SIZE) {
            notifyQueue.current.push(fullItem);
        } else {
            setCurrentNotify(q => [...q, fullItem])
        }
    };

    const removeNotify = (id: string) => {
        setCurrentNotify(q => q.filter(n => n.id !== id));
    };

    const pushDialog = (item: Omit<DialogItem, "resolve">): Promise<boolean> => {
        return new Promise(resolve => {
            const fullItem: DialogItem = {
                ...item,
                resolve
            };
            if (currentDialog) {
                dialogQueue.current.push(fullItem);
            } else {
                setCurrentDialog(fullItem)
            }
        });
    };

    const removeDialog = () => setCurrentDialog(null);

    useEffect(() => {
        if (currentNotify.length < MAX_STACK_SIZE && notifyQueue.current.length > 0) {
            const nextNotify = notifyQueue.current.shift();
            if (nextNotify) {
                setCurrentNotify(q => [...q, nextNotify]);
            }
        }
    }, [currentNotify]);

    useEffect(() => {
        if (!currentDialog && dialogQueue.current.length > 0) {
            const nextDialog = dialogQueue.current.shift();
            if (nextDialog) {
                setCurrentDialog(nextDialog);
            }
        }
    }, [currentDialog]);


    const value = {
        pushNotify,
        pushDialog
    };

    return (
        <NotifyContext.Provider value={value}>
            {children}
            {currentDialog && <DialogView item={currentDialog} handleClose={removeDialog}/>}
            {currentNotify.length > 0 && <NotifyView 
                queue={currentNotify} 
                timeout={NOTIFY_TIMEOUT_SECONDS}
                handleClose={removeNotify}
                />}
        </NotifyContext.Provider>
    );
}

export const useNotification = (): NotificationProviderContextType => {
    const context = useContext(NotifyContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

