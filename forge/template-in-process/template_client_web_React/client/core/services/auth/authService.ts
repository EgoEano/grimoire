import { saveSecret, loadSecret, deleteSecret } from "./keychainService";
import Config from "react-native-config";

import fetchRequest from "../connection/fetchRequest";
import { decodeJwt } from "../utils/parsers";

import type {FetchResponse, ServerResponse} from "../connection/fetchRequest";
import type { UserSessionData, SessionData, SessionDataOpened, CreateSessionProps, ModJwtPayload, JwtPayloadParsed, UpdateSessionProps } from "../../types/tokenTypes";
import { UserLocalRepository } from "../repositories/UserLocalRepository";
import { ToastAndroid } from "react-native";

/*
Цикл
При любом сетевом запросе - Проверка наличия токена
Если токена нет - Вызов - Получение токена
Если токен есть:
    Проверка истечения сессии и флага used
    Проверка истечения access_token

При провале проверок Вызов - Получение токена
При успехе - выполнение запроса с прикреплением access_token




Получение токена {
Запрос api получения токена с передачей логина и хешированного пароля
При неудаче - вывод
При успехе сохранение данных сессии
}

Клиентская проверка {
проверка access_token
    срок протухания токена истек
    скорое протухание < 30 сек

если токен нужно обновить - Обновление сессии через refresh_token

!!!!! обдумать action_token на чувствительную логику

отправка запроса
}
*/


export interface CreateSessionResponse {
    success: boolean;
    message: SessionResponseType;
    payload?: UserData;
}

export type SessionResponseType = 'ok' | 'error' | 'fail' | (string & {});

export interface UserData {
    id?: number | null;
    user_id: string | null;
    username?: string;
    email?: string | null;
    avatar?: any | null;
    created_at?: number;
    updated_at?: number;
};



export class AuthService {
    public serverUrl: string;
    public path_auth_login: string;
    public path_auth_refresh: string;
    public path_auth_register: string;

    //#FIXME Сейчас нет никаких проверок какой пользователь вошел - нужно добавить перед выдачей или инициализацией constructor
    //Если пользователь другой - дропать токены
    //Или же выдавать токены только к привязанным id 
    constructor() {
        const configs = {
            API_SERVER_URL: Config.API_SERVER_URL,
            API_SERVER_LOGIN_ROUTE: Config.API_SERVER_LOGIN_ROUTE,
            API_SERVER_REFRESH_ROUTE: Config.API_SERVER_REFRESH_ROUTE,
            API_SERVER_REGISTER_ROUTE: Config.API_SERVER_REGISTER_ROUTE,
        };

        const missing = Object.entries(configs)
            .filter(([_, v]) => !v)
            .map(([k]) => k);

        if (missing.length > 0) {
            throw new Error(
                `Missing config fields: ${missing.join(', ')}`
            );
        }

        this.serverUrl = `${configs.API_SERVER_URL}${Config.API_SERVER_PORT ? `:${Config.API_SERVER_PORT}` : ''}`;
        this.path_auth_login = configs.API_SERVER_LOGIN_ROUTE!;
        this.path_auth_refresh = configs.API_SERVER_REFRESH_ROUTE!;
        this.path_auth_register = configs.API_SERVER_REGISTER_ROUTE!;
    }

    //create
    async createSession({
        login, password, device_id, device_hash
    }: CreateSessionProps): Promise<CreateSessionResponse> {
        try {
            await this.clearSession();
            const url = `${this.serverUrl}${this.path_auth_login}`;

            const res = await fetchRequest<ServerResponse<SessionData>>({
                url: url,
                data: { login, password, device_id, device_hash },
            });
            
            if (res.success && res.response) {
                const data = res.response?.data as SessionData 
                await this.saveSession(data);

                return { 
                    success: true, 
                    message: 'ok',
                    payload: {
                        user_id: data.user_id,
                        username: login
                    }
                };
            } else {
                return { success: false, message: res.message ?? 'fail'};
            }
        } catch (err) {
            console.error("Failed to create session", err);
            return { success: false, message: 'error'};

        }
    }

    //create
    private async saveSession(session: SessionData): Promise<boolean | null> {
        return await saveSecret("session", session);
    }

    //read session
    async getUserData(): Promise<UserSessionData | null> {
        const session = await this.getSession();
        if (!session) return null;
        return {
            user_id: session.user_id
        }
    }
    
    //read session
    async getSession(): Promise<SessionDataOpened | null> {
        const session = await this.getSessionFromKeychain();
        if (!session) return null;
        const isSessionValid = await this.isSessionValid(session);
        return isSessionValid ? session : null;
    }
    
    private async getSessionFromKeychain(): Promise<SessionDataOpened | null> {
        const session = await loadSecret<SessionData>("session");
        if (session) {
            return this.mapSession(session);
        } else return null;
    }

    //read access_token
    async getAccessToken(): Promise<JwtPayloadParsed | null> {
        let accessToken = await this.getValidAccessToken();
        if (!accessToken) {
            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) {
                //#FIXME Сейчас сессия не очищаяется полноценно
                //this.clearSession();
                return null;
            } else {
                const resp: SessionResponseType = await this.updateSession();

                if (resp === 'ok') {
                    accessToken = await this.getValidAccessToken();
                }
            }
        }
        return accessToken;
    }

    private async getValidAccessToken(): Promise<JwtPayloadParsed | null> {
        const token = await this.getAccessTokenFromSession();
        if (!token) return null;
        
        const isValid = await this.isAccessTokenValid(token);

        return isValid ? token : null;
    }

    private async getAccessTokenFromSession(): Promise<JwtPayloadParsed | null> {
        const session = await this.getSession();
        if (!session) return null;
        return {
            raw: session.access_token,
            payload: session.access_token_payload
        };
    }

    //read refresh_token
    private async getRefreshToken(): Promise<string | null> {
        const session = await this.getSession();
        if (!session) return null;
        return session.refresh_token;
    }

    //update
    async updateSession(): Promise<SessionResponseType> {
        const ss = await this.getSession();
        if (!ss) return 'fail';
        
        return await this.updateSessionParams({
            session_id: ss.session_id, 
            refresh_token: ss.refresh_token, 
            device_id: ss.device_id, 
            device_hash: ss.device_hash
        });
    }

    //update inner
    private async updateSessionParams({
        session_id, refresh_token, device_id, device_hash
    }: UpdateSessionProps): Promise<SessionResponseType> {
        try {
            const url = `${this.serverUrl}${this.path_auth_refresh}`;

            const res = await fetchRequest<ServerResponse<SessionData>>({
                url: url,
                data: { session_id, refresh_token, device_id, device_hash },
            })

            //#FIXME Продумать логику что если refresh_token устарел или session_id недействительна
            // В случае провала очищать локальную сессию
            // но только после успешных тестов работы сессии
            if (res.success && res.response) {
                const data = res.response?.data as SessionData 
                await this.saveSession(data);
                return 'ok';
            } else {
                await this.clearSession();
                return res.message ?? 'fail';
            }
        } catch (err) {
            console.error("Failed to create session", err);
            return 'error';
        }
    }

    //delete
    async clearSession(): Promise<boolean | null> {
        return await deleteSecret("session");
    }

    //inner
    private mapSession(session: SessionData): SessionDataOpened {
        return {
            ...session,
            access_token_payload: decodeJwt(session.access_token),
        };
    }

    //inner
    private async isSessionValid(session?: SessionDataOpened): Promise<boolean> {
        const sess = session ?? await this.getSession();
        if (!sess) return false;
        
        return (
            sess.session_id != null
            && !sess.used
            && sess.expires_at * 1000 > Date.now()
        );
    }

    //inner
    private async isAccessTokenValid(token: JwtPayloadParsed ): Promise<boolean> {
        if (!token) return false;
        const timeShift = 1000 * 30; // 30 seconds

        return (
            token.payload?.exp != null
            && token.payload.exp * 1000 > Date.now() + timeShift
        );
    }
}


