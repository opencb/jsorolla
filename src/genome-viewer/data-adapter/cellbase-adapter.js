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

    //chromosome hash
    this.chrHash = {};


    this.cache = {};

}

CellBaseAdapter.prototype = {

    getData : function (args) {
        var _this = this;

        var params = {
            //TODO
        };

        //Create one chunk cache by chromosome
        var dataType = args.dataType;
        var chr = args.chromosome;
        var start = args.start;
        var end = args.end;

        if (_.isUndefined(this.cache[dataType])) {
            this.cache[dataType] = new FeatureChunkCache({});
        }

        var chunksByRegion = this.cache[dataType].getCachedByRegion(args);

        if(chunksByRegion.notCached.length > 0) {
            var queryRegionStrings = _.map(chunksByRegion.notCached, function(region) {
                return region.chromosome + ":" + region.start + "-" + region.end;
            });

            //limit queries
            var n = 50;
            var lists = _.groupBy(queryRegionStrings, function(a, b){
                return Math.floor(b/n);
            });
            var queriesList = _.toArray(lists); //Added this to convert the returned object to an array.

            for(var i = 0; i < queriesList.length; i++) {
                CellBaseManager.get({
                    host: this.host,
                    species: this.species,
                    category: this.category,
                    subCategory: this.subCategory,
                    query: queriesList[i],
                    resource: this.resource,
                    params: this.params,
                    success: function(data){
                        _this._cellbaseSuccess(data, args.dataType);
                    }
                });
            }
        }

        if(chunksByRegion.cached.length > 0) {
            var chunksCached = this.cache[dataType].getByRegions(chunksByRegion.cached);
            this.trigger('data:ready', {items: chunksCached, dataType: dataType, sender: this});
        }
    },

    _cellbaseSuccess : function (data, dataType) {
        var timeId = Utils.randomString(4);
        console.time(this.resource + " save " + timeId);
        //////////
        //////////

        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];
            var splitDots = queryResult.id.split(":");
            var splitDash = splitDots[1].split("-");
            var qRegion = {chromosome: splitDots[0], start: splitDash[0], end: splitDash[1]};

            var queryId = queryResult.id;
            var features = queryResult.result;

//            var chrChunkCache = this.chrHash[qRegion.chromosome];

            //start or end does not matter
            var chunkId = this.cache[dataType].getChunkId(qRegion.start);
//            var chunkId = this.chrChunkCache.getChunkId(qRegion.end);

            chunks.push(this.cache[dataType].putChunk(chunkId,features));

        }
        if (chunks.length > 0) {
            this.trigger('data:ready', {items: chunks, dataType: dataType, sender: this});
        }

        //////////
        //////////
        console.timeEnd(this.resource + " get and save " + timeId);
    }
};

