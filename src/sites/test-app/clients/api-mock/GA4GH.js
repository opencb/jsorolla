export default class GA4GH {

    constructor(config) {
        this._config = config;
    }

    searchReads() {
        return this._post("ga4gh", null, "reads", null, "search");
    }

    fetchReads(study, file, params) {
        return this._get("ga4gh/reads", study, null, file, null, params);
    }

    responses(chrom, pos, allele, beacon, params) {
        return this._get("ga4gh", null, null, null, "responses", {chrom, pos, allele, beacon, ...params});
    }

    searchVariants() {
        return this._post("ga4gh", null, "variants", null, "search");
    }

}
