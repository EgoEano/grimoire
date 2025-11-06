import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AuthService, UserProfile } from '../auth/authService';


type CreateUserResult = UserProfile | null;
type UpdateUserResult = UserProfile | null;
type ReadUserResult = UserProfile | null;
type DeleteUserResult = void;

type AuthLocalContextType = {
    isLoggedIn: boolean;
    get currentStorageKey(): string | null;
    login: (login: string, password: string, isStayLogged?: boolean) => Promise<boolean>;
    logout: () => Promise<void>;
    create: (login: string, password: string, profile?: Record<string, any>) => Promise<CreateUserResult>;
    read: (key: string) => Promise<ReadUserResult>;
    update: (key: string, updates: Partial<UserProfile>) => Promise<UpdateUserResult>;
    delete: () => Promise<DeleteUserResult>;
    restoreSession: () => Promise<boolean>;
};

const AuthLocalContext = createContext<AuthLocalContextType | null>(null);

export const AuthLocalProvider = ({ children }: { children: React.ReactNode }) => {
    const serviceRef = useRef<AuthService>(AuthService.getInstance());
    const [version, setVersion] = useState(0);

    const updateUI = () => setVersion((v) => v + 1);

    const login = useCallback(async (
        loginName: string, 
        password: string, 
        isStayLogged: boolean = false
    ): Promise<boolean> => {
        const ok = await serviceRef.current.login(loginName, password, isStayLogged);
        if (ok) updateUI();
        return ok;
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        await serviceRef.current.logout();
        updateUI();
    }, []);

    const create = useCallback(async (
        loginName: string, 
        password: string, 
        profile?: Record<string, any>
    ): Promise<CreateUserResult> => {
        return await serviceRef.current.create(loginName, password, profile);
    }, []);

    const read = useCallback(async (key: string): Promise<ReadUserResult> => {
        return await serviceRef.current.read<UserProfile>(key);
    }, []);

    const update = useCallback(async (
        key: string, 
        updates: Partial<UserProfile>
    ): Promise<UpdateUserResult> => {
        return await serviceRef.current.update(key, updates);
    }, []);

    const _delete = useCallback(async (): Promise<DeleteUserResult> => {
        await serviceRef.current.delete();
        updateUI();
    }, []);

    const restoreSession = useCallback(async (): Promise<boolean> => {
        const ok = await serviceRef.current.restoreSession();
        if (ok) updateUI();
        return ok;
    }, []);

    const value = useMemo<AuthLocalContextType>(
        () => ({
            get isLoggedIn() {
                return serviceRef.current.isLoggedIn;
            },
            get currentStorageKey() {
                try {
                return serviceRef.current.isLoggedIn ? serviceRef.current.currentStorageKey : null;
                } catch {
                return null;
                }
            },
            login,
            logout,
            create,
            read,
            update,
            delete: _delete,
            restoreSession,
        }),
        [version, login, logout, create, read, update, _delete, restoreSession]
    );

    return <AuthLocalContext.Provider value={value}>{children}</AuthLocalContext.Provider>;
};

export const useLocalAuth = (): AuthLocalContextType => {
    const ctx = useContext(AuthLocalContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
