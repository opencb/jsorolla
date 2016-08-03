/*
 * Copyright 2015 OpenCB
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
        this._panels;
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

    samples() {
        if (typeof this._samples === "undefined") {
            this._samples = new Samples(this._config)
        }
        return this._samples;
    }

    panels() {
        if (typeof this._panels === "undefined") {
            this._panels = new Panels(this._config)
        }
        return this._panels;
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
        return this.getExtended(category, ids, null, null, action, params, options);
    }

    getExtended(category1, ids1, category2, ids2, action, params, options) {
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
            let sid = Cookies.get(this._config.cookieSessionId);
            if (sid != undefined) {
                params["sid"] = sid;
            }
        }

        // If category == users and userId is not given, we try to set it
        if (category1 === "users" && (ids1 === undefined || ids1 === null || ids1 === "")) {
            ids1 = Cookies.get(this._config.cookieUserName);
        }

        if (rpc.toLowerCase() === "rest") {
            let url = this._createRestUrl(host, version, category1, ids1, category2, ids2, action, params);
            if (method === "GET") {
                url = this._addQueryParams(url, params);
            } else {
                options["data"] = params;
            }
            console.log(url)
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
            keyValueArray.push(keyArray[i] + "=" + encodeURIComponent(params[keyArray[i]]));
        }
        return keyValueArray.join('&');
    }

}

class Users extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("users", undefined, "create", params, options);
    }

    login(userId, params, options) {
        if (options == undefined) {
            options = {};
        }
        options["method"] = "GET";
        return this.get("users", userId, "login", params, options).then(function(response) {
            if (response.error === "") {
                Cookies.set(this._config.cookieSessionId, response.response[0].result[0].sessionId);
                Cookies.set(this._config.cookieUserName, response.response[0].result[0].userId);
                console.log("Cookies properly set");
                return response;
            }
        }.bind(this))
    }

    logout(userId, params, options) {
        return this.get("users", userId, "logout", params, options).then(function(response) {
            if (response.error === "") {
                Cookies.expire(this._config.cookieSessionId);
                Cookies.expire(this._config.cookieUserName);
                console.log("Cookies properly removed");
                return response;
            }
        }.bind(this));

    }

    changeEmail(userId, params, options) {
        return this.get("users", userId, "change-email", params, options);
    }

    update(userId, params, options) {
        return this.get("users", userId, "update", params, options);
    }

    resetPassword(userId, params, options) {
        return this.get("users", userId, "reset-password", params, options);
    }

    info(userId, params, options) {
        return this.get("users", userId, "info", params, options);
    }

    projects(userId, params, options) {
        return this.get("users", userId, "projects", params, options);
        //return this.get("users", Cookies.get(this._config.cookieUserName), "projects",
        //    {sid: Cookies.get(this._config.cookieSessionId)},
        //    options);
    }

    update(userId, params, options) {
        return this.get("users", userId, "update", params, options);
    }

    delete(userId, params, options) {
        return this.get("users", userId, "delete", params, options);
    }

    remove(userId, params, options) {
        return this.get("users", userId, "remove", params, options);
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

    studies(id, params, options) {
        return this.get("projects", id, "studies", params, options);
        //return this.get("projects", id, "studies",
        //    {sid: Cookies.get(this._config.cookieSessionId)}, options);
    }

    update(ids, params, options) {
        return this.get("projects", ids, "update", params, options);
    }

    delete(ids, params, options) {
        return this.get("projects", ids, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("projects", ids, "remove", params, options);
    }

}

class Studies extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("studies", undefined, "create", params, options);
    }

    delete(id, params, options) {
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

    files(id, params, options) {
        return this.get("studies", id, "files", params, options);
    }

    jobs(id, params, options) {
        return this.get("studies", id, "jobs", params, options);
    }

    samples(id, params, options) {
        return this.get("studies", id, "samples", params, options);
    }

    group(id, params, options) {
        return this.get("studies", id, "groups", params, options);
    }

    update(id, params, options) {
        return this.get("studies", id, "update", params, options);
    }

    variants(id, params, options) {
        return this.get("studies", id, "variants", params, options);
    }

    alignments(id, params, options) {
        return this.get("studies", id, "alignments", params, options);
    }

    status(id, params, options) {
        return this.get("studies", id, "status", params, options);
    }

    remove(ids, params, options) {
        return this.get("studies", ids, "remove", params, options);
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

    uri(id, params, options) {
        return this.get("files", id, "uri", params, options);
    }

    info(id, params, options) {
        return this.get("files", id, "info", params, options);
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

    contentGrep(id, params, options) {
        return this.get("files", id, "content-grep", params, options);
    }

    contentExample(params, options) {
        return this.get("files", undefined, "content-example", params, options);
    }

    downloadExample(params, options) {
        return this.get("files", undefined, "download-example", params, options);
    }

    setHeader(id, params, options) {
        return this.get("files", id, "set-header", params, options);
    }

    filesByFolder(id, params, options) {
        return this.get("files", id, "files", params, options);
    }
    treeView(id, params, options) {
        return this.get("files", id, "tree-view", params, options);
    }

    createFolder(params, options) {
        return this.get("files", undefined, "create-folder", params, options);
    }

    list(id, params, options) {
        return this.get("files", id, "list", params, options);
    }

    index(id, params, options) {
        return this.get("files", id, "index", params, options);
    }

    alignments(id, params, options) {
        return this.get("files", id, "alignments", params, options);
    }

    fetch(id, params, options) {
        return this.get("files", id, "fetch", params, options);
    }

    variants(id, params, options) {
        return this.get("files", id, "variants", params, options);
    }

    delete(id, params, options) {
        return this.get("files", id, "delete", params, options);
    }

    update(id, params, options) {
        return this.get("files", id, "update", params, options);
    }

    share(id, params, options) {
        return this.get("files", id, "share", params, options);
    }

    relink(id, params, options) {
        return this.get("files", id, "relink", params, options);
    }

    upload(params, options) {
        return this.get("files", undefined, "upload", params, options);
    }

    remove(ids, params, options) {
        return this.get("files", ids, "remove", params, options);
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

    info(id, params, options) {
        return this.get("jobs", id, "info", params, options);
    }

    delete(id, params, options) {
        return this.get("jobs", id, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("jobs", ids, "remove", params, options);
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

    annotate(id, params, options) {
        return this.get("individuals", id, "annotate", params, options);
    }

    update(id, params, options) {
        return this.get("individuals", id, "update", params, options);
    }

    delete(id, params, options) {
        return this.get("individuals", id, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("individuals", ids, "remove", params, options);
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

    load(params, options) {
        return this.get("samples", undefined, "load", params, options);
    }

    info(id, params, options) {
        return this.get("samples", id, "info", params, options);
    }

    annotate(id, params, options) {
        return this.get("samples", id, "annotate", params, options);
    }

    update(id, params, options) {
        return this.get("samples", id, "update", params, options);
    }

    share(id, params, options) {
        return this.get("samples", id, "share", params, options);
    }

    delete(id, params, options) {
        return this.get("samples", id, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("samples", ids, "remove", params, options);
    }

}

class Variables extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    create(params, options) {
        return this.get("variables", undefined, "create", params, options);
    }

    search(params, options) {
        return this.get("variables", undefined, "search", params, options);
    }

    info(id, params, options) {
        return this.get("variables", id, "info", params, options);
    }

    update(id, params, options) {
        return this.get("variables", id, "update", params, options);
    }

    delete(id, params, options) {
        return this.get("variables", id, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("variables", ids, "remove", params, options);
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

    update(id, params, options) {
        return this.get("cohorts", id, "update", params, options);
    }

    delete(id, params, options) {
        return this.get("cohorts", id, "delete", params, options);
    }

    remove(ids, params, options) {
        return this.get("cohorts", ids, "remove", params, options);
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