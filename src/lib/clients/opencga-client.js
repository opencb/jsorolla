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

class OpenCGAClient {

    constructor(config) {
        this._config = config;
        this._users;
        this._projects;
        this._studies;
        this._files;
        this._samples;
        this._individuals;
        this._cohorts;
        this._jobs;
        this._panels;
        this._variables;
    }

    getConfig() {
        return this._config;
    }

    setConfig(config) {
        this._config = config;
    }

    users() {
        if (typeof this._users === "undefined") {
            console.log(this._config)
            this._users = new Users(this._config)
        }
        return this._users;
    }

    projects() {
        if (typeof this._projects === "undefined") {
            this._projects = new Projects(this._config)
        }
        return this._projects;
    }

    studies() {
        if (typeof this._studies === "undefined") {
            this._studies = new Studies(this._config)
        }
        return this._studies;
    }

    files() {
        if (typeof this._files === "undefined") {
            this._files = new Files(this._config)
        }
        return this._files;
    }

    jobs() {
        if (typeof this._jobs === "undefined") {
            this._jobs = new Jobs(this._config)
        }
        return this._jobs;
    }

    samples() {
        if (typeof this._samples === "undefined") {
            this._samples = new Samples(this._config)
        }
        return this._samples;
    }

    individuals() {
        if (typeof this._individuals === "undefined") {
            this._individuals = new Individuals(this._config)
        }
        return this._individuals;
    }

    cohorts() {
        if (typeof this._cohorts === "undefined") {
            this._cohorts = new Cohorts(this._config)
        }
        return this._cohorts;
    }

    panels() {
        if (typeof this._panels === "undefined") {
            this._panels = new Panels(this._config)
        }
        return this._panels;
    }

    variables() {
        if (typeof this._variables === "undefined") {
            this._variables = new Variables(this._config)
        }
        return this._variables;
    }
}

// parent class
class OpenCGAParentClass {

    constructor(config) {
        if (typeof config === 'undefined') {
            this._config = new OpenCGAClientConfig();
        } else {
            this._config = config;
        }
    }

    get(category, ids, action, params, options) {
        return this.extendedGet(category, ids, null, null, action, params, options);
    }

    extendedGet(category1, ids1, category2, ids2, action, params, options) {
        // we store the options from the parameter or from the default values in config
        let host = this._config.host;
        let version = this._config.version;
        let rpc = this._config.rpc;
        let method = "GET";

        if (options !== undefined && options.hasOwnProperty("method")) {
            method = options.method;
        }

        if (params === undefined || params === null || params === "") {
            params = {};
        }

        // Check that sessionId is being given
        if (!params.hasOwnProperty("sid")) {
            let sid = this._getSessionId();
            if (sid !== undefined) {
                params["sid"] = sid;
            }
        }

        // If category == users and userId is not given, we try to set it
        if (category1 === "users" && (ids1 === undefined || ids1 === null || ids1 === "")) {
            ids1 = this._getUserId();
        }

        if (rpc.toLowerCase() === "rest") {
            let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action, params);
            // if (method === "GET") {
            url = this._addQueryParams(url, params);
            if (method === "POST") {
                options["data"] = params["body"];
            }
            console.log(url);
            // if the URL query fails we try with next host
            let response = RestClient.callPromise(url, options);
            return response;
        }
    }

    _createRestUrl(host, version, category1, ids1, category2, ids2, action) {
        let url = "http://" + host + "/webservices/rest/" + version + "/" + category1 + "/";

        // Some web services do not need IDs
        if (typeof ids1 != "undefined" && ids1 != null) {
            url += ids1 + "/";
        }

        // Some web services do not need a second category
        if (typeof category2 != "undefined" && category2 != null) {
            url += category2 + "/";
        }

        // Some web services do not need the second category of ids
        if (typeof ids2 != "undefined" && ids2 != null) {
            url += ids2 + "/";
        }

        url += action;

        return url;
    }

    _addQueryParams(url, params) {
        // We add the query params formatted in URL
        let queryParamsUrl = this._createQueryParam(params);
        if (typeof queryParamsUrl != "undefined" && queryParamsUrl != null && queryParamsUrl != "") {
            url += "?" + queryParamsUrl;
        }
        return url;
    }

    _createQueryParam(params) {
        // Do not remove the sort! we need to sort the array to ensure that the key of the cache will be correct
        var keyArray = _.keys(params);
        var keyValueArray = [];
        for (let i in keyArray) {
            // Whatever it is inside body will be sent hidden via POST
            if (keyArray[i] !== "body") {
                keyValueArray.push(keyArray[i] + "=" + encodeURIComponent(params[keyArray[i]]));
            }
        }
        return keyValueArray.join('&');
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

class Users extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("users", undefined, "create", params, options);
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
        return this.get("users", userId, "login", params, options).then(function(response) {
            if (response.error === "") {
                if (this._config.hasOwnProperty("cookieUserId")) {
                    // Cookies being used
                    Cookies.set(this._config.cookieSessionId, response.response[0].result[0].sessionId);
                    Cookies.set(this._config.cookieUserId, response.response[0].result[0].userId);
                    console.log("Cookies properly set");
                } else {
                    // No cookies used
                    this._config.sessionId = response.response[0].result[0].sessionId;
                    this._config.userId = response.response[0].result[0].userId;
                }
                return response;
            }
        }.bind(this))
    }

    logout() {
        return this.get("users", this._getUserId(), "logout").then(function(response) {
            if (response.error === "") {
                if (this._config.hasOwnProperty("cookieUserId")) {
                    // Cookies being used
                    Cookies.expire(this._config.cookieSessionId);
                    Cookies.expire(this._config.cookieUserId);
                    console.log("Cookies properly removed");
                } else {
                    // No cookies being used
                    this._config.userId = "";
                    this._config.sessionId = "";
                }
                return response;
            }
        }.bind(this));

    }

    changeEmail(newMail) {
        let params = {
            nemail: newMail
        };
        return this.get("users", this._getUserId(), "change-email", params);
    }

    update(params, options) {
        return this.get("users", this._getUserId(), "update", params, options);
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
        return this.extendedGet("users", this._getUserId(), "configs/filters", undefined, "list", params, options);
    }

    getFilter(filter, params, options) {
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "info", params, options);
    }

    createFilter(params, options) {
        if (options === undefined) {
            options = {};
        }
        if (params === undefined) {
            params = {};
        }
        if (!params.hasOwnProperty("body")) {
            let aux = {
                body: params
            }
            params = aux;
        }
        options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs/filters", undefined, "create", params, options);
    }

    updateFilter(filter, params, options) {
        if (options === undefined) {
            options = {};
        }
        if (params === undefined) {
            params = {};
        }
        if (!params.hasOwnProperty("body")) {
            let aux = {
                body: params
            }
            params = aux;
        }
        options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "update", params, options);
    }

    deleteFilter(filter) {
        return this.extendedGet("users", this._getUserId(), "configs/filters", filter, "delete", undefined, undefined);
    }

    // Configs
    getConfig(name, params, options) {
        return this.extendedGet("users", this._getUserId(), "configs", name, "info", params, options);
    }

    updateConfig(name, params, options) {
        if (options === undefined) {
            options = {};
        }
        if (params === undefined) {
            params = {};
        }
        if (!params.hasOwnProperty("body")) {
            let aux = {
                body: params
            };
            params = aux;
        }
        params["name"] = name;
        options["method"] = "POST";
        return this.extendedGet("users", this._getUserId(), "configs", undefined, "create", params, options);
    }

    deleteConfig(name) {
        return this.extendedGet("users", this._getUserId(), "configs", name, "delete", undefined, undefined);
    }

}

class Projects extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("projects", undefined, "create", params, options);
    }

    info(ids, params, options) {
        return this.get("projects", ids, "info", params, options);
    }

    getStudies(id, params, options) {
        return this.get("projects", id, "studies", params, options);
    }

    update(ids, params, options) {
        return this.get("projects", ids, "update", params, options);
    }

    remove(ids, params, options) {
        return this.get("projects", ids, "delete", params, options);
    }

}

class Studies extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("studies", undefined, "create", params, options);
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

    getGroups(id) {
        return this.get("studies", id, "groups");
    }

    getGroup(id, groupId) {
        return this.extendedGet("studies", id, "groups", groupId, "info");
    }

    createGroup(id, groupId, userIds) {
        let params = {
            groupId: groupId,
            users: userIds
        };
        return this.extendedGet("studies", id, "groups", undefined, "create", params);
    }

    deleteGroup(id, groupId) {
        return this.extendedGet("studies", id, "groups", groupId, "delete");
    }

    updateGroup(id, groupId, params) {
        return this.extendedGet("studies", id, "groups", groupId, "update", params);
    }

    update(id, params, options) {
        return this.get("studies", id, "update", params, options);
    }

    getVariants(id, params, options) {
        return this.get("studies", id, "variants", params, options);
    }

    getAlignments(id, params, options) {
        return this.get("studies", id, "alignments", params, options);
    }

}

class Files extends OpenCGAParentClass {

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

    createFolder(params, options) {
        return this.get("files", undefined, "create-folder", params, options);
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

    update(id, params, options) {
        return this.get("files", id, "update", params, options);
    }

    relink(id, params, options) {
        return this.get("files", id, "relink", params, options);
    }

    upload(params, options) {
        return this.get("files", undefined, "upload", params, options);
    }
}

class Jobs extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("jobs", undefined, "create", params, options);
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

}

class Individuals extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("individuals", undefined, "create", params, options);
    }

    search(params, options) {
        return this.get("individuals", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("individuals", id, "info", params, options);
    }

    update(id, params, options) {
        return this.get("individuals", id, "update", params, options);
    }

    remove(id, params, options) {
        return this.get("individuals", id, "delete", params, options);
    }

}

class Samples extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("samples", undefined, "create", params, options);
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

    update(id, params, options) {
        return this.get("samples", id, "update", params, options);
    }

    remove(id, params, options) {
        return this.get("samples", id, "delete", params, options);
    }

}

class Variables extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("variableSet", undefined, "create", params, options);
    }

    search(params, options) {
        return this.get("variableSet", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("variableSet", id, "info", params, options);
    }

    summary(id) {
        return this.get("variableSet", id, "summary", {}, {});
    }

    update(id, params, options) {
        return this.get("variableSet", id, "update", params, options);
    }

    remove(id, params, options) {
        return this.get("variableSet", id, "delete", params, options);
    }

}

class Cohorts extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("cohorts", undefined, "create", params, options);
    }

    stats(id, params, options) {
        return this.get("cohorts", id, "stats", params, options);
    }

    info(id, params, options) {
        return this.get("cohorts", id, "info", params, options);
    }

    getSamples(id, params) {
        return this.get("cohorts", id, "samples", params);
    }

    update(id, params, options) {
        return this.get("cohorts", id, "update", params, options);
    }

    remove(id, params, options) {
        return this.get("cohorts", id, "delete", params, options);
    }

}

class Panels extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("panels", undefined, "create", params, options);
    }

    info(id, params, options) {
        return this.get("panels", id, "info", params, options);
    }

}