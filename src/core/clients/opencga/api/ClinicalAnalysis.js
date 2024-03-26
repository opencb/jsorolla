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

import OpenCGAParentClass from "./../opencga-parent-class.js";


/**
 * This class contains the methods for the "ClinicalAnalysis" resource
 */

export default class ClinicalAnalysis extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Update the set of permissions granted for the member
    * @param {String} members - Comma separated list of user or group IDs.
    * @param {Object} data - JSON containing the parameters to add ACLs.
    * @param {"SET ADD REMOVE RESET"} action = "ADD" - Action to be performed [ADD, SET, REMOVE or RESET]. The default value is ADD.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.propagate = "false"] - Propagate permissions to related families, individuals, samples and files. The default
    *     value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateAcl(members, action, data, params) {
        return this._post("analysis", null, "clinical/acl", members, "update", data, {action, ...params});
    }

    /** Load annotation sets from a TSV file
    * @param {Object} [data] - JSON containing the 'content' of the TSV file if this has not yet been registered into OpenCGA.
    * @param {String} variableSetId - Variable set ID or name.
    * @param {String} path - Path where the TSV file is located in OpenCGA or where it should be located.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.parents] - Flag indicating whether to create parent directories if they don't exist (only when TSV file was
    *     not previously associated).
    * @param {String} [params.annotationSetId] - Annotation set id. If not provided, variableSetId will be used.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("analysis", null, "clinical/annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    /** Update Clinical Analysis configuration.
    * @param {Object} [data] - Configuration params to update.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateClinicalConfiguration(data, params) {
        return this._post("analysis", null, "clinical/clinical/configuration", null, "update", data, params);
    }

    /** Create a new clinical analysis
    * @param {Object} data - JSON containing clinical analysis information.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.skipCreateDefaultInterpretation] - Flag to skip creating and initialise an empty default primary
    *     interpretation (Id will be '{clinicalAnalysisId}.1'). This flag is only considered if no Interpretation object is passed.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    create(data, params) {
        return this._post("analysis", null, "clinical", null, "create", data, params);
    }

    /** Clinical Analysis distinct method
    * @param {String} field - Comma separated list of fields for which to obtain the distinct values.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.id] - Comma separated list of Clinical Analysis IDs up to a maximum of 100. Also admits basic regular
    *     expressions using the operator '~', i.e. '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.uuid] - Comma separated list of Clinical Analysis UUIDs up to a maximum of 100.
    * @param {String} [params.type] - Clinical Analysis type.
    * @param {String} [params.disorder] - Clinical Analysis disorder. Also admits basic regular expressions using the operator '~', i.e.
    *     '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.files] - Clinical Analysis files.
    * @param {String} [params.sample] - Sample associated to the proband or any member of a family.
    * @param {String} [params.individual] - Proband or any member of a family.
    * @param {String} [params.proband] - Clinical Analysis proband.
    * @param {String} [params.probandSamples] - Clinical Analysis proband samples.
    * @param {String} [params.family] - Clinical Analysis family.
    * @param {String} [params.familyMembers] - Clinical Analysis family members.
    * @param {String} [params.familyMemberSamples] - Clinical Analysis family members samples.
    * @param {String} [params.panels] - Clinical Analysis panels.
    * @param {Boolean} [params.locked] - Locked Clinical Analyses.
    * @param {String} [params.analystId] - Clinical Analysis analyst id.
    * @param {String} [params.priority] - Clinical Analysis priority.
    * @param {String} [params.flags] - Clinical Analysis flags.
    * @param {String} [params.creationDate] - Clinical Analysis Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Clinical Analysis Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018,
    *     <201805.
    * @param {String} [params.dueDate] - Clinical Analysis due date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.qualityControlSummary] - Clinical Analysis quality control summary.
    * @param {String} [params.release] - Release when it was created.
    * @param {String} [params.status] - Filter by status.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.annotation] - Annotation filters. Example: age>30;gender=FEMALE. For more information, please visit
    *     http://docs.opencb.org/display/opencga/AnnotationSets+1.4.0.
    * @param {Boolean} [params.deleted] - Boolean to retrieve deleted entries.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    distinct(field, params) {
        return this._get("analysis", null, "clinical", null, "distinct", {field, ...params});
    }

    /** Interpretation distinct method
    * @param {String} field - Comma separated list of fields for which to obtain the distinct values.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.id] - Comma separated list of Interpretation IDs up to a maximum of 100. Also admits basic regular expressions
    *     using the operator '~', i.e. '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.uuid] - Comma separated list of Interpretation UUIDs up to a maximum of 100.
    * @param {String} [params.clinicalAnalysisId] - Clinical Analysis id.
    * @param {String} [params.analystId] - Analyst ID.
    * @param {String} [params.methodName] - Interpretation method name. Also admits basic regular expressions using the operator '~', i.e.
    *     '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.panels] - Interpretation panels.
    * @param {String} [params.primaryFindings] - Interpretation primary findings.
    * @param {String} [params.secondaryFindings] - Interpretation secondary findings.
    * @param {String} [params.creationDate] - Interpretation Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Interpretation Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018,
    *     <201805.
    * @param {String} [params.status] - Filter by status.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.release] - Release when it was created.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    distinctInterpretation(field, params) {
        return this._get("analysis", null, "clinical/interpretation", null, "distinct", {field, ...params});
    }

    /** Search clinical interpretations
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.sort] - Sort the results.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.id] - Comma separated list of Interpretation IDs up to a maximum of 100. Also admits basic regular expressions
    *     using the operator '~', i.e. '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.uuid] - Comma separated list of Interpretation UUIDs up to a maximum of 100.
    * @param {String} [params.clinicalAnalysisId] - Clinical Analysis id.
    * @param {String} [params.analystId] - Analyst ID.
    * @param {String} [params.methodName] - Interpretation method name. Also admits basic regular expressions using the operator '~', i.e.
    *     '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.panels] - Interpretation panels.
    * @param {String} [params.primaryFindings] - Interpretation primary findings.
    * @param {String} [params.secondaryFindings] - Interpretation secondary findings.
    * @param {String} [params.creationDate] - Interpretation Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Interpretation Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018,
    *     <201805.
    * @param {String} [params.status] - Filter by status.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.release] - Release when it was created.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    searchInterpretation(params) {
        return this._get("analysis", null, "clinical/interpretation", null, "search", params);
    }

    /** Clinical interpretation information
    * @param {String} interpretations - Comma separated list of clinical interpretation IDs  up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.version] - Comma separated list of interpretation versions. 'all' to get all the interpretation versions. Not
    *     supported if multiple interpretation ids are provided.
    * @param {Boolean} [params.deleted = "false"] - Boolean to retrieve deleted entries. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    infoInterpretation(interpretations, params) {
        return this._get("analysis", null, "clinical/interpretation", interpretations, "info", params);
    }

    /** Run cancer tiering interpretation analysis
    * @param {Object} data - Cancer tiering interpretation analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInterpreterCancerTiering(data, params) {
        return this._post("analysis", null, "clinical/interpreter/cancerTiering", null, "run", data, params);
    }

    /** Run exomiser interpretation analysis
    * @param {Object} data - Exomizer interpretation analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInterpreterExomiser(data, params) {
        return this._post("analysis", null, "clinical/interpreter/exomiser", null, "run", data, params);
    }

    /** Run TEAM interpretation analysis
    * @param {Object} data - TEAM interpretation analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInterpreterTeam(data, params) {
        return this._post("analysis", null, "clinical/interpreter/team", null, "run", data, params);
    }

    /** Run tiering interpretation analysis
    * @param {Object} data - Tiering interpretation analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInterpreterTiering(data, params) {
        return this._post("analysis", null, "clinical/interpreter/tiering", null, "run", data, params);
    }

    /** Run Zetta interpretation analysis
    * @param {Object} data - Zetta interpretation analysis params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runInterpreterZetta(data, params) {
        return this._post("analysis", null, "clinical/interpreter/zetta", null, "run", data, params);
    }

    /** Load clinical analyses from a file
    * @param {Object} data - Parameters to load clinical analysis in OpenCGA catalog from a file.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    load(data, params) {
        return this._post("analysis", null, "clinical", null, "load", data, params);
    }

    /** RGA aggregation stats
    * @param {String} field - List of fields separated by semicolons, e.g.: clinicalSignificances;type. For nested fields use >>, e.g.:
    *     type>>clinicalSignificances;knockoutType.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    aggregationStatsRga(field, params) {
        return this._get("analysis", null, "clinical/rga", null, "aggregationStats", {field, ...params});
    }

    /** Query gene RGA
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.includeIndividual] - Include only the comma separated list of individuals to the response.
    * @param {Number} [params.skipIndividual] - Number of individuals to skip.
    * @param {Number} [params.limitIndividual] - Limit number of individuals returned (default: 1000).
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryRgaGene(params) {
        return this._get("analysis", null, "clinical/rga/gene", null, "query", params);
    }

    /** RGA gene summary stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    summaryRgaGene(params) {
        return this._get("analysis", null, "clinical/rga/gene", null, "summary", params);
    }

    /** Generate Recessive Gene Analysis secondary index
    * @param {Object} data - Recessive Gene Analysis index params.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobTags] - Job tags.
    * @param {Boolean} [params.auxiliarIndex = "false"] - Index auxiliar collection to improve performance assuming RGA is completely
    *     indexed. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runRgaIndex(data, params) {
        return this._post("analysis", null, "clinical/rga/index", null, "run", data, params);
    }

    /** Query individual RGA
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryRgaIndividual(params) {
        return this._get("analysis", null, "clinical/rga/individual", null, "query", params);
    }

    /** RGA individual summary stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    summaryRgaIndividual(params) {
        return this._get("analysis", null, "clinical/rga/individual", null, "summary", params);
    }

    /** Query variant RGA
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.includeIndividual] - Include only the comma separated list of individuals to the response.
    * @param {Number} [params.skipIndividual] - Number of individuals to skip.
    * @param {Number} [params.limitIndividual] - Limit number of individuals returned (default: 1000).
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryRgaVariant(params) {
        return this._get("analysis", null, "clinical/rga/variant", null, "query", params);
    }

    /** RGA variant summary stats
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.sampleId] - Filter by sample id.
    * @param {String} [params.individualId] - Filter by individual id.
    * @param {String} [params.sex] - Filter by sex.
    * @param {String} [params.phenotypes] - Filter by phenotypes.
    * @param {String} [params.disorders] - Filter by disorders.
    * @param {String} [params.numParents] - Filter by the number of parents registered.
    * @param {String} [params.geneId] - Filter by gene id.
    * @param {String} [params.geneName] - Filter by gene name.
    * @param {String} [params.chromosome] - Filter by chromosome.
    * @param {String} [params.start] - Filter by start position.
    * @param {String} [params.end] - Filter by end position.
    * @param {String} [params.transcriptId] - Filter by transcript id.
    * @param {String} [params.variants] - Filter by variant id.
    * @param {String} [params.dbSnps] - Filter by DB_SNP id.
    * @param {String} [params.knockoutType] - Filter by knockout type.
    * @param {String} [params.filter] - Filter by filter (PASS, NOT_PASS).
    * @param {String} [params.type] - Filter by variant type.
    * @param {String} [params.clinicalSignificance] - Filter by clinical significance.
    * @param {String} [params.populationFrequency] - Filter by population frequency.
    * @param {String} [params.consequenceType] - Filter by consequence type.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    summaryRgaVariant(params) {
        return this._get("analysis", null, "clinical/rga/variant", null, "summary", params);
    }

    /** Clinical analysis search.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count = "false"] - Get the total number of results matching the query. Deactivated by default. The default
    *     value is false.
    * @param {Boolean} [params.flattenAnnotations = "false"] - Flatten the annotations?. The default value is false.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.id] - Comma separated list of Clinical Analysis IDs up to a maximum of 100. Also admits basic regular
    *     expressions using the operator '~', i.e. '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.uuid] - Comma separated list of Clinical Analysis UUIDs up to a maximum of 100.
    * @param {String} [params.type] - Clinical Analysis type.
    * @param {String} [params.disorder] - Clinical Analysis disorder. Also admits basic regular expressions using the operator '~', i.e.
    *     '~{perl-regex}' e.g. '~value' for case sensitive, '~/value/i' for case insensitive search.
    * @param {String} [params.files] - Clinical Analysis files.
    * @param {String} [params.sample] - Sample associated to the proband or any member of a family.
    * @param {String} [params.individual] - Proband or any member of a family.
    * @param {String} [params.proband] - Clinical Analysis proband.
    * @param {String} [params.probandSamples] - Clinical Analysis proband samples.
    * @param {String} [params.family] - Clinical Analysis family.
    * @param {String} [params.familyMembers] - Clinical Analysis family members.
    * @param {String} [params.familyMemberSamples] - Clinical Analysis family members samples.
    * @param {String} [params.panels] - Clinical Analysis panels.
    * @param {Boolean} [params.locked] - Locked Clinical Analyses.
    * @param {String} [params.analystId] - Clinical Analysis analyst id.
    * @param {String} [params.priority] - Clinical Analysis priority.
    * @param {String} [params.flags] - Clinical Analysis flags.
    * @param {String} [params.creationDate] - Clinical Analysis Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Clinical Analysis Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018,
    *     <201805.
    * @param {String} [params.dueDate] - Clinical Analysis due date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.qualityControlSummary] - Clinical Analysis quality control summary.
    * @param {String} [params.release] - Release when it was created.
    * @param {String} [params.status] - Filter by status.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.annotation] - Annotation filters. Example: age>30;gender=FEMALE. For more information, please visit
    *     http://docs.opencb.org/display/opencga/AnnotationSets+1.4.0.
    * @param {Boolean} [params.deleted] - Boolean to retrieve deleted entries.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    search(params) {
        return this._get("analysis", null, "clinical", null, "search", params);
    }

    /** Fetch clinical variants
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {Boolean} [params.approximateCount] - Get an approximate count, instead of an exact total count. Reduces execution time.
    * @param {Number} [params.approximateCountSamplingSize] - Sampling size to get the approximate count. Larger values increase accuracy
    *     but also increase execution time.
    * @param {String} [params.savedFilter] - Use a saved filter at User level.
    * @param {String} [params.includeInterpretation] - Interpretation ID to include the fields related to this interpretation.
    * @param {String} [params.id] - List of IDs, these can be rs IDs (dbSNP) or variants in the format chrom:start:ref:alt, e.g.
    *     rs116600158,19:7177679:C:T.
    * @param {String} [params.region] - List of regions, these can be just a single chromosome name or regions in the format chr:start-end,
    *     e.g.: 2,3:100000-200000.
    * @param {String} [params.type] - List of types, accepted values are SNV, MNV, INDEL, SV, COPY_NUMBER, COPY_NUMBER_LOSS,
    *     COPY_NUMBER_GAIN, INSERTION, DELETION, DUPLICATION, TANDEM_DUPLICATION, BREAKEND, e.g. SNV,INDEL.
    * @param {String} [params.study] - Filter variants from the given studies, these can be either the numeric ID or the alias with the
    *     format organization@project:study.
    * @param {String} [params.file] - Filter variants from the files specified. This will set includeFile parameter when not provided.
    * @param {String} [params.filter] - Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the
    *     filter. e.g.: PASS,LowGQX.
    * @param {String} [params.qual] - Specify the QUAL for any of the files. If 'file' filter is provided, will match the file and the qual.
    *     e.g.: >123.4.
    * @param {String} [params.fileData] - Filter by file data (i.e. FILTER, QUAL and INFO columns from VCF file).
    *     [{file}:]{key}{op}{value}[,;]* . If no file is specified, will use all files from "file" filter. e.g. AN>200 or
    *     file_1.vcf:AN>200;file_2.vcf:AN<10 . Many fields can be combined. e.g. file_1.vcf:AN>200;DB=true;file_2.vcf:AN<10,FILTER=PASS,LowDP.
    * @param {String} [params.sample] - Filter variants by sample genotype. This will automatically set 'includeSample' parameter when not
    *     provided. This filter accepts multiple 3 forms: 1) List of samples: Samples that contain the main variant. Accepts AND (;) and OR (,)
    *     operators.  e.g. HG0097,HG0098 . 2) List of samples with genotypes: {sample}:{gt1},{gt2}. Accepts AND (;) and OR (,) operators.  e.g.
    *     HG0097:0/0;HG0098:0/1,1/1 . Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice
    *     versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with
    *     genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT, HET_MISS and MISS  e.g.
    *     HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3) Sample with segregation mode: {sample}:{segregation}. Only one sample accepted.Accepted
    *     segregation modes: [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo,
    *     deNovoStrict, mendelianError, compoundHeterozygous ]. Value is case insensitive. e.g. HG0097:DeNovo Sample must have parents defined
    *     and indexed. .
    * @param {String} [params.sampleData] - Filter by any SampleData field from samples. [{sample}:]{key}{op}{value}[,;]* . If no sample is
    *     specified, will use all samples from "sample" or "genotype" filter. e.g. DP>200 or HG0097:DP>200,HG0098:DP<10 . Many FORMAT fields can
    *     be combined. e.g. HG0097:DP>200;GT=1/1,0/1,HG0098:DP<10.
    * @param {String} [params.sampleAnnotation] - Selects some samples using metadata information from Catalog. e.g.
    *     age>20;phenotype=hpo:123,hpo:456;name=smith.
    * @param {String} [params.cohort] - Select variants with calculated stats for the selected cohorts.
    * @param {String} [params.cohortStatsRef] - Reference Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsAlt] - Alternate Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMaf] - Minor Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsMgf] - Minor Genotype Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4.
    * @param {String} [params.cohortStatsPass] - Filter PASS frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL>0.8.
    * @param {String} [params.missingAlleles] - Number of missing alleles: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.missingGenotypes] - Number of missing genotypes: [{study:}]{cohort}[<|>|<=|>=]{number}.
    * @param {String} [params.score] - Filter by variant score: [{study:}]{score}[<|>|<=|>=]{number}.
    * @param {String} [params.family] - Filter variants where any of the samples from the given family contains the variant (HET or
    *     HOM_ALT).
    * @param {String} [params.familyDisorder] - Specify the disorder to use for the family segregation.
    * @param {String} [params.familySegregation] - Filter by segregation mode from a given family. Accepted values: [ autosomalDominant,
    *     autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, deNovoStrict, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.familyMembers] - Sub set of the members of a given family.
    * @param {String} [params.familyProband] - Specify the proband child to use for the family segregation.
    * @param {String} [params.gene] - List of genes, most gene IDs are accepted (HGNC, Ensembl gene, ...). This is an alias to 'xref'
    *     parameter.
    * @param {String} [params.ct] - List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578. Accepts aliases
    *     'loss_of_function' and 'protein_altering'.
    * @param {String} [params.xref] - List of any external reference, these can be genes, proteins or variants. Accepted IDs include HGNC,
    *     Ensembl genes, dbSNP, ClinVar, HPO, Cosmic, ...
    * @param {String} [params.biotype] - List of biotypes, e.g. protein_coding.
    * @param {String} [params.proteinSubstitution] - Protein substitution scores include SIFT and PolyPhen. You can query using the score
    *     {protein_score}[<|>|<=|>=]{number} or the description {protein_score}[~=|=]{description} e.g. polyphen>0.1,sift=tolerant.
    * @param {String} [params.conservation] - Filter by conservation score: {conservation_score}[<|>|<=|>=]{number} e.g.
    *     phastCons>0.5,phylop<0.1,gerp>0.1.
    * @param {String} [params.populationFrequencyAlt] - Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyRef] - Reference Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.populationFrequencyMaf] - Population minor allele frequency: {study}:{population}[<|>|<=|>=]{number}. e.g.
    *     1000G:ALL<0.01.
    * @param {String} [params.transcriptFlag] - List of transcript flags. e.g. canonical, CCDS, basic, LRG, MANE Select, MANE Plus Clinical,
    *     EGLH_HaemOnc, TSO500.
    * @param {String} [params.geneTraitId] - List of gene trait association id. e.g. "umls:C0007222" , "OMIM:269600".
    * @param {String} [params.go] - List of GO (Gene Ontology) terms. e.g. "GO:0002020".
    * @param {String} [params.expression] - List of tissues of interest. e.g. "lung".
    * @param {String} [params.proteinKeyword] - List of Uniprot protein variant annotation keywords.
    * @param {String} [params.drug] - List of drug names.
    * @param {String} [params.functionalScore] - Functional score: {functional_score}[<|>|<=|>=]{number} e.g. cadd_scaled>5.2 ,
    *     cadd_raw<=0.3.
    * @param {String} [params.clinical] - Clinical source: clinvar, cosmic.
    * @param {String} [params.clinicalSignificance] - Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic.
    * @param {Boolean} [params.clinicalConfirmedStatus] - Clinical confirmed status.
    * @param {String} [params.customAnnotation] - Custom annotation: {key}[<|>|<=|>=]{number} or {key}[~=|=]{text}.
    * @param {String} [params.panel] - Filter by genes from the given disease panel.
    * @param {String} [params.panelModeOfInheritance] - Filter genes from specific panels that match certain mode of inheritance. Accepted
    *     values : [ autosomalDominant, autosomalRecessive, XLinkedDominant, XLinkedRecessive, YLinked, mitochondrial, deNovo, mendelianError,
    *     compoundHeterozygous ].
    * @param {String} [params.panelConfidence] - Filter genes from specific panels that match certain confidence. Accepted values : [ high,
    *     medium, low, rejected ].
    * @param {String} [params.panelRoleInCancer] - Filter genes from specific panels that match certain role in cancer. Accepted values : [
    *     both, oncogene, tumorSuppressorGene, fusion ].
    * @param {String} [params.panelFeatureType] - Filter elements from specific panels by type. Accepted values : [ gene, region, str,
    *     variant ].
    * @param {Boolean} [params.panelIntersection] - Intersect panel genes and regions with given genes and regions from que input query.
    *     This will prevent returning variants from regions out of the panel.
    * @param {String} [params.trait] - List of traits, based on ClinVar, HPO, COSMIC, i.e.: IDs, histologies, descriptions,...
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    queryVariant(params) {
        return this._get("analysis", null, "clinical/variant", null, "query", params);
    }

    /** Returns the acl of the clinical analyses. If member is provided, it will only return the acl for the member.
    * @param {String} clinicalAnalyses - Comma separated list of clinical analysis IDs or names up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.member] - User or group ID.
    * @param {Boolean} [params.silent = "false"] - Boolean to retrieve all possible entries that are queried for, false to raise an
    *     exception whenever one of the entries looked for cannot be shown for whichever reason. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    acl(clinicalAnalyses, params) {
        return this._get("analysis", null, "clinical", clinicalAnalyses, "acl", params);
    }

    /** Delete clinical analyses
    * @param {String} clinicalAnalyses - Comma separated list of clinical analysis IDs or names up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.force = "false"] - Force deletion if the ClinicalAnalysis contains interpretations or is locked. The default
    *     value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    delete(clinicalAnalyses, params) {
        return this._delete("analysis", null, "clinical", clinicalAnalyses, "delete", params);
    }

    /** Update clinical analysis attributes
    * @param {String} clinicalAnalyses - Comma separated list of clinical analysis IDs.
    * @param {Object} data - JSON containing clinical analysis information.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {"ADD REMOVE REPLACE"} [params.commentsAction = "ADD"] - Action to be performed if the array of comments is being updated. The
    *     default value is ADD.
    * @param {"ADD SET REMOVE"} [params.flagsAction = "ADD"] - Action to be performed if the array of flags is being updated. The default
    *     value is ADD.
    * @param {"ADD SET REMOVE"} [params.analystsAction = "ADD"] - Action to be performed if the array of analysts is being updated. The
    *     default value is ADD.
    * @param {"ADD SET REMOVE"} [params.filesAction = "ADD"] - Action to be performed if the array of files is being updated. The default
    *     value is ADD.
    * @param {"ADD SET REMOVE"} [params.panelsAction = "ADD"] - Action to be performed if the array of panels is being updated. The default
    *     value is ADD.
    * @param {"ADD SET REMOVE"} [params.annotationSetsAction = "ADD"] - Action to be performed if the array of annotationSets is being
    *     updated. The default value is ADD.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    update(clinicalAnalyses, data, params) {
        return this._post("analysis", null, "clinical", clinicalAnalyses, "update", data, params);
    }

    /** Update annotations from an annotationSet
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {String} annotationSet - AnnotationSet ID to be updated.
    * @param {Object} [data] - Json containing the map of annotations when the action is ADD, SET or REPLACE, a json with only the key
    *     'remove' containing the comma separated variables to be removed as a value when the action is REMOVE or a json with only the key
    *     'reset' containing the comma separated variables that will be set to the default value when the action is RESET.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {"ADD SET REMOVE RESET REPLACE"} [params.action = "ADD"] - Action to be performed: ADD to add new annotations; REPLACE to
    *     replace the value of an already existing annotation; SET to set the new list of annotations removing any possible old annotations;
    *     REMOVE to remove some annotations; RESET to set some annotations to the default value configured in the corresponding variables of the
    *     VariableSet if any. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateAnnotationSetsAnnotations(clinicalAnalysis, annotationSet, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "annotationSets", annotationSet, "annotations/update", data, params);
    }

    /** Clinical analysis info
    * @param {String} clinicalAnalysis - Comma separated list of clinical analysis IDs or names up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.flattenAnnotations = "false"] - Flatten the annotations?. The default value is false.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Boolean} [params.deleted = "false"] - Boolean to retrieve deleted entries. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    info(clinicalAnalysis, params) {
        return this._get("analysis", null, "clinical", clinicalAnalysis, "info", params);
    }

    /** Create a new Interpretation
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {Object} data - JSON containing clinical interpretation information.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - [[organization@]project:]study id.
    * @param {"PRIMARY SECONDARY"} [params.setAs = "SECONDARY"] - Set interpretation as. The default value is SECONDARY.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    createInterpretation(clinicalAnalysis, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", null, "create", data, params);
    }

    /** Clear the fields of the main interpretation of the Clinical Analysis
    * @param {String} interpretations - Interpretation IDs of the Clinical Analysis.
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - [[organization@]project:]study ID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    clearInterpretation(clinicalAnalysis, interpretations, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretations, "clear", params);
    }

    /** Delete interpretation
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {String} interpretations - Interpretation IDs of the Clinical Analysis.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - [[organization@]project:]study ID.
    * @param {String} [params.setAsPrimary] - Interpretation id to set as primary from the list of secondaries in case of deleting the
    *     actual primary one.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    deleteInterpretation(clinicalAnalysis, interpretations, params) {
        return this._delete("analysis/clinical", clinicalAnalysis, "interpretation", interpretations, "delete", params);
    }

    /** Revert to a previous interpretation version
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {String} interpretation - Interpretation ID.
    * @param {Number} version - Version to revert to.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - [[organization@]project:]study ID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    revertInterpretation(clinicalAnalysis, interpretation, version, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretation, "revert", {version, ...params});
    }

    /** Update interpretation fields
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {String} interpretation - Interpretation ID.
    * @param {Object} data - JSON containing clinical interpretation information.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - [[organization@]project:]study ID.
    * @param {"ADD SET REMOVE REPLACE"} [params.primaryFindingsAction = "ADD"] - Action to be performed if the array of primary findings is
    *     being updated. The default value is ADD.
    * @param {"ADD SET REMOVE"} [params.methodsAction = "ADD"] - Action to be performed if the array of methods is being updated. The
    *     default value is ADD.
    * @param {"ADD SET REMOVE REPLACE"} [params.secondaryFindingsAction = "ADD"] - Action to be performed if the array of secondary findings
    *     is being updated. The default value is ADD.
    * @param {"ADD REMOVE REPLACE"} [params.commentsAction = "ADD"] - Action to be performed if the array of comments is being updated. To
    *     REMOVE or REPLACE, the date will need to be provided to identify the comment. The default value is ADD.
    * @param {"ADD SET REMOVE"} [params.panelsAction = "ADD"] - Action to be performed if the array of panels is being updated. The default
    *     value is ADD.
    * @param {"PRIMARY SECONDARY"} [params.setAs] - Set interpretation as.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateInterpretation(clinicalAnalysis, interpretation, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "interpretation", interpretation, "update", data, params);
    }

    /** Update clinical analysis report
    * @param {String} clinicalAnalysis - Clinical analysis ID.
    * @param {Object} data - JSON containing clinical report information.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {"ADD REMOVE REPLACE"} [params.commentsAction = "ADD"] - Action to be performed if the array of comments is being updated. The
    *     default value is ADD.
    * @param {"ADD SET REMOVE"} [params.supportingEvidencesAction = "ADD"] - Action to be performed if the array of supporting evidences is
    *     being updated. The default value is ADD.
    * @param {"ADD SET REMOVE"} [params.filesAction = "ADD"] - Action to be performed if the array of files is being updated. The default
    *     value is ADD.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateReport(clinicalAnalysis, data, params) {
        return this._post("analysis/clinical", clinicalAnalysis, "report", null, "update", data, params);
    }

}
