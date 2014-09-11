/**
 * Created with IntelliJ IDEA.
 * User: fsalavert
 * Date: 10/18/13
 * Time: 12:06 PM
 * To change this template use File | Settings | File Templates.
 */

function FeatureChunkCache(args) {
    _.extend(this, Backbone.Events);

    // Default values
    this.id = Utils.genId("FeatureChunkCache");

    this.chunkSize = 50000;
    this.limit;

    _.extend(this, args);

//    this.store = new MemoryStore({});

    this.store = new IndexedDBStore({cacheId: this.cacheId, objectStore: this.subCacheId});

    this.verbose = false;
}


FeatureChunkCache.prototype = {

/*
    getChunk: function (chunkId) {
        return this.store.get(chunkId);
    },*/

    getChunk: function (chunkKey, callback) {
        if (!callback) {
            console.log("bad FeatureChunkCache usage: undefined callback");
        }

        this.store.get(chunkKey, callback);
    },

    getChunks: function (chunkKeysArray, callback) {
        if (!callback) {
            console.log("bad FeatureChunkCache usage: undefined callback");
        }
        this.store.getAll(chunkKeysArray, callback);
    },

    getAdjustedRegion: function (region) {
        var start = this.getChunkId(region.start) * this.chunkSize;
        var end = (this.getChunkId(region.end) * this.chunkSize) + this.chunkSize - 1;

        return new Region({chromosome: region.chromosome, start: start, end: end});
    },


    /**
     * Calls the callback with an Array of regions (chromosome, start, end) that are missing in the cache.
     * If two or more chunks are adjacent, they are returned as a single region.
     */
    getAdjustedRegions: function (region, callback, keySuffix) {
        var _this = this;
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);
        var keys = [];

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId, keySuffix));
        }

        this.getChunks(keys, function(chunks){
            var regions = [];
            var chunkStart = parseInt(firstChunkId * _this.chunkSize);

            for (var i = 0; i < chunks.length - 1; i++) {
                if (!chunks[i]) {
                    if (chunks[i+1]) {  // missing chunks region ends here. build it.
                        var chunkEnd = parseInt(((firstChunkId + i) * _this.chunkSize) + _this.chunkSize - 1);
                        var r = new Region({chromosome: region.chromosome, start: chunkStart, end: chunkEnd});
                        regions.push(r);
                    }
                } else {
                    chunkStart = parseInt((firstChunkId + i + 1) * _this.chunkSize);  // prepare start for next chunk
                }
            }

            if (!chunks[chunks.length - 1]) {
                var chunkEnd = parseInt(((lastChunkId) * _this.chunkSize) + _this.chunkSize - 1);
                var r = new Region({chromosome: region.chromosome, start: chunkStart, end: chunkEnd});
                regions.push(r);
            }
            callback(regions);
        });
    },


    /**
     * get the chunks that contain the starts of the regions.
     * // FIXME? change name?
     */
    getByRegions: function (regions, callback) {
        var chunkKeys = [];
        for (var i in regions) {
            var chunkId = this.getChunkId(regions[i].start);
            chunkKeys.push(this.getChunkKey(regions[i].chromosome, chunkId));
        }
        this.getChunks(chunkKeys, callback);
    },

    /**
     * get cached chunks in a region. The region can cover several chunks.
     */
    getByRegion: function (region, callback, keySuffix) {
        var _this = this;
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);
        var keys = [];
        var chunks = [];

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId, keySuffix));
        }

        this.getChunks(keys, function(allChunks){
            for (var i = 0; i < allChunks.length; i++) {
                if (allChunks[i]) {
                    chunks.push(allChunks[i]);
                }
            }
            callback(chunks);
        });
    },

    /**
     * get the regions of the chunks, classified by cached or not cached.
     */
    getCachedByRegion: function (region, callback) {
        var _this = this;
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);
        var keys = [];
        var chunkRegions = {cached: [], notCached: []};

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId));
        }

        this.getChunks(keys, function(chunks){
            for (var i = 0; i < chunks.length; i++) {
                var chunkRegionEnd = parseInt(((firstChunkId + i) * _this.chunkSize) + _this.chunkSize - 1);
                var chunkRegionStart = parseInt((firstChunkId + i) * _this.chunkSize);
                var chunkRegion = new Region({chromosome: region.chromosome, start: chunkRegionStart, end: chunkRegionEnd});

                if (_.isUndefined(chunks[i])) {
                    chunkRegions.notCached.push(chunkRegion);
                } else {
                    chunkRegions.cached.push(chunkRegion);
                }
            }
            if (this.verbose) {
                console.log(chunkRegions);
            }
            callback(chunkRegions);
        });
    },

    createEntryValue: function (chunkKey, value, encoded) {
        var valueStored;
        if (encoded) {
            valueStored = {value: value, chunkKey: chunkKey, enc: encoded}; // TODO add timestamp, last usage time, size, etc.
        } else {
            valueStored = {value: value, chunkKey: chunkKey}; // TODO add timestamp, last usage time, size, etc.
        }
        return valueStored;
    },

    /** single chunk in one transaction. this is a slow put */
    putChunk: function (chunkKey, value, encoded) {
        var valueStored = this.createEntryValue(chunkKey, value, encoded);
        this.store.put(chunkKey, valueStored);
        return valueStored;
    },
    putByRegion: function (region, value, encoded) {
        var chunkId = this.getChunkId(region.start);
        var chunkKey = this.getChunkKey(region.chromosome, chunkId);
        return this.putChunk(chunkKey, value);
    },

    /** several chunks in one transaction. this is a fast put */
    putChunks: function (chunkKeyArray, valueArray, encoded) {
        var valueStoredArray = [];
        for (var i = 0; i < valueArray.length; i++) {
            valueStoredArray.push(this.createEntryValue(chunkKeyArray[i], valueArray[i], encoded));   // TODO add timestamp, last usage time, size, etc.
        }
        this.store.putAll(chunkKeyArray, valueStoredArray);
        return valueStoredArray;
    },
    putByRegions: function (regionArray, valueArray, encoded, keySuffix) {
        var chunkKeyArray = [];
        for (var i = 0; i < regionArray.length; i++) {
            var chunkId = this.getChunkId(regionArray[i].start);
            var chunkKey = this.getChunkKey(regionArray[i].chromosome, chunkId, keySuffix);
            chunkKeyArray.push(chunkKey);
        }
        return this.putChunks(chunkKeyArray, valueArray, encoded);
    },

    getChunkKey: function (chromosome, chunkId, keySuffix) {
        if (keySuffix) {
            return chromosome + ":" + chunkId + "_" + keySuffix;
        } else {
            return chromosome + ":" + chunkId;
        }
    },

    getChunkId: function (position) {
        return Math.floor(position / this.chunkSize);
    },


    getChunkSize: function () {
        return this.chunkSize;
    }

    /* TODO:
    visit: function (chunkKey) {
        var _this = this;
        this.getChunk(chunkKey, function(value){
//            value.lastUsed = ...
            _this.putChunk(chunkKey, value);
        });
    },*/
};


