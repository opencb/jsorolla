import {RestResponse} from "../../../../core/clients/rest-response.js";

export default class User {

    constructor(config) {
        this._config = config;
    }

    create(data) {
        return this._post("users", null, null, null, "create", data);
    }

    login(data) {
        return this._post("users", null, null, null, "login", data);
    }

    password(data) {
        return this._post("users", null, null, null, "password", data);
    }

    info(users, params) {
        return this._get("users", users, null, null, "info", params);
    }

    configs(user, params) {
        return this._get("users", user, null, null, "configs", params);
    }

    updateConfigs(user, data, params) {
        let result;
        switch (params) {
            default:
                result = {
                    responses: [{
                        results: [
                            {...data.configuration}
                        ]
                    }]
                };
        }
        // return this._post("users", user, "configs", null, "update", data, params);
        return Promise.resolve(new RestResponse(result));
    }

    filters(user, params) {
        return this._get("users", user, null, null, "filters", params);
    }

    updateFilters(user, data, params) {
        return this._post("users", user, "filters", null, "update", data, params);
    }

    updateFilter(user, filterId, data) {
        return this._post("users", user, "filters", filterId, "update", data);
    }

    resetPassword(user) {
        return this._get("users", user, "password", null, "reset");
    }

    projects(user, params) {
        return this._get("users", user, null, null, "projects", params);
    }

    update(user, data, params) {
        return this._post("users", user, null, null, "update", data, params);
    }

}
