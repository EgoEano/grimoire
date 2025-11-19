import React, { createContext, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

type NotifyItemTypes = "success" | "error" | "info";
interface NotifyItem {
    id: string;
    type: NotifyItemTypes;
    message: string;
    timeout: number;
}

type DialogItemTypes = "warn" | "confirm";
interface DialogItem {
    id: string;
    type: DialogItemTypes;
    message: string;
    header?: string;
    onConfirm: (data: any) => Promise<boolean>;
    onCancel: (data: any) => Promise<boolean>;
}

interface NotificationProviderContextType {
    pushNotify: (item: NotifyItem) => void;
    pushDialog: (item: DialogItem) => void;
}

interface NotificationProviderProps {
    children: ReactNode;
}


const NotifyContext = createContext<NotificationProviderContextType | null>(null);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const MAX_STACK_SIZE: number = 3;
    
    const notifyQueue = useRef<NotifyItem[]>([]); 
    const dialogQueue = useRef<DialogItem[]>([]);

    const [currentNotify, setCurrentNotify] = useState<NotifyItem[]>([]); 
    const [currentDialog, setCurrentDialog] = useState<DialogItem | null>(null);

    const pushNotify = (item: NotifyItem) => {
        if (currentNotify.length >= MAX_STACK_SIZE) {
            notifyQueue.current.push(item);
        } else {
            setCurrentNotify(q => [...q, item])
        }
    };

    const removeNotify = (id: string) => {
        setCurrentNotify(q => q.filter(n => n.id !== id));
    };

    const pushDialog = (item: DialogItem) => {
        if (currentDialog) {
            dialogQueue.current.push(item);
        } else {
            setCurrentDialog(item)
        }
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
            {currentNotify.length > 0 && <NotifyView queue={notifyQueue} remove={api.removeNotify} />}
            {currentDialog && <DialogView dialog={currentDialog} />}
        </NotifyContext.Provider>
    );
}

function NotifyView({ queue, remove }) {
    return (
      <div className="notify-stack top-right">
        {queue.map(item => (
          <NotifyItem
            key={item.id}
            {...item}
            onTimeout={() => remove(item.id)}
          />
        ))}
      </div>
    );
}

function DialogView({ dialog }) {
    if (!dialog) return null;
  
    if (dialog.mode === "warn") {
      return (
        <WarnModal
          message={dialog.message}
          header={dialog.header}
          onOk={() => close(undefined)}
        />
      );
    }
  
    if (dialog.mode === "confirm") {
      return (
        <ConfirmModal
          message={dialog.message}
          header={dialog.header}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      );
    }
  
    return null;
}
  
  
