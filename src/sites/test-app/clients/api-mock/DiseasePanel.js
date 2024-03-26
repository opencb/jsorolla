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

export default class DiseasePanel {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("panels", null, "acl", members, "update", data, {action, ...params});
    }

    create(data, params) {
        return this._post("panels", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("panels", null, null, null, "distinct", {field, ...params});
    }

    importPanels(data, params) {
        return this._post("panels", null, null, null, "import", data, params);
    }

    search(params) {
        return this._get("panels", null, null, null, "search", params);
    }

    acl(panels, params) {
        return this._get("panels", panels, null, null, "acl", params);
    }

    delete(panels, params) {
        return this._delete("panels", panels, null, null, "delete", params);
    }

    info(panels, params) {
        // Mocked response for Disease Panel update test
        if (panels === "Early_onset_dystonia-PanelAppId-192") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/disease-panels-platinum.json`)
                .then(data => ({
                    responses: [{results: [data[0]]}]
                }));
        }
        return Promise.resolve({});
    }

    update(panels, data, params) {
        return this._post("panels", panels, null, null, "update", data, params);
    }

}
