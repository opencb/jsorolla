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

export default class Meta {

    constructor(config) {
        this._config = config;
    }

    about() {
        const result = {
            "responses": [
                {
                    "results": [
                        {
                            "Program": "OpenCGA (OpenCB)",
                            "Git commit": "d486ff459a8c76fd0ac7805b27d6fd71d72f425d",
                            "Description": "Big Data platform for processing and analysing NGS data",
                            "Version": "2.6.0",
                            "Git branch": "master"
                        }
                    ],
                }
            ]
        };
        return Promise.resolve(new RestResponse(result));
    }

    api(params) {
        return this._get("meta", null, null, null, "api", params);
    }

    fail() {
        return this._get("meta", null, null, null, "fail");
    }

    model() {
        return this._get("meta", null, null, null, "model");
    }

    ping() {
        return this._get("meta", null, null, null, "ping");
    }

    status() {
        return this._get("meta", null, null, null, "status");
    }

}
