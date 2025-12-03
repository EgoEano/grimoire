import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from "react";
//import languages from '@ui/locales/languages.js';

type TranslationPack = Record<string, string>;
type TranslationVariables = Record<string, string>;

type Language = Record<string, TranslationPack> | null;

type TranslationSearch = (key: string, vars?: Record<string, string>) => string;

type LanguageContextType  = { 
    t: TranslationSearch, 
    currentLanguage: string, 
    changeLanguage: (langCode: string) => void, 
    setLanguagePack: (pack: TranslationPack) => void
};



const languages: Language = {}; // заглушка

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({children}: { children: React.ReactNode }) => {
    const [version, setVersion] = useState(0);
    const currentLanguageRef = useRef<string>("en-US");
    const overriddenLangPack = useRef<TranslationPack | null>(null);
    
    const changeLanguage = useCallback((lang: string) => {
        if (lang === currentLanguageRef.current) return;
        if (lang in languages) {
            currentLanguageRef.current = lang;
            setVersion(v => v + 1);
        } else {
            console.warn(`LanguageProvider. Language '${lang}' not found`);
        }
    }, []);

    const setLanguagePack = useCallback((lang: TranslationPack) => {
        if (typeof lang === 'object') {
            overriddenLangPack.current = lang;
            setVersion(v => v + 1);
        } else {
            console.warn(`LanguageProvider. Invalid TranslationPack`);
        }
    }, []);

    const translations = useMemo<TranslationPack>(() => {
        return overriddenLangPack.current ?? languages[currentLanguageRef.current] ?? {};
    }, [version]);

    const t = useCallback((key: string, vars: TranslationVariables = {}) => {
        if (!key || typeof key !== 'string') {
            console.warn(`Missing or wrong translation key: '${key}'`);
            return '';
        }
        let text = translations[key] || key;
        Object.keys(vars).forEach((varKey) => {
            text = text.replace(`{{${varKey}}}`, vars[varKey]);
        });
        return text;
    }, [translations]);


    const value = useMemo<LanguageContextType>(() => ({
        t, 
        get currentLanguage() {
            return currentLanguageRef.current;
        }, 
        changeLanguage, 
        setLanguagePack 
    }),[version]);
    
    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};