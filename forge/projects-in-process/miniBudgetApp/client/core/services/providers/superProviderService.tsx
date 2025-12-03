import React, { ReactNode } from "react";
import { LanguageProvider } from './languageProviderService';
import {SystemDataProvider} from './systemDataProviderService';
import {StyleProvider} from './styleProvider';


export function SuperProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <SystemDataProvider>
            <StyleProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
            </StyleProvider>
            </SystemDataProvider>
        </>
    );
}