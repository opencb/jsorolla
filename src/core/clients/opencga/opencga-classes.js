//old classes TODO remove

//import {OpenCGAParentClass} from "./opencga-client";

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
