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

    this.cacheConfig = {
        cacheId: 'opencga' + this.resource.id,
//        subCacheId: this.resource + this.params.exclude,
        chunkSize: 3000
    };
    _.extend(this.cacheConfig, args.cacheConfig);

    this.cache = new FeatureChunkCache(this.cacheConfig);
    this.debug = false;
}

OpencgaAdapter.prototype = {
    getData: function (args) {
        var _this = this;
        args.webServiceCallCount = 0;

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
        //TODO define category
        var categories = this.resource.id.toString().split(',');   // in this adapter each category is each file

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        var chunkSize = args.params.interval ? args.params.interval : this.cacheConfig.chunkSize; // this.cache.defaultChunkSize should be the same
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
            /**
             * Process uncached regions
             */
            // TODO check if OpenCGA allows multiple regions
            var queriesList = _this._groupQueries(uncachedRegions[category]);

            // TODO check how to manage multiple regions and multiple files ids
            for (var i = 0; i < queriesList.length; i++) {
                args.webServiceCallCount++;
                var queryRegion = queriesList[i];

                params['region'] = queryRegion.toString();
                params['interval'] = chunkSize;
                params['histogram'] = (dataType == 'histogram');
                params['process_differences'] = false;

                OpencgaManager.files.fetch({
                    id: categoriesName,
                    query: params,
                    request: {
                        success: function (response) {
                            _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                        },
                        error: function () {
                            args.done();
                            console.log('Server error');
                        }
                    }
                });
            }

            /**
             * Process Cached chunks
             */
            if (cachedChunks[category].length > 0) {
                if (args.webServiceCallCount === 0) {
                    args.done();
                }
                _this.trigger('data:ready', {items: cachedChunks[category], dataType: dataType, chunkSize: chunkSize, sender: _this});
//                args.dataReady({items: cachedChunks[category], dataType: dataType, chunkSize: chunkSize, sender: _this});
            }
        });
    },

    _opencgaSuccess: function (data, categories, dataType, chunkSize, args) {
        args.webServiceCallCount--;

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

        for (var i = 0; i < data.response.length; i++) {    // FIXME each response is a sample? in variant too?
            var queryResult = data.response[i];
            var items = this._adaptChunks(queryResult, categories[i], dataType, chunkSize);
            //if (items.length > 0) {
            //    // if (data.encoded) {decrypt }
            //    args.dataReady({items: items, dataType: dataType, chunkSize: chunkSize, sender: this, category: categories[i]});
            //}
            //var decryptedChunks = this._decryptChunks(items, "mypassword");
            if (items.length > 0) {
                this.trigger('data:ready', {items: items, dataType: dataType, chunkSize: chunkSize, sender: this});
            }
        }

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
