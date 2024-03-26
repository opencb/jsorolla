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

function OpencgaAdapter(args) {

    _.extend(this, Backbone.Events);

    _.extend(this, args);

    this.on(this.handlers);

    this.configureCache();

    this.debug = false;
}

OpencgaAdapter.prototype = {
    setSpecies: function (species) {
        this.species = species;
    },
    configureCache: function () {
        var host = this.host || OpencgaManager.host;
        if (!this.cacheConfig) {
            this.cacheConfig = {
                // subCacheId: this.resource + this.params.keys(),
                chunkSize: 3000
            }
        }
        this.cacheConfig.cacheId = 'opencga' + this.resource.id;
        this.cache = new FeatureChunkCache(this.cacheConfig);
    },

    getData: function (args) {
        var _this = this;

        var params = {};
//                    histogram: (dataType == 'histogram')
        _.extend(params, this.params);
        _.extend(params, args.params);

        /** 1 region check **/
        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;


        /** 2 category check **/
        var categories = this.resource.id.toString().split(',');   // in this adapter each category is each file

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        var chunkSize = params.interval ? params.interval : this.cacheConfig.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /**
         * Get the uncached regions (uncachedRegions) and cached chunks (cachedChunks).
         * Uncached regions will be used to query OpenCGA. The response data will be converted in chunks
         * by the Cache TODO????
         * Cached chunks will be returned by the args.dataReady Callback.
         */
        this.cache.get(region, categories, dataType, chunkSize, function (cachedChunks, uncachedRegions) {

            var category = categories[0];
            var categoriesName = "";
            for (var j = 0; j < categories.length; j++) {
                categoriesName += "," + categories[j];
            }
            categoriesName = categoriesName.slice(1);   // to remove first ','

            var chunks = cachedChunks[category];
            // TODO check if OpenCGA allows multiple regions
            var queriesList = _this._groupQueries(uncachedRegions[category]);

            /** Uncached regions found **/
            if (queriesList.length > 0) {
                args.webServiceCallCount = 0;

                // TODO check how to manage multiple regions and multiple files ids
                for (var i = 0; i < queriesList.length; i++) {
                    args.webServiceCallCount++;
                    var queryRegion = queriesList[i];

                    params['region'] = queryRegion.toString();
                    params['interval'] = chunkSize;
                    params['histogram'] = (dataType == 'histogram');
                    params['process_differences'] = false;

                    OpencgaManager.files['fetch']({
                        id: categoriesName,
                        query: params,
                        request: {
                            success: function (response) {
                                var responseChunks = _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                                args.webServiceCallCount--;

                                chunks = chunks.concat(responseChunks);
                                if (args.webServiceCallCount === 0) {
                                    args.done({
                                        items: chunks, dataType: dataType, chunkSize: chunkSize, sender: _this
                                    });
                                }
                            },
                            error: function () {
                                console.log('Server error');
                                args.done();
                            }
                        }
                    });
                }

            }
            /** All regions are cached **/
            else {
                args.done({
                    items: chunks, dataType: dataType, chunkSize: chunkSize, sender: _this
                });
            }
        });
    },

    _opencgaSuccess: function (data, categories, dataType, chunkSize) {
        var timeId = this.cacheConfig.cacheId + " save " + data.response.length + " samples";
        console.time(timeId);
        /** time log **/

        if (categories.length != data.response.length) {
            console.log("ERROR: requested " + categories.length + "samples, but response has " + data.response.length);
            console.log(data);
//            debugger;
        }

        if (data.response[0] && data.response[0].result[0]) {
            var inferredChunkSize = data.response[0].result[0].end - data.response[0].result[0].start + 1;
            if (inferredChunkSize != chunkSize) {
                console.log("code smell: chunkSize requested: " + chunkSize + ", but obtained: " + inferredChunkSize);
//                chunkSize = inferredChunkSize;
            }
        }

        var responseItems = [];
        for (var i = 0; i < data.response.length; i++) {    // FIXME each response is a sample? in variant too?
            var queryResult = data.response[i];
            var items = this._adaptChunks(queryResult, categories[i], dataType, chunkSize);
            responseItems = responseItems.concat(items);
            //if (items.length > 0) {
            //    // if (data.encoded) {decrypt }
            //    args.dataReady({items: items, dataType: dataType, chunkSize: chunkSize, sender: this, category: categories[i]});
            //}
            //var decryptedChunks = this._decryptChunks(items, "mypassword");
        }

        /** time log **/
        console.timeEnd(timeId);

        return responseItems;

    },

    /**
     * Transform the list on a list of lists, to limit the queries
     * [ r1,r2,r3,r4,r5,r6,r7,r8 ]
     * [ [r1,r2,r3,r4], [r5,r6,r7,r8] ]
     */
    _groupQueries: function (uncachedRegions) {
        var groupSize = 50;
        var queriesLists = [];
        while (uncachedRegions.length > 0) {
            queriesLists.push(uncachedRegions.splice(0, groupSize).toString());
        }
        return queriesLists;
    },

    _decryptChunks: function (chunks, password) {
        var decryptedChunks = [];
        for (var i = 0; i < chunks.length; i++) {
            if (chunks[i].enc == true) {
                decryptedChunks.push(CryptoJS.AES.decrypt(chunks[i], password));
            } else {
                decryptedChunks.push(chunks[i]);
            }
        }
        return decryptedChunks;
    },

    _adaptChunks: function (queryResult, category, dataType, chunkSize) {
        var chunks;
        var regions;
        var items = [];
//        debugger
        if (queryResult.resultType == "org.opencb.biodata.models.variant.Variant") {
            chunks = [];
            regions = [];
            var keyToPair = {};
            for (var i = 0; i < queryResult.result.length; i++) {
                var variation = queryResult.result[i];
                var chunkId = this.cache.getChunkId(variation.start, chunkSize);
                var key = this.cache.getChunkKey(variation.chromosome,
                    chunkId,
                    dataType,
                    chunkSize);

                if (keyToPair[key] == undefined) {
                    keyToPair[key] = chunks.length;
                    regions.push(new Region({chromosome: variation.chromosome, start: chunkId * chunkSize, end: (chunkId + 1) * chunkSize - 1}));
                    chunks.push([]);
                }
                chunks[keyToPair[key]].push(variation);
            }

//            debugger
            items = this.cache.putByRegions(regions, chunks, category, dataType, chunkSize);
        } else { //if(queryResult.resultType == "org.opencb.biodata.models.alignment.AlignmentRegion") {
            regions = [];
            for (var j = 0; j < queryResult.result.length; j++) {
                regions.push(new Region(queryResult.result[j]));
            }
            chunks = queryResult.result;

//            if (data.response[i].result.length == 1) {
//            } else {
//                console.log("unexpected data structure");
//            }
            items = this.cache.putByRegions(regions, chunks, category, dataType, chunkSize);
        }
        return items;
    }
};
