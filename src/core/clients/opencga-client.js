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

class OpenCGAClientConfig {

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

    setPrefix(prefix) {
        this.cookieSessionId = `${prefix}_sid`;
        this.cookieUserId = `${prefix}_userId`;
        this.cookiePassword = `${prefix}_password`;
        this.cookieLoginResponse = `${prefix}_loginResponse`;
    }

}

class OpenCGAClient {

    constructor(config) {
        this._config = config;
    }

    /*
     * Client factory functions
     */
    users() {
        if (typeof this._users === "undefined") {
            this._users = new Users(this._config);
        }
        return this._users;
    }

    projects() {
        if (typeof this._projects === "undefined") {
            this._projects = new Projects(this._config);
        }
        return this._projects;
    }

    studies() {
        if (typeof this._studies === "undefined") {
            this._studies = new Studies(this._config);
        }
        return this._studies;
    }

    files() {
        if (typeof this._files === "undefined") {
            this._files = new Files(this._config);
        }
        return this._files;
    }

    jobs() {
        if (typeof this._jobs === "undefined") {
            this._jobs = new Jobs(this._config);
        }
        return this._jobs;
    }

    samples() {
        if (typeof this._samples === "undefined") {
            this._samples = new Samples(this._config);
        }
        return this._samples;
    }

    individuals() {
        if (typeof this._individuals === "undefined") {
            this._individuals = new Individuals(this._config);
        }
        return this._individuals;
    }

    families() {
        if (typeof this._families === "undefined") {
            this._families = new Families(this._config);
        }
        return this._families;
    }

    cohorts() {
        if (typeof this._cohorts === "undefined") {
            this._cohorts = new Cohorts(this._config);
        }
        return this._cohorts;
    }

    panels() {
        if (typeof this._panels === "undefined") {
            this._panels = new Panels(this._config);
        }
        return this._panels;
    }

    clinical() {
        if (typeof this._clinical === "undefined") {
            this._clinical = new Clinical(this._config);
        }
        return this._clinical;
    }

    variables() {
        if (typeof this._variables === "undefined") {
            this._variables = new Variables(this._config);
        }
        return this._variables;
    }

    // Analysis
    alignments() {
        if (typeof this._alignments === "undefined") {
            this._alignments = new Alignment(this._config);
        }
        return this._alignments;
    }

    variants() {
        if (typeof this._variants === "undefined") {
            this._variants = new Variant(this._config);
        }
        return this._variants;
    }

    // GA4GH
    ga4gh() {
        if (typeof this._ga4gh === "undefined") {
            this._ga4gh = new Ga4gh(this._config);
        }
        return this._ga4gh;
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
    createSession() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            // check that a session exists
            // TODO sould we check the session has not expired?
            if (UtilsNew.isNotUndefined(_this._config.sessionId)) {
                _this.users().info()
                    .then(function(response) {
                        let session = {};
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
                            .then(function (response) {
                                session.projects = response.response[0].result;
                                if (UtilsNew.isNotEmptyArray(session.projects) && UtilsNew.isNotEmptyArray(session.projects[0].studies)) {
                                    // FIXME This is need to keep backward compatibility with OpenCGA 1.3.x
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
                                            }
                                        }
                                    }

                                    // this sets the current active project and study
                                    session.project = session.projects[0];
                                    session.study = session.projects[0].studies[0];
                                }

                                resolve(session);
                            })
                            .catch(function (response) {
                                reject({message: "An error when getting projects", value: response});
                            });
                    });
            } else {
                reject({message: "No valid token", value: _this._config.sessionId});
            }
        });
    }

    /*
     * Getter and setters
     */
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

// parent class
class OpenCGAParentClass {

    constructor(config) {
        if (typeof config === "undefined") {
            this._config = new OpenCGAClientConfig();
        } else {
            this._config = config;
        }
    }

    post(category, ids, action, params, body, options) {
        return this.extendedPost(category, ids, null, null, action, params, body, options);
    }

    extendedPost(category1, ids1, category2, ids2, action, params, body, options) {
        let _options = options;
        if (typeof _options === "undefined") {
            _options = {};
        }
        _options.method = "POST";
        let _params = params;

        if (typeof _params === "undefined") {
            _params = {};
        }
        _params.body = body;
        return this.extendedGet(category1, ids1, category2, ids2, action, _params, _options);
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
            return RestClient.callPromise(url, _options);
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

}

class Acls extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    getAcl(category, id, params) {
        return this.get(category, id, "acl", params);
    }

    updateAcl(category, members, params, body) {
        return this.extendedPost(category, null, "acl", members, "update", params, body);
    }

}

class Users extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, body) {
        return this.post("users", undefined, "create", params, body);
    }

    login(userId, password) {
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
    }

    // refresh only works if cookies are enabled
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
    }

    logout() {
        this._config.userId = "";
        this._config.sessionId = "";

        // Remove cookies
        if (this._config.hasOwnProperty("cookieUserId")) {
            Cookies.expire(this._config.cookieSessionId);
            Cookies.expire(this._config.cookieUserId);
            Cookies.expire(this._config.cookiePassword);
            Cookies.expire(this._config.cookieLoginResponse);
        }

        return Promise.resolve();
    }

    changeEmail(newMail) {
        let params = {
            nemail: newMail
        };
        return this.get("users", this._getUserId(), "change-email", params);
    }

    update(params, body, options) {
        return this.post("users", this._getUserId(), "update", params, body, options);
    }

    resetPassword() {
        return this.get("users", this._getUserId(), "reset-password");
    }

    info(params, options) {
        return this.get("users", this._getUserId(), "info", params, options);
    }

    getProjects(userId, params, options) {
        return this.get("users", userId, "projects", params, options);
    }

    remove(userId, params, options) {
        return this.get("users", userId, "delete", params, options);
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

class Studies extends Acls {

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

    summary(id, params, options) {
        return this.get("studies", id, "summary", params, options);
    }

    search(params, options) {
        return this.get("studies", undefined, "search", params, options);
    }

    getFiles(id, params, options) {
        return this.get("studies", id, "files", params, options);
    }

    getJobs(id, params, options) {
        return this.get("studies", id, "jobs", params, options);
    }

    getSamples(id, params, options) {
        return this.get("studies", id, "samples", params, options);
    }

    getGroups(id, params) {
        return this.get("studies", id, "groups", params);
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

    update(id, params, body, options) {
        return this.post("studies", id, "update", params, body, options);
    }

    getVariants(id, params, options) {
        return this.get("studies", id, "variants", params, options);
    }

    getAlignments(id, params, options) {
        return this.get("studies", id, "alignments", params, options);
    }

}

class Files extends Acls {

    constructor(config) {
        super(config);
    }

    search(params, options) {
        return this.get("files", undefined, "search", params, options);
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

}

class Jobs extends Acls {

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

}

class Individuals extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("individuals", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("individuals", undefined, "search", params, options);
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

    annotationsetsCreate(id, params, body, options) {
        return this.post("individuals", id, "annotationsets/create", params, body, options);
    }

    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("individuals", id, "annotationsets", name, "update", params, body, options);
    }

}

class Families extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("families", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("families", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("families", id, "info", params, options);
    }

    update(id, params, body, options) {
        return this.post("families", id, "update", params, body, options);
    }

    annotationsetsCreate(id, params, body, options) {
        return this.post("families", id, "annotationsets/create", params, body, options);
    }

    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("families", id, "annotationsets", name, "update", params, body, options);
    }

}

class Samples extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("samples", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("samples", undefined, "search", params, options);
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

    annotationsetsCreate(id, params, body, options) {
        return this.post("samples", id, "annotationsets/create", params, body, options);
    }

    annotationsetsUpdate(id, name, params, body, options) {
        return this.extendedPost("samples", id, "annotationsets", name, "update", params, body, options);
    }

}

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

class Cohorts extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("cohorts", undefined, "create", params, body, options);
    }

    stats(id, params, options) {
        return this.get("cohorts", id, "stats", params, options);
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

}

class Panels extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("diseasePanels", undefined, "create", params, body, options);
    }

    search(params, options) {
        return this.get("diseasePanels", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("diseasePanels", id, "info", params, options);
    }

}

class Clinical extends Acls {

    constructor(config) {
        super(config);
    }

    create(params, body, options) {
        return this.post("clinical", undefined, "create", params, body, options);
    }

    update(id, params, body, options) {
        return this.post("clinical", id, "update", params, body, options);
    }

    info(id, params, options) {
        return this.get("clinical", id, "info", params, options);
    }

    search(params, options) {
        return this.get("clinical", undefined, "search", params, options);
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

    stats(id, params, options) {
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

    samples(params, options) {
        return this.get("analysis/variant", undefined, "samples", params, options);
    }

    index(params, options) {
        return this.get("analysis/variant", undefined, "index", params, options);
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
