export default class Admin {

    constructor(config) {
        this._config = config;
    }

    groupByAudit(fields, entity, params) {
        return this._get("admin", null, "audit", null, "groupBy", {fields, entity, ...params});
    }

    indexStatsCatalog(params) {
        return this._post("admin", null, "catalog", null, "indexStats", params);
    }

    installCatalog(data) {
        return this._post("admin", null, "catalog", null, "install", data);
    }

    jwtCatalog(data) {
        return this._post("admin", null, "catalog", null, "jwt", data);
    }

    createUsers(data) {
        return this._post("admin", null, "users", null, "create", data);
    }

    importUsers(data) {
        return this._post("admin", null, "users", null, "import", data);
    }

    searchUsers(params) {
        return this._get("admin", null, "users", null, "search", params);
    }

    syncUsers(data) {
        return this._post("admin", null, "users", null, "sync", data);
    }

}
