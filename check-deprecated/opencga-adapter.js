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

    this.cache = {};
}

OpencgaAdapter.prototype = {
    getData: function (args) {
        var _this = this;
        /********/

        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        var params = {species: Utils.getSpeciesCode(this.species.text)};
        _.extend(params, this.params);
        _.extend(params, args.params);

        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }
        var chunkSize;
        /********/

        if (dataType == 'histogram') {

        } else {
            //Create one FeatureChunkCache by datatype
            if (_.isUndefined(this.cache[dataType])) {
                this.cache[dataType] = new FeatureChunkCache(this.cacheConfig);
            }
            chunkSize = this.cache[dataType].chunkSize;

            this.cache[dataType].getCachedByRegion(region, function (chunksByRegion) {
                if (chunksByRegion.notCached.length > 0) {
                    var queryRegionStrings = _.map(chunksByRegion.notCached, function (region) {
                        return new Region(region).toString();
                    });

                    //limit queries
                    var n = 50;
                    var lists = _.groupBy(queryRegionStrings, function (a, b) {
                        return Math.floor(b / n);
                    });
                    var queriesList = _.toArray(lists); //Added this to convert the returned object to an array.

                    for (var i = 0; i < queriesList.length; i++) {
                        var cookie = $.cookie("bioinfo_sid");
                        cookie = ( cookie != '' && cookie != null ) ? cookie : 'dummycookie';
                        OpencgaManager.region({
                            accountId: _this.resource.account,
                            sessionId: cookie,
                            bucketId: _this.resource.bucketId,
                            objectId: _this.resource.oid,
                            region: queriesList[i],
                            queryParams: params,
                            success: function (data) {
                                _this._opencgaSuccess(data, dataType);
                            }
                        });
//                    CellBaseManager.get({
//                        host: _this.host,
//                        species: _this.species,
//                        category: _this.category,
//                        subCategory: _this.subCategory,
//                        query: queriesList[i],
//                        resource: _this.resource,
//                        params: params,
//                        success: function (data) {
//                            _this._cellbaseSuccess(data, dataType);
//                        }
//                    });
                    }
                }
                if (chunksByRegion.cached.length > 0) {
                    _this.cache[dataType].getByRegions(chunksByRegion.cached, function (cachedChunks) {
                        _this.trigger('data:ready', {items: cachedChunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                    });
                }
            });
        }
    },

    _opencgaSuccess: function (data, dataType) {
        var timeId = this.resource + " save " + Utils.randomString(4);
        console.time(timeId);
        /** time log **/

        var chunkSize = this.cache[dataType].chunkSize;

        var regions = [];
        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];

            regions.push(new Region(queryResult.id));
            chunks.push(queryResult.result);
        }
        this.cache[dataType].putByRegions(regions, chunks);

        /** time log **/
        console.timeEnd(timeId);

        if (chunks.length > 0) {
            this.trigger('data:ready', {items: chunks, dataType: dataType, chunkSize: chunkSize, sender: this});
        }
    }
}


OpencgaAdapter.prototype.getDataOld = function (args) {
    debugger
    var _this = this;
    //region check

    this.params["histogram"] = args.histogram;
    this.params["histogramLogarithm"] = args.histogramLogarithm;
    this.params["histogramMax"] = args.histogramMax;
    this.params["interval"] = args.interval;
    this.params["transcript"] = args.transcript;


    if (args.start < 1) {
        args.start = 1;
    }
    if (args.end > 300000000) {
        args.end = 300000000;
    }

    var type = "data";
    if (args.histogram) {
        type = "histogram" + args.interval;
    }

    var firstChunk = this.featureCache._getChunk(args.start);
    var lastChunk = this.featureCache._getChunk(args.end);

    var chunks = [];
    var itemList = [];
    for (var i = firstChunk; i <= lastChunk; i++) {
        var key = args.chromosome + ":" + i;
        if (this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
            chunks.push(i);
        } else {
            var items = this.featureCache.getFeatureChunk(key, type);
            itemList = itemList.concat(items);
        }
    }
////	//notify all chunks
//	if(itemList.length>0){
//		this.onGetData.notify({data:itemList, params:this.params, cached:true});
//	}


    //CellBase data process
    //TODO check host
    var calls = 0;
    var querys = [];
    regionSuccess = function (data) {
        console.timeEnd("dqs");
        console.time("dqs-cache");
        var type = "data";
        if (data.params.histogram) {
            type = "histogram" + data.params.interval;
        }
        _this.params["dataType"] = type;

        var splitDots = data.query.split(":");
        var splitDash = splitDots[1].split("-");
        var query = {chromosome: splitDots[0], start: splitDash[0], end: splitDash[1]};

        //check if features contains positon or start-end
        if (data.result[0] != null && data.result[0]['position'] != null) {
            for (var i = 0; i < data.result.length; i++) {
                data.result[i]['start'] = data.result[i].position;
                data.result[i]['end'] = data.result[i].position;
            }
        }

        _this.featureCache.putFeaturesByRegion(data.result, query, _this.category, type);
        var items = _this.featureCache.getFeatureChunksByRegion(query, type);
        console.timeEnd("dqs-cache");
        if (items != null) {
            itemList = itemList.concat(items);
        }
        if (calls == querys.length) {
//			_this.onGetData.notify({items:itemList, params:_this.params, cached:false});
            _this.trigger('data:ready', {items: itemList, params: _this.params, cached: false, sender: _this});
        }
    };

    var updateStart = true;
    var updateEnd = true;
    if (chunks.length > 0) {
//		console.log(chunks);

        for (var i = 0; i < chunks.length; i++) {

            if (updateStart) {
                var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
                updateStart = false;
            }
            if (updateEnd) {
                var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize - 1);
                updateEnd = false;
            }

            if (chunks[i + 1] != null) {
                if (chunks[i] + 1 == chunks[i + 1]) {
                    updateEnd = true;
                } else {
                    var query = args.chromosome + ":" + chunkStart + "-" + chunkEnd;
                    querys.push(query);
                    updateStart = true;
                    updateEnd = true;
                }
            } else {
                var query = args.chromosome + ":" + chunkStart + "-" + chunkEnd;

                querys.push(query);
                updateStart = true;
                updateEnd = true;
            }
        }
//		console.log(querys)
        for (var i = 0, li = querys.length; i < li; i++) {
            console.time("dqs");
            calls++;
//			opencgaManager.region(this.category, this.resource, querys[i], this.params);
            var cookie = $.cookie("bioinfo_sid");
            cookie = ( cookie != '' && cookie != null ) ? cookie : 'dummycookie';
            OpencgaManager.region({
                accountId: this.resource.account,
                sessionId: cookie,
                bucketId: this.resource.bucketId,
                objectId: this.resource.oid,
                region: querys[i],
                queryParams: this.params,
                success: regionSuccess
            });
        }
    } else {
        if (itemList.length > 0) {
            this.trigger('data:ready', {items: itemList, params: this.params, cached: false, sender: this});
//			this.onGetData.notify({items:itemList, params:this.params});
        }
    }
};