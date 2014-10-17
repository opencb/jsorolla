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

    this.defaultChunkSize = 50000;
    this.limit;

    _.extend(this, args);

//    this.store = new MemoryStore({});

    this.store = new IndexedDBStore({cacheId: this.cacheId, objectStore: this.subCacheId});

    this.verbose = false;
}


FeatureChunkCache.prototype = {
    getUnachedRegionsAndCachedChunks: function (region, category, dataType, chunkSize, callback) {
        var _this = this;
        var temporalChunkSize = chunkSize? chunkSize : this.defaultChunkSize;

        var firstChunkId = this.getChunkId(region.start, temporalChunkSize);
        var lastChunkId = this.getChunkId(region.end, temporalChunkSize);
        var keys = [];
        var chunksAndRegions = {cachedChunks: [], uncachedRegions: []};

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId, dataType, temporalChunkSize));
        }

        this.getChunks(category, keys, function(chunks){
            for (var i = 0; i < chunks.length; i++) {
                var chunkRegionEnd = parseInt(((firstChunkId + i) * _this.chunkSize) + _this.chunkSize - 1);
                var chunkRegionStart = parseInt((firstChunkId + i) * _this.chunkSize);
                var chunkRegion = new Region({chromosome: region.chromosome, start: chunkRegionStart, end: chunkRegionEnd});

                if (_.isUndefined(chunks[i])) {
                    chunksAndRegions.uncachedRegions.push(chunkRegion);
                } else {
                    chunksAndRegions.cachedChunks.push(chunk);
                }
            }
            if (this.verbose) {
                console.log(chunksAndRegions);
            }
            if (callback) {
                callback(chunksAndRegions.cachedChunks, chunksAndRegions.uncachedRegions);
            }
        });
    },

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

    getChunks: function (category, chunkKeysArray, callback) {
        if (!callback) {
            console.log("bad FeatureChunkCache usage: undefined callback");
        }
        this.store.getAll(category, chunkKeysArray, callback);
    },

    // deprecated
    getAdjustedRegion: function (region) {
        var start = this.getChunkId(region.start) * this.chunkSize;
        var end = (this.getChunkId(region.end) * this.chunkSize) + this.chunkSize - 1;

        return new Region({chromosome: region.chromosome, start: start, end: end});
    },


    /**
     * Calls the callback with an Array of regions (chromosome, start, end) that are missing in the cache.
     * If two or more chunks are adjacent, they are returned as a single region.
     */
        //half deprecated
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
        // deprecated
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
        // deprecated
    putChunk: function (chunkKey, value, encoded) {
        var valueStored = this.createEntryValue(chunkKey, value, encoded);
        this.store.put(chunkKey, valueStored);
        return valueStored;
    },
    //deprecated
    putByRegion: function (region, value, encoded) {
        var chunkId = this.getChunkId(region.start);
        var chunkKey = this.getChunkKey(region.chromosome, chunkId);
        return this.putChunk(chunkKey, value);
    },

    /** several chunks in one transaction. this is a fast put */
    putChunks: function (category, chunkKeyArray, valueArray, encoded) {
        var valueStoredArray = [];
        for (var i = 0; i < valueArray.length; i++) {
            valueStoredArray.push(this.createEntryValue(chunkKeyArray[i], valueArray[i], encoded));   // TODO add timestamp, last usage time, size, etc.
        }
        this.store.putAll(category, chunkKeyArray, valueStoredArray);
        return valueStoredArray;
    },

    /**
     * TODO: the regions must be equally long to the chunksize
     */
    putByRegions: function (regionArray, valueArray, category, dataType, chunkSize) { // encoded
        var temporalChunkSize = chunkSize? chunkSize : this.defaultChunkSize;
        var chunkKeyArray = [];
        for (var i = 0; i < regionArray.length; i++) {
            var chunkId = this.getChunkId(regionArray[i].start, temporalChunkSize);
            var chunkKey = this.getChunkKey(regionArray[i].chromosome, chunkId,  dataType, chunkSize);
            chunkKeyArray.push(chunkKey);
        }
        return this.putChunks(category, chunkKeyArray, valueArray, encoded);
    },

    getChunkKey: function (chromosome, chunkId, dataType, chunkSize) {
        var keySuffix = dataType? "_" + dataType : "";
        keySuffix += "_" + chunkSize;       // e.g. "_hist_1000"
        return chromosome + ":" + chunkId + keySuffix;
    },

    getChunkId: function (position, chunkSize) {
        return Math.floor(position / chunkSize);
    },


    getDefaultChunkSize: function () {
        return this.defaultChunkSize;
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


