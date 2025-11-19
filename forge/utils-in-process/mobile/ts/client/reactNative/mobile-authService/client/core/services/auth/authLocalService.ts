import { saveSecret, loadSecret, deleteSecret } from "./keychainService";
import Crypto from 'react-native-quick-crypto';

export interface UserProfile {
    login: string;
    profile?: any;
    createdAt: number;
    updatedAt?: number;
    tokens?: {
        sessionId?: string;
        access?: string;
        refresh?: string;
    };
};


export class AuthLocalService {
    private static SESSION_KEY: string = 'session';
    private static instance: AuthLocalService;
    private storageKey: string | null = null;
    private loginName: string | null = null;

    static getInstance() {
        if (!AuthLocalService.instance) AuthLocalService.instance = new AuthLocalService();
        return AuthLocalService.instance;
    }

    async create(
        login: string, 
        password: string, 
        profile?: any, 
        isStayLogged: boolean = false
    ): Promise<UserProfile | null> {
        const key = this.buildKey(login, password);

        const existing = await this.read<UserProfile>(key);
        if (existing) return null;

        const data: UserProfile = { 
            login, profile, createdAt: Date.now() 
        };
        const isSaved = await saveSecret(key, data);
        if (isSaved) {
            this.storageKey = key;
            this.loginName = login;

            if (isStayLogged) {
                await saveSecret(AuthLocalService.SESSION_KEY, key);
            }
            return data;
        } else return null;
    }

    async read<T = any>(key?: string | null): Promise<T | null> {
        const currKey = key ?? this.storageKey;
        if (!currKey) return null;
        return await loadSecret<T>(currKey);
    }

    async update(updates: Partial<UserProfile>): Promise<UserProfile | null> {
        if (!this.storageKey) return null;

        const existing = await this.read<UserProfile>(this.storageKey);
        if (!existing) return null;

        const updated: UserProfile = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };

        await saveSecret(this.storageKey, updated);
        return updated;
    }

    async delete(): Promise<boolean> {
        if (!this.storageKey) return false;

        await deleteSecret(AuthLocalService.SESSION_KEY);
        const isDeleted = !!(await deleteSecret(this.storageKey));
        this.storageKey = null;
        this.loginName = null;
        
        return isDeleted;
    }

    async login(
        login: string, 
        password: string, 
        isStayLogged: boolean = false
    ): Promise<boolean> {
        const key = this.buildKey(login, password);
        const data = await loadSecret(key);
        if (data) {
            this.storageKey = key;
            this.loginName = login;

            if (isStayLogged) {
                await saveSecret(AuthLocalService.SESSION_KEY, key);
            }
            return true;
        }
        return false;
    }

    async logout() {
        this.storageKey = null;
        this.loginName = null;
        return await deleteSecret(AuthLocalService.SESSION_KEY);
    }

    async restoreSession(): Promise<boolean> {
        const session = await loadSecret<string>(AuthLocalService.SESSION_KEY);
        if (!session) return false;
        const data = await this.read<UserProfile>(session);
        if (!data) return false;

        this.storageKey = session;
        this.loginName = data.login;
        return true;
    }

    // getters
    get currentStorageKey(): string | null {
        return this.storageKey ?? null;
    }

    get isLoggedIn(): boolean {
        return !!this.storageKey;
    }

    //#region Inner
    buildKey(login: string, password: string): string {
        const hash = Crypto.createHash('sha256')
            .update(`${login}:${password}`)
            .digest('hex');
        return `user.${hash}`;
    }
    //#endregion
}
