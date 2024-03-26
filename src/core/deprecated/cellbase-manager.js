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

var CellBaseManager = {
    host: (typeof window.CELLBASE_HOST === 'undefined') ? 'http://bioinfo.hpc.cam.ac.uk/cellbase' : window.CELLBASE_HOST,
    version: (typeof window.CELLBASE_VERSION === 'undefined') ? 'v3' : window.CELLBASE_VERSION,
    get: function(args) {
        var success = args.success;
        var error = args.error;
        var async = (args.async == false) ? false: true;

        // remove XMLHttpRequest keys
        var ignoreKeys = ['success', 'error', 'async'];
        var urlConfig = {};
        for (var prop in args) {
            if (hasOwnProperty.call(args, prop) && args[prop] != null && ignoreKeys.indexOf(prop) == -1) {
                urlConfig[prop] = args[prop];
            }
        }

        var url = CellBaseManager.url(urlConfig);
        if (typeof url === 'undefined') {
            return;
        }

        if (window.CELLBASE_LOG != null && CELLBASE_LOG === true) {
            console.log(url);
        }

        var d;
        var request = new XMLHttpRequest();
        request.onload = function() {
            var contentType = this.getResponseHeader('Content-Type');
            if (contentType === 'application/json') {
                var parsedResponse = JSON.parse(this.response);
                if (typeof success === "function") success(parsedResponse);
                d = parsedResponse;
            } else {
                console.log('Cellbase returned a non json object or list, please check the url.');
                console.log(url);
                console.log(this.response)
            }
        };
        request.onerror = function() {
            console.log("CellBaseManager: Ajax call returned " + this.statusText);
            if (typeof error === "function") error(this);
        };
        request.open("GET", url, async);
        request.send();
        return d;

    },
    url: function(args) {
        if (args == null) {
            args = {};
        }
        if (args.params == null) {
            args.params = {};
        }

        var version = this.version;
        if (args.version != null) {
            version = args.version
        }

        var host = this.host;
        if (args.host != null) {
            host = args.host;
        }

        delete args.host;
        delete args.version;

        var config = {
            host: host,
            version: version
        };

        for (var prop in args) {
            if (hasOwnProperty.call(args, prop) && args[prop] != null) {
                config[prop] = args[prop];
            }
        }

        var query = '';
        if (config.query != null) {
            query = '/' + config.query.toString();
        }

        //species can be the species code(String) or an object with text attribute
        if (config.species && config.species.id != null) {
            if (config.species.assembly != null) {
                config.params["assembly"] = config.species.assembly.name;
            }
            // TODO Remove temporary fix
            if (config.subCategory === 'chromosome') {
                delete config.params["assembly"]
            }
            config.species = Utils.getSpeciesCode(config.species.scientificName);
        }

        var url;
        if (config.category === 'meta') {
            url = config.host + '/webservices/rest/' + config.version + '/' + config.category + '/' + config.subCategory;
        } else {
            url = config.host + '/webservices/rest/' + config.version + '/' + config.species + '/' + config.category + '/' + config.subCategory + query + '/' + config.resource;
        }


        url = Utils.addQueryParamtersToUrl(config.params, url);
        return url;
    }
};
