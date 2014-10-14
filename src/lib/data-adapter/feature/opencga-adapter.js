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
        args.webServiceCallCount = 0;

        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        var params = {
//            species: Utils.getSpeciesCode(this.species.text)
        };
        _.extend(params, this.params);
        _.extend(params, args.params);

        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }
        var chunkSize;

        // two levels of cache. In this adapter, default are: resource and subResource
        this.cacheConfig.cacheId = this.resource;
        this.cacheConfig.subCacheId = this.subResource;
        var combinedCacheId = _this.cacheConfig.cacheId + "_" + _this.cacheConfig.subCacheId;
        /********/

        if (dataType == 'histogram') {  // coverage?
            // TODO ask only not cached
            var queryParams = {histogram: true/*, interval: this.interval*/};
            OpencgaManager.get({
                    region: new Region(region).toString(),
                    queryParams: queryParams,
                    success: function (data) {
                        _this._opencgaSuccess(data, dataType, combinedCacheId, args);
                    }
                });
        } else {
            //Create one FeatureChunkCache by combinedCacheId
            if (_.isUndefined(this.cache[combinedCacheId])) {
                this.cache[combinedCacheId] = new FeatureChunkCache(this.cacheConfig);
            }
            chunkSize = this.cache[combinedCacheId].chunkSize;

            this.cache[combinedCacheId].getCachedByRegion(region, function (chunksByRegion) {
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
                        args.webServiceCallCount++;
//                        var cookie = $.cookie("bioinfo_sid");   // FIXME sense?
//                        cookie = ( cookie != '' && cookie != null ) ? cookie : 'dummycookie';
                        OpencgaManager.get({
//                            accountId: _this.resource.account,
//             //               sessionId: cookie,
//                            bucketId: _this.resource.bucketId,
//                            objectId: _this.resource.oid,
                            region: queryRegionStrings[i],
//                            queryParams: params = {histogram : true},
                            success: function (data) {
                                _this._opencgaSuccess(data, dataType, combinedCacheId, args);
                            }
                        });
                    }
                }
                if (chunksByRegion.cached.length > 0) {
                    _this.cache[combinedCacheId].getByRegions(chunksByRegion.cached, function (cachedChunks) {
                        var decryptedChunks = _this._decryptChunks(cachedChunks, "mypassword");
                        _this.trigger('data:ready', {items: decryptedChunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                        if (args.webServiceCallCount === 0) {
                            args.done();
                        }
                    });
                }
            });
        }
    },

    _opencgaSuccess: function (data, dataType, combinedCacheId, args) {
        args.webServiceCallCount--;
        var timeId = this.resource + " save " + Utils.randomString(4);
        console.time(timeId);
        /** time log **/

        var chunkSize = this.cache[combinedCacheId].chunkSize;


        var chunks = [];
        var regions = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];
            regions.push(new Region(queryResult.id));
            chunks.push(queryResult.result);

//            if (data.response[i].result.length == 1) {
//            } else {
//                console.log("unexpected data structure");
//            }
        }
        var items = this.cache[combinedCacheId].putByRegions(regions, chunks);

//        var decryptedChunks = this._decryptChunks(items, "mypassword");
        /** time log **/
        console.timeEnd(timeId);

        if (chunks.length > 0) {
            // if (data.encoded) {decrypt }
            this.trigger('data:ready', {items: items, dataType: dataType, chunkSize: chunkSize, sender: this});
        }

        if (args.webServiceCallCount === 0) {
            args.done();
        }
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
