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

import UtilsNew from "../../../core/utils-new.js";
import {RestResponse} from "../../../core/clients/rest-response";

export class CellBaseClientMock {

    constructor(config) {
        this._config = {
            ...this.getDefaultConfig(),
            ...config,
        };
    }

    getDefaultConfig() {
        return {
            host: "https://ws.zettagenomics.com/cellbase",
            version: "v5.1",
            species: "hsapiens",
            testDataVersion: "",
        };
    }

    // eslint-disable-next-line no-unused-vars
    getMeta(param, options) {
        return Promise.reject(new Error("Not implemented"));
    }

    // eslint-disable-next-line no-unused-vars
    get(category, subcategory, ids, resource, params, options) {
        if (category === "genomic") {
            // Genome browser: import chromosomes
            if (subcategory === "chromosome" && resource === "search") {
                return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-chromosomes.json`);
            }
            // Genome browser: import genes in specified region
            if (subcategory === "region" && resource === "gene") {
                if (ids === "17:42987481-43221279" || ids === "17:43089768-43118992") {
                    return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-region-17-43102293-43106467-genes.json`);
                }
            }
            // Genome browser: import variants in specified region
            if (subcategory === "region" && resource === "variant") {
                if (ids === "17:43089768-43118992") {
                    return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/genome-browser-region-17-43102293-43106467-variants.json`);
                }
            }
        }
        if (category === "feature") {
            if (subcategory === "ontology" && resource === "search") {
                switch (params.name) {
                    case "~/gli/i":
                        return UtilsNew.importJSONFile(`./test-data/${this._config.testDataVersion}/cellbase-autocomplete-phenotypes.json`)
                            .then(data => new RestResponse({responses: [{results: data}]}));
                    default:
                        break;
                }
            }


        }
        // Other request
        return Promise.reject(new Error("Not implemented"));
    }

}
