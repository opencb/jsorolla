/*
 * Copyright 2015 OpenCB
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

/**
 * Created by imedina on 18/03/16.
 */

class CellBaseClient {

    constructor(config) {
        if (typeof config == 'undefined') {
            this._config = new CellBaseClientConfig();
        } else {
            this._config = config;
        }
        this.indexedDBCache = new IndexedDBCache("cellbase_cache");
    }

    setHosts(hosts) {
        if (typeof hosts != 'undefined') {
            this._config.setHosts(hosts);
        }
    }

    setVersion(version) {
        this._config.version = version;
    }


    /**
     * This method has been implemented to be backword compatible with old cellbase-manager.js
     */
    getOldWay(args) {
        return this.get(args.category, args.subcategory, args.id, args.resource, args.params, args.options);
    }

    getMeta(param, options) {
        if (options === undefined) {
            options = {};
        }
        let hosts = options.hosts || this._config.hosts;
        let version = options.version || this._config.version;
        let count = 0;
        // let response;
        let url = "http://" + hosts[count] + "/webservices/rest/" + version + "/" + "meta" + "/" + param;
        // options.error = function() {
        //     if (++count < hosts.length) {
        //         // we need a new URL
        //         url = "http://" + hosts[count] + "/webservices/rest/" + version + "/" + "meta" + "/" + param;
        //         response = RestClient.call(url, options);
        //     } else {
        //         userError(this);
        //     }
        // };
        // response = RestClient.call(url, options);
        return RestClient.callPromise(url, options);
    }

    getGeneClient(id, resource, params, options) {
        return this.get('feature', 'gene', id, resource, params, options);
    }

    getTranscriptClient(id, resource, params, options) {
        return this.get('feature', 'transcript', id, resource, params, options);
    }

    getVariationClient(id, resource, params, options) {
        return this.get('feature', 'variation', id, resource, params, options);
    }

    getRegulatoryClient(id, resource, params, options) {
        return this.get('feature', 'regulatory', id, resource, params, options);
    }


    get(category, subcategory, ids, resource, params, options) {
        if (options === undefined) {
            options = {};
        }
        // we store the options from the parameter or from the default values in config
        let hosts = options.hosts || this._config.hosts;
        if (typeof hosts == "string") {
            hosts = hosts.split(",");
        }
        let rpc = options.rpc || this._config.rpc;
        let cache = options.cache; // || this._config.cache;


        let response;
        if (cache == true && ids !== undefined) {
            let version = options.version || this._config.version;
            let species = options.species || this._config.species;
            let os = species + "_" + category + "_" + subcategory + "_" + version;

            let idArray = ids.split(",");
            let nonCachedIds = [];

            let cacheKeys = [];
            let queryParams = this._createSortedQueryParam(params);
            for (let i = 0; i < idArray.length; i++) {
                cacheKeys.push(idArray[i] + "_" + resource + "_" + queryParams);
            }

            console.time("Cache time:");
            var _this = this;
            this.indexedDBCache.getAll(os, cacheKeys, function (results) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i] == undefined) {
                        nonCachedIds.push(idArray[i]);
                    }
                }

                console.log(results)
                if (rpc.toLowerCase() === "rest") {
                    options.cacheFn = function(dataResponse) {
                        // we add the new fetched data to the cache
                        let queryParams = _this._createSortedQueryParam(params);
                        for (let i = 0; i < dataResponse.response.length; i++) {
                            _this.indexedDBCache.add(os, idArray[i] + "_" + resource + "_" + queryParams, dataResponse.response[i].result);
                        }

                        console.log(dataResponse);
                        response = {response: []};
                        let responses = [];
                        for (let i = 0, j = 0; i < results.length; i++) {
                            if (results[i] == undefined) {
                                results[i] = dataResponse.response[j++].result;
                            }
                            responses.push({result: results[i]});
                        }
                        response.response = responses;

                        console.log(response)
                        // If the call is OK then we execute the success function from the user
                        if (typeof options != "undefined" && typeof options.success === "function") {
                            options.success(response);
                        }
                    };
                    if (nonCachedIds.length > 0) {
                        response = _this._callRestWebService(hosts, category, subcategory, nonCachedIds, resource, params, options);
                    } else {
                        let response = {response: []};
                        let responses = [];
                        for (let i = 0; i < results.length; i++) {
                            responses.push({result: results[i]});
                        }
                        // response.response = responses;
                        response = Promise.resolve(responses);
                        // If the call is OK then we execute the success function from the user
                        if (typeof options != "undefined" && typeof options.success === "function") {
                            options.success(response);
                        }
                    }
                } else {
                    if (rpc.toLowerCase() === "grpc") {
                        response = _this._callGrpcService(hosts, category, subcategory, nonCachedIds, resource, params, options);
                    } else {
                        console.error("No valid RPC method: " + rpc + ". Accepted values are 'rest' and 'grpc'");
                    }
                }
                console.timeEnd("Cache time:");
            });
        } else {
            // let response;
            if (rpc.toLowerCase() === "rest") {
                response = this._callRestWebService(hosts, category, subcategory, ids, resource, params, options);
            } else {
                if (rpc.toLowerCase() === "grpc") {
                    response = this._callGrpcService(hosts, category, subcategory, ids, resource, params, options);
                } else {
                    console.error("No valid RPC method: " + rpc + ". Accepted values are 'rest' and 'grpc'");
                }
            }
        }

        return response;
    }

    _callRestWebService(hosts, category, subcategory, ids, resource, params, options) {
        let version = options.version || this._config.version;
        let species = options.species || this._config.species;

        let count = 0;
        let response;
        let url = this._createRestUrl(hosts[count], version, species, category, subcategory, ids, resource, params);

        let userError = options.error;
        var _this = this;
        // if the URL query fails we try with next host
        options.error = function() {
            if (++count < hosts.length) {
                // we need a new URL
                url = _this._createRestUrl(hosts[count], version, species, category, subcategory, ids, resource, params);
                response = RestClient.call(url, options);
            } else {
                userError(this);
            }
        };

        // response = RestClient.call(url, options);
        response = RestClient.callPromise(url, options);
        return response;
    }


    _createRestUrl(host, version, species, category, subcategory, ids, resource, params) {
        var url = "http://" + host + "/webservices/rest/" + version + "/" + species + "/";

        // Some web services do not need IDs
        if (typeof ids != "undefined" && ids != null) {
            url += category + "/" + subcategory + "/" + ids + "/" + resource;
        } else {
            url += category + "/" + subcategory + "/" + resource;
        }

        // We add the query params formatted in URL
        var queryParamsUrl = this._createSortedQueryParam(params)
        if (typeof queryParamsUrl != "undefined" && queryParamsUrl != null && queryParamsUrl != "") {
            url += "?" + queryParamsUrl;
        }
        return url;
    }

    _createSortedQueryParam(params) {
        // Do not remove the sort! we need to sort the array to ensure that the key of the cache will be correct
        var keyArray = _.keys(params).sort();
        var keyValueArray = [];
        for (let i in keyArray) {
            keyValueArray.push(keyArray[i] + "=" + encodeURIComponent(params[keyArray[i]]));
        }
        return keyValueArray.join('&');
    }

    _callGrpcService(params) {

    }

}