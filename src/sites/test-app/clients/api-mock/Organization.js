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

export default class Organization {

    constructor(config) {
        this._config = config;
    }

    create(data, params) {
        return this._post("organizations", null, null, null, "create", data, params);
    }

    info(organization, params) {
        return this._get("organizations", organization, null, null, "info", params);
    }

    update(organization, data, params) {
        return this._post("organizations", organization, null, null, "update", data, params);
    }

}
