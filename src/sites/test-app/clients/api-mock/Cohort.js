import UtilsNew from "../../../../core/utils-new.js";

export default class Cohort {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("cohorts", null, "acl", members, "update", data, {action, ...params});
    }

    aggregationStats(params) {
        return this._get("cohorts", null, null, null, "aggregationStats", params);
    }

    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("cohorts", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    create(data, params) {
        return this._post("cohorts", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("cohorts", null, null, null, "distinct", {field, ...params});
    }

    generate(data, params) {
        return this._post("cohorts", null, null, null, "generate", data, params);
    }

    search(params) {
        return this._get("cohorts", null, null, null, "search", params);
    }

    acl(cohorts, params) {
        return this._get("cohorts", cohorts, null, null, "acl", params);
    }

    delete(cohorts, params) {
        return this._delete("cohorts", cohorts, null, null, "delete", params);
    }

    info(cohorts, params) {
        if (cohorts === "ALL") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/cohorts-1000G.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }

        return this._get("cohorts", cohorts, null, null, "info", params);
    }

    update(cohorts, data, params) {
        return this._post("cohorts", cohorts, null, null, "update", data, params);
    }

    updateAnnotationSetsAnnotations(cohort, annotationSet, data, params) {
        return this._post("cohorts", cohort, "annotationSets", annotationSet, "annotations/update", data, params);
    }

}
