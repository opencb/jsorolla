import {RestResponse} from "./rest-response.js";

export class RestClientXmlhttp {

    constructor() {
        this.requests = {};
    }

    static callXmlhttp(url, options) {
        const method = options.method || "GET";
        const async = options.async;

        let dataResponse = null;
        console.time("AJAX call to CellBase");
        const request = new XMLHttpRequest();
        request.onload = function (event) {
            console.log(`CellBaseClient: call to URL succeed: '${url}'`);
            const contentType = this.getResponseHeader("Content-Type");
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

        request.onerror = function (event) {
            // console.log(event)
            console.error(`CellBaseClient: an error occurred when calling to '${url}'`);
            if (typeof options.error === "function") {
                options.error(this);
            }
        };

        request.ontimeout = function (event) {
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

    call(url, options, key) {
        const eventFire = new CustomEvent("request", {
            detail: {
                value: url
            }
        });
        const eventDone = new CustomEvent("response", {
            detail: {
                value: url
            }
        });
        globalThis.dispatchEvent(eventFire);

        let method = "GET";
        let async = true;
        if (typeof options !== "undefined") {
            method = options.method || "GET";
            async = options.async || true;
        }

        let dataResponse = null;
        console.time(`REST call to ${url}`);
        // Creating the promise
        return new Promise((resolve, reject) => {

            const request = new XMLHttpRequest();
            if (url.includes("analysis/variant")) {

                console.error("url", url)
                if (this.requests[key]) {
                // abort here if possible. Pass AbortController object in RestClient.call?
                //console.error("prev request running");

                // pending prev request
                this.requests[key] = {...this.requests[key], pending: true};

                } else {
                // pending false as there is no prev request
                this.requests[key] = {pending: false, request, url};
                //console.log("first request")
                }

                console.log("FULL LIST", this.requests)
            }
            request.onload = function (event) {
                if (request.status === 200) {
                    const contentType = this.getResponseHeader("Content-Type") ?? ""; // empty string is useful in case contentType is undefined (empty response)
                    // indexOf() is used because sometimes the contentType is 'application/json;charset=utf-8'
                    if (contentType.indexOf("application/json")!== -1) {
                        dataResponse = JSON.parse(this.response);

                        if (typeof options !== "undefined" && typeof options.cacheFn === "function") {
                            options.cacheFn(dataResponse);
                        }

                        // If the call is OK then we execute the success function from the user
                        if (typeof options !== "undefined" && typeof options.success === "function" &&
                                typeof options.cacheFn === "undefined") {
                            options.success(dataResponse);
                        }
                        console.timeEnd(`REST call to ${url}`);
                        globalThis.dispatchEvent(eventDone);

                        resolve(new RestResponse(dataResponse));
                    } else if (contentType.startsWith("text/plain")) {
                        globalThis.dispatchEvent(eventDone);
                        resolve(this.response);

                    } else if (contentType.startsWith("application/octet-stream")) {
                        globalThis.dispatchEvent(eventDone);
                        resolve(this.response);
                    } else {
                        console.error(`Response is not JSON: ${this.response}`);
                    }
                } else {
                    console.error(`REST call to URL failed: '${url}'`);
                    globalThis.dispatchEvent(eventDone);
                    if (this.getResponseHeader("Content-Type").indexOf("application/json") > -1) {
                        reject(new RestResponse(JSON.parse(request.response)));
                    } else {
                        reject(request.response);
                    }

                }
            };

            request.onerror = function (event) {
                console.error(`CellBaseClient: an error occurred when calling to '${url}'`);
                if (typeof options.error === "function") {
                    options.error(this);
                }
                reject(Error(`CellBaseClient: an error occurred when calling to '${url}'`));
            };

            request.ontimeout = function (event) {
                console.error(`CellBaseClient: a timeout occurred when calling to '${url}'`);
                if (typeof options.error === "function") {
                    options.error(this);
                }
            };

            // console.log("CALL [method, url, options]", method, url, options)
            request.open(method, url, async);
            if (typeof options !== "undefined" && options.hasOwnProperty("token")) {
                request.setRequestHeader("Authorization", `Bearer ${options["token"]}`);
            }
            // request.timeout = options.timeout || 0;
            if (method === "POST" && options !== undefined && options.hasOwnProperty("data")) {
                if (options.hasOwnProperty("post-method") && options["post-method"] === "form") {
                    const myForm = new FormData();
                    const keys = Object.keys(options.data);

                    for (const i in keys) {
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
            } else if (method === "DELETE") {
                // TODO handle delete appropriately
                request.setRequestHeader("Content-type", "application/json");
                request.send();
            } else {
                request.send();

                if (this.requests?.[key]?.url.includes("analysis/variant")) {
                    console.log("FULL LIST", this.requests)
                    console.error("this.requests[key]",this.requests[key])

                    if (this.requests[key].pending === true) {

                        console.error("aborting", this.requests[key].url)
                        this.requests[key].request.abort();
                        // delete this.requests[key]
                        //console.error("request must be aborted", this.requests[key])
                    } else {

                    }
                }
            }
        });
    }

}
