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

export default class Clinical {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("analysis", null, "clinical/acl", members, "update", data, {action, ...params});
    }

    updateClinicalConfiguration(data, params) {
        return this._post("analysis", null, "clinical/clinical/configuration", null, "update", data, params);
    }

    create(data, params) {
        return this._post("analysis", null, "clinical", null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("analysis", null, "clinical", null, "distinct", {field, ...params});
    }

    distinctInterpretation(field, params) {
        return this._get("analysis", null, "clinical/interpretation", null, "distinct", {field, ...params});
    }

    searchInterpretation(params) {
        return this._get("analysis", null, "clinical/interpretation", null, "search", params);
    }

    infoInterpretation(interpretations, params) {
        return this._get("analysis", null, "clinical/interpretation", interpretations, "info", params);
    }

    runInterpreterCancerTiering(data, params) {
        return this._post("analysis", null, "clinical/interpreter/cancerTiering", null, "run", data, params);
    }

    runInterpreterExomiser(data, params) {
        return this._post("analysis", null, "clinical/interpreter/exomiser", null, "run", data, params);
    }

    runInterpreterTeam(data, params) {
        return this._post("analysis", null, "clinical/interpreter/team", null, "run", data, params);
    }

    runInterpreterTiering(data, params) {
        return this._post("analysis", null, "clinical/interpreter/tiering", null, "run", data, params);
    }

    runInterpreterZetta(data, params) {
        return this._post("analysis", null, "clinical/interpreter/zetta", null, "run", data, params);
    }

    aggregationStatsRga(field, params) {
        return this._get("analysis", null, "clinical/rga", null, "aggregationStats", {field, ...params});
    }

    queryRgaGene(params) {
        return this._get("analysis", null, "clinical/rga/gene", null, "query", params);
    }

    summaryRgaGene(params) {
        return this._get("analysis", null, "clinical/rga/gene", null, "summary", params);
    }

    runRgaIndex(data, params) {
        return this._post("analysis", null, "clinical/rga/index", null, "run", data, params);
    }

    queryRgaIndividual(params) {
        return this._get("analysis", null, "clinical/rga/individual", null, "query", params);
    }

    summaryRgaIndividual(params) {
        return this._get("analysis", null, "clinical/rga/individual", null, "summary", params);
    }

    queryRgaVariant(params) {
        return this._get("analysis", null, "clinical/rga/variant", null, "query", params);
    }

    summaryRgaVariant(params) {
        return this._get("analysis", null, "clinical/rga/variant", null, "summary", params);
    }

    search(params) {
        return this._get("analysis", null, "clinical", null, "search", params);
    }

    actionableVariant(params) {
        return this._get("analysis", null, "clinical/variant", null, "actionable", params);
    }

    queryVariant(params) {
        return this._get("analysis", null, "clinical/variant", null, "query", params);
    }

    acl(clinicalAnalyses, params) {
        return this._get("analysis", null, "clinical", clinicalAnalyses, "acl", params);
    }

    delete(clinicalAnalyses, params) {
        return this._delete("analysis", null, "clinical", clinicalAnalyses, "delete", params);
    }

    update(clinicalAnalyses, data, params) {
        return this._post("analysis", null, "clinical", clinicalAnalyses, "update", data, params);
    }

    info(clinicalAnalysis, params) {
        return this._get("analysis", null, "clinical", clinicalAnalysis, "info", params);
    }

    createInterpretation(clinicalAnalysis, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", null, "create", data, params);
    }

    clearInterpretation(clinicalAnalysis, interpretations, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretations, "clear", params);
    }

    deleteInterpretation(clinicalAnalysis, interpretations, params) {
        return this._delete("analysis/clinical", clinicalAnalysis, "interpretation", interpretations, "delete", params);
    }

    revertInterpretation(clinicalAnalysis, interpretation, version, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretation, "revert", {version, ...params});
    }

    updateInterpretation(clinicalAnalysis, interpretation, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretation, "update", data, params);
    }

}
