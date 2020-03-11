/*
 * Copyright 2015-2016 OpenCB
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

import {RestClient} from "../rest-client.js";

export class ReactomeClient {

    constructor() {
        this.host = "https://reactome.org";
    }

    /*
     * Client factory functions
     */
    contentServiceClient() {
        if (typeof this._contentService === "undefined") {
            this._contentService = new ContentService(this.host + "/ContentService");
        }
        return this._contentService;
    }
}

export class ContentService {

    constructor(host) {
        this.host = host;
    }

    /*
     * Client factory functions
     */
    mappingClient() {
        if (typeof this._mapping === "undefined") {
            this._mapping = new MappingClient(this.host + "/data/mapping");
        }
        return this._mapping;
    }

}

// parent class
export class ReactomeParentClass {

    constructor(host) {
        this.host = host;
    }

    // post(category, ids, action, params, body, options) {
    //     return this.extendedPost(category, ids, null, null, action, params, body, options);
    // }
    //
    // extendedPost(category1, ids1, category2, ids2, action, params, body, options) {
    //     let _options = options;
    //     if (typeof _options === "undefined") {
    //         _options = {};
    //     }
    //     _options.method = "POST";
    //     let _params = params;
    //
    //     if (typeof _params === "undefined") {
    //         _params = {};
    //     }
    //     _params.body = body;
    //     return this.extendedGet(category1, ids1, category2, ids2, action, _params, _options);
    // }

    get(category, ids, action, params, options) {
        return this.extendedGet(category, ids, null, null, action, params, options);
    }

    extendedGet(category1, ids1, category2, ids2, action, params, options) {
        // we store the options from the parameter or from the default values in config
        const host = this.host;
        const rpc = "rest";
        let method = "GET";
        let _options = options;
        if (typeof _options === "undefined") {
            _options = {};
        }

        if (_options.hasOwnProperty("method")) {
            method = _options.method;
        }

        let _params = params;

        if (_params === undefined || _params === null || _params === "") {
            _params = {};
        }

        if (rpc.toLowerCase() === "rest") {
            let url = this._createRestUrl(host, category1, ids1, category2, ids2, action);
            url = this._addQueryParams(url, _params);
            if (method === "POST") {
                _options.data = _params.body;
            }
            return RestClient.call(url, _options);
        }
    }

    _createRestUrl(host, category1, ids1, category2, ids2, action) {
        let url = host + "/" + category1 + "/";

        // Some web services do not need IDs
        if (typeof ids1 !== "undefined" && ids1 !== null) {
            url += `${ids1}/`;
        }

        // Some web services do not need a second category
        if (typeof category2 !== "undefined" && category2 !== null) {
            url += `${category2}/`;
        }

        // Some web services do not need the second category of ids
        if (typeof ids2 !== "undefined" && ids2 !== null && ids2 !== "") {
            url += `${ids2}/`;
        }

        // Some web services do not have action
        if (typeof action !== "undefined" && action !== null && action !== "") {
            url += action;
        }

        return url;
    }

    _addQueryParams(url, params) {
        // We add the query params formatted in URL
        const queryParamsUrl = this._createQueryParam(params);
        let _url = url;
        if (typeof queryParamsUrl !== "undefined" && queryParamsUrl !== null && queryParamsUrl !== "") {
            _url += `?${queryParamsUrl}`;
        }
        return _url;
    }

    _createQueryParam(params) {
        // Do not remove the sort! we need to sort the array to ensure that the key of the cache will be correct
        let keyArray = _.keys(params);
        let keyValueArray = [];
        for (let i in keyArray) {
            // Whatever it is inside body will be sent hidden via POST
            if (keyArray[i] !== "body") {
                keyValueArray.push(`${keyArray[i]}=${encodeURIComponent(params[keyArray[i]])}`);
            }
        }
        return keyValueArray.join("&");
    }

}

export class MappingClient extends ReactomeParentClass {

    constructor(host) {
        super(host);
    }

    // The lower level pathways where an identifier can be mapped to
    pathways(resource, identifier, params) {
        return this.get(resource, identifier, "pathways", params);
    }

}
