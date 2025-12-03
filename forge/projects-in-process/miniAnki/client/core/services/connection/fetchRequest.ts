// v1.0.0
//This is an example of using custom fetchRequest
/*
function callFetch() {
	fetchRequest({
		url: '/Home/Index',  //Use your method, which returns data
		method: 'POST',
		type: "json",
		data: {				// You can use names of parameters, or objects parameters. Names of this object must be the same as in called method
			param1: 'value1',
			param1: 'value2',
		},
		timeout: 10000,

		headers: {},

		onSuccess: (data) => {	// Functionality on status 200 (Ok)
			console.log(data);
		},

		onError: (error) => {		// Functionality on bad requests
			console.log(error);
		},

		onFinally: () => {		// Finally 
			console.log("finally");
		},

		onTimeout: () => {		// Timeout 
			console.log("timeout");
		},
	});
};
*/

export interface FetchRequestOptions {
	url: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
	type?: "json" | "string" | "multipart";
	data?: any;
	timeout?: number;

	headers?: Record<string, string> | null;
	cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
	redirect?: 'follow' | 'error' | 'manual';
	credentials?: 'omit' | 'same-origin' | 'include';

	onSuccess?: (data: FetchResponse) => void;
	onError?: (error: any) => void;
	onFinally?: () => void;
	onTimeout?: () => void;
}

export interface FetchResponse<T = any> {
    success: boolean;
	status?: number;
    response?: T | null;
    message?: string | null;
    errors?: any[] | null;
	raw: Response;
};

export interface ServerResponse<T = any> {
    status: number;
    message: string;
    payload?: T | null;
};

//This one is constructor of fetch request, thats create connection through Fetch API and sends data to url.
export default async function fetchRequest<T = any>({
	url,
	method: inputMethod = 'POST',
	type = 'json',
	data: inputData,
	timeout = 10000,

	headers: inputHeaders,
	cache = 'no-store',
	redirect = 'follow',
	credentials = 'include',

	onSuccess,
	onError,
	onFinally,
	onTimeout,
}: FetchRequestOptions): Promise<FetchResponse<T>> {
	try {
		const controller = new AbortController();
		const signal = controller.signal;
		const timeoutPromise = new Promise<Response>((_, reject) => {
			const id = setTimeout(() => {
				controller.abort();
				onTimeout?.();
				reject({
					success: false,
					message: "Request timed out",
					status: 0,
				} as FetchResponse);
			}, timeout);
			signal.addEventListener("abort", () => clearTimeout(id));
		});

		let requestUrl = url.trim();
		if (!requestUrl) {
			throw {
				success: false,
				errors: ['Need to set url in options']
			};
		}

		const method = (inputMethod).toUpperCase();
		let headers;
		let data = undefined;

		switch (type) {  //  Default header and data type is for Json data type
			case "string":
				headers = { 'Content-Type': 'application/x-www-form-urlencoded', ...inputHeaders };
				data = new URLSearchParams(inputData).toString();
				break;

			case "multipart":
				headers = inputHeaders ?? {};
				data = inputData;
				break;

			case "json":
			default:
				headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', ...inputHeaders };
				data = JSON.stringify(inputData);
				break;
		}

		if (["GET", "HEAD"].includes(method) && inputData && typeof inputData === 'object') {
			const queryString = new URLSearchParams(inputData).toString();
			if (queryString) {
				requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
			}
		}

		const response = await Promise.race([
			fetch(requestUrl, {
				method, //  Default method is POST
				headers,
				//cache,  //  Defaultly don't use cache and do not allows 304
				//redirect, //  Defaultly allow redirect
				credentials, 
				signal,
				body: ["GET", "HEAD"].includes(method) ? undefined : data,
			}),
			timeoutPromise,
		  ]) as Response;

		const contentType = response.headers.get('content-type') || '';
		let responseData: any = null;
		try {
			switch (true) {
				case contentType.includes('application/json'):
					responseData = await response.json();
					break;
				case contentType.includes('text/html'):
				case contentType.includes('text/plain'):
				case contentType.includes('application/xml'):
					responseData = await response.text();
					break;
				default:
					responseData = await response.blob();
			}
		} catch (_) {}


		if (!response.ok) {
			throw {
				success: false,
				status: response.status,
				message: `Fetch request failed`,
				data: responseData as T,
				errors: [response.statusText],
				raw: response
			};
		}

		const resp: FetchResponse = {
			success: true,
			status: response.status,
			response: responseData as T,
			raw: response
		};

		onSuccess?.(resp);
		return resp;

	} catch (e: any) {
		onError?.(e);
		return e as FetchResponse<T>;

	} finally {
		onFinally?.();
    }
}
