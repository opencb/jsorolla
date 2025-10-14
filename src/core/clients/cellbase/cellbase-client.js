/*
 * Copyright 2015-2016 OpenCB
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

import RestClient from "../rest-client.js";

export class CellBaseClient {

    constructor(config) {
        this.setConfig(config);
        this.restClient = new RestClient();
        this.check();
    }

    check() {
        const dispatchGlobalEvent = (type, value) => {
            globalThis.dispatchEvent(new CustomEvent(type, {
                detail: {
                    host: "cellbase",
                    value: value,
                },
            }));
        };

        if (!this._config?.host) {
            dispatchGlobalEvent("hostInit", "NOT DEFINED");
        } else {
            this.getMeta("about")
                .then(response => {
                    const result = response?.response?.[0]?.result[0];
                    // Older versions of cellbase are using 'Version: ' as the key instead of 'Version' (Issue #185).
                    // To keep compatibility, we will check for both keys, but in the future only the newest key will be used.
                    dispatchGlobalEvent("hostInit", "v" + (result["Version"] || result["Version: "]));
                })
                .catch(error => {
                    console.error(error);
                    dispatchGlobalEvent("hostInit", "NOT AVAILABLE");
                });
        }
    }

    getMeta(param, options = {}) {
        let host = options.host || this._config.host;
        const version = options.version || this._config.version;

        // Remove trailing '/' in the host
        if (host.endsWith("/")) {
            host = host.slice(0, -1);
        }

        let url = `${host}/webservices/rest/${version}/meta/${param}`;

        // If the param is 'dataReleases', we need to add the species to the URL
        if (param === "dataReleases") {
            url = `${host}/webservices/rest/${version}/meta/${this._config.species}/${param}`;
        }

        // By default, we assume https protocol instead of http
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
        }

        // append search params to the url
        const searchParams = this._createSearchParams({});
        if (searchParams) {
            url += `?${searchParams}`;
        }

        return this.restClient.call(url, options);
    }

    getGeneClient(id, resource, params, options) {
        return this.get("feature", "gene", id, resource, params, options);
    }

    getTranscriptClient(id, resource, params, options) {
        return this.get("feature", "transcript", id, resource, params, options);
    }

    getProteinClient(id, resource, params, options) {
        return this.get("feature", "protein", id, resource, params, options);
    }

    getVariationClient(id, resource, params, options) {
        return this.get("feature", "variation", id, resource, params, options);
    }

    getRegulatoryClient(id, resource, params, options) {
        return this.get("feature", "regulatory", id, resource, params, options);
    }

    get(category, subcategory, ids, resource, params, options = {}) {
        const host = options.host || this._config.host;
        const version = options.version || this._config.version;
        const species = options.species || this._config.species;
        const url = this._createRestUrl(host, version, species, category, subcategory, ids, resource, params);

        return this.restClient.call(url, options);
    }

    _createRestUrl(host, version, species, category, subcategory, ids, resource, params) {
        let _host = host;

        // Remove trailing '/'
        if (_host.endsWith("/")) {
            _host = _host.slice(0, -1);
        }

        // initialize the URL with the host, version, and species
        let url = _host + `/webservices/rest/${version}/${species}/`;

        // By default we assume https protocol instead of http
        if (!url.startsWith("https://") && !url.startsWith("http://")) {
            url = `https://${url}`;
        }

        // Some web services do not need IDs
        if (typeof ids !== "undefined" && ids !== null && ids.length > 0) {
            url += `${category}/${subcategory}/${ids}/${resource}`;
        } else {
            url += `${category}/${subcategory}/${resource}`;
        }

        // We add the search params formatted in URL
        const searchParamsUrl = this._createSearchParams(params);
        if (!!searchParamsUrl) {
            url += `?${searchParamsUrl}`;
        }
        return url;
    }

    _createSearchParams(params = {}) {
        const searchParams = new URLSearchParams(params);

        // check if apiKey is defined in the configuration
        if (this._config.apiKey) {
            searchParams.set("apiKey", this._config.apiKey);
        }

        // generate the search params string
        return searchParams.toString();
    }

    getConfig() {
        return this._config;
    }

    setConfig(config = {}) {
        this._config = {
            ...this.getDefaultConfig(),
            ...config,
        };
    }

    getDefaultConfig() {
        return {
            host: "https://ws.zettagenomics.com/cellbase",
            version: "v5.8",
            species: "hsapiens",
            apiKey: "",
        };
    }

}
