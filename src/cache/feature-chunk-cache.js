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

    getByRegions: function (regions) {
        var chunks = [];
        for(var i in regions) {
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

        for(var chunkId = firstChunkId; chunkId <= lastChunkId; chunkId++) {
            var chunkKey = this.getChunkKey(region.chromosome, chunkId);
            var chunk = this.getChunk(chunkKey);

            var chunkRegionStart = parseInt(chunkId * this.chunkSize);
            var chunkRegionEnd = parseInt(chunkId * this.chunkSize + this.chunkSize - 1);
            var chunkRegion = new Region({chromosome: region.chromosome, start: chunkRegionStart, end: chunkRegionEnd});

            if (_.isUndefined(chunk)) {
                chunkRegions.notCached.push(chunkRegion);
            } else {
                chunkRegions.cached.push(chunkRegion);
            }

            if(this.verbose) {
                console.log(chunkRegions);
            }
        }
        return chunkRegions;
    },

    putChunk: function (chunkId, items) {
        var value = {items: items, chunkId: chunkId};
        this.store.add(chunkId, value);
        return value;
    },

    putByRegion: function (region, items) {
        var value = {items: items, chunkId: chunkId};
        this.store.add(chunkId, value);
        return value;
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