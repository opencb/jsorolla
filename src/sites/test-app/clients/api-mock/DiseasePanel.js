import UtilsNew from "../../../../core/utils-new.js";

export default class DiseasePanel {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("panels", null, "acl", members, "update", data, {action, ...params});
    }

    create(data, params) {
        return this._post("panels", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("panels", null, null, null, "distinct", {field, ...params});
    }

    importPanels(data, params) {
        return this._post("panels", null, null, null, "import", data, params);
    }

    search(params) {
        return this._get("panels", null, null, null, "search", params);
    }

    acl(panels, params) {
        return this._get("panels", panels, null, null, "acl", params);
    }

    delete(panels, params) {
        return this._delete("panels", panels, null, null, "delete", params);
    }

    info(panels, params) {
        // Mocked response for Disease Panel update test
        if (panels === "Early_onset_dystonia-PanelAppId-192") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/disease-panels-platinum.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }
        return Promise.resolve({});
    }

    update(panels, data, params) {
        return this._post("panels", panels, null, null, "update", data, params);
    }

}
