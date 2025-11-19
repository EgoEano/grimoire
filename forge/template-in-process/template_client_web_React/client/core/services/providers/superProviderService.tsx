import React from "react";
import { LanguageProvider } from './languageProviderService';
import {SystemDataProvider} from './systemDataProviderService';
import {StyleProvider} from './styleProvider';

import type { ReactNode } from "react";

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