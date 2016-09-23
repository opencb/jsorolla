/**
 * Created by swaathi on 13/04/16.
 */

class RestClient {

    static call(url, options) {
        let method = options.method || "GET";
        let async = options.async;

        let dataResponse = null;
        console.time("AJAX call to CellBase");
        var request = new XMLHttpRequest();
        request.onload = function(event) {
            console.log("CellBaseClient: call to URL succeed: '" + url +"'");
            var contentType = this.getResponseHeader('Content-Type');
            if (contentType === 'application/json') {
                dataResponse = JSON.parse(this.response);

                if (typeof options != "undefined" && typeof options.cacheFn === "function") {
                    options.cacheFn(dataResponse);
                }

                // If the call is OK then we execute the success function from the user
                console.log(options)
                if (typeof options != "undefined" && typeof options.success === "function" && typeof options.cacheFn == "undefined") {
                    options.success(dataResponse);
                }
                console.timeEnd("AJAX call to CellBase");
                console.log("Size: " + event.total + " Bytes");
            } else {
                console.log(this.response)
            }
        };

        request.onerror = function(event) {
            // console.log(event)
            console.error("CellBaseClient: an error occurred when calling to '" + url +"'");
            if (typeof options.error === "function") {
                options.error(this);
            }
        };

        request.ontimeout = function(event) {
            console.error("CellBaseClient: a timeout occurred when calling to '" + url +"'");
            if (typeof options.error === "function") {
                options.error(this);
            }
        };

        request.open(method, url, async);
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
        console.time("AJAX call to CellBase");

        // Creating the promise
        return new Promise(function(resolve, reject) {

            var request = new XMLHttpRequest();

            request.onload = function(event) {
                if (request.status == 200) {
                    console.log("REST call to URL succeed: '" + url +"'");
                    var contentType = this.getResponseHeader('Content-Type');
                    if (contentType === 'application/json') {
                        dataResponse = JSON.parse(this.response);

                        if (typeof options != "undefined" && typeof options.cacheFn === "function") {
                            options.cacheFn(dataResponse);
                        }

                        // If the call is OK then we execute the success function from the user
                        console.log(options)
                        if (typeof options != "undefined" && typeof options.success === "function" && typeof options.cacheFn == "undefined") {
                            options.success(dataResponse);
                        }
                        console.timeEnd("AJAX call to CellBase");
                        console.log("Size: " + event.total + " Bytes");
                        resolve(dataResponse);
                    } else {
                        console.log(this.response)
                    }
                } else {
                    reject(JSON.parse(request.response));
                }
            };

            request.onerror = function(event) {
                // console.log(event)
                console.error("CellBaseClient: an error occurred when calling to '" + url +"'");
                if (typeof options.error === "function") {
                    options.error(this);
                }
                reject(Error("CellBaseClient: an error occurred when calling to '" + url +"'"));
            };

            request.ontimeout = function(event) {
                console.error("CellBaseClient: a timeout occurred when calling to '" + url +"'");
                if (typeof options.error === "function") {
                    options.error(this);
                }
            };

            request.open(method, url, async);

            // request.timeout = options.timeout || 0;
            if (method === "POST" && options !== undefined && options.hasOwnProperty("data")) {
                request.setRequestHeader("Access-Control-Allow-Origin", "*");
                // request.setRequestHeader("Access-Control-Allow-Credentials", "true");
                request.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                request.setRequestHeader("Content-type", "application/json");
                request.send(JSON.stringify(options.data));
            } else {
                console.log("Calling GET");
                request.send();
            }
        });
    }
}

