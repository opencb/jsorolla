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
        if (this._config.cache.active) {
            this.indexedDBCache = new IndexedDBCache(this._config.cache.database);
            this._initCache();
        }
    }

    _initCache() {
        this.indexedDBCache.createObjectStores(this._config.cache.subcategories)
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

    getFiles(folderId, resource, params, options) {
        if (options === undefined) {
            options = {};
        }
        let hosts = options.hosts || this._config.hosts;
        let version = options.version || this._config.version;
        let species = options.species || this._config.species;

        let url = "http://" + hosts[count] + "/webservices/rest/" + version + "/" + species + "/" + "files";

        if (typeof folderId != "undefined" && folderId != null && folderId != "") {
            url += "/" + folderId + "/" + resource;
        } else {
            url += "/" + resource;
        }

        // We add the query params formatted in URL
        let queryParamsUrl = this._createSuffixKey(params);
        if (typeof queryParamsUrl != "undefined" && queryParamsUrl != null && queryParamsUrl != "") {
            url += "?" + queryParamsUrl;
        }
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
        let cache = options.cache || this._config.cache;


        let response;
        if (cache.active) {
            let os = category + "_" + subcategory;

            let nonCachedIds = [];

            let cacheKeys = [];
            let suffixKey = this._createSuffixKey(params);

            let idArray = [];
            if (ids !== undefined) {
                idArray = ids.split(",");
                for (let i = 0; i < idArray.length; i++) {
                    cacheKeys.push(idArray[i] + "_" + resource + suffixKey);
                }
            } else {
                cacheKeys.push(resource + suffixKey);
            }

            console.time("Cache time:");
            var _this = this;
            response = new Promise(function(resolve, reject) {
                _this.indexedDBCache.getAll(os, cacheKeys, function (results) {
                    let uncachedQueries = false;
                    for (let i = 0; i < results.length; i++) {
                        if (results[i] === undefined) {
                            uncachedQueries = true;
                            if (idArray.length > 0) {
                                nonCachedIds.push(idArray[i]);
                            }
                        }
                    }

                    if (rpc.toLowerCase() === "rest") {
                        options.cacheFn = function(dataResponse) {
                            // we add the new fetched data to the cache
                            let suffixKey = _this._createSuffixKey(params);
                            // We make a copy of dataResponse
                            let query = {};
                            for (let i in dataResponse) {
                                query[i] = dataResponse[i];
                            };
                            // And remove the key response
                            delete query['response'];

                            if (idArray.length > 0) {
                                for (let i = 0; i < dataResponse.response.length; i++) {
                                    let result = {
                                        query: query,
                                        data: dataResponse.response[i]
                                    };
                                    // result['data'] = dataResponse.response[i];
                                    // // Update the data time to 0
                                    result.data.dbTime = 0;
                                    _this.indexedDBCache.add(os, idArray[i] + "_" + resource + suffixKey, result);
                                }
                            } else {
                                for (let i = 0; i < dataResponse.response.length; i++) {
                                    let result = {
                                        query: query,
                                        data: dataResponse.response[i]
                                    };
                                    // Update the data time to 0
                                    result.data.dbTime = 0;
                                    _this.indexedDBCache.add(os, resource + suffixKey, result);
                                }
                            }

                            // debugger
                            // console.log(dataResponse);
                            // response = {response: []};
                            // let responses = [];
                            // for (let i = 0, j = 0; i < results.length; i++) {
                            //     if (results[i] == undefined) {
                            //         results[i] = dataResponse.response[j++].result;
                            //     }
                            //     responses.push({result: results[i]});
                            // }
                            // response.response = responses;
                            //
                            // console.log(response)
                            // // If the call is OK then we execute the success function from the user
                            // if (typeof options != "undefined" && typeof options.success === "function") {
                            //     options.success(response);
                            // }
                        };
                        if (uncachedQueries) {
                            // response = _this._callRestWebService(hosts, category, subcategory, nonCachedIds, resource, params, options);
                            resolve(_this._callRestWebService(hosts, category, subcategory, nonCachedIds, resource, params, options));
                        } else {
                            let queryResponse = results[0].query;
                            queryResponse['response'] = [];

                            // if (results.length > 1) {
                            //     debugger;
                            // }

                            for (let i = 0; i < results.length; i++) {
                                queryResponse.response.push(results[i].data);
                            }
                            // response.response = responses;
                            // response = Promise.resolve(queryResponse);
                            resolve(queryResponse);
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
        if (typeof ids != "undefined" && ids != null && ids.length > 0) {
            url += category + "/" + subcategory + "/" + ids + "/" + resource;
        } else {
            url += category + "/" + subcategory + "/" + resource;
        }

        // We add the query params formatted in URL
        var queryParamsUrl = this._createSuffixKey(params)
        if (typeof queryParamsUrl != "undefined" && queryParamsUrl != null && queryParamsUrl != "") {
            url += "?" + queryParamsUrl;
        }
        return url;
    }

    _createSuffixKey(params) {
        // Do not remove the sort! we need to sort the array to ensure that the key of the cache will be correct
        var keyArray = _.keys(params).sort();
        var keyValueArray = [];
        for (let i in keyArray) {
            keyValueArray.push(keyArray[i] + "=" + encodeURIComponent(params[keyArray[i]]));
        }
        let suffixKey = keyValueArray.join('&');
        if (suffixKey !== "") {
            suffixKey = "_" + suffixKey;
        }
        return suffixKey;
    }

    _callGrpcService(params) {

    }

}