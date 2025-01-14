//This is custom Ajax request, without using other libraries
//This variant working only with Strings or Forms as parameters (JSON is not supported)

//This one is call function that you might change for your needs.
function callAjax() {
	ajaxRequest({
		url: '/Home/Index?', 
		method: 'POST',
		data: 
				"name=Nama" + 
				"&age=99" + 
				"&other=dull",

		success: (data) => {
			console.log(data);
		},

		error: (error) => {
			console.log(error);
		}
	});
};

//This one is constructor of custom ajax request.
function ajaxRequest(options) {

	var method = options.method || 'POST';
	var data = options.data || {};

	promisedConnection(options.url, method, data)

		.then(result => {
			if (options.success) {
				options.success(result);
			}
		})

		.catch(error => {
			if (options.error) {
				options.error(error);
			}
		});
};

//This one create connection and sends data to url.
function promisedConnection(url, method, data) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.open(method, encodeURI(url));
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(JSON.parse(xhr.response));
			} else {
				reject(`HTTP-status. Error code: ${xhr.status}. Error server response: ${xhr.statusText}.`);
			}
		};

		xhr.onerror = () => {
			reject(`HTTP-status. Error code: ${xhr.status}. Error server response: ${xhr.statusText}.`);
		};

		xhr.timeout = 60000;
		xhr.ontimeout = () => {
			reject("Request timed out.");
		}

		xhr.send(data);
	});
};
