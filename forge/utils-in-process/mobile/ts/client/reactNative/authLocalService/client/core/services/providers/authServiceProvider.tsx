import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { AuthService } from '../auth/authService';
import { AuthLocalService, UserProfile } from '../auth/authLocalService';
import type { FetchRequestOptions, FetchResponse } from '../connection/fetchRequest';

type AuthServiceContextType = {
    isLoggedIn: boolean;
    login: (login: string, password: string, isStayLogged?: boolean) => Promise<boolean>;
    logout: () => Promise<boolean>;
    restoreSession: () => Promise<boolean>;
    changePin: () => Promise<void>;
    register: (login: string, password: string, profile?: any) => Promise<boolean>;
    readUser: () => Promise<any | null>;
    updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
    deleteUser: () => Promise<boolean>;
    authFetch: <T = any>(opts: FetchRequestOptions) => Promise<FetchResponse<T>>;
};

const AuthServiceContext = createContext<AuthServiceContextType | null>(null);

export const AuthServiceProvider = ({ children }: { children: React.ReactNode }) => {
    const serviceRef = useRef<AuthService>(AuthService.getInstance());
    
    const [version, setVersion] = useState(0);

    const updateUI = useCallback(() => {
        setVersion((v) => v + 1);
    }, []);

    const login = useCallback(async (
        loginName: string, 
        password: string, 
        isStayLogged: boolean = false
    ) => {
        const ok = await serviceRef.current.login(loginName, password, isStayLogged);
        if (ok) updateUI();
        return ok;
    }, [version]);

    const logout = useCallback(async () => {
        const ok = await serviceRef.current.logout();
        if (ok) updateUI();
        return ok;
    }, [version]);

    const restoreSession = useCallback(async () => {
        const ok = await serviceRef.current.restoreSession();
        if (ok) updateUI();
        return ok;
    }, [version]);

    // not implemented yet
    const changePin = useCallback(async () => {
        await serviceRef.current.changePin();
        updateUI();
    }, [version]);

    const register = useCallback(async (
        loginName: string, 
        password: string, 
        profile?: any
    ) => {
        const ok = await serviceRef.current.register(loginName, password, profile);
        if (ok) updateUI();
        return ok;
    }, [version]);

    const readUser = useCallback(async () => {
        const data = await serviceRef.current.readUser();
        updateUI();
        return data;
    }, [version]);

    const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
        const ok = await serviceRef.current.updateUser(updates);
        if (ok) updateUI();
        return ok;
    }, [version]);

    const deleteUser = useCallback(async () => {
        const ok = await serviceRef.current.deleteUser();
        if (ok) updateUI();
        return ok;
    }, [version]);

    const authFetch = useCallback(async <T = any>(opts: FetchRequestOptions): Promise<FetchResponse<T>> => {
        return await serviceRef.current.authFetch<T>(opts);
    }, [version]);

    const value = useMemo<AuthServiceContextType>(() => ({
        get isLoggedIn() {
            return serviceRef.current.getIsLoggedIn();
        },
        login,
        logout,
        restoreSession,
        changePin,
        register,
        readUser,
        updateUser,
        deleteUser,
        authFetch,
    }), [
        login,
        logout,
        restoreSession,
        changePin,
        register,
        readUser,
        updateUser,
        deleteUser,
        authFetch,
    ]);

    return <AuthServiceContext.Provider value={value}>{children}</AuthServiceContext.Provider>;
};

export const useAuth = (): AuthServiceContextType => {
    const ctx = useContext(AuthServiceContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

