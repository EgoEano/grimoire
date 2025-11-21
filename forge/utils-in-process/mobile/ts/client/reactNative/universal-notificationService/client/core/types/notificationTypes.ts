import type { ReactNode } from "react";

export type NotifyItemTypes = "success" | "error" | "info";
export interface NotifyItem {
    id: string;
    type: NotifyItemTypes;
    message: string;
    header?: string;
    timeout?: number;
}

export type DialogItemTypes = "warn" | "confirm";
export interface DialogItem {
    type: DialogItemTypes;
    message: string;
    header?: string;
    onConfirm?: (data: any) => boolean;
    onCancel?: (data: any) => boolean;
    resolve: (value: boolean) => void;
}

export interface NotificationProviderContextType {
    pushNotify: (item: Omit<NotifyItem, "id">) => void;
    pushDialog: (item: Omit<DialogItem, "resolve">) => Promise<boolean>;
}

export interface NotificationProviderProps {
    children: ReactNode;
}
