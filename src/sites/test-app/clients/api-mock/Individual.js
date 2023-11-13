import UtilsNew from "../../../../core/utils-new.js";

export default class Individual {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("individuals", null, "acl", members, "update", data, {action, ...params});
    }

    aggregationStats(params) {
        return this._get("individuals", null, null, null, "aggregationStats", params);
    }

    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("individuals", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    create(data, params) {
        return this._post("individuals", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("individuals", null, null, null, "distinct", {field, ...params});
    }

    search(params) {
        return this._get("individuals", null, null, null, "search", params);
    }

    acl(individuals, params) {
        return this._get("individuals", individuals, null, null, "acl", params);
    }

    delete(individuals, params) {
        return this._delete("individuals", individuals, null, null, "delete", params);
    }

    info(individuals, params) {
        // Mocked response for Individual update test
        if (individuals === "NA12889") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/individuals-platinum.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }
        return Promise.resolve({});
    }

    update(individuals, data, params) {
        return this._post("individuals", individuals, null, null, "update", data, params);
    }

    updateAnnotationSetsAnnotations(individual, annotationSet, data, params) {
        return this._post("individuals", individual, "annotationSets", annotationSet, "annotations/update", data, params);
    }

    relatives(individual, params) {
        return this._get("individuals", individual, null, null, "relatives", params);
    }

}
