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

    this.verbose = false;
}


FeatureChunkCache.prototype = {

    getChunk: function (chunkId) {
        return this.store.get(chunkId);
    },

    getAdjustedRegion: function (region) {
        var start = this.getChunkId(region.start) * this.chunkSize;
        var end = (this.getChunkId(region.end) * this.chunkSize) + this.chunkSize - 1;

        return new Region({chromosome: region.chromosome, start: start, end: end});
    },


    getAdjustedRegions: function (region) {
        var firstChunkId = this.getChunkId(region.start);
        var lastChunkId = this.getChunkId(region.end);

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
                if (nextChunk && chunkId < lastChunkId) {
                    var r = new Region({chromosome: region.chromosome, start: chunkStart, end: chunkEnd})
                    regions.push(r);
                    updateStart = true;
                }
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

    getByRegions: function (regions) {
        var chunks = [];
        for (var i in regions) {
            var chunkId = this.getChunkId(regions[i].start);
            var chunkKey = this.getChunkKey(regions[i].chromosome, chunkId);
            chunks.push(this.getChunk(chunkKey));
        }
        return chunks;
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


}