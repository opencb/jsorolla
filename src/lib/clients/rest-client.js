/**
 * Created by swaathi on 13/04/16.
 */

class RestClient {

    static call(url, options) {
        let method = options.method || "GET";
        let async = options.async;

        let dataResponse = null;
        console.time("AJAX call to CellBase");
        let request = new XMLHttpRequest();
        request.onload = function(event) {
            console.log(`CellBaseClient: call to URL succeed: '${url}'`);
            let contentType = this.getResponseHeader("Content-Type");
            if (contentType === "application/json") {
                dataResponse = JSON.parse(this.response);

                if (typeof options !== "undefined" && typeof options.cacheFn === "function") {
                    options.cacheFn(dataResponse);
                }

                // If the call is OK then we execute the success function from the user
                // console.log(options)
                if (typeof options !== "undefined" && typeof options.success === "function" && typeof options.cacheFn === "undefined") {
                    options.success(dataResponse);
                }
                console.timeEnd("AJAX call to CellBase");
                console.log(options, `Size: ${event.total} Bytes`);
            } else {
                console.log(this.response);
            }
        };

        request.onerror = function(event) {
            // console.log(event)
            console.error(`CellBaseClient: an error occurred when calling to '${url}'`);
            if (typeof options.error === "function") {
                options.error(this);
            }
        };

        request.ontimeout = function(event) {
            console.error(`CellBaseClient: a timeout occurred when calling to '${url}'`);
            if (typeof options.error === "function") {
                options.error(this);
            }
        };

        request.open(method, url, async);
        if (typeof options !== "undefined" && options.hasOwnProperty("sid")) {
            request.setRequestHeader("Authorization", `Bearer ${options["sid"]}`);
        }
        // request.timeout = options.timeout || 0;
        request.send();
        return dataResponse;
    }

    static callPromise(url, options) {
        let method = "GET";
        let async = true;
        if (typeof options !== "undefined") {
            method = options.method || "GET";
            async = options.async;
        }

        let dataResponse = null;
        console.time(`REST call to ${url}`);

        // Creating the promise
        return new Promise(function(resolve, reject) {

            let request = new XMLHttpRequest();

            request.onload = function(event) {
                if (request.status === 200) {
                    let contentType = this.getResponseHeader("Content-Type");
                    // startsWith() is used because sometimes the contentType is 'application/json;charset=utf-8'
                    if (contentType.startsWith("application/json")) {
                        dataResponse = JSON.parse(this.response);

                        if (typeof options !== "undefined" && typeof options.cacheFn === "function") {
                            options.cacheFn(dataResponse);
                        }

                        // If the call is OK then we execute the success function from the user
                        // console.log(options)
                        if (typeof options !== "undefined" && typeof options.success === "function" && typeof options.cacheFn === "undefined") {
                            options.success(dataResponse);
                        }
                        console.timeEnd(`REST call to ${url}`);
                        console.debug("REST call query: ", options, `, Size: ${event.total} Bytes`);
                        resolve(dataResponse);
                    } else {
                        console.log(`Result is not JSON: ${this.response}`);
                    }
                } else {
                    console.error(`REST call to URL failed: '${url}'`);
                    reject(JSON.parse(request.response));
                }
            };

            request.onerror = function(event) {
                // console.log(event)
                console.error(`CellBaseClient: an error occurred when calling to '${url}'`);
                if (typeof options.error === "function") {
                    options.error(this);
                }
                reject(Error(`CellBaseClient: an error occurred when calling to '${url}'`));
            };

            request.ontimeout = function(event) {
                console.error(`CellBaseClient: a timeout occurred when calling to '${url}'`);
                if (typeof options.error === "function") {
                    options.error(this);
                }
            };

            request.open(method, url, async);
            if (typeof options !== "undefined" && options.hasOwnProperty("sid")) {
                request.setRequestHeader("Authorization", `Bearer ${options["sid"]}`);
            }

            // request.timeout = options.timeout || 0;
            if (method === "POST" && options !== undefined && options.hasOwnProperty("data")) {
                if (options.hasOwnProperty("post-method") && options["post-method"] === "form") {
                    let myForm = new FormData();
                    let keys = Object.keys(options.data);

                    for (let i in keys) {
                        myForm.append(keys[i], options.data[keys[i]]);
                    }

                    request.send(myForm);
                } else {
                    // request.setRequestHeader("Access-Control-Allow-Origin", "*");
                    // // request.setRequestHeader("Access-Control-Allow-Credentials", "true");
                    // request.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    request.setRequestHeader("Content-type", "application/json");
                    request.send(JSON.stringify(options.data));
                }
            } else {
                request.send();
            }
        });
    }
}

