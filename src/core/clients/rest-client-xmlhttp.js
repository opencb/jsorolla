import {RestResponse} from "./rest-response.js";

export class RestClientXmlhttp {

    static callXmlhttp(url, options) {
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

    static call(url, options) {
        console.log("REMOTE", url, options)
        let method = "GET";
        let async = true;
        if (typeof options !== "undefined") {
            method = options.method || "GET";
            async = options.async || true;
        }

        let dataResponse = null;
        console.time(`REST call to ${url}`);

        // Creating the promise
        return new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();

            request.onload = function(event) {
                if (request.status === 200) {
                    let contentType = this.getResponseHeader("Content-Type");
                    // indexOf() is used because sometimes the contentType is 'application/json;charset=utf-8'
                    if (contentType.indexOf("application/json")!= -1) {
                        dataResponse = JSON.parse(this.response);

                        if (typeof options !== "undefined" && typeof options.cacheFn === "function") {
                            options.cacheFn(dataResponse);
                        }

                        // If the call is OK then we execute the success function from the user
                        if (typeof options !== "undefined" && typeof options.success === "function"
                            && typeof options.cacheFn === "undefined") {
                            options.success(dataResponse);
                        }
                        console.timeEnd(`REST call to ${url}`);
                        resolve( new RestResponse(dataResponse));
                    } else if (contentType.startsWith("text/plain")) {
                        resolve(this.response);

                    } else if (contentType.startsWith("application/octet-stream")) {
                        resolve(this.response);

                    }  else {
                        console.log(`Result is not JSON: ${this.response}`);
                    }
                } else {
                    console.error(`REST call to URL failed: '${url}'`);
                    //TODO check this. it assumes in case of error a RestResponse shaped json is returned in any case
                    reject(new RestResponse(JSON.parse(request.response)));
                }
            };

            request.onerror = function(event) {
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

            //console.log("CALL [method, url, options]", method, url, options)
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
