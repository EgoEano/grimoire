import React, { ReactNode } from "react";
import { LanguageProvider } from './languageProviderService';
import {SystemDataProvider} from './systemDataProviderService';
import {StyleProvider} from './styleProvider';
import {UserDataProvider} from './userDataProviderService';
import { SocketProvider } from "./socketProvider";
import { AuthFetchProvider } from "./authFetchProvider";


export function SuperProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <SystemDataProvider>
            <StyleProvider>
            <LanguageProvider>
            <UserDataProvider>
            <AuthFetchProvider>
            <SocketProvider>
                {children}
            </SocketProvider>
            </AuthFetchProvider>
            </UserDataProvider>
            </LanguageProvider>
            </StyleProvider>
            </SystemDataProvider>
        </>
    );
}