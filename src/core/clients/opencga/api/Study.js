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
 * This class contains the methods for the "Study" resource
 */

export default class Study extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Update the set of permissions granted for the member
    * @param {String} members - Comma separated list of user or group ids.
    * @param {Object} data - JSON containing the parameters to modify ACLs. 'template' could be either 'admin', 'analyst' or 'view_only'.
    * @param {"SET ADD REMOVE RESET"} action = "ADD" - Action to be performed [ADD, SET, REMOVE or RESET]. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateAcl(members, action, data) {
        return this._post("studies", null, "acl", members, "update", data, action);
    }

    /** Create a new study
    * @param {Object} data - study.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {String} [params.project] - Project [organization@]project where project can be either the ID or the alias.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    create(data, params) {
        return this._post("studies", null, null, null, "create", data, params);
    }

    /** Search studies
    * @param {String} project - Project [organization@]project where project can be either the ID or the alias.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.name] - Study name.
    * @param {String} [params.id] - Study ID.
    * @param {String} [params.alias] - Study alias.
    * @param {String} [params.fqn] - Study full qualified name.
    * @param {String} [params.creationDate] - Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.status] - Filter by status.
    * @param {String} [params.attributes] - Attributes.
    * @param {String} [params.release] - Release value.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    search(project, params) {
        return this._get("studies", null, null, null, "search", {project, ...params});
    }

    /** Return the acl of the study. If member is provided, it will only return the acl for the member.
    * @param {String} studies - Comma separated list of Studies [[organization@]project:]study where study and project can be either the ID
    *     or UUID up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.member] - User or group id.
    * @param {Boolean} [params.silent = "false"] - Boolean to retrieve all possible entries that are queried for, false to raise an
    *     exception whenever one of the entries looked for cannot be shown for whichever reason. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    acl(studies, params) {
        return this._get("studies", studies, null, null, "acl", params);
    }

    /** Fetch study information
    * @param {String} studies - Comma separated list of Studies [[organization@]project:]study where study and project can be either the ID
    *     or UUID up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    info(studies, params) {
        return this._get("studies", studies, null, null, "info", params);
    }

    /** Search audit collection
    * @param {String} study - Study ID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count] - Get the total number of results matching the query. Deactivated by default.
    * @param {String} [params.operationId] - Audit operation UUID.
    * @param {String} [params.userId] - User ID.
    * @param {String} [params.action] - Action performed by the user.
    * @param {"AUDIT ORGANIZATION USER PROJECT STUDY FILE SAMPLE JOB INDIVIDUAL COHORT DISEASE_PANEL FAMILY CLINICAL_ANALYSIS INTERPRETATION
    *     VARIANT ALIGNMENT CLINICAL EXPRESSION RGA FUNCTIONAL"} [params.resource] - Resource involved.
    * @param {String} [params.resourceId] - Resource ID.
    * @param {String} [params.resourceUuid] - resource UUID.
    * @param {"SUCCESS ERROR"} [params.status] - Filter by status.
    * @param {String} [params.date] - Date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    searchAudit(study, params) {
        return this._get("studies", study, "audit", null, "search", params);
    }

    /** Return the groups present in the study. For owners and administrators only.
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.id] - Group id. If provided, it will only fetch information for the provided group.
    * @param {Boolean} [params.silent = "false"] - Boolean to retrieve all possible entries that are queried for, false to raise an
    *     exception whenever one of the entries looked for cannot be shown for whichever reason. The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    groups(study, params) {
        return this._get("studies", study, null, null, "groups", params);
    }

    /** Add or remove a group
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {"ADD REMOVE"} [params.action = "ADD"] - Action to be performed: ADD or REMOVE a group. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateGroups(study, data, params) {
        return this._post("studies", study, "groups", null, "update", data, params);
    }

    /** Add, set or remove users from an existing group
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} group - Group name.
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {"ADD SET REMOVE"} [params.action = "ADD"] - Action to be performed: ADD, SET or REMOVE users to/from a group. The default
    *     value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateGroupsUsers(study, group, data, params) {
        return this._post("studies", study, "groups", group, "users/update", data, params);
    }

    /** Fetch permission rules
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {"SAMPLES FILES COHORTS INDIVIDUALS FAMILIES JOBS CLINICAL_ANALYSES DISEASE_PANELS"} entity - Entity where the permission rules
    *     should be applied to.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    permissionRules(study, entity) {
        return this._get("studies", study, null, null, "permissionRules", entity);
    }

    /** Add or remove a permission rule
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} data - JSON containing the permission rule to be created or removed.
    * @param {"SAMPLES FILES COHORTS INDIVIDUALS FAMILIES JOBS CLINICAL_ANALYSES DISEASE_PANELS"} entity - Entity where the permission rules
    *     should be applied to.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {"ADD REMOVE REVERT NONE"} [params.action = "ADD"] - Action to be performed: ADD to add a new permission rule; REMOVE to remove
    *     all permissions assigned by an existing permission rule (even if it overlaps any manual permission); REVERT to remove all permissions
    *     assigned by an existing permission rule (keep manual overlaps); NONE to remove an existing permission rule without removing any
    *     permissions that could have been assigned already by the permission rule. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updatePermissionRules(study, entity, data, params) {
        return this._post("studies", study, "permissionRules", null, "update", data, {entity, ...params});
    }

    /** Execute template
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} data - Template loader parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.jobId] - Job ID. It must be a unique string within the study. An ID will be autogenerated automatically if not
    *     provided.
    * @param {String} [params.jobDependsOn] - Comma separated list of existing job IDs the job will depend on.
    * @param {String} [params.jobDescription] - Job description.
    * @param {String} [params.jobTags] - Job tags.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    runTemplates(study, data, params) {
        return this._post("studies", study, "templates", null, "run", data, params);
    }

    /** Resource to upload a zipped template
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {InputStream} [params.file] - File to upload.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    uploadTemplates(study, params) {
        return this._post("studies", study, "templates", null, "upload", params);
    }

    /** Delete template
    * @param {String} [study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} templateId - Template id.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    deleteTemplates(study, templateId) {
        return this._delete("studies", study, "templates", templateId, "delete");
    }

    /** Update some study attributes
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} data - JSON containing the params to be updated.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    update(study, data, params) {
        return this._post("studies", study, null, null, "update", data, params);
    }

    /** Fetch variableSets from a study
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.id] - Id of the variableSet to be retrieved. If no id is passed, it will show all the variableSets of the
    *     study.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    variableSets(study, params) {
        return this._get("studies", study, null, null, "variableSets", params);
    }

    /** Add or remove a variableSet
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {Object} data - JSON containing the VariableSet to be created or removed.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {"ADD REMOVE FORCE_REMOVE"} [params.action = "ADD"] - Action to be performed: ADD, REMOVE or FORCE_REMOVE a variableSet. The
    *     default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateVariableSets(study, data, params) {
        return this._post("studies", study, "variableSets", null, "update", data, params);
    }

    /** Add or remove variables to a VariableSet
    * @param {String} study - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} variableSet - VariableSet id of the VariableSet to be updated.
    * @param {Object} data - JSON containing the variable to be added or removed. For removing, only the variable id will be needed.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {"ADD REMOVE"} [params.action = "ADD"] - Action to be performed: ADD or REMOVE a variable. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    updateVariableSetsVariables(study, variableSet, data, params) {
        return this._post("studies", study, "variableSets", variableSet, "variables/update", data, params);
    }

}
