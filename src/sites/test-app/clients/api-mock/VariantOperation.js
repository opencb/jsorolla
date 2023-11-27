
export default class VariantOperation {

    constructor(config) {
        this._config = config;
    }

    configureCellbase(data, params) {
        return this._post("operation", null, "cellbase", null, "configure", data, params);
    }

    aggregateVariant(data, params) {
        return this._post("operation", null, "variant", null, "aggregate", data, params);
    }

    deleteVariantAnnotation(params) {
        return this._delete("operation", null, "variant/annotation", null, "delete", params);
    }

    indexVariantAnnotation(data, params) {
        return this._post("operation", null, "variant/annotation", null, "index", data, params);
    }

    saveVariantAnnotation(data, params) {
        return this._post("operation", null, "variant/annotation", null, "save", data, params);
    }

    configureVariant(data, params) {
        return this._post("operation", null, "variant", null, "configure", data, params);
    }

    deleteVariant(data, params) {
        return this._post("operation", null, "variant", null, "delete", data, params);
    }

    aggregateVariantFamily(data, params) {
        return this._post("operation", null, "variant/family", null, "aggregate", data, params);
    }

    indexVariant(data, params) {
        return this._post("operation", null, "variant", null, "index", data, params);
    }

    launcherVariantIndex(data, params) {
        return this._post("operation", null, "variant/index", null, "launcher", data, params);
    }

    runVariantJulie(data, params) {
        return this._post("operation", null, "variant/julie", null, "run", data, params);
    }

    repairVariantMetadata(data, params) {
        return this._post("operation", null, "variant/metadata", null, "repair", data, params);
    }

    synchronizeVariantMetadata(data, params) {
        return this._post("operation", null, "variant/metadata", null, "synchronize", data, params);
    }

    pruneVariant(data, params) {
        return this._post("operation", null, "variant", null, "prune", data, params);
    }

    deleteVariantSample(data, params) {
        return this._post("operation", null, "variant/sample", null, "delete", data, params);
    }

    deleteVariantScore(params) {
        return this._delete("operation", null, "variant/score", null, "delete", params);
    }

    indexVariantScore(data, params) {
        return this._post("operation", null, "variant/score", null, "index", data, params);
    }

    variantSecondaryAnnotationIndex(data, params) {
        return this._post("operation", null, "variant/secondary/annotation", null, "index", data, params);
    }

    variantSecondarySampleIndex(data, params) {
        return this._post("operation", null, "variant/secondary/sample", null, "index", data, params);
    }

    configureVariantSecondarySampleIndex(data, params) {
        return this._post("operation", null, "variant/secondary/sample/index", null, "configure", data, params);
    }

    deleteVariantSecondaryIndex(params) {
        return this._delete("operation", null, "variant/secondaryIndex", null, "delete", params);
    }

    deleteVariantStats(data, params) {
        return this._post("operation", null, "variant/stats", null, "delete", data, params);
    }

    indexVariantStats(data, params) {
        return this._post("operation", null, "variant/stats", null, "index", data, params);
    }

    deleteVariantStudy(data, params) {
        return this._post("operation", null, "variant/study", null, "delete", data, params);
    }

}
