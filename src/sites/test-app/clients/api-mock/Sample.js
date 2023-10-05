import UtilsNew from "../../../../core/utils-new.js";

export default class Sample {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("samples", null, "acl", members, "update", data, {action, ...params});
    }

    aggregationStats(params) {
        return this._get("samples", null, null, null, "aggregationStats", params);
    }

    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("samples", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    create(data, params) {
        return this._post("samples", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("samples", null, null, null, "distinct", {field, ...params});
    }

    load(file, params) {
        return this._get("samples", null, null, null, "load", {file, ...params});
    }

    search(params) {
        // Response for genome browser test
        if (params?.study === "TEST_STUDY_PLATINUM_GB") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-platinum-samples.json`);
        }
    }

    acl(samples, params) {
        return this._get("samples", samples, null, null, "acl", params);
    }

    delete(samples, params) {
        return this._delete("samples", samples, null, null, "delete", params);
    }

    info(samples, params) {
        // Response for Genome browser test
        if (params?.study === "TEST_STUDY_CANCER_GB" && samples === "TEST_SAMPLE_GB") {
            return Promise.resolve({});
        }
        // Mocked response for Sample update test
        if (samples === "NA12877") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/samples-platinum.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }
        return Promise.resolve({});
    }

    update(samples, data, params) {
        return this._post("samples", samples, null, null, "update", data, params);
    }

    updateAnnotationSetsAnnotations(sample, annotationSet, data, params) {
        return this._post("samples", sample, "annotationSets", annotationSet, "annotations/update", data, params);
    }

}
