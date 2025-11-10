import fetchRequest, { FetchResponse, ServerResponse } from "../connection/fetchRequest";

import type { UserProfile } from "./authLocalService";
import type { SessionData } from "../../types/AuthServiceTypes";

// RN 0.82 has issues with react-native-config, 
// and the known forks are not sufficiently tested.
// Non-confidential configs will be stored in app.json
// until the issue is fixed.
//import Config from 'react-native-config';
import { env as Config } from '../../../../app.json';
type EnvKeys = keyof typeof Config;


export class AuthServerService {
    private static instance: AuthServerService;

    //#region Inner
    static getInstance() {
        if (!AuthServerService.instance) {
            AuthServerService.instance = new AuthServerService();
        }
        return AuthServerService.instance;
    }

    getBaseUrl(): string {
        const url = Config.API_SERVER_URL;
        if (!url) throw new Error('API_SERVER_URL route is not configured');
        return url;
    }

    private getRoute(routeName: string): string {
        const envKey = `API_SERVER_AUTH_${routeName.toUpperCase()}` as EnvKeys;
        const route = (Config && envKey in Config)
            ? Config[envKey as EnvKeys]
            : '';
        
        if (!route) throw new Error(`${envKey} route is not configured`);
    
        return `${this.getBaseUrl()}${route}`;
    } 
    //#endregion

    //#region Session
    async login(
        login: string,
        password: string,
    ): Promise<SessionData | null> {
        const url = this.getRoute('LOGIN');
        const ftch = await fetchRequest<ServerResponse<SessionData>>({
            url,
            method: 'POST',
            type: 'json',
            data: {
                login,
                password,
            },
        });

        if (ftch.success || ftch.response) {
            const data = ftch.response?.payload as SessionData 
            return data;
        } else return null;
    }

    async logout(refreshToken: string): Promise<boolean> {
        const url = this.getRoute('LOGOUT');
        const ftch = await fetchRequest({
            url,
            method: 'POST',
            type: 'json',
            data: {
                refreshToken,
            },
        });
        return ftch.success;
    }

    async restoreSession(
        session_id: string, 
        refresh_token: string
    ): Promise<SessionData | null> {
        const url = this.getRoute('REFRESH');
        const ftch = await fetchRequest<ServerResponse<SessionData>>({
            url,
            method: 'POST',
            type: 'json',
            data: {
                session_id, refresh_token,
            },
        });

        if (ftch.success || ftch.response) {
            const data = ftch.response?.payload as SessionData 
            return data;
        } else return null;
    }
    //#endregion

    //#region User CRUD
    async create(
        login: string,
        password: string,
        profile?: any
    ): Promise<SessionData | null> {
        const url = this.getRoute('USER_CREATE');
        const ftch = await fetchRequest<ServerResponse<SessionData>>({
            url,
            method: 'POST',
            type: 'json',
            data: {
                login,
                password,
                profile,
            },
        });

        if (ftch.success && ftch.response) {
            const data = ftch.response?.payload as SessionData 
            return data;
        } else return null;
    }

    async read(
        accessToken: string
    ): Promise<FetchResponse> {
        const url = this.getRoute('USER_READ');
        return await fetchRequest({
            url,
            method: 'GET',
            type: 'json',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }

    async update(
        accessToken: string, 
        updates: Partial<UserProfile>
    ): Promise<FetchResponse> {
        const url = this.getRoute('USER_UPDATE');
        return await fetchRequest({
            url,
            method: 'PATCH',
            type: 'json',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            data: {
                ...updates,
            },
        });
    }

    async delete(
        accessToken: string
    ): Promise<FetchResponse> {
        const url = this.getRoute('USER_DELETE');
        return await fetchRequest({
            url,
            method: 'DELETE',
            type: 'json',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
    }
    //#endregion
}
