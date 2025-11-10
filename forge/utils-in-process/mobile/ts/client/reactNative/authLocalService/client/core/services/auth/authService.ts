import { AuthLocalService } from "./authLocalService";
import { AuthServerService } from "./authServerService";
import fetchRequest from "../connection/fetchRequest";

import type { SessionData } from "../../types/AuthServiceTypes";
import type { UserProfile } from "./authLocalService";
import type { FetchRequestOptions, FetchResponse } from "../connection/fetchRequest";

// RN 0.82 has issues with react-native-config, 
// and the known forks are not sufficiently tested.
// Non-confidential configs will be stored in app.json
// until the issue is fixed.
//import Config from 'react-native-config';
import { env as Config } from '../../../../app.json';


export class AuthService {
    private static isUseServerLogic: boolean = Config["API_SERVER_IS_USE_AUTH_LOGIC"] ?? false;
    private static instance: AuthService;
    private local = AuthLocalService.getInstance();
    private server = AuthServerService.getInstance();

    //#region Inner
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private async getUserData(): Promise<UserProfile | null> {
        if (!this.local.isLoggedIn) return null;
        return await this.local.read<UserProfile>();
    }

    private async getTokens(): Promise<UserProfile['tokens'] | null> {
        return (await this.getUserData())?.tokens ?? null;
    }

    getIsLoggedIn() {
        return this.local.isLoggedIn;
    }
    //#endregion

    //#region Session
    async login(
        login: string, 
        password: string,
        isStayLogged: boolean = false
    ): Promise<boolean> {
        let session: SessionData | null = null;
        if (AuthService.isUseServerLogic) {
            session = await this.server.login(login, password);
            if (!session) return false;
        }

        // stage - opened secret without pin
        // need to offer to save session through pin (changePin())
        const isLogged = await this.local.login(login, password, isStayLogged);
        if (isLogged) {
            if (AuthService.isUseServerLogic) {
                const { session_id, access_token, refresh_token, ...safeProfile } = session || {};
                await this.local.update({
                    profile: safeProfile,
                    tokens: {
                        sessionId: session_id,
                        access: access_token,
                        refresh: refresh_token
                    }
                });
            }
            return true;
        } else {
            if (AuthService.isUseServerLogic && session) {
                const isCreated = await this.local.create(login, password, session);
                if (isCreated) {
                    await this.local.update({
                        tokens: {
                            sessionId: session?.session_id,
                            access: session?.access_token,
                            refresh: session?.refresh_token
                        }
                    });
                    return true;
                }
            } 
            return false;
        }
    }

    async logout(): Promise<boolean> {
        if (AuthService.isUseServerLogic) {
            try {
                const tokens = await this.getTokens();
                const token = tokens?.refresh;
                if (token) await this.server.logout(token);
            } catch { /* ignore */ }
        }
        return !!(await this.local.logout());
    }

    async restoreSession(): Promise<boolean> {
        const isLocalRestored = await this.local.restoreSession();
        if (!isLocalRestored) return false;

        if (AuthService.isUseServerLogic) {
            const isServerRestored = await this.restoreServerSession();
            if (!isServerRestored) return false;
        }
        return true;
    }

    async restoreServerSession(): Promise<boolean> {
        const tokens = await this.getTokens();
        if (!tokens) return false;

        const sessionId = tokens?.sessionId;
        const refresh = tokens?.refresh;

        if (!sessionId || !refresh) return false;

        const newSession = await this.server.restoreSession(sessionId, refresh);
        if (!newSession) return false;

        await this.local.update({
            tokens: {
                sessionId: newSession.session_id,
                access: newSession.access_token,
                refresh: newSession.refresh_token,
            },
        });

        return true;
    }

    async changePin() {
        // здесь нужно реализовать изменение локального пин кода
        // с пересохранением данных
    }
    //#endregion
    
    //#region CRUD User
    async register(
        login: string,
        password: string,
        profile?: any
    ): Promise<boolean> {
        let session: SessionData | null = null;
        if (AuthService.isUseServerLogic) {
            session = await this.server.create(login, password, profile);
            if (!session) return false;
        }

        const localUser = await this.local.create(login, password, profile);
        if (!localUser) return false;
        if (session) {
            await this.local.update({
                tokens: {
                    sessionId: session.session_id,
                    access: session.access_token,
                    refresh: session.refresh_token,
                },
            });
        }
        return true;
    }

    // route for opened user data (without tokens and secrets)
    async readUser(): Promise<any | null> {
        const localProfile = await this.local.read<UserProfile>();
        let readable = localProfile?.profile;
        if (AuthService.isUseServerLogic) {
            const firstAccessToken = localProfile?.tokens?.access;
            if (!firstAccessToken) return null;

            const firstFetch = await this.server.read(firstAccessToken);

            if (firstFetch.success && firstFetch.response) {
                const data = firstFetch.response?.payload ?? firstFetch.response;
                if (!data) return null;
                readable = data;
            }

            if (firstFetch.status === 401) {
                const isServerRestored = await this.restoreServerSession();
                if (!isServerRestored) return null;

                const secondTokens = await this.getTokens();
                const secondAccessToken = secondTokens?.access;
                if (!secondAccessToken) return null;

                const secondFetch = await this.server.read(secondAccessToken);
                if (secondFetch.status === 401) {
                    await this.local.logout();
                } 
                if (secondFetch.success && secondFetch.response) {
                    const data = secondFetch.response?.payload ?? secondFetch.response;
                    if (!data) return null;
                    readable = data;
                }
            }
            await this.local.update({
                profile: readable
            });
        }
        return readable;
    }

    async updateUser(updates: Partial<UserProfile>): Promise<boolean> {
        if (AuthService.isUseServerLogic) {
            const firstTokens = await this.getTokens();
            const firstAccessToken = firstTokens?.access;
            if (!firstAccessToken) return false;

            const firstFetch = await this.server.update(firstAccessToken, updates);
            if (firstFetch.status === 401) {
                const isServerRestored = await this.restoreServerSession();
                if (!isServerRestored) return false;

                const secondTokens = await this.getTokens();
                const secondAccessToken = secondTokens?.access;
                if (!secondAccessToken) return false;

                const secondFetch = await this.server.update(secondAccessToken, updates);
                
                if (secondFetch.status === 401) {
                    await this.local.logout();
                } 
                if (!secondFetch.success) return false;
            }
        }

        const localUpdated = await this.local.update(updates);
        return !!localUpdated;
    }

    async deleteUser(): Promise<boolean> {
        if (AuthService.isUseServerLogic) {
            try {
                const firstTokens = await this.getTokens();
                const firstAccessToken = firstTokens?.access;
                if (!firstAccessToken) return false;

                const firstFetch = await this.server.delete(firstAccessToken);
                if (firstFetch.status === 401) {
                    const isServerRestored = await this.restoreServerSession();
                    if (!isServerRestored) return false;

                    const secondTokens = await this.getTokens();
                    const secondAccessToken = secondTokens?.access;
                    if (!secondAccessToken) return false;
    
                    const secondFetch = await this.server.delete(secondAccessToken);
                    
                    if (secondFetch.status === 401) {
                        await this.local.logout();
                    }
                    if (!secondFetch.success) return false;
                }
            } catch { /* ignore */ }
        }
        return !!(await this.local.delete());
    }
    //#endregion

    async authFetch<T=any>(opts: FetchRequestOptions): Promise<FetchResponse<T>> {
        if (!opts?.url || opts.url?.length == 0) {
            return {
                success: false,
                status: 400,
                message: 'need_to_set_url',
            };
        }
        
        const localTokens = await this.getTokens();
        const firstAccessToken = localTokens?.access;
        if (!firstAccessToken) {
            return {
                success: false,
                status: 401,
                message: 'lost_or_expired_access_token',
            };
        }

        if (opts.url.startsWith('/')) {
            opts.url = this.server.getBaseUrl() + opts.url;
        }


        const firstFetch = await fetchRequest<T>({
            ...opts,
            headers: {
                ...(opts.headers || {}),
                'Authorization': `Bearer ${firstAccessToken}`,
            }
        });

        if (firstFetch.success) {
            return firstFetch;
        }

        if (firstFetch.status === 401) {
            const isServerRestored = await this.restoreServerSession();
            if (!isServerRestored) return firstFetch;

            const newTokens = await this.getTokens();
            const newAccessToken = newTokens?.access;

            const secondFetch = await fetchRequest<T>({
                ...opts,
                headers: {
                    ...(opts.headers || {}),
                    'Authorization': `Bearer ${newAccessToken}`,
                }
            });

            if (secondFetch.status === 401) {
                await this.local.logout();
            } 
            
            return secondFetch;
        } else return firstFetch;
    }
}