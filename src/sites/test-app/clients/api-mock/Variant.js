/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import UtilsNew from "../../../../core/utils-new.js";

export default class Variant {

    constructor(config) {
        this._config = config;
    }

    aggregationStats(params) {
        return this._get("analysis", null, "variant", null, "aggregationStats", params);
    }

    metadataAnnotation(params) {
        return this._get("analysis", null, "variant/annotation", null, "metadata", params);
    }

    queryAnnotation(params) {
        return this._get("analysis", null, "variant/annotation", null, "query", params);
    }

    runCircos(data, params) {
        return this._post("analysis", null, "variant/circos", null, "run", data, params);
    }

    deleteCohortStats(params) {
        return this._delete("analysis", null, "variant/cohort/stats", null, "delete", params);
    }

    infoCohortStats(cohort, params) {
        return this._get("analysis", null, "variant/cohort/stats", null, "info", {cohort, ...params});
    }

    runCohortStats(data, params) {
        return this._post("analysis", null, "variant/cohort/stats", null, "run", data, params);
    }

    runExomiser(data, params) {
        return this._post("analysis", null, "variant/exomiser", null, "run", data, params);
    }

    runExport(data, params) {
        return this._post("analysis", null, "variant/export", null, "run", data, params);
    }

    genotypesFamily(modeOfInheritance, params) {
        return this._get("analysis", null, "variant/family", null, "genotypes", {modeOfInheritance, ...params});
    }

    runFamilyQc(data, params) {
        return this._post("analysis", null, "variant/family/qc", null, "run", data, params);
    }

    runGatk(data, params) {
        return this._post("analysis", null, "variant/gatk", null, "run", data, params);
    }

    runGenomePlot(data, params) {
        return this._post("analysis", null, "variant/genomePlot", null, "run", data, params);
    }

    runGwas(data, params) {
        return this._post("analysis", null, "variant/gwas", null, "run", data, params);
    }

    runHrDetect(data, params) {
        return this._post("analysis", null, "variant/hrDetect", null, "run", data, params);
    }

    runIndividualQc(data, params) {
        return this._post("analysis", null, "variant/individual/qc", null, "run", data, params);
    }

    runInferredSex(data, params) {
        return this._post("analysis", null, "variant/inferredSex", null, "run", data, params);
    }

    queryKnockoutGene(params) {
        return this._get("analysis", null, "variant/knockout/gene", null, "query", params);
    }

    queryKnockoutIndividual(params) {
        return this._get("analysis", null, "variant/knockout/individual", null, "query", params);
    }

    runKnockout(data, params) {
        return this._post("analysis", null, "variant/knockout", null, "run", data, params);
    }

    runMendelianError(data, params) {
        return this._post("analysis", null, "variant/mendelianError", null, "run", data, params);
    }

    metadata(params) {
        return this._get("analysis", null, "variant", null, "metadata", params);
    }

    queryMutationalSignature(params) {
        return this._get("analysis", null, "variant/mutationalSignature", null, "query", params);
    }

    runMutationalSignature(data, params) {
        return this._post("analysis", null, "variant/mutationalSignature", null, "run", data, params);
    }

    runPlink(data, params) {
        return this._post("analysis", null, "variant/plink", null, "run", data, params);
    }

    query(params) {
        // Response for genome browser test
        if (params?.study === "TEST_STUDY_PLATINUM_GB") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-platinum-17-43102293-43106467-variants.json`);
        }

        return this._get("analysis", null, "variant", null, "query", params);
    }

    runRelatedness(data, params) {
        return this._post("analysis", null, "variant/relatedness", null, "run", data, params);
    }

    runRvtests(data, params) {
        return this._post("analysis", null, "variant/rvtests", null, "run", data, params);
    }

    aggregationStatsSample(params) {
        return this._get("analysis", null, "variant/sample", null, "aggregationStats", params);
    }

    runSampleEligibility(data, params) {
        return this._post("analysis", null, "variant/sample/eligibility", null, "run", data, params);
    }

    runSampleQc(data, params) {
        return this._post("analysis", null, "variant/sample/qc", null, "run", data, params);
    }

    querySample(params) {
        return this._get("analysis", null, "variant/sample", null, "query", params);
    }

    runSample(data, params) {
        return this._post("analysis", null, "variant/sample", null, "run", data, params);
    }

    querySampleStats(sample, params) {
        return this._get("analysis", null, "variant/sample/stats", null, "query", {sample, ...params});
    }

    runSampleStats(data, params) {
        return this._post("analysis", null, "variant/sample/stats", null, "run", data, params);
    }

    runStatsExport(data, params) {
        return this._post("analysis", null, "variant/stats/export", null, "run", data, params);
    }

    runStats(data, params) {
        return this._post("analysis", null, "variant/stats", null, "run", data, params);
    }

}
