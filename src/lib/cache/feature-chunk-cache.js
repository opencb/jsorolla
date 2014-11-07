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
    this.defaultCategory = "defaultCategory";
    this.limit;

    _.extend(this, args);

    if (this.storeType == "MemoryStore") {
        this.store = new MemoryStore({});
    } else {
        this.store = new IndexedDBStore({cacheId: this.cacheId});
    }

    this.verbose = false;
}


FeatureChunkCache.prototype = {
    /**
     *
     * @param region an object Region
     * @param categories approximately the table in the DB. May be an array
     * @param dataType another level of classification
     * @param chunkSize
     * @param callback receives two arguments: (cachedChunks, uncachedRegions) with this structure:
     * cachedChunks: {
     *     categories[0]: [chunk, chunk, chunk],
     *     categories[1]: [chunk, chunk, chunk],
     *     ...
     * }
     * uncachedRegions: {
     *     categories[0]: [region, region],
     *     categories[1]: [region, region],
     *     ...
     * }
     */
    get: function (region, categories, dataType, chunkSize, callback) {
        var _this = this;
        var temporalChunkSize = chunkSize? chunkSize : this.defaultChunkSize;

        var firstChunkId = this.getChunkId(region.start, temporalChunkSize);
        var lastChunkId = this.getChunkId(region.end, temporalChunkSize);
        var keys = [];
        var chunksAndRegions = {cachedChunks: {}, uncachedRegions: {}};

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId, dataType, temporalChunkSize));
        }

        if (!_.isArray(categories)) {
            categories = [categories];
        }
        var callbackCount = 0;
        for (var cat = 0; cat < categories.length; cat++) {
            callbackCount++;
            chunksAndRegions.cachedChunks[categories[cat]] = [];
            chunksAndRegions.uncachedRegions[categories[cat]] = [];
            this.getChunks(categories[cat], keys, function (iterCat) {
                return function(chunks) {
                    for (var i = 0; i < chunks.length; i++) {
                        var chunkRegionEnd = parseInt(((firstChunkId + i) * temporalChunkSize) + temporalChunkSize - 1);
                        var chunkRegionStart = parseInt((firstChunkId + i) * temporalChunkSize);
                        var chunkRegion = new Region({chromosome: region.chromosome, start: chunkRegionStart, end: chunkRegionEnd});

                        if (_.isUndefined(chunks[i])) {
                            chunksAndRegions.uncachedRegions[categories[iterCat]].push(chunkRegion);
                        } else {
                            chunksAndRegions.cachedChunks[categories[iterCat]].push(chunks[i]);
                        }
                    }
                    if (this.verbose) {
                        console.log(chunksAndRegions);
                    }
                    callbackCount--;
                    if  (callbackCount == 0 && callback) {
                        callback(chunksAndRegions.cachedChunks, chunksAndRegions.uncachedRegions);
                    }
                }
            } (cat));     // to force the closure to have each value of cat, and not just the last one
        }
    },

    /*
     getChunk: function (chunkId) {
     return this.store.get(chunkId);
     },*/

    getChunk: function (category, chunkKey, callback) {
        if (!callback) {
            console.log("bad FeatureChunkCache usage: undefined callback");
        }
        if (!category) {
            category = this.defaultCategory;
        }
        this.store.get(category, chunkKey, callback);
    },

    getChunks: function (category, chunkKeysArray, callback) {
        if (!callback) {
            console.log("bad FeatureChunkCache usage: undefined callback");
        }
        if (!category) {
            category = this.defaultCategory;
        }
        this.store.getAll(category, chunkKeysArray, callback);
    },

    joinRegions: function(regions) {
        if (regions.length <= 1) {
            return regions;
        }
        // assert(regions.length >= 2)

        var joinedRegions = [];
        var regionStart = regions[0].start;
        var regionEnd = region[0].end;
        var regionChromosome = regions[0].chromosome;

        for (var i = 1; i < regions.length; i++) {
            if (regions[i].chromosome == regionChromosome && regions[i].start - 1 <= regionEnd) { // CAUTION: assuming inclusive intervals
                if (regions[i].end > regionEnd) {
                    regionEnd = regions[i].end;
                }
            } else {
                joinedRegions.push(new Region({chromosome: regionChromosome, start: regionStart, end: regionEnd}));
                regionChromosome = regions[i].chromosome;
                regionStart = regions[i].start;
                regionEnd = regions[i].end;
            }
        }

        joinedRegions.push(new Region({chromosome: regionChromosome, start: regionStart, end: regionEnd}));

        return joinedRegions;
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
        return this.putChunks(chunkKeyArray, valueArray, category, false);
    },

    /** several chunks in one transaction. this is a fast put */
    putChunks: function (chunkKeyArray, valueArray, category, encoded) {
        var valueStoredArray = [];
        for (var i = 0; i < valueArray.length; i++) {
            valueStoredArray.push(this.createEntryValue(chunkKeyArray[i], valueArray[i], encoded));   // TODO add timestamp, last usage time, size, etc.
        }
        if (!category) {
            category = this.defaultCategory;
        }
        this.store.putAll(category, chunkKeyArray, valueStoredArray);
        return valueStoredArray;
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


