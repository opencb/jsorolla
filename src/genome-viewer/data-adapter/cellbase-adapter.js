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
        //creates a list of regions from chunkids, chunk regions are merged to minimize the querys
        var querys = [];

        var chunkSize = this.chrHash[chromosome].getChunkSize();

        for (var i = 0; i < chunkIds.length; i++) {
            var chunkStart = parseInt(chunkIds[i] * chunkSize);
            var chunkEnd = parseInt((chunkIds[i] * chunkSize) + chunkSize - 1);
            var query = chromosome + ":" + chunkStart + "-" + chunkEnd;
            querys.push(query);
        }

        var n = 100;
        var lists = _.groupBy(querys, function(a, b){
            return Math.floor(b/n);
        });
        var querysList = _.toArray(lists); //Added this to convert the returned object to an array.

        for(var i = 0; i < querysList.length; i++) {
            CellBaseManager.get({
                host: this.host,
                species: this.species,
                category: this.category,
                subCategory: this.subCategory,
                query: querysList[i],
                resource: this.resource,
                params: this.params,
                success: this.cellbaseSuccess
            });
        }
    },
    //CellBase data process
    cellbaseSuccess : function (data) {
        debugger
        var dataType = "data";
        if (data.params.transcript) {
            dataType = "withTranscripts";
        }
        if (data.params.histogram) {
            dataType = "histogram" + data.params.interval;
        }

        var featureType = data.resource;

        for (var i = 0; i < data.response.length; i++) {
            var queryResponse = data.response[i];
            var splitDots = queryResponse.id.split(":");
            var splitDash = splitDots[1].split("-");
            var qRegion = {chromosome: splitDots[0], start: splitDash[0], end: splitDash[1]};

            var queryId = queryResponse.id;
            var features = queryResponse.result;

            if (data.params.histogram != true && featureType == "gene" && data.params.transcript == true) {
                for (var j = 0, lenj = features.length; j < lenj; j++) {
                    for (var t = 0, lent = features[j].transcripts.length; t < lent; t++) {
                        features[j].transcripts[t].featureType = "transcript";
                        //loop over exons
                        for (var e = 0, lene = features[j].transcripts[t].exons.length; e < lene; e++) {
                            features[j].transcripts[t].exons[e].featureType = "exon";
                        }
                    }
                }
            }

            if (featureType == "regulatory") {
                featureType = data.params.type;
                if (featureType == 'TF_binding_site_motif') {
                    featureType = 'tfbs';
                }
            }

            console.time(_this.resource + " save " + rnd);
            var chrChunkCache = this.chrHash[qRegion.chromosome];
            chrChunkCache.putFeaturesByRegion(features, qRegion, featureType, dataType);
            var items = _this.featureCache.getFeatureChunksByRegion(qRegion);
            console.timeEnd(_this.resource + " save " + rnd);
            if (items != null) {
                itemList = itemList.concat(items);
            }
        }
        if (itemList.length > 0) {
            _this.trigger('data:ready', {items: itemList, params: _this.params, cached: false, sender: _this});
        }
        console.timeEnd(_this.resource + " get and save " + rnd);


    },
    _getCallRegion: function(chunkIds,chromosome){
        //creates a list of regions from chunkids, chunk regions are merged to minimize the querys
        var querys = [];
        var updateStart = true;
        var updateEnd = true;

        var chunkSize = this.chrHash[chromosome].getChunkSize();

        for (var i = 0; i < chunkIds.length; i++) {

            if (updateStart) {
                var chunkStart = parseInt(chunkIds[i] * chunkSize);
                updateStart = false;
            }
            if (updateEnd) {
                var chunkEnd = parseInt((chunkIds[i] * chunkSize) + chunkSize - 1);
                updateEnd = false;
            }

            if (chunkIds[i + 1] != null) {
                if (chunkIds[i] + 1 == chunkIds[i + 1]) {
                    updateEnd = true;
                } else {
                    var query = chromosome + ":" + chunkStart + "-" + chunkEnd;
                    querys.push(query);
                    updateStart = true;
                    updateEnd = true;
                }
            } else {
                var query = chromosome + ":" + chunkStart + "-" + chunkEnd;
                querys.push(query);
                updateStart = true;
                updateEnd = true;
            }
        }
        return querys;
    }

};

