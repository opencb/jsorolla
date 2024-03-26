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
 * This class contains the methods for the "Admin" resource
 */

export default class Admin extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Group by operation
    * @param {String} fields - Comma separated list of fields by which to group by.
    * @param {"AUDIT ORGANIZATION USER PROJECT STUDY FILE SAMPLE JOB INDIVIDUAL COHORT DISEASE_PANEL FAMILY CLINICAL_ANALYSIS INTERPRETATION
    *     VARIANT ALIGNMENT CLINICAL EXPRESSION RGA FUNCTIONAL"} entity - Entity to be grouped by.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {Boolean} [params.count] - Count the number of elements matching the group.
    * @param {Number} [params.limit = "50"] - Maximum number of documents (groups) to be returned. The default value is 50.
    * @param {String} [params.action] - Action performed.
    * @param {String} [params.before] - Object before update.
    * @param {String} [params.after] - Object after update.
    * @param {String} [params.date] - Date <,<=,>,>=(Format: yyyyMMddHHmmss) and yyyyMMddHHmmss-yyyyMMddHHmmss.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    groupByAudit(fields, entity, params) {
        return this._get("admin", null, "audit", null, "groupBy", {fields, entity, ...params});
    }

    /** Install OpenCGA database
    * @param {Object} data - JSON containing the mandatory parameters.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    installCatalog(data) {
        return this._post("admin", null, "catalog", null, "install", data);
    }

    /** Change JWT secret key
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.organization] - Organization id.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    jwtCatalog(data, params) {
        return this._post("admin", null, "catalog", null, "jwt", data, params);
    }

    /** Create a new user
    * @param {Object} data - JSON containing the parameters.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    createUsers(data) {
        return this._post("admin", null, "users", null, "create", data);
    }

    /** Import users or a group of users from LDAP or AAD
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.organization] - Organization id.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    importUsers(data, params) {
        return this._post("admin", null, "users", null, "import", data, params);
    }

    /** User permissions
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.study] - Study [[organization@]project:]study where study and project can be either the ID or UUID.
    * @param {String} [params.entryIds] - Comma separated list of entry ids.
    * @param {String} [params.permissions] - Comma separated list of permissions to be retrieved.
    * @param {String} [params.category] - Category corresponding to the id's provided.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    permissionsUsers(params) {
        return this._get("admin", null, "users", null, "permissions", params);
    }

    /** User search method
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {Boolean} [params.count = "false"] - Get the total number of results matching the query. Deactivated by default. The default
    *     value is false.
    * @param {String} [params.organization] - Organization id.
    * @param {String} [params.user] - User ID.
    * @param {String} [params.account] - Account type [GUEST, FULL, ADMINISTRATOR].
    * @param {String} [params.authenticationId] - Authentication origin ID.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    searchUsers(params) {
        return this._get("admin", null, "users", null, "search", params);
    }

    /** Synchronise a group of users from an authentication origin with a group in a study from catalog
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.organization] - Organization id.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    syncUsers(data, params) {
        return this._post("admin", null, "users", null, "sync", data, params);
    }

    /** Add or remove users from existing groups
    * @param {String} user - User ID.
    * @param {Object} data - JSON containing the parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.organization] - Organization id.
    * @param {"ADD REMOVE"} [params.action = "ADD"] - Action to be performed: ADD or REMOVE user to/from groups. The default value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    usersUpdateGroups(user, data, params) {
        return this._post("admin/users", user, "groups", null, "update", data, params);
    }

}
