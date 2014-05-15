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

    _.extend(this, args);

    this.on(this.handlers);

    this.cache = {};
}

CellBaseAdapter.prototype = {

    getData: function (args) {
        var timeStamp = args.timeStamp;
        var _this = this;

        /** Check region and parameters **/
        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;


        var params = {};
        _.extend(params, this.params);
        _.extend(params, args.params);

        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }
        var chunkSize;


        /** Check dataType histogram  **/
        if (dataType == 'histogram') {
            // Histogram chunks will be saved in different caches by interval size
            // The chunkSize will be the histogram interval
            var histogramId = dataType + '_' + params.interval;
            if (_.isUndefined(this.cache[histogramId])) {
                this.cache[histogramId] = new FeatureChunkCache({chunkSize: params.interval});
            }
            chunkSize = this.cache[histogramId].chunkSize;

            // Extend region to be adjusted with the chunks
            //        --------------------             -> Region needed
            // |----|----|----|----|----|----|----|    -> Logical chunk division
            //      |----|----|----|----|----|         -> Chunks covered by needed region
            //      |------------------------|         -> Adjusted region
            var adjustedRegions = this.cache[histogramId].getAdjustedRegions(region);
            if (adjustedRegions.length > 0) {
                // Get CellBase data
                CellBaseManager.get({
                    host: this.host,
                    species: this.species,
                    category: this.category,
                    subCategory: this.subCategory,
                    query: adjustedRegions,
                    resource: this.resource,
                    params: params,
                    success: function (data) {
                        _this._cellbaseHistogramSuccess(data, dataType, histogramId, timeStamp);
                    }
                });
            } else {
                // Get chunks from cache
                var chunksByRegion = this.cache[histogramId].getCachedByRegion(region);
                var chunksCached = this.cache[histogramId].getByRegions(chunksByRegion.cached);
                this.trigger('data:ready', {items: chunksCached, dataType: dataType, chunkSize: chunkSize, timeStamp: timeStamp, sender: this});
            }

            /** Features: genes, snps ... **/
        } else {
            // Features will be saved using the dataType features
            if (_.isUndefined(this.cache[dataType])) {
                this.cache[dataType] = new FeatureChunkCache(this.cacheConfig);
            }
            chunkSize = this.cache[dataType].chunkSize;

            // Get cached chunks and not cached chunk regions
            //        --------------------             -> Region needed
            // |----|----|----|----|----|----|----|    -> Logical chunk division
            //      |----|----|----|----|----|         -> Chunks covered by needed region
            //      |----|++++|++++|----|----|         -> + means the chunk is cached so its region will not be retrieved
            var chunksByRegion = this.cache[dataType].getCachedByRegion(region);

            if (chunksByRegion.notCached.length > 0) {
                var queryRegionStrings = _.map(chunksByRegion.notCached, function (region) {
                    return new Region(region).toString();
                });

                // Multiple CellBase calls will be performed, each one will
                // query 50 or less chunk regions
                var n = 50;
                var lists = _.groupBy(queryRegionStrings, function (a, b) {
                    return Math.floor(b / n);
                });
                // Each element on queriesList contains and array of 50 or less regions
                var queriesList = _.toArray(lists); //Added this to convert the returned object to an array.

                for (var i = 0; i < queriesList.length; i++) {
                    CellBaseManager.get({
                        host: this.host,
                        species: this.species,
                        category: this.category,
                        subCategory: this.subCategory,
                        query: queriesList[i],
                        resource: this.resource,
                        params: params,
                        success: function (data) {
                            _this._cellbaseSuccess(data, dataType, timeStamp);
                        }
                    });
                }
            }
            // Get chunks from cache
            if (chunksByRegion.cached.length > 0) {
                var chunksCached = this.cache[dataType].getByRegions(chunksByRegion.cached);
                this.trigger('data:ready', {items: chunksCached, dataType: dataType, chunkSize: chunkSize, timeStamp: timeStamp, sender: this});
            }
        }

    },

    _cellbaseSuccess: function (data, dataType, timeStamp) {
        var timeId = this.resource + " save " + Utils.randomString(4);
        console.time(timeId);
        /** time log **/

        var chunkSize = this.cache[dataType].chunkSize;

        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];

            var region = new Region(queryResult.id);
            var features = queryResult.result;
            var chunk = this.cache[dataType].putByRegion(region, features);
            chunks.push(chunk);
        }

        /** time log **/
        console.timeEnd(timeId);


        if (chunks.length > 0) {
            this.trigger('data:ready', {items: chunks, dataType: dataType, chunkSize: chunkSize, timeStamp: timeStamp, sender: this});
        }


    },
    _cellbaseHistogramSuccess: function (data, dataType, histogramId, timeStamp) {
        var timeId = Utils.randomString(4);
        console.time(this.resource + " save " + timeId);
        /** time log **/

        var chunkSize = this.cache[histogramId].chunkSize;

        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];
            for (var j = 0; j < queryResult.result.length; j++) {
                var interval = queryResult.result[j];
                var region = new Region(queryResult.id);
                region.load(interval);
                chunks.push(this.cache[histogramId].putByRegion(region, interval));
            }
        }

        this.trigger('data:ready', {items: chunks, dataType: dataType, chunkSize: chunkSize, timeStamp: timeStamp, sender: this});
        /** time log **/
        console.timeEnd(this.resource + " get and save " + timeId);
    }
};

