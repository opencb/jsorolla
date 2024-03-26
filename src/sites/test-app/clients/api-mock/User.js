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

import {RestResponse} from "../../../../core/clients/rest-response.js";

export default class User {

    constructor(config) {
        this._config = config;
    }

    create(data) {
        return this._post("users", null, null, null, "create", data);
    }

    login(data) {
        return this._post("users", null, null, null, "login", data);
    }

    password(data) {
        return this._post("users", null, null, null, "password", data);
    }

    info(users, params) {
        return this._get("users", users, null, null, "info", params);
    }

    configs(user, params) {
        return this._get("users", user, null, null, "configs", params);
    }

    updateConfigs(user, data, params) {
        let result;
        switch (params) {
            default:
                result = {
                    responses: [{
                        results: [
                            {...data.configuration}
                        ]
                    }]
                };
        }
        // return this._post("users", user, "configs", null, "update", data, params);
        return Promise.resolve(new RestResponse(result));
    }

    filters(user, params) {
        return this._get("users", user, null, null, "filters", params);
    }

    updateFilters(user, data, params) {
        return this._post("users", user, "filters", null, "update", data, params);
    }

    updateFilter(user, filterId, data) {
        return this._post("users", user, "filters", filterId, "update", data);
    }

    resetPassword(user) {
        return this._get("users", user, "password", null, "reset");
    }

    projects(user, params) {
        return this._get("users", user, null, null, "projects", params);
    }

    update(user, data, params) {
        return this._post("users", user, null, null, "update", data, params);
    }

}
