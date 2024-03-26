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

export default class Admin {

    constructor(config) {
        this._config = config;
    }

    groupByAudit(fields, entity, params) {
        return this._get("admin", null, "audit", null, "groupBy", {fields, entity, ...params});
    }

    indexStatsCatalog(params) {
        return this._post("admin", null, "catalog", null, "indexStats", params);
    }

    installCatalog(data) {
        return this._post("admin", null, "catalog", null, "install", data);
    }

    jwtCatalog(data) {
        return this._post("admin", null, "catalog", null, "jwt", data);
    }

    createUsers(data) {
        return this._post("admin", null, "users", null, "create", data);
    }

    importUsers(data) {
        return this._post("admin", null, "users", null, "import", data);
    }

    searchUsers(params) {
        return this._get("admin", null, "users", null, "search", params);
    }

    syncUsers(data) {
        return this._post("admin", null, "users", null, "sync", data);
    }

}
