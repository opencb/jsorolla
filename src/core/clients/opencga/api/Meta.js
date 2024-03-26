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
 * This class contains the methods for the "Meta" resource
 */

export default class Meta extends OpenCGAParentClass {

    constructor(config) {
        super(config);
    }

    /** Returns info about current OpenCGA code.
    *
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    about() {
        return this._get("meta", null, null, null, "about");
    }

    /** API
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.category] - List of categories to get API from.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    api(params) {
        return this._get("meta", null, null, null, "api", params);
    }

    /** Ping Opencga webservices.
    *
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    fail() {
        return this._get("meta", null, null, null, "fail");
    }

    /** Opencga model webservices.
    * @param {Object} [params] - The Object containing the following optional parameters:
    * @param {String} [params.model] - Model description.
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    model(params) {
        return this._get("meta", null, null, null, "model", params);
    }

    /** Ping Opencga webservices.
    *
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    ping() {
        return this._get("meta", null, null, null, "ping");
    }

    /** Database status.
    *
    * @returns {Promise} Promise object in the form of RestResponse instance.
    */
    status() {
        return this._get("meta", null, null, null, "status");
    }

}
