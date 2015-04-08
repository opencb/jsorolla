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

function CellBaseAdapter(args) {

    _.extend(this, Backbone.Events);

    this.host;
    this.version;

    _.extend(this, args);

    this.on(this.handlers);
    this.cacheConfig = {
        cacheId: (this.species.text + this.species.assembly).replace(/[/_().\ -]/g, ''),
//        subCacheId: this.resource + this.params.exclude,
        chunkSize: 3000
    };
    _.extend(this.cacheConfig, args.cacheConfig);

    this.cache = new FeatureChunkCache(this.cacheConfig);
    this.debug = false;
}

CellBaseAdapter.prototype = {

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
        var categories = [this.resource + this.params.exclude];

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        var chunkSize = args.params.interval? args.params.interval : this.cacheConfig.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /**
         * Get the uncached regions (uncachedRegions) and cached chunks (cachedChunks).
         * Uncached regions will be used to query cellbase. The response data will be converted in chunks
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

                // Get CellBase data
                CellBaseManager.get({
                    host: _this.host,
                    version: _this.version,
                    species: _this.species,
                    category: _this.category,
                    subCategory: _this.subCategory,
                    query: queryRegion.toString(),
                    resource: _this.resource,
                    params: params,
                    success: function (response) {
                        _this._cellbaseSuccess(response, categories, dataType, chunkSize, args);
                    },
                    error: function () {
                        console.log('Server error');
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

    _cellbaseSuccess: function (data, categories, dataType, chunkSize, args) {
        args.webServiceCallCount--;
        var timeId = Utils.randomString(4) + this.resource + " save";
        console.time(timeId);
        /** time log **/

        var regions = [];
        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {    // TODO test what do several responses mean
            var queryResult = data.response[i];
            if (dataType == "histogram") {
                for (var j = 0; j < queryResult.result.length; j++) {
                    var interval = queryResult.result[j];
                    var region = new Region(interval);
                    regions.push(region);
                    chunks.push(interval);
                }
            } else {
                regions.push(new Region(queryResult.id));
                chunks.push(queryResult.result);
            }
        }
        var items = this.cache.putByRegions(regions, chunks, categories, dataType, chunkSize);

        /** time log **/
        console.timeEnd(timeId);

        if (args.webServiceCallCount === 0) {
            args.done();
        }

        if (items.length > 0) {
            this.trigger('data:ready', {items: items, dataType: dataType, chunkSize: chunkSize, sender: this});
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
    }
};

