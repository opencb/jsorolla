/*
 * Copyright 2016 OpenCB
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

import {RestClient} from "./rest-client.js";
import {RestResponse} from "./RestResponse.js";

export class OpenCGAClientConfig {

    constructor(host = "172.24.193.208:8080/opencga", version = "v1", useCookies = true, cookiePrefix = "catalog") {
        this.host = host;
        this.version = version;
        this.useCookies = useCookies;
        this.cookiePrefix = cookiePrefix;

        if (this.useCookies) {
            this.setPrefix(cookiePrefix);
        } else {
            this.userId = "";
            this.sessionId = "";
        }
        // default values
        this.rpc = "rest";
    }

    // to allow multiple sessions of IVA
    setPrefix(prefix) {
        this.cookieSessionId = `${prefix}_sid`;
        this.cookieUserId = `${prefix}_userId`;
        this.cookiePassword = `${prefix}_password`;
        this.cookieLoginResponse = `${prefix}_loginResponse`;
    }
}


export class OpenCGAClient {

    constructor(config = {}) {
        this._config = {...this.getDefaultConfig(), ...config};
        this.clients = new Map();
    }

    //TODO remove OpenCGAClientConfig
    getDefaultConfig() {
        return {
            cookiePrefix: "opencga"
        };
    }

    check() {
        // TODO check OpeCGA URL and other variables.
    }

    /*
     * Client singleton functions
     */
    users() {
        if (!this.clients.has("users"))
            this.clients.set("users", new Users(this._config));
        return this.clients.get("users");
    }
    /*users() {
        if (typeof this._users === "undefined") {
            console.log("user client config",this._config)
            this._users = new Users(this._config);
        }
        return this._users;
    }*/

    projects() {
        if (!this.clients.has("projects"))
            this.clients.set("projects", new Projects(this._config));
        return this.clients.get("projects");
    }

    studies() {
        if (!this.clients.has("studies"))
            this.clients.set("studies", new Studies(this._config));
        return this.clients.get("studies");
    }

    files() {
        if (!this.clients.has("files"))
            this.clients.set("files", new Files(this._config));
        return this.clients.get("files");
    }

    jobs() {
        if (!this.clients.has("jobs"))
            this.clients.set("jobs", new Jobs(this._config));
        return this.clients.get("jobs");
    }

    samples() {
        if (!this.clients.has("samples"))
            this.clients.set("samples", new Samples(this._config));
        return this.clients.get("samples");
    }

    cohorts() {
        if (!this.clients.has("cohorts"))
            this.clients.set("cohorts", new Cohorts(this._config));
        return this.clients.get("cohorts");
    }

    individuals() {
        if (!this.clients.has("individuals"))
            this.clients.set("individuals", new Individuals(this._config));
        return this.clients.get("individuals");
    }

    families() {
        if (!this.clients.has("families"))
            this.clients.set("families", new Families(this._config));
        return this.clients.get("families");
    }

    panels() {
        if (!this.clients.has("panels"))
            this.clients.set("panels", new Panels(this._config));
        return this.clients.get("panels");
    }

    meta() {
        if (!this.clients.has("meta"))
            this.clients.set("meta", new Meta(this._config));
        return this.clients.get("meta");
    }

    admin() {
        if (!this.clients.has("admin"))
            this.clients.set("admin", new Admin(this._config));
        return this.clients.get("admin");
    }

    // interpretations() {
    //     if (typeof this._interpretations === "undefined") {
    //         this._interpretations = new Interpretation(this._config);
    //     }
    //     return this._interpretations;
    // }

    // variables() {
    //     if (typeof this._variables === "undefined") {
    //         this._variables = new Variables(this._config);
    //     }
    //     return this._variables;
    // }

    // Analysis
    //TODO change class to plural
    alignments() {
        if (!this.clients.has("alignments"))
            this.clients.set("alignments", new Alignment(this._config));
        return this.clients.get("alignments");
    }

    variants() {
        if (!this.clients.has("variants"))
            this.clients.set("variants", new Variant(this._config));
        return this.clients.get("variants");
    }

    clinical() {
        if (!this.clients.has("clinical"))
            this.clients.set("clinical", new Clinical(this._config));
        return this.clients.get("clinical");
    }

    variantOperations() {
        if (!this.clients.has("variantOperations"))
            this.clients.set("variantOperations", new VariantOperations(this._config));
        return this.clients.get("variantOperations");
    }

    // GA4GH
    ga4gh() {
        if (!this.clients.has("ga4gh"))
            this.clients.set("ga4gh", new Ga4gh(this._config));
        return this.clients.get("ga4gh");
    }

    async login(userId, password) {

        try {
            /*if (this._config.useCookies) {
                let cookieSession = Cookies.get(this._config.cookieSessionId);
                let cookieUser = Cookies.get(this._config.cookieUserId);
                let cookiePass = Cookies.get(this._config.cookiePassword);
                let loginResponse = Cookies.get(this._config.cookieLoginResponse);

                if (cookieUser !== undefined && cookieUser === userId && cookiePass !== undefined && cookiePass === encryptedPass
                    && cookieSession !== undefined && loginResponse !== undefined) {
                    console.log("Credentials taken from cookies");
                    return Promise.resolve(JSON.parse(loginResponse));
                }
            }*/
            const response = await this.users().login(userId, password);
            const restResponse = new RestResponse(response);
            const encryptedPass = CryptoJS.SHA256(password).toString();

            //TODO search for Errors in restResponse.events
            //TODO if password is not defined use token?
            this._config.userId = userId;
            this._config.sessionId = restResponse.getResult(0).token;

            // Cookies being used
            if (this._config.useCookies) {
                console.log("Cookies being used");
                Cookies.set(this._config.cookieSessionId, this._config.sessionId);
                Cookies.set(this._config.cookieUserId, userId);
                //Cookies.set(this._config.cookiePassword, encryptedPass);
                //Cookies.set(this._config.cookieLoginResponse, JSON.stringify(response));
            }

            this.clients.forEach(client => client.setToken(this._config.sessionId));
            return restResponse;

        } catch (e) {
            console.error(e);

        }
    }

    // refresh only works if cookies are enabled
    async refresh() {
        let userId = this.getUserId();
        const response = await this.users().login(userId);
        const restResponse = new RestResponse(response);
        if (this._config.useCookies) {
            this._config.sessionId = restResponse.getResult(0).token;
            Cookies.set(this._config.cookieSessionId, this._config.sessionId);
            Cookies.set(this._config.cookieUserId, userId);
            //Cookies.set(this._config.cookiePassword, encryptedPass);
            //Cookies.set(this._config.cookieLoginResponse, JSON.stringify(response));
        }
        this.clients.forEach(client => client.setToken(this._config.sessionId));
        return restResponse;
    }

    logout() {
        this._config.userId = "";
        this._config.sessionId = "";

        // Remove cookies
        if (this._config.cookieUserId) {
            delete this._config.userId;
            delete  this._config.sessionId;

            Cookies.expire(this._config.cookieSessionId);
            Cookies.expire(this._config.cookieUserId);
            Cookies.expire(this._config.cookiePassword);
            Cookies.expire(this._config.cookieLoginResponse);
        }
        return Promise.resolve();
    }

    /**
     * Creates and return an anonymous session object, it is a sync function.
     */
    createAnonymousSession() {
        let opencgaSession = {};
        opencgaSession.user = {
            id: "anonymous", projects: []
        };
        opencgaSession.token = "";
        opencgaSession.date = new Date().toISOString();
        opencgaSession.server = {
            host: this._config.host,
            version: this._config.version
        };
        opencgaSession.opencgaClient = this;

        return opencgaSession;
    }

    /**
     * Creates an authenticated session for the user and token of the current OpenCGAClient. The token is taken from the
     * opencgaClient object itself.
     * @returns {Promise<any>}
     */

    //TODO refactor
    createSession() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            // check that a session exists
            // TODO should we check the session has not expired?
            if (UtilsNew.isNotUndefined(_this._config.sessionId)) {
                _this.users().info()
                    .then(function(response) {
                        let session = {};
                        console.log("response",response)
                        session.user = response.response[0].result[0];
                        session.token = _this._config.sessionId;
                        session.date = new Date().toISOString();
                        session.server = {
                            host: _this._config.host,
                            version: _this._config.version,
                            serverVersion: _this._config.serverVersion
                        };
                        session.opencgaClient = _this;

                        // Fetch authorised Projects and Studies
                        _this.projects().search({})
                            .then(function(response) {
                                console.log("response",response)
                                let res = new RestResponse(response);
                                session.projects = response.response[0].result;
                                if (UtilsNew.isNotEmptyArray(session.projects) && UtilsNew.isNotEmptyArray(session.projects[0].studies)) {
                                    let studies = [];
                                    // FIXME This is needed to keep backward compatibility with OpenCGA 1.3.x
                                    for (let project of session.projects) {
                                        project.alias = project.alias || project.fqn || null;
                                        if (project.studies !== undefined) {
                                            for (let study of project.studies) {
                                                // If study.alias does not exist we are NOT in version 1.3, we set fqn from 1.4
                                                if (study.alias === undefined || study.alias === "") {
                                                    if (study.fqn.includes(":")) {
                                                        study.alias = study.fqn.split(":")[1];
                                                    } else {
                                                        study.alias = study.fqn;
                                                    }
                                                }
                                                // Keep track of the studies to fetch Disease Panels
                                                studies.push(project.id + ":" + study.id);
                                            }
                                        }
                                    }

                                    // this sets the current active project and study
                                    session.project = session.projects[0];
                                    session.study = session.projects[0].studies[0];

                                    // Fetch the Disease Panels for each Study
                                    let panelPromises = [];
                                    for (let study of studies) {
                                        let promise = _this.panels().search({
                                            study: study,
                                            include: "id,name,stats,source,genes.id,genes.name,regions.id"
                                        }).then(function(response) {
                                            return new RestResponse(response).getResult(0);
                                        });
                                        panelPromises.push(promise);
                                    }

                                    Promise.all(panelPromises)
                                        .then(function(values) {
                                            let studiesMap = {};
                                            for (let i = 0; i < studies.length; i++) {
                                                studiesMap[studies[i]] = values[i];
                                            }
                                            // This set the panels in the object reference of the session object
                                            for (let project of session.projects) {
                                                for (let study of project.studies) {
                                                    study.panels = studiesMap[project.id + ":" + study.id];
                                                }
                                            }
                                        });
                                }
                                resolve(session);
                            })
                            .catch(function(response) {
                                reject({message: "An error when getting projects", value: response});
                            });
                    });
            } else {
                reject({message: "No valid token", value: _this._config.sessionId});
            }
        });
    }

    checkCookie() {

    }

    //TODO remove setter
    getConfig() {
        return this._config;
    }

    setConfig(config) {
        this._config = config;
    }

    getUserId() {
        if (this._config.hasOwnProperty("cookieUserId")) { // The app is using cookies
            return Cookies.get(this._config.cookieUserId);
        } else {
            if (this._config.hasOwnProperty("userId")) {
                return this._config.userId;
            }
        }
        return undefined;
    }

    getToken() {
        if (this._config.hasOwnProperty("cookieSessionId")) { // The app is using cookies
            return Cookies.get(this._config.cookieSessionId);
        } else {
            if (this._config.hasOwnProperty("sessionId")) {
                return this._config.sessionId;
            }
        }
        return undefined;
    }
}
//TODO OpenCGAClient maybe should be a singleton exported module..
//Object.freeze(OpenCGAClient);

// parent class
class OpenCGAParentClass {

    constructor(config) {
        if (config === "undefined") {
            this._config = new OpenCGAClientConfig();
        } else {
            this._config = config;
        }
        this.token = null;
    }

    post(category, ids, action, params, body, options) {
        return this.extendedPost(category, ids, null, null, action, params, body, options);
    }

    extendedPost(category1, ids1, category2, ids2, action, params = {}, body, options = {}) {
        const host = this._config.host;
        const version = this._config.version;
        const rpc = this._config.rpc;
        let _options = {...options, method: "POST"};
        if(this._config.sessionId) {
            _options.sid = this._config.sessionId;
        }
        let _params = {...params, body: body};
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
            console.error("rpc NON-REST")
        }
    }

    get(category, ids, action, params, options) {
        return this.extendedGet(category, ids, null, null, action, params, options);
    }

    extendedGet(category1, ids1, category2, ids2, action, params, options) {
        // we store the options from the parameter or from the default values in config
        const host = this._config.host;
        const version = this._config.version;
        const rpc = this._config.rpc;
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

    _getUserId() {
        if (this._config.hasOwnProperty("cookieUserId")) { // The app is using cookies
            return Cookies.get(this._config.cookieUserId);
        } else if (this._config.hasOwnProperty("userId")) {
            return this._config.userId;
        }
        return undefined;
    }

    _getSessionId() {
        if (this._config.hasOwnProperty("cookieSessionId")) { // The app is using cookies
            return Cookies.get(this._config.cookieSessionId);
        } else if (this._config.hasOwnProperty("sessionId")) {
            return this._config.sessionId;
        }
        return undefined;
    }

    setToken(token) {
        this.token = token;
        this._config.sessionId = token;
    }

    getToken() {
        return this.token;
    }

}

/*class Acls extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}*/

class Users extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body) {
        return this.post("users", undefined, "create", params, body);
    }

    login(userId, password) {
        return this.extendedPost("users", userId, null, null, "login", {}, password ? {password: password} : {});
    }

    /*login(userId, password) {
        let params = {
            body: {
                password: password
            }
        };
        let options = {
            method: "POST"
        };
        // Encrypt password
        let encryptedPass = CryptoJS.SHA256(password).toString();

        if (this._config.useCookies) {
            let cookieSession = Cookies.get(this._config.cookieSessionId);
            let cookieUser = Cookies.get(this._config.cookieUserId);
            let cookiePass = Cookies.get(this._config.cookiePassword);
            let loginResponse = Cookies.get(this._config.cookieLoginResponse);

            if (cookieUser !== undefined && cookieUser === userId && cookiePass !== undefined && cookiePass === encryptedPass
                && cookieSession !== undefined && loginResponse !== undefined) {
                console.log("Credentials taken from cookies");
                return Promise.resolve(JSON.parse(loginResponse));
            }
        }
        return this.get("users", userId, "login", params, options).then(function(response) {
            if (response.error === "") {
                this._config.userId = userId;
                this._config.sessionId = response.response[0].result[0].id;

                // Cookies being used
                if (this._config.useCookies) {
                    Cookies.set(this._config.cookieSessionId, response.response[0].result[0].id);
                    Cookies.set(this._config.cookieUserId, userId);
                    Cookies.set(this._config.cookiePassword, encryptedPass);
                    Cookies.set(this._config.cookieLoginResponse, JSON.stringify(response));
                }

                return response;
            }
        }.bind(this));
    }*/

    /*// refresh only works if cookies are enabled
    refresh() {
        let userId = this._getUserId();

        return this.post("users", userId, "login", {}, {}).then(function(response) {
            if (response.error === "") {
                if (this._config.useCookies) {
                    // Cookies being used
                    Cookies.set(this._config.cookieSessionId, response.response[0].result[0].id);
                    Cookies.set(this._config.cookieUserId, userId);
                    Cookies.set(this._config.cookieLoginResponse, JSON.stringify(response));
                    console.log("Cookies properly set");
                }
                this._config.sessionId = response.response[0].result[0].id;
                this._config.userId = userId;

                return response;
            }
        }.bind(this));
    }*/

    /*logout() {
        this._config.userId = "";
        this._config.sessionId = "";

        // Remove cookies
        if (this._config.cookieUserId) {
            Cookies.expire(this._config.cookieSessionId);
            Cookies.expire(this._config.cookieUserId);
            Cookies.expire(this._config.cookiePassword);
            Cookies.expire(this._config.cookieLoginResponse);
        }

        return Promise.resolve();
    }*/

    changeEmail(newMail) {
        let params = {
            nemail: newMail
        };
        return this.extendedGet("users", this._getUserId(), null, null, "change-email", params);
    }

    update(params, body, options) {
        return this.extendedPost("users", this._getUserId(), null, null, "update", params, body, options);
    }

    resetPassword() {
        return this.extendedGet("users", this._getUserId(), null, null, "reset-password");
    }

    info(params, options) {
        return this.extendedGet("users", this._getUserId(), null, null, "info", params, options);
    }

    getProjects(userId, params, options) {
        return this.extendedGet("users", userId, null, null, "projects", params, options);
    }

    remove(userId, params, options) {
        return this.extendedGet("users", userId, null, null, "delete", params, options);
    }

    // Filters
    getFilters(params, options) {
        let subCat = (options.serverVersion !== undefined && options.serverVersion === "1.3") ? "list" : "";
        return this.extendedGet("users", this._getUserId(), "configs/filters", undefined, subCat, params, options);
    }

    getFilter(filter, params, options) {
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "info", params, options);
    }

    createFilter(params, options) {
        let _params = Object.assign({}, params);
        let _options = Object.assign({}, options);

        if (!_params.hasOwnProperty("body")) {
            _params = {
                body: _params
            };
        }
        _options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs/filters", undefined, "create", _params, _options);
    }

    updateFilter(filter, params, options) {
        let _params = Object.assign({}, params);
        let _options = Object.assign({}, options);

        if (!_params.hasOwnProperty("body")) {
            _params = {
                body: _params
            };
        }
        _options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "update", _params, _options);
    }

    updateFilters(action, params, options) {
        let _action = action;
        let _params = Object.assign({}, params);
        let _options = Object.assign({}, options);

        if (_action === undefined || _action === "") {
            _action = "ADD";
        }

        if (!_params.hasOwnProperty("body")) {
            _params = {
                action: _action,
                body: _params
            };
        }
        _options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs/filters", undefined, "update", _params, _options);
    }

    deleteFilter(filter) {
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "delete", undefined, undefined);
    }

    // Configs
    getConfig(name, params, options) {
        return this.extendedGet("users", this._getUserId(), "configs", name, "info", params, options);
    }

    updateConfig(name, params, options) {
        let _params = Object.assign({}, params);
        let _options = Object.assign({}, options);

        if (!_params.hasOwnProperty("body")) {
            _params = {
                body: _params
            };
        }
        _params.name = name;
        _options.method = "POST";
        return this.extendedGet("users", this._getUserId(), "configs", undefined, "create", _params, _options);
    }

    deleteConfig(name) {
        return this.extendedGet("users", this._getUserId(), "configs", name, "delete", undefined, undefined);
    }

}

class Projects extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("projects", undefined, "create", params, body, options);
    }

    info(ids, params, options) {
        return this.get("projects", ids, "info", params, options);
    }

    aggregationStats(ids, params, options) {
        return this.get("projects", ids, "stats", params, options);
    }

    search(params, options) {
        return this.get("projects", undefined, "search", params, options);
    }

    getStudies(id, params, options) {
        return this.get("projects", id, "studies", params, options);
    }

    update(ids, params, body, options) {
        return this.post("projects", ids, "update", params, body, options);
    }

    remove(ids, params, options) {
        return this.get("projects", ids, "delete", params, options);
    }

}

class Studies extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("studies", undefined, "create", params, body, options);
    }

    remove(id, params, options) {
        return this.get("studies", id, "delete", params, options);
    }

    info(id, params, options) {
        return this.get("studies", id, "info", params, options);
    }

    aggregationStats(ids, params, options) {
        return this.get("studies", ids, "stats", params, options);
    }

    /*
    * @deprecated since version 1.4.0. Use stats instead.
    * */
    summary(id, params, options) {
        return this.get("studies", id, "summary", params, options);
    }

    search(params, options) {
        return this.get("studies", undefined, "search", params, options);
    }

    /*
    * @deprecated since version 1.4.0. Use files().search() instead.
    * */
    getFiles(id, params, options) {
        return this.get("studies", id, "files", params, options);
    }

    /*
    * @deprecated since version 1.4.0. Use jobs().search() instead.
    * */
    getJobs(id, params, options) {
        return this.get("studies", id, "jobs", params, options);
    }

    /*
    * @deprecated since version 1.4.0. Use samples().search() instead.
    * */
    getSamples(id, params, options) {
        return this.get("studies", id, "samples", params, options);
    }

    getGroups(id, params) {
        return this.get("studies", id, "groups", params);
    }

    getVariableSets(id, params) {
        return this.get("studies", id, "variableSets", params);
    }

    createGroup(id, params, body, options) {
        return this.extendedPost("studies", id, "groups", undefined, "create", params, body, options);
    }

    deleteGroup(id, groupId) {
        return this.extendedGet("studies", id, "groups", groupId, "delete");
    }

    updateGroup(id, groupId, params, body, options) {
        return this.extendedPost("studies", id, "groups", groupId, "update", params, body, options);
    }

    updateVariableSets(id, params, body) {
        return this.extendedPost("studies", id, "variableSets", undefined, "update", params, body, {});
    }

    updateVariableSetVariables(id, variableSet, params, body) {
        return this.extendedPost("studies", id, "variableSets", variableSet, "variables/update", params, body, {});
    }

    update(id, params, body, options) {
        return this.post("studies", id, "update", params, body, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

    /*
    * @deprecated since version 1.4.0. Use variants().query() instead.
    * */
    getVariants(id, params, options) {
        return this.get("studies", id, "variants", params, options);
    }

    /*
    * @deprecated since version 1.4.0. Use alignments().query() instead.
    * */
    getAlignments(id, params, options) {
        return this.get("studies", id, "alignments", params, options);
    }

}

class Files extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    search(params, options) {
        return this.extendedGet("files", undefined, null, null, "search", params, options);
    }

    aggregationStats(params, options) {
        return this.extendedGet("files", undefined, null, null,"aggregationStats", params, options);
    }

    link(params, options) {
        return this.get("files", undefined, "link", params, options);
    }

    info(id, params, options) {
        return this.get("files", id, "info", params, options);
    }

    groupBy(params, options) {
        return this.get("files", undefined, "groupBy", params, options);
    }

    treeView(id, params, options) {
        return this.get("files", id, "tree-view", params, options);
    }

    refresh(id, params, options) {
        return this.get("files", id, "refresh", params, options);
    }

    download(id, params, options) {
        return this.get("files", id, "download", params, options);
    }

    content(id, params, options) {
        return this.get("files", id, "content", params, options);
    }

    grep(id, params, options) {
        return this.get("files", id, "grep", params, options);
    }

    getAllBioFormats(params, options) {
        return this.get("files", undefined, "bioformats", params, options);
    }

    getAllFormats(params, options) {
        return this.get("files", undefined, "formats", params, options);
    }

    create(params, body, options) {
        return this.post("files", undefined, "create", params, body, options);
    }

    list(folderId, params, options) {
        return this.get("files", folderId, "list", params, options);
    }

    index(id, params, options) {
        return this.get("files", id, "index", params, options);
    }

    getAlignments(id, params, options) {
        return this.get("files", id, "alignments", params, options);
    }

    getVariants(id, params, options) {
        return this.get("files", id, "variants", params, options);
    }

    remove(id, params, options) {
        return this.get("files", id, "delete", params, options);
    }

    update(id, params, body, options) {
        return this.post("files", id, "update", params, body, options);
    }

    relink(id, params, options) {
        return this.get("files", id, "relink", params, options);
    }

    upload(params, options) {
        return this.post("files", undefined, "upload", undefined, params, options);
    }

    updateAnnotationSetAnnotations(id, annotationSet, params, body) {
        return this.extendedPost("files", id, "annotationSets", annotationSet, "annotations/update", params, body, {});
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}

class Jobs extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("jobs", undefined, "create", params, body, options);
    }

    visit(id, params, options) {
        return this.get("jobs", id, "visit", params, options);
    }

    groupBy(params, options) {
        return this.get("jobs", undefined, "groupBy", params, options);
    }

    info(id, params, options) {
        return this.get("jobs", id, "info", params, options);
    }

    remove(id, params, options) {
        return this.get("jobs", id, "delete", params, options);
    }

    search(params, options) {
        return this.get("jobs", undefined, "search", params, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}

class Individuals extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("individuals", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("individuals", undefined, "search", params, options);
    }

    aggregationStats(params, options) {
        return this.get("individuals", undefined, "stats", params, options);
    }

    info(id, params, options) {
        return this.get("individuals", id, "info", params, options);
    }

    update(id, params, body, options) {
        return this.post("individuals", id, "update", params, body, options);
    }

    remove(id, params, options) {
        return this.get("individuals", id, "delete", params, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsCreate(id, params, body, options) {
        return this.post("individuals", id, "annotationSets/create", params, body, options);
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("individuals", id, "annotationSets", name, "update", params, body, options);
    }

    updateAnnotationSetAnnotations(id, annotationSet, params, body) {
        return this.extendedPost("individuals", id, "annotationSets", annotationSet, "annotations/update", params, body, {});
    }

}

class Families extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("families", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("families", undefined, "search", params, options);
    }

    aggregationStats(params, options) {
        return this.get("families", undefined, "stats", params, options);
    }

    info(id, params, options) {
        return this.get("families", id, "info", params, options);
    }

    update(id, params, body, options) {
        return this.post("families", id, "update", params, body, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

    updateAnnotationSetAnnotations(id, annotationSet, params, body) {
        return this.extendedPost("families", id, "annotationSets", annotationSet, "annotations/update", params, body, {});
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsCreate(id, params, body, options) {
        return this.post("families", id, "annotationsets/create", params, body, options);
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("families", id, "annotationsets", name, "update", params, body, options);
    }


}

class Samples extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("samples", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("samples", undefined, "search", params, options);
    }

    aggregationStats(params, options) {
        return this.get("samples", undefined, "stats", params, options);
    }

    groupBy(params, options) {
        return this.get("samples", undefined, "groupBy", params, options);
    }

    load(params, options) {
        return this.get("samples", undefined, "load", params, options);
    }

    info(id, params, options) {
        return this.get("samples", id, "info", params, options);
    }

    update(id, params, body, options) {
        return this.post("samples", id, "update", params, body, options);
    }

    remove(id, params, options) {
        return this.get("samples", id, "delete", params, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

    updateAnnotationSetAnnotations(id, annotationSet, params, body) {
        return this.extendedPost("samples", id, "annotationSets", annotationSet, "annotations/update", params, body, {});
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsCreate(id, params, body, options) {
        return this.post("samples", id, "annotationsets/create", params, body, options);
    }

    /*
    * @deprecated since version 1.4.0. Use update() instead.
    * */
    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("samples", id, "annotationsets", name, "update", params, body, options);
    }



}

/*
* @deprecated since version 1.4.0. Use studies() instead.
* */
class Variables extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("variableset", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("variableset", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("variableset", id, "info", params, options);
    }

    summary(id) {
        return this.get("variableset", id, "summary", {}, {});
    }

    update(id, params, body, options) {
        return this.post("variableset", id, "update", params, body, options);
    }

    remove(id, params, options) {
        return this.get("variableset", id, "delete", params, options);
    }

}

class Cohorts extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("cohorts", undefined, "create", params, body, options);
    }

    aggregationStats(params, options) {
        return this.get("cohorts", undefined, "stats", params, options);
    }

    search(params, options) {
        return this.get("cohorts", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("cohorts", id, "info", params, options);
    }

    getSamples(id, params) {
        return this.get("cohorts", id, "samples", params);
    }

    update(id, params, body, options) {
        return this.post("cohorts", id, "update", params, body, options);
    }

    remove(id, params, options) {
        return this.get("cohorts", id, "delete", params, options);
    }

    annotationsetsCreate(id, params, body, options) {
        return this.post("cohorts", id, "annotationsets/create", params, body, options);
    }

    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("cohorts", id, "annotationsets", name, "update", params, body, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }
}

class Panels extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("panels", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("panels", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("panels", id, "info", params, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}

class Clinical extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("analysis/clinical", undefined, "create", params, body, options);
    }

    update(id, params, body, options) {
        return this.post("analysis/clinical", id, "update", params, body, options);
    }

    info(id, params, options) {
        return this.get("analysis/clinical", id, "info", params, options);
    }

    search(params, options) {
        return this.get("analysis/clinical", undefined, "search", params, options);
    }

    getAcl(category, id, params) {
        return this.extendedGet(category, id, null,null, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}

class Interpretation extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(clinicalAnalysis, params, body, options) {
        let _params = Object.assign({}, params);
        _params["action"] = "ADD";
        return this.extendedPost("analysis/clinical", clinicalAnalysis, "interpretations", undefined, "update", _params, body, options);
    }
}

class Alignment extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    query(id, params, options) {
        if (params === undefined) {
            params = {};
        }
        params["file"] = id;
        return this.get("analysis/alignment", undefined, "query", params, options);
    }

    aggregationStats(id, params, options) {
        if (params === undefined) {
            params = {};
        }
        params["file"] = id;
        return this.get("analysis/alignment", undefined, "stats", params, options);
    }

    coverage(id, params, options) {
        let _params = params;
        if (_params === undefined) {
            _params = {};
        }
        _params.file = id;
        return this.get("analysis/alignment", undefined, "coverage", _params, options);
    }

    lowCoverage(id, params, options) {
        let _params = params;
        if (_params === undefined) {
            _params = {};
        }
        _params.file = id;
        return this.get("analysis/alignment", undefined, "lowCoverage", _params, options);
    }

}

class Variant extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    metadata(params, options) {
        return this.get("analysis/variant", undefined, "metadata", params, options);
    }

    query(params, options) {
        return this.get("analysis/variant", undefined, "query", params, options);
    }

    facet(params, options) {
        return this.get("analysis/variant", undefined, "facet", params, options);
    }

    // stats(params, options) {
    //     return this.get("analysis/variant", undefined, "stats", params, options);
    // }

    aggregationStats(params, options) {
        return this.get("analysis/variant", undefined, "stats", params, options);
    }

    samples(params, options) {
        return this.get("analysis/variant", undefined, "samples", params, options);
    }

    sampleData(variantId, params, options) {
        return this.get("analysis/variant", variantId, "sampleData", params, options);
    }

    index(params, options) {
        return this.get("analysis/variant", undefined, "index", params, options);
    }

    familyGenotypes(params, options) {
        return this.get("analysis/variant", undefined, "familyGenotypes", params, options);
    }

}

class Ga4gh extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    beacon(params, options) {
        return this.get("ga4gh", undefined, "responses", params, options);
    }

}
