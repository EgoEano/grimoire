export interface UserSessionData {
    user_id: string;
}

export type SessionData = {
	session_id: string,
	user_id: string;
	device_id: string;
	device_hash: string;
	access_token: string;
	refresh_token: string;
	created_at: number;
	expires_at: number;
	mastery: boolean;
	used: boolean;
};

export type SessionDataOpened = SessionData & {
    access_token_payload: ModJwtPayload;
};

export type CreateSessionProps = {
    login: string;
    password: string;
    device_id: number;
    device_hash: string;
}

export type UpdateSessionProps = {
    session_id: string;
    refresh_token: string;
    device_id: string;
    device_hash: string;
}

export interface TokenPayload {
    roles: string[];  // роли выданные держателю токена
    scope?: string;  // права выданные держателю токена
    
    device_id?: string;  // для привязки к устройству
    device_hash?: string;  // хэш устройства, формируемый из технических данных
    session_id?: string;  // для контроля/отзыва

    version: number; // версионирование токенов
}

export type TokenActionPayload = TokenPayload & {
    action_type: string;
    params_hash: string;  //хэш параметров конкретного действия
}

export interface JwtStandardClaims {
    iat?: number; // issued at
    exp?: number; // expiration time
    nbf?: number; // not before
    jti?: string; // jwt id
    iss?: string; // issuer
    aud?: string | string[]; // audience
    sub?: string; // subject (например userId)
    [key: string]: any;
}
  
export type ModJwtPayload = (TokenPayload | TokenActionPayload) & JwtStandardClaims;

export type JwtPayloadParsed = {raw: string, payload: ModJwtPayload}

