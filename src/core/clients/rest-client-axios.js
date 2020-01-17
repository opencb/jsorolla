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

            //in case of authentication header
            let auth = options && options.sid ? { Authorization: `Bearer ${options.sid}` } : null;

            //in case of formData
            let reqContentType = {};
            if(options && options["post-method"] === "form") {
                const formData = new URLSearchParams();
                for (let [k, v] in Object.entries(options.data)) {
                    formData.append(k, v);
                }
                reqContentType = {'content-type': 'application/x-www-form-urlencoded'};
            }
            //in case of GET request with params
            //console.log(options.method)
            let queryString = options && options.data && (!options.method || options.method === "GET") ? `?${this.encodeObject(options.data)}` : "";

            console.time(`REST call to ${url}`);

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

/*
RestClient.call("https://httpbin.org/get", null, {timeout: 1000})
    .then( r => console.log(r))
    .catch( e => console.log(e));
*/
/*
RestClient.call("http://bioinfo.hpc.cam.ac.uk/opencga-demo/webservices/rest/v1/users/demo/login", {
    method: "POST",
    data: { password: "demo" }
}).then( r => console.log(r))
.catch( e => console.log(e));*/

/*

RestClient.call("http://bioinfo.hpc.cam.ac.uk/opencga-demo/webservices/rest/v1/users/demo/info", {
    headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIiwiYXVkIjoiT3BlbkNHQSB1c2VycyIsImlhdCI6MTU3ODY2Njk2NywiZXhwIjoxNTc4NjcwNTY3fQ.Ybil4STvpoERQ_F3nx0WsxRN4uZKj3oTHuIN_ieDZg0' }
}).then( r => console.log(r));
*/
