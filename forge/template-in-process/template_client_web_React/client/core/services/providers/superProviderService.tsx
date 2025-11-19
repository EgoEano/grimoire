import React from "react";
import { LanguageProvider } from './languageProviderService';
import {SystemDataProvider} from './systemDataProviderService';
import {StyleProvider} from './styleProvider';
import { NotificationProvider } from "./notificationProvider";

import type { ReactNode } from "react";

export function SuperProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <SystemDataProvider>
            <StyleProvider>
            <LanguageProvider>
            <NotificationProvider>
                {children}
            </NotificationProvider>
            </LanguageProvider>
            </StyleProvider>
            </SystemDataProvider>
        </>
    );
}