export default class Project {

    constructor(config) {
        this._config = config;
    }

    create(data, params) {
        return this._post("projects", null, null, null, "create", data, params);
    }

    search(params) {
        return this._get("projects", null, null, null, "search", params);
    }

    aggregationStats(projects, params) {
        return this._get("projects", projects, null, null, "aggregationStats", params);
    }

    info(projects, params) {
        return this._get("projects", projects, null, null, "info", params);
    }

    incRelease(project) {
        return this._post("projects", project, null, null, "incRelease");
    }

    studies(project, params) {
        return this._get("projects", project, null, null, "studies", params);
    }

    update(project, data, params) {
        return this._post("projects", project, null, null, "update", data, params);
    }

}
