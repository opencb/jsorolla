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
 * This class contains the methods for the "Project" resource
 */

export default class Project extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Create a new project
    * @param {Object} data - JSON containing the mandatory parameters.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    create(data, params) {
        return this._post("projects", null, null, null, "create", data, params);
    }

    /** Search projects
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @param {String} [params.organization] - Project organization.
    * @param {String} [params.id] - Project [organization@]project where project can be either the ID or the alias.
    * @param {String} [params.name] - Project name.
    * @param {String} [params.fqn] - Project fqn.
    * @param {String} [params.description] - Project description.
    * @param {String} [params.study] - Study id.
    * @param {String} [params.creationDate] - Creation date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.modificationDate] - Modification date. Format: yyyyMMddHHmmss. Examples: >2018, 2017-2018, <201805.
    * @param {String} [params.internalStatus] - Filter by internal status.
    * @param {String} [params.attributes] - Attributes.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    search(params) {
        return this._get("projects", null, null, null, "search", params);
    }

    /** Fetch project information
    * @param {String} projects - Comma separated list of projects [organization@]project up to a maximum of 100.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    info(projects, params) {
        return this._get("projects", projects, null, null, "info", params);
    }

    /** Increment current release number in the project
    * @param {String} project - Project [organization@]project where project can be either the ID or the alias.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    incRelease(project) {
        return this._post("projects", project, null, null, "incRelease");
    }

    /** Fetch all the studies contained in the project
    * @param {String} project - Project [organization@]project where project can be either the ID or the alias.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Number} [params.limit] - Number of results to be returned.
    * @param {Number} [params.skip] - Number of results to skip.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    studies(project, params) {
        return this._get("projects", project, null, null, "studies", params);
    }

    /** Update some project attributes
    * @param {String} project - Project [organization@]project where project can be either the ID or the alias.
    * @param {Object} data - JSON containing the params to be updated. It will be only possible to update organism fields not previously
    *     defined.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    update(project, data, params) {
        return this._post("projects", project, null, null, "update", data, params);
    }

}
