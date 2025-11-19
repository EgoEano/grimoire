import { Button, CView, ModalCard } from "@client/core/ui/components/interfaceComponents";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

type NotifyItemTypes = "success" | "error" | "info";
interface NotifyItem {
    id: string;
    type: NotifyItemTypes;
    message: string;
    header?: string;
    timeout?: number;
}

type DialogItemTypes = "warn" | "confirm";
interface DialogItem {
    type: DialogItemTypes;
    message: string;
    header?: string;
    onConfirm?: (data: any) => boolean;
    onCancel?: (data: any) => boolean;
    resolve: (value: boolean) => void;
}

interface NotificationProviderContextType {
    pushNotify: (item: Omit<NotifyItem, "id">) => void;
    pushDialog: (item: Omit<DialogItem, "resolve">) => Promise<boolean>;
}

interface NotificationProviderProps {
    children: ReactNode;
}


const NotifyContext = createContext<NotificationProviderContextType | null>(null);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const MAX_STACK_SIZE: number = 3;
    const NOTIFY_TIMEOUT_SECONDS = 70;
    
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

const style = StyleSheet.create({
    //confirm
    modal: {
        maxWidth: '100%',
        gap: 16,
    },
    textArea: {
        maxWidth: '90%',
        gap: 16,
    },
    subtitle: {
        fontSize: 21,
    },
    buttonArea: { 
        width: '100%',
        display: 'flex', 
        justifyContent: 'center',
        marginTop: 16,
    },
    button: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
    },
    //notify
    notifyWrapper: {
        position: 'absolute',
        alignItems: 'flex-start',
        left: 10,
        bottom: 10,
        maxWidth: 500,
    },
    notifyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
});


function NotifyView({ 
    queue,
    timeout,
    handleClose
}: { 
    queue: NotifyItem[];
    timeout: number;
    handleClose: (id: string) => void;
}) {
    return (
        <CView
            isScrollable={false}
            isAllowHorizontalScroll={false}
            showsVerticalScrollIndicator={false}
            style={style.notifyWrapper}
        >
            {queue.map(item => (
                <NotifyCard
                    key={item.id}
                    item={item}
                    timeout={timeout}
                    handleClose={handleClose}
                />
            ))}
        </CView>
    );
}

function NotifyCard({
    item,
    timeout,
    handleClose,
}: {
    item: NotifyItem;
    timeout: number;
    handleClose: (id: string) => void;
}) {
    const {id, message, header} = item;

    useEffect(() => {
        const tmt = setTimeout(() => {
            handleClose(id);
        }, timeout * 1000);

        return () => clearTimeout(tmt);
    }, []);

    return (
        <View style={style.notifyCard}>
            {header && <Text>{header}</Text>}
            <Text>{message}</Text>
        </View>
    );
}

function DialogView({ 
    item,
    handleClose,
    confirmText = "OK",
    cancelText = "Cancel",
}: { 
    item: DialogItem;
    handleClose: () => void;
    confirmText?: string;
    cancelText?: string;
}) {
    if (!item) return null;

    const { type, header, message, onConfirm, onCancel, resolve } = item;
  
    const handleConfirm = async () => {
        handleClose();
        onConfirm?.({});
        resolve(true);
    };

    const handleCancel = async () => {
        handleClose();
        onCancel?.({});
        resolve(false);
    };

    return (
        <ModalCard 
            isShow={true} 
            setIsShow={() => null}
            isHasCross={false}
            closable={false}
            style={{
                modal: style.modal
            }}
        >
            <View style={style.textArea}>
                {header && <Text style={style.subtitle}>{header}</Text>}
                <Text>{message}</Text>
            </View>
            <View style={style.buttonArea}>
                <Button 
                    title={confirmText} 
                    style={{
                        button: style.button
                    }}
                    onPress={handleConfirm}
                />
                {(type === 'confirm' && onCancel) && <Button 
                    title={cancelText} 
                    style={{
                        button: style.button
                    }}
                    onPress={handleCancel}
                />}
            </View>
        </ModalCard>
    );
}