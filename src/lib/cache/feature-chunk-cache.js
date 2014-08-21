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

    this.store = new MemoryStore({});
//    this.store = new IndexedDBStore({});

    this.verbose = false;
}


FeatureChunkCache.prototype = {


    getChunk: function (chunkId) {
        return this.store.get(chunkId);
    },
    //Async
    getChunknew: function (chunkKey, callback) {
        this.store.get(chunkKey, callback);
    },

    getChunksnew: function (chunkKeysArray, callback) {
        this.store.getCollection(chunkKeysArray, callback);
    },

    getAdjustedRegion: function (region) {
        var start = this.getChunkId(region.start) * this.chunkSize;
        var end = (this.getChunkId(region.end) * this.chunkSize) + this.chunkSize - 1;

        return new Region({chromosome: region.chromosome, start: start, end: end});
    },


    /**
     * Returns an Array of regions (chromosome, start, end) that are missing in the cache.
     * If two or more chunks are adjacent, they are returned as a single region.
     */
    //Async
    getAdjustedRegionsnew: function (region, callback) {
        var _this = this;
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);
        var keys = [];

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId));
        }

        this.getChunksnew(keys, function(chunks){
            console.log("in getAdjustedRegionsnew");
            console.log(chunks);
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


    getAdjustedRegions: function (region) {
        var regions = [], updateStart = true, updateEnd = true, chunkStart, chunkEnd;
        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            var chunkKey = this.getChunkKey(region.chromosome, chunkId);
            var nextChunkKey = this.getChunkKey(region.chromosome, chunkId + 1);
            var chunk = this.getChunk(chunkKey);
            var nextChunk = this.getChunk(nextChunkKey);
            if (updateStart) {
                chunkStart = parseInt(chunkId * this.chunkSize);
                updateStart = false;
            }
            if (updateEnd) {
                chunkEnd = parseInt((chunkId * this.chunkSize) + this.chunkSize - 1);
                updateEnd = false;
            }

            if (!chunk) {
                updateEnd = true;
                if (nextChunk && chunkId < lastChunkId) {   // region of missing chunks ends here. build the region
                    var r = new Region({chromosome: region.chromosome, start: chunkStart, end: chunkEnd})
                    regions.push(r);
                    updateStart = true;
                }   // else, there are more adjacent missing chunks, so the region is bigger: don't build the region yet.
                if (chunkId == lastChunkId) {
                    var r = new Region({chromosome: region.chromosome, start: chunkStart, end: chunkEnd})
                    regions.push(r);
                }
            } else {
                updateStart = true;
                updateEnd = true;
            }
        }
        return regions;
    },

    getByRegionsnew: function (regions, callback) {
        var chunkKeys = [];
        for (var i in regions) {
            var chunkId = this.getChunkId(regions[i].start);
            chunkKeys.push(this.getChunkKey(regions[i].chromosome, chunkId));
        }
        this.getChunksnew(chunkKeys, callback);
    },

    getByRegions: function (regions) {
        var chunks = [];
        for (var i in regions) {
            var chunkId = this.getChunkId(regions[i].start);
            var chunkKey = this.getChunkKey(regions[i].chromosome, chunkId);
            chunks.push(this.getChunk(chunkKey));
        }
        return chunks;
    },

    getCachedByRegionnew: function (region, callback) {
        var _this = this;
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);
        var keys = [];
        var chunkRegions = {cached: [], notCached: []};

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            keys.push(this.getChunkKey(region.chromosome, chunkId));
        }

        this.getChunksnew(keys, function(chunks){
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

    getCachedByRegion: function (region) {
        var chunkRegions = {cached: [], notCached: []};

        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);

        for (var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            var chunkKey = this.getChunkKey(region.chromosome, chunkId);
            var chunk = this.getChunk(chunkKey);

            var chunkRegionStart = parseInt(chunkId * this.chunkSize) || 1;
            var chunkRegionEnd = parseInt(chunkId * this.chunkSize + this.chunkSize - 1);
            var chunkRegion = new Region({chromosome: region.chromosome, start: chunkRegionStart, end: chunkRegionEnd});

            if (_.isUndefined(chunk)) {
                chunkRegions.notCached.push(chunkRegion);
            } else {
                chunkRegions.cached.push(chunkRegion);
            }

            if (this.verbose) {
                console.log(chunkRegions);
            }
        }
        return chunkRegions;
    },

    putChunk: function (chunkKey, value) {
        var value = {value: value, chunkKey: chunkKey};
        this.store.add(chunkKey, value);
        return value;
    },

    putByRegion: function (region, value) {
        var chunkId = this.getChunkId(region.start);
        var chunkKey = this.getChunkKey(region.chromosome, chunkId);
        return this.putChunk(chunkKey, value);
    },

    getChunkKey: function (chromosome, chunkId) {
        return chromosome + ":" + chunkId;
    },

    getChunkId: function (position) {
        return Math.floor(position / this.chunkSize);
    },


    getChunkSize: function () {
        return this.chunkSize;
    }


};


