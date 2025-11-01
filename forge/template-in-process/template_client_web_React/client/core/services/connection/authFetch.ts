import { AuthService, SessionResponseType } from "../auth/authService";
import fetchRequest, { FetchRequestOptions, FetchResponse, ServerResponse } from "./fetchRequest";

export class AuthFetch {
    private service: AuthService;

    constructor(service?: AuthService | null) {
        if (service != null && !(service instanceof AuthService)) {
            throw new Error("Параметр service должен быть экземпляром AuthService");
        }
        this.service = service ?? new AuthService();
    }

    async request<T>({
        url: urlPath,
        method,
        type,
        data,
        timeout,
    
        headers: inputHeaders,
        cache,
        redirect,
        credentials,

        onSuccess,
        onError,
        onFinally,
        onTimeout,
    }: FetchRequestOptions & { retry?: boolean }): Promise<ServerResponse<T>> {
        let fetchResponse: FetchResponse<ServerResponse<T>>;
        if (!urlPath || urlPath?.length == 0) {
            return {
                status: 400,
                message: 'need_to_set_url',
                data: null
            };
        }
        
        const headers = await this.prepareHeadersWithToken(inputHeaders);
        if (!headers) {
            return {
                status: 401,
                message: 'lost_or_expired_access_token',
                data: null
            };
        }
        
        if (urlPath.startsWith('/')) {
            urlPath = this.service.serverUrl + urlPath;
        }
        
        try {
            fetchResponse = await fetchRequest<ServerResponse<T>>({
                url: urlPath,
                method,
                type,
                data,
                timeout,
            
                headers,
                cache,
                redirect,
                credentials,
        
                onSuccess,
                onError,
                onFinally,
                onTimeout,
            });
            
            // трансформируем в ServerResponse<T>
            
            //fetchResponse.


            const serverResponse: ServerResponse = (fetchResponse.success && fetchResponse.response) ?
                fetchResponse.response :
                {
                    status: fetchResponse.status ?? 500,
                    message: fetchResponse.message ?? (fetchResponse.success ? 'ok' : 'error'),
                    data: null
                };

            if (fetchResponse.success) {
                onSuccess?.(fetchResponse);
            } else {
                onError?.(fetchResponse.errors ?? []);
            }
    
            return serverResponse;
        } catch (err: any) {
            onError?.(err);
            return {
                status: 500,
                message: err.message || 'NETWORK_ERROR',
                data: null
            };
        } finally {
            onFinally?.();
        }
    }

    private async prepareHeadersWithToken(
        inputHeaders: Record<string, string> | null | undefined
    ): Promise<Record<string, string> | null> {
        const accessToken = await this.service.getAccessToken();
        if (!accessToken) return null;
        
        const headers: Record<string, string> = {
            ...(inputHeaders || {}),
            Authorization: `Bearer ${accessToken.raw}`,
        };
        return headers;
    }
}