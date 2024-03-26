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

export default class Alignment {

    constructor(config) {
        this._config = config;
    }

    runBwa(data, params) {
        return this._post("analysis", null, "alignment/bwa", null, "run", data, params);
    }

    runCoverageIndex(data, params) {
        return this._post("analysis", null, "alignment/coverage/index", null, "run", data, params);
    }

    coverageQcGeneCoverageStatsRun(data, params) {
        return this._post("analysis", null, "alignment/coverage/qc/geneCoverageStats", null, "run", data, params);
    }

    queryCoverage(file, params) {
        // Response for genome browser test
        if (params?.study === "TEST_STUDY_CANCER_GB") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-cancer-17-43102293-43106467-coverage.json`);
        }

        return this._get("analysis", null, "alignment/coverage", null, "query", {file, ...params});
    }

    ratioCoverage(file1, file2, params) {
        return this._get("analysis", null, "alignment/coverage", null, "ratio", {file1, file2, ...params});
    }

    statsCoverage(file, gene, params) {
        return this._get("analysis", null, "alignment/coverage", null, "stats", {file, gene, ...params});
    }

    runDeeptools(data, params) {
        return this._post("analysis", null, "alignment/deeptools", null, "run", data, params);
    }

    runFastqc(data, params) {
        return this._post("analysis", null, "alignment/fastqc", null, "run", data, params);
    }

    runIndex(data, params) {
        return this._post("analysis", null, "alignment/index", null, "run", data, params);
    }

    runPicard(data, params) {
        return this._post("analysis", null, "alignment/picard", null, "run", data, params);
    }

    runQc(data, params) {
        return this._post("analysis", null, "alignment/qc", null, "run", data, params);
    }

    query(file, params) {
        // Response for genome browser test
        if (params?.study === "TEST_STUDY_CANCER_GB") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-cancer-17-43102293-43106467-alignments.json`);
        }

        return this._get("analysis", null, "alignment", null, "query", {file, ...params});
    }

    runSamtools(data, params) {
        return this._post("analysis", null, "alignment/samtools", null, "run", data, params);
    }

}
