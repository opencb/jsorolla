// parent class
import RestClient from "../rest-client.js";

export default class OpenCGAParentClass {

    constructor(config) {
        this._config = config;
        // this.token = null;
        this.restClient = new RestClient();
    }

    _get(category1, ids1, category2, ids2, action, params, options) {
        // we store the options from the parameter or from the default values in config

        // first attempt of solving https://github.com/opencb/jsorolla/issues/153
        // cannot use `params` in key as we want to cancel queries from the same origin (ajax function) but different params.
        const k = this.generateKey(params);

        const host = this._config.host;
        const version = this._config.version;
        // const rpc = this._config.mode;
        const _options = options || {};

        const method = _options?.method || "GET";

        const _params = params || {};

        // Check that sessionId is being given
        if (!_params.sid) {
            const sid = this._getSessionId();
            if (typeof sid !== "undefined") {
                _options.sid = sid;
                _options.token = sid;
            }
        }
        // CAUTION Vero 2024-05-10: We believe this bit of code is useless. Temporarily commented out.
        //  In users endpoint, we cannot find GET method where the path param {user/users} should be autocompleted.
        //  When needed, they should be explicitly set.
        // If category == users and userId is not given, we try to set it
        // if (category1 === "users" && (ids1 === undefined || ids1 === null || ids1 === "")) {
        //     ids1 = this._getUserId();
        // }

        let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action);
        // if (method === "GET") {
        url = this._addQueryParams(url, _params);
        if (method === "POST") {
            _options.data = _params.body;
            if (action === "upload") {
                _options["post-method"] = "form";
            }
        }

        // Enable credentials
        _options.includeCredentials = !!this._config?.sso?.active;

        // console.log(`OpenCGA client calling to ${url}`);
        // if the URL query fails we try with next host
        return this.restClient.call(url, _options, k);

    }

    _post(category1, ids1, category2, ids2, action, body, params = {}, options = {}) {
        const host = this._config.host;
        const version = this._config.version;
        // const rpc = this._config.mode;
        const k = this.generateKey(params);
        const _options = {...options, method: "POST"};
        if (this._config.token) {
            _options.sid = this._config.token;
            _options.token = this._config.token;
        }
        const _params = {...params, body: body}; // body as param?
        let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action);
        url = this._addQueryParams(url, _params);
        _options.data = _params.body;
        if (action === "upload") {
            _options["post-method"] = "form";
        }

        // Enable credentials
        _options.includeCredentials = !!this._config?.sso?.active;

        return this.restClient.call(url, _options, k);
    }

    // recheck
    _delete(category1, ids1, category2, ids2, action, body, params = {}) {
        const host = this._config.host;
        const version = this._config.version;
        const _options = {method: "DELETE"};
        const k = this.generateKey(params);
        if (this._config.token) {
            // _options.sid = this._config.token;
            _options.token = this._config.token;
        }
        // const _params = {...params, body: body};
        const _params = {...params, ...body};
        let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action);
        url = this._addQueryParams(url, _params);
        // _options.data = _params.body;
        // _options.body = _params.body;

        // Enable credentials
        _options.includeCredentials = !!this._config?.sso?.active;

        return this.restClient.call(url, _options, k);
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
        const keyArray = Object.keys(params);
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
        return this._config.userId;
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

    generateKey() {
        // Josemi 2022-04-22 NOTE: disabled key generation. See task https://app.clickup.com/t/36631768/TASK-670
        // return params?.concurrent !== true ? `${new Error().stack.split("\n    at ").slice(0, 5).join("|")}${params?.study}` : false;
        return "";
    }

}
