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

export default class Job {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data) {
        return this._post("jobs", null, "acl", members, "update", data, action);
    }

    aggregationStats(params) {
        return this._get("jobs", null, null, null, "aggregationStats", params);
    }

    create(data, params) {
        return this._post("jobs", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("jobs", null, null, null, "distinct", {field, ...params});
    }

    retry(data, params) {
        return this._post("jobs", null, null, null, "retry", data, params);
    }

    // eslint-disable-next-line no-unused-vars
    search(params) {
        // Mocked response to prevent error in navbar
        // This returns an object containing a dummy getResults function, simulating that there are no jobs returned by rest
        return Promise.resolve({
            getResults: () => [],
        });
    }

    top(params) {
        return this._get("jobs", null, null, null, "top", params);
    }

    acl(jobs, params) {
        return this._get("jobs", jobs, null, null, "acl", params);
    }

    delete(jobs, params) {
        return this._delete("jobs", jobs, null, null, "delete", params);
    }

    info(jobs, params) {
        return this._get("jobs", jobs, null, null, "info", params);
    }

    update(jobs, data, params) {
        return this._post("jobs", jobs, null, null, "update", data, params);
    }

    headLog(job, params) {
        let result;

        switch (job) {
            default:
                result = {
                    content: "CONTENT TEST PURPOSE JOB headLog",
                    eof: false,
                    fileId: job,
                    lines: 500,
                    offset: 68888,
                    size: 68888
                };
        }
        return Promise.resolve(new RestResponse({responses: [{results: [result]}]}));
    }

    tailLog(job, params) {
        let result;
        switch (job) {
            default:
                result = {
                    fileId: "/opt/opencga/sessions/jobs/JOBS/opencga/20230605/pedigree-graph-init.20230605193906.u8QidK/pedigree-graph-init.20230605193906.u8QidK.err",
                    eof: true,
                    offset: 6085,
                    size: 6084,
                    lines: 27,
                    content: "CONTENT TEST PURPOSE JOB tailLog",
                };
        }
        return Promise.resolve(new RestResponse({responses: [{results: [result]}]}));
    }

}
