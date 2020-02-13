/**
 * Copyright 2015-2019 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//node.js env
if (typeof window === 'undefined') {
    axios = require("axios");
}

/**
 * This is the new version of rest-client.
 */
export class RestClientAxios {

    //timeout = 0;
    static encodeObject(obj) {
        Object.entries(obj).map(([k, v]) => {
            return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }).join('&');
    }

    static async call(url, options = {}) {
        try {

            //console.log("URL", url, "OPTIONS", options)
            //in case of authentication header
            let auth = options && options.sid ? { Authorization: `Bearer ${options.sid}` } : null;

            //in case of formData
            let reqContentType = { 'Content-Type': 'application/json',};
            if(options && options["post-method"] === "form") {
                const formData = new URLSearchParams();
                for (let [k, v] in Object.entries(options.data)) {
                    formData.append(k, v);
                }
                reqContentType = {'content-type': 'application/x-www-form-urlencoded'};
            }
            //in case of GET request with params
            console.log(options)
            let queryString = options && options.data && (!options.method || options.method === "GET") ? `?${this.encodeObject(options.data)}` : "";

            console.time(`REST call to ${url}`);


            console.log("PARAMS", {url: url + queryString,
                //method: "GET",
                headers: {...auth, ...reqContentType},
                auth,
                ...options});

            const response = await axios.request({
                url: url + queryString,
                //method: "GET",
                headers: {...auth, ...reqContentType},
                auth,
                ...options
            });

            const contentType = response.headers['content-type'];

            if(["application/json", "text/plain", "application/octet-stream"].includes(contentType)) {
                if (options && typeof options.cacheFn === "function") {
                    options.cacheFn(response);
                }
                // If the call is OK then we execute the success function from the user
                //TODO check if we really need it
                if (options && typeof options.success === "function") {
                    options.success(response);
                }
                console.timeEnd(`REST call to ${url}`);
                return response.data;
            } else {
                console.error("Result format unexpected ", response);
            }
        } catch (e) {
            return e;
        }
    }

}
