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
        /********/

        if (dataType == 'histogram') {  // coverage?

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
//                        var cookie = $.cookie("bioinfo_sid");   // FIXME sense?
//                        cookie = ( cookie != '' && cookie != null ) ? cookie : 'dummycookie';
                        OpencgaManager.region({
                            accountId: _this.resource.account,
//                            sessionId: cookie,
                            bucketId: _this.resource.bucketId,
                            objectId: _this.resource.oid,
                            region: queriesList[i],
                            queryParams: params,
                            success: function (data) {
                                _this._opencgaSuccess(data, dataType, chunksByRegion.notCached);
                            }
                        });
                    }
                }
                if (chunksByRegion.cached.length > 0) {
                    _this.cache[dataType].getByRegions(chunksByRegion.cached, function (cachedChunks) {
                        var decryptedChunks = _this._decryptChunks(cachedChunks, "mypassword");
                        _this.trigger('data:ready', {items: decryptedChunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                    });
                }
            });
        }
    },

    _opencgaSuccess: function (data, dataType, regions) {
        var timeId = this.resource + " save " + Utils.randomString(4);
        console.time(timeId);
        /** time log **/

        var chunkSize = this.cache[dataType].chunkSize;

        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            chunks.push(data.response[i].result);
        }
        var items = this.cache[dataType].putByRegions(regions, chunks);

        var decryptedChunks = this._decryptChunks(items, "mypassword");
        /** time log **/
        console.timeEnd(timeId);

        if (chunks.length > 0) {
            // if (data.encoded) {decrypt }
            this.trigger('data:ready', {items: decryptedChunks, dataType: dataType, chunkSize: chunkSize, sender: this});
        }
    },

    _decryptChunks: function (chunks, password) {
        var decryptedChunks = [];
        for (var i = 0; i < chunks.length; i++) {
            if (chunks[i].enc == true) {
                decryptedChunks.push(CryptoJS.AES.decrypt(chunks[i], password));
            } else {
                decryptedChunks.push(chunks);
            }
        }
        return decryptedChunks;
    }
};
