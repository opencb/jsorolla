export default class Organization {

    constructor(config) {
        this._config = config;
    }

    create(data, params) {
        return this._post("organizations", null, null, null, "create", data, params);
    }

    info(organization, params) {
        return this._get("organizations", organization, null, null, "info", params);
    }

    update(organization, data, params) {
        return this._post("organizations", organization, null, null, "update", data, params);
    }

}
