import { saveSecret, loadSecret, deleteSecret } from "./keychainService";
import Crypto from 'react-native-quick-crypto';

export interface UserData {
    [key: string]: any;
};

export interface UserProfile {
    login: string;
    profile?: UserData;
    createdAt: number;
    updatedAt?: number;
    tokens?: {
        access?: string;
        refresh?: string;
    };
};


export class AuthService {
    private static instance: AuthService;
    private storageKey: string | null = null;
    private loginName: string | null = null;

    static getInstance() {
        if (!AuthService.instance) AuthService.instance = new AuthService();
        return AuthService.instance;
    }

    async create(
        login: string, 
        password: string, 
        profile?: UserData
    ): Promise<UserProfile | null> {
        const key = this.buildKey(login, password);

        const existing = await this.read<UserProfile>(key);
        if (existing) return null;

        const data: UserProfile = { 
            login, profile, createdAt: Date.now() 
        };
        await saveSecret(key, data);
        return data;
    }

    async read<T = any>(key: string): Promise<T | null> {
        return await loadSecret<T>(key);
    }

    async update(key: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        const existing = await this.read<UserProfile>(key);
        if (!existing) return null;

        const updated: UserProfile = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        };

        await saveSecret(key, updated);
        return updated;
    }

    async delete() {
        if (!this.storageKey) return;
        await deleteSecret(`session`);
        await deleteSecret(this.storageKey);
        this.storageKey = null;
        this.loginName = null;
    }

    async login(
        login: string, 
        password: string, 
        isStayLogged: boolean = false
    ) {
        const key = this.buildKey(login, password);
        const data = await loadSecret(key);
        if (data) {
            this.storageKey = key;
            this.loginName = login;

            if (isStayLogged) {
                await saveSecret('session', key);
            }
            return true;
        }
        return false;
    }

    async logout() {
        if (!this.storageKey) return;
        await deleteSecret(`session`);
        this.storageKey = null;
        this.loginName = null;
    }

    async restoreSession(): Promise<boolean> {
        const session = await loadSecret<string>("session");
        if (!session) return false;
        const data = await this.read<UserProfile>(session);
        if (!data) return false;

        this.storageKey = session;
        this.loginName = data.login;
        return true;
    }

    // getters
    get currentStorageKey(): string {
        if (!this.storageKey) throw new Error("Not logged in");
        return this.storageKey;
    }

    get isLoggedIn(): boolean {
        return !!this.storageKey;
    }

    //#region Inner
    private buildKey(login: string, password: string): string {
        const hash = Crypto.createHash('sha256')
            .update(`${login}:${password}`)
            .digest('hex');
        return `user.${hash}`;
    }
    //#endregion
}
