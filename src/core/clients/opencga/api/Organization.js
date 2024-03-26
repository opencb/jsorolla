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
 * This class contains the methods for the "Organization" resource
 */

export default class Organization extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Create a new organization
    * @param {Object} data - JSON containing the organization to be created.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    create(data, params) {
        return this._post("organizations", null, null, null, "create", data, params);
    }

    /** Return the organization information
    * @param {String} organization - Organization id.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    info(organization, params) {
        return this._get("organizations", organization, null, null, "info", params);
    }

    /** Update some organization attributes
    * @param {String} organization - Organization id.
    * @param {Object} data - JSON containing the params to be updated.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.include] - Fields included in the response, whole JSON path must be provided.
    * @param {String} [params.exclude] - Fields excluded in the response, whole JSON path must be provided.
    * @param {Boolean} [params.includeResult = "false"] - Flag indicating to include the created or updated document result in the response.
    *     The default value is false.
    * @param {"ADD REMOVE"} [params.adminsAction = "ADD"] - Action to be performed if the array of admins is being updated. The default
    *     value is ADD.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    update(organization, data, params) {
        return this._post("organizations", organization, null, null, "update", data, params);
    }

}
