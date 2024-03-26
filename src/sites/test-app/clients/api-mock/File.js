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
import UtilsNew from "../../../../core/utils-new.js";

export default class File {

    constructor(config) {
        this._config = config;
    }

    updateAcl(members, action, data, params) {
        return this._post("files", null, "acl", members, "update", data, {action, ...params});
    }

    aggregationStats(params) {
        return this._get("files", null, null, null, "aggregationStats", params);
    }

    loadAnnotationSets(variableSetId, path, data, params) {
        return this._post("files", null, "annotationSets", null, "load", data, {variableSetId, path, ...params});
    }

    bioformats() {
        return this._get("files", null, null, null, "bioformats");
    }

    create(data, params) {
        return this._post("files", null, null, null, "create", data, params);
    }

    distinct(field, params) {
        return this._get("files", null, null, null, "distinct", {field, ...params});
    }

    fetch(data, params) {
        return this._post("files", null, null, null, "fetch", data, params);
    }

    formats() {
        return this._get("files", null, null, null, "formats");
    }

    link(data, params) {
        return this._post("files", null, null, null, "link", data, params);
    }

    runLink(data, params) {
        return this._post("files", null, "link", null, "run", data, params);
    }

    runPostlink(data, params) {
        return this._post("files", null, "postlink", null, "run", data, params);
    }

    search(params) {
        // Response for Genome browser test
        if (params?.study === "TEST_STUDY_CANCER_GB" && params?.sampleIds === "TEST_SAMPLE_GB") {
            return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-cancer-files-alignment.json`);

        }

        return this._get("files", null, null, null, "search", params);
    }

    upload(params) {
        return this._post("files", null, null, null, "upload", params);
    }

    acl(files, params) {
        return this._get("files", files, null, null, "acl", params);
    }

    delete(files, params) {
        return this._delete("files", files, null, null, "delete", params);
    }

    info(files, params) {
        return this._get("files", files, null, null, "info", params);
    }

    unlink(files, params) {
        return this._delete("files", files, null, null, "unlink", params);
    }

    update(files, data, params) {
        return this._post("files", files, null, null, "update", data, params);
    }

    updateAnnotationSetsAnnotations(file, annotationSet, data, params) {
        return this._post("files", file, "annotationSets", annotationSet, "annotations/update", data, params);
    }

    download(file, params) {
        return this._get("files", file, null, null, "download", params);
    }

    grep(file, params) {
        return this._get("files", file, null, null, "grep", params);
    }

    head(file, params) {
        let result;
        switch (file) {
            default:
                result = {
                    responses: [{
                        results: [
                            {
                                "fileId": "/opt/opencga/variants/demo/GIAB_ChineseTrio/data/HG005_GRCh38_1_22_v4.2.1_benchmark.vcf.gz",
                                "eof": false,
                                "offset": 2058,
                                "size": 2058,
                                "lines": 20,
                                "content": "##fileformat=VCFv4.2" +
                                    "\n##fileDate=20160824\n##CL=vcffilter -i filtered-phase-transfer.vcf.gz -o - --javascript \"ensureFormatHeader(\\\"" +
                                    "##FORMAT=<ID=PS,Number=1,Type=Integer,Description=\\\\\\\"Phase set for GT\\\\\\\">\\\"); function record() {if(HG005.GT==\\\"1/1\\\")" +
                                    "{ INTEGRATION.IPS=\\\".\\\"; INTEGRATION.PS=\\\"HOMVAR\\\"; INTEGRATION.GT=\\\"1|1\\\";} else {if((INTEGRATION.GT==\\\"0/1\\\" || INTEGRATION.GT==\\\"1/2\\\" || " +
                                    "INTEGRATION.GT==\\\"2/1\\\" || INTEGRATION.GT==\\\"1/0\\\") ) {if(INTEGRATION.IPS.length>1) {INTEGRATION.PS=INTEGRATION.IPS; INTEGRATION.GT=INTEGRATION.IGT;} else"+
                                    "{INTEGRATION.PS=\\\".\\\";};} else { if((INTEGRATION.IPS.length<2)) { INTEGRATION.IPS=\\\".\\\";} INTEGRATION.PS=\\\"PATMAT\\\";};};}\"\n##RUN-ID=e8ffb950-52ea-4f42-9ce3-83b1d3033f3a\n"+
                                    "## TESTING PURPOSE TESITNG PURPOSE FILE:" + file + " TESTING PURPOSE FILE"
                            }
                        ]
                    }]
                };
        }
        return Promise.resolve(new RestResponse(result));
    }

    image(file, params) {
        return this._get("files", file, null, null, "image", params);
    }

    refresh(file, params) {
        return this._get("files", file, null, null, "refresh", params);
    }

    tail(file, params) {
        return this._get("files", file, null, null, "tail", params);
    }

    list(folder, params) {
        return this._get("files", folder, null, null, "list", params);
    }

    tree(folder, params) {
        return this._get("files", folder, null, null, "tree", params);
    }

}
