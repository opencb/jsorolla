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
}

CellBaseAdapter.prototype = {
    getData : function (args) {
        var _this = this;

        var params = {
            //TODO
        };

        //Create one chunk cache by chromosome
        var chr = args.chromosome;
        var start = args.start;
        var end = args.end;

        var chrChunkCache = this.chrHash[chr];
        if (_.isUndefined(chrChunkCache)) {
            this.chrHash[chr] = chrChunkCache = new ChunkCache({});
        }

        var firstChunkId = chrChunkCache.getChunkId(start);
        var lastChunkId = chrChunkCache.getChunkId(end);

        var chunkIdsNotCached = [];
        var chunksCached = [];
        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            var chunk = chrChunkCache.getChunk(chunkId);
            if (_.isUndefined(chunk)) {
                chunkIdsNotCached.push(chunkId);
            } else {
                chunksCached.push(chunk);
            }
        }

        if (chunkIdsNotCached.length > 0) {
            this.callRegions(chunkIdsNotCached,chr);
        }
        if(chunksCached.length > 0){
            this.trigger('data:ready', {items: chunksCached, params: params, sender: this});
        }

    },
    callRegions: function(chunkIds,chromosome){
        var _this = this;
        var queries = [];

        var chunkSize = this.chrHash[chromosome].getChunkSize();

        for (var i = 0; i < chunkIds.length; i++) {
            var chunkStart = parseInt(chunkIds[i] * chunkSize);
            var chunkEnd = parseInt((chunkIds[i] * chunkSize) + chunkSize - 1);
            queries.push(chromosome + ":" + chunkStart + "-" + chunkEnd);
        }

        //limit queries
        var n = 100;
        var lists = _.groupBy(queries, function(a, b){
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
                    _this.cellbaseSuccess(data);
                }
            });
        }
    },
    cellbaseSuccess : function (data) {
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

            var chrChunkCache = this.chrHash[qRegion.chromosome];

            //start or end does not matter
            var chunkId = chrChunkCache.getChunkId(qRegion.start);
//            var chunkId = this.chrChunkCache.getChunkId(qRegion.end);

            chunks.push(chrChunkCache.putChunk(chunkId,features));

        }
        if (chunks.length > 0) {
            this.trigger('data:ready', {items: chunks, params: data.params});
        }

        //////////
        //////////
        console.timeEnd(this.resource + " get and save " + timeId);
    }
};

