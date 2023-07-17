import UtilsNew from "../../../core/utils-new";

export class CellBaseClientMock {

    constructor(config) {
        this._config = {
            ...this.getDefaultConfig(),
            ...config,
        };
    }

    getDefaultConfig() {
        return {
            host: "https://ws.zettagenomics.com/cellbase",
            version: "v5.1",
            species: "hsapiens",
            testDataVersion: "",
        };
    }

    getMeta(param, options = {}) {
        return Promise.reject(new Error("Not implemented"));
    }

    getFiles(folderId, resource, params, options = {}) {
        return Promise.reject(new Error("Not implemented"));
    }

    getGeneClient(id, resource, params, options) {
        return this.get("feature", "gene", id, resource, params, options);
    }

    getTranscriptClient(id, resource, params, options) {
        return this.get("feature", "transcript", id, resource, params, options);
    }

    getProteinClient(id, resource, params, options) {
        return this.get("feature", "protein", id, resource, params, options);
    }

    getVariationClient(id, resource, params, options) {
        return this.get("feature", "variation", id, resource, params, options);
    }

    getRegulatoryClient(id, resource, params, options) {
        return this.get("feature", "regulatory", id, resource, params, options);
    }

    get(category, subcategory, ids, resource, params, options = {}) {
        if (category === "genomic" && subcategory === "chromosome" && resource === "search") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-chromosomes.json`);
        }
        // Other request
        return Promise.reject(new Error("Not implemented"));
    }

}
