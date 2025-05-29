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
import UtilsNew from "../../utils-new.js";

export class CellBaseClient {

    constructor(config) {
        this.setConfig(config);
        this.restClient = new RestClient();
        this.check();
    }

    async check() {
        const globalEvent = (type, value) => {
            globalThis.dispatchEvent(
                new CustomEvent(type, {
                    detail: value
                }));
        };
        if (!this._config?.host) {
            globalEvent("hostInit", {
                host: "cellbase",
                value: "NOT DEFINED"
            });
        } else {
            this.getMeta("about")
                .then(response => {
                    const result = response?.response?.[0]?.result[0];
                    // Older versions of cellbase are using 'Version: ' as the key instead of 'Version' (Issue #185).
                    // To keep compatibility, we will check for both keys, but in the future only the newest key will be used.
                    globalEvent("hostInit", {
                        host: "cellbase",
                        value: "v" + (result["Version"] || result["Version: "]),
                    });
                })
                .catch(e => {
                    console.error(e);
                    // globalEvent("signingInError", {value: "Cellbase host not available."});
                    globalEvent("hostInit", {
                        host: "cellbase",
                        value: "NOT AVAILABLE"
                    });
                });
        }
    }

    /*
     * This method has been implemented to be backward compatible with old cellbase-manager.js
     */
    getOldWay(args) {
        this._config.species = args.species.id || this._config.species;
        return this.get(args.category, args.subcategory, args.id, args.resource, args.params, args.options);
    }

    getMeta(param, options = {}) {
        const host = options.host || this._config.host;
        const version = options.version || this._config.version;

        let url;
        if (param === "dataReleases") {
            // We need to add the species
            url = `${host}/webservices/rest/${version}/meta/${this._config.species}/${param}`;
        } else {
            url = `${host}/webservices/rest/${version}/meta/${param}`;
        }

        // By default, we assume https protocol instead of http
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `http://${url}`;
        }

        // Append search params
        const searchParams = this._createSearchParams({});
        if (searchParams) {
            url += `?${searchParams}`;
        }

        // options.error = function() {
        //     if (++count < hosts.length) {
        //         // we need a new URL
        //         url = "http://" + hosts[count] + "/webservices/rest/" + version + "/" + "meta" + "/" + param;
        //         response = this.restClient.call(url, options);
        //     } else {
        //         userError(this);
        //     }
        // };
        // response = this.restClient.call(url, options);
        const k = this.generateKey(param);
        return this.restClient.call(url, options, k);
    }

    getFiles(folderId, resource, params, options = {}) {
        const host = options.host || this._config.host;
        const version = options.version || this._config.version;
        const species = options.species || this._config.species;
        let url = `http://${host}/webservices/rest/${version}/${species}/` + "files";

        if (typeof folderId !== "undefined" && folderId !== null && folderId !== "") {
            url += `/${folderId}/${resource}`;
        } else {
            url += `/${resource}`;
        }

        // We add the query params formatted in URL
        const queryParamsUrl = this._createSuffixKey(params, false);
        if (typeof queryParamsUrl !== "undefined" && queryParamsUrl !== null && queryParamsUrl !== "") {
            url += `?${queryParamsUrl}`;
        }
        const k = this.generateKey(params);
        return this.restClient.call(url, options, k);
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

        // By default we assume https protocol instead of http
        let url = _host + `/webservices/rest/${version}/${species}/`;
        if (!url.startsWith("https://") && !url.startsWith("http://")) {
            url = `https://${_host}/webservices/rest/${version}/${species}/`;
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

    _createSuffixKey(params, suffix) {
        // Do not remove the sort! we need to sort the array to ensure that the key of the cache will be correct
        const keyArray = Object.keys(params || {}).sort();
        const keyValueArray = [];
        for (const i in keyArray) {
            if (Object.prototype.hasOwnProperty.call(keyArray, i)) {
                keyValueArray.push(`${keyArray[i]}=${encodeURIComponent(params[keyArray[i]])}`);
            }
        }
        let suffixKey = keyValueArray.join("&");
        // suffixKey is preceded by '_' if suffix is true. Else it is treated as queryParam that needs to be sorted
        if (suffix && suffixKey !== "") {
            suffixKey = `_${suffixKey}`;
        }
        return suffixKey;
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

    generateKey(params) {
        // params is added to the key to avoid unwanted request abort.
        // We can do it because we don't have tables in IVA that queries Cellbase.
        return `${new Error().stack.split("\n    at ").slice(0, 5).join("|") + JSON.stringify(params)}`;
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
