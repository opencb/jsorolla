// parent class
import {RestClient} from "../rest-client.js";

export default class OpenCGAParentClass {

    constructor(config) {
        this._config = config;
        // this.token = null;
    }


    _post(category, ids, category2, ids2, action, body, params) {
        return this.extendedPost(category, ids, category2, ids2, action, params, body);
    }

    _get(category, ids, category2, ids2, action, params) {
        return this.extendedGet(category, ids, category2, ids2, action, params);
    }

    // TODO
    _delete(category, ids, category2, ids2, action, params) {
        return this.__delete(category, ids, category2, ids2, action, params);
    }

    post(category, ids, action, params, body, options) {
        return this.extendedPost(category, ids, null, null, action, params, body, options);
    }

    extendedPost(category1, ids1, category2, ids2, action, params = {}, body, options = {}) {
        const host = this._config.host;
        const version = this._config.version;
        const rpc = this._config.mode;
        const _options = {...options, method: "POST"};
        if (this._config.token) {
            _options.sid = this._config.token;
            _options.token = this._config.token;
        }
        const _params = {...params, body: body};
        if (rpc.toLowerCase() === "rest") {
            let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action);
            url = this._addQueryParams(url, _params);
            _options.data = _params.body;
            if (action === "upload") {
                _options["post-method"] = "form";
            }
            // console.log(`OpenCGA client calling to ${url}`);
            // if the URL query fails we try with next host
            return RestClient.call(url, _options);
        } else {
            console.error("rpc NON-REST");
        }
    }

    get(category, ids, action, params, options) {
        return this.extendedGet(category, ids, null, null, action, params, options);
    }

    extendedGet(category1, ids1, category2, ids2, action, params, options) {
        // we store the options from the parameter or from the default values in config
        const host = this._config.host;
        const version = this._config.version;
        const rpc = this._config.mode;
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

        // Check that sessionId is being given
        if (!_params.hasOwnProperty("sid")) {
            const sid = this._getSessionId();
            if (typeof sid !== "undefined") {
                _options.sid = sid;
                _options.token = sid;
            }
        }

        // If category == users and userId is not given, we try to set it
        if (category1 === "users" && (ids1 === undefined || ids1 === null || ids1 === "")) {
            ids1 = this._getUserId();
        }

        if (rpc.toLowerCase() === "rest") {
            let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action);
            // if (method === "GET") {
            url = this._addQueryParams(url, _params);
            if (method === "POST") {
                _options.data = _params.body;
                if (action === "upload") {
                    _options["post-method"] = "form";
                }
            }
            // console.log(`OpenCGA client calling to ${url}`);
            // if the URL query fails we try with next host
            return RestClient.call(url, _options);
        }
    }

    _createRestUrl(host, version, category1, ids1, category2, ids2, action) {
        let url = host + `/webservices/rest/${version}/${category1}/`;
        // By default we assume https protocol instead of http
        if (!url.startsWith("https://") && !url.startsWith("http://")) {
            url = `https://${host}/webservices/rest/${version}/${category1}/`;
        }

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

        url += action;

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
        const keyArray = _.keys(params);
        const keyValueArray = [];
        for (const i in keyArray) {
            // Whatever it is inside body will be sent hidden via POST
            if (keyArray[i] !== "body") {
                keyValueArray.push(`${keyArray[i]}=${encodeURIComponent(params[keyArray[i]])}`);
            }
        }
        return keyValueArray.join("&");
    }

    _getUserId() {
        this._config.userId;
    }

    _getSessionId() {
        return this._config.token;
    }

    setToken(token) {
        // this.token = token;
        this._config.token = token;
    }

    getToken() {
        return this._config.token;
    }

}
