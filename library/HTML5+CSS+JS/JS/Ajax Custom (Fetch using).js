//This is an example of using custom ajaxRequest
/*
function callAjax() {
	ajaxRequest({
		url: '/Home/Index',  //Use your method, which returns data
		method: 'POST',
		type: "json",

		data: {				// You can use names of parameters, or objects parameters. Names of this object must be the same as in called method
			param1: 'value1',
			param1: value2,
		},

		success: (data) => {	// Functionality on status 200 (Ok)
			console.log(data);
		},

		error: (error) => {		// Functionality on bad requests
			console.log(error);
		}

		complete: () => {		// Finally 
			console.log("complete");
		}
	});
};
*/

//This one is constructor of ajax request, thats create connection through Fetch API and sends data to url.
ajaxRequest(options) {
	var headers;
	var responseBody = null;
	var data;
	switch (options.type) {  //  Default header and data type is for Json data type
		case "string":
			headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
			data = Object.keys(options.data)
				.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]))
				.join('&');
			break;

		case "multipart":
			headers = undefined;
			data = options.data;
			break;

		case "json":
		default:
			headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
			data = JSON.stringify(options.data);
			break;
	}

	try {
		return fetch(options.url, {
			method: options.method || 'POST', //  Default method is POST
			headers: headers,
			cache: options.cache || 'no-cache',  //  Defaultly don't use cache
			redirect: options.redirect || 'follow', //  Defaultly allow redirect
			credentials: options.credentials || 'same-origin', //  Defaultly don't allow third party data
			body: options.data ? data : undefined,
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Fetch request. Network response was not ok');
				}
				if (responseBody) return responseBody;

				var header = response.headers.get('content-type');
				switch (true) {
					case header.includes('application/json'):
						responseBody = response.json();
						break;
					case header.includes('text/html'):
						responseBody = response.text();
						break;
					default:
						throw new Error('Fetch request. Invalid content type.');
						break;
				}
				return responseBody;
			})
			.then(data => {
				if (options.success) {
					return options.success(data);
				}
			})
			.catch(error => {
				if (options.error) {
					return options.error(error);
				}
			})

			.finally(() => {
				if (options.complete) {
					return options.complete();
				}
			});
	} catch (e) {
		return options.error(e);
	}
}

