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

import UtilsNew from "../../../../core/utils-new.js";

export default class Family {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("families", null, "acl", members, "update", data, {action, ...params});
    }

    aggregationStats(params) {
        return this._get("families", null, null, null, "aggregationStats", params);
    }

    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("families", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    create(data, params) {
        return this._post("families", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("families", null, null, null, "distinct", {field, ...params});
    }

    search(params) {
        return this._get("families", null, null, null, "search", params);
    }

    acl(families, params) {
        return this._get("families", families, null, null, "acl", params);
    }

    delete(families, params) {
        return this._delete("families", families, null, null, "delete", params);
    }

    info(families, params) {
        // Mocked response for Sample update test
        if (families === "899077") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/families-platinum.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }
        return Promise.resolve({});
    }

    update(families, data, params) {
        return this._post("families", families, null, null, "update", data, params);
    }

    updateAnnotationSetsAnnotations(family, annotationSet, data, params) {
        return this._post("families", family, "annotationSets", annotationSet, "annotations/update", data, params);
    }

}
