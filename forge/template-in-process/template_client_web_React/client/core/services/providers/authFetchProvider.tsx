import React, { createContext, useContext, useRef, useMemo } from "react";
import { AuthFetch } from "../connection/authFetch";
import { useUser } from "./userDataProviderService";

// тип контекста
interface AuthFetchContextType {
    fetcher: AuthFetch;
}

const AuthFetchContext = createContext<AuthFetchContextType | null>(null);

export const AuthFetchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getAuthService } = useUser();
    const fetchRef = useRef<AuthFetch | null>(null);

    // singleton
    if (!fetchRef.current) {
        fetchRef.current = new AuthFetch(getAuthService());
    }

    const value = useMemo<AuthFetchContextType>(() => ({ 
        fetcher: fetchRef.current!
    }), []);

    return (
        <AuthFetchContext.Provider value={value}>
        {children}
        </AuthFetchContext.Provider>
    );
};

// хук для доступа к fetcher
export const useAuthFetch = (): AuthFetchContextType => {
    const ctx = useContext(AuthFetchContext);
    if (!ctx) {
        throw new Error("useAuthFetch must be used inside AuthFetchProvider");
    }
    return ctx;
};
