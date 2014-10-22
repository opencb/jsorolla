/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function OpencgaAdapter(args) {

    _.extend(this, Backbone.Events);

    _.extend(this, args);

    this.on(this.handlers);

    this.cache = new FeatureChunkCache(this.cacheConfig);
    this.user = null;
    this.sessionId = null;
}

OpencgaAdapter.prototype = {
    getData: function (args) {
        var _this = this;

        args.webServiceCallCount = 0;

        /** 1 region check **/
        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        /** 2 category check **/
        //TODO define category
        var categories = args.categories;   // in this adapter each category is each file

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        //TODO define chunksize,  histogram is dynamic and features is fixed
        var chunkSize = args.params.interval? args.params.interval : undefined;
        chunkSize = 1500;

        /* TODO remove??????
         var params = {
         species: Utils.getSpeciesCode(this.species.text)
         };
         _.extend(params, this.params);
         _.extend(params, args.params);

         two levels of cache. In this adapter, default are: resource and subResource
         this.cacheConfig.cacheId = this.resource;
         this.cacheConfig.subCacheId = this.subResource;
         var combinedCacheId = _this.cacheConfig.cacheId + "_" + _this.cacheConfig.subCacheId;
         */

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
            /**
             * Process uncached regions
             */
            // TODO check if OpenCGA allows multiple regions
            var queriesList = _this._groupQueries(uncachedRegions[category]);

            // TODO check how to manage multiple regions and multiple files ids
            for (var i = 0; i < queriesList.length; i++) {
                args.webServiceCallCount++;
                var queryRegion = queriesList[i];

                OpencgaManager.files.fetch({
                    id: categoriesName,
                    query: {
                        sid: 'RNk4P0ttFGHyqLA3YGS8', //TODO add sid to queryParams;
                        region: queryRegion.toString(),
                        interval: this.interval,
                        histogram: (dataType == 'histogram')
                    },
                    request: {
                        success: function (response) {
                            //TODO check success
                            _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                        },
                        error: function () {
                            console.log('Server error');
                        }
                    }
                });
            }

            /**
             * Process Cached chunks
             */
            for (var k = 0; k < categories.length; k++) {
                if (cachedChunks[categories[k]].length > 0) {
                    var decryptedChunks = _this._decryptChunks(cachedChunks[categories[k]], "mypassword");
                    if (args.webServiceCallCount === 0) {
                        args.done();
                    }
                    args.dataReady({items: decryptedChunks, dataType: dataType, chunkSize: chunkSize, sender: _this, category: categories[k]});
                }
            }
        });
    },

    _opencgaSuccess: function (data, categories, dataType, chunkSize, args) {
        args.webServiceCallCount--;
        var timeId = this.resource + " save " + data.response.length + " regions";
        console.time(timeId);
        /** time log **/

        if (categories.length != data.response.length) {
            console.log("ERROR: requested " + categories.length + "samples, but response has " + data.response.length);
            console.log(data);
            debugger;
        }

        var chunks;
        var regions;
        for (var i = 0; i < data.response.length; i++) {    // FIXME each response is a sample?
            var queryResult = data.response[i];
            chunks = [];
            regions = [];
            for (var j = 0; j < queryResult.result.length; j++) {
                regions.push(new Region(queryResult.result[j]));
            }
            chunks = queryResult.result;

//            if (data.response[i].result.length == 1) {
//            } else {
//                console.log("unexpected data structure");
//            }
            var items = this.cache.putByRegions(regions, chunks, categories[i], dataType, chunkSize);
            if (chunks.length > 0) {
                // if (data.encoded) {decrypt }
                args.dataReady({items: items, dataType: dataType, chunkSize: chunkSize, sender: this, category: categories[i]});
            }
        }

//        var decryptedChunks = this._decryptChunks(items, "mypassword");
        /** time log **/
        console.timeEnd(timeId);

        if (args.webServiceCallCount === 0) {
            args.done();
        }
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
    }
};
