/**
 * Created with IntelliJ IDEA.
 * User: fsalavert
 * Date: 10/18/13
 * Time: 12:06 PM
 * To change this template use File | Settings | File Templates.
 */

function ChunkCache(args) {
    _.extend(this, Backbone.Events);

    // Default values
    this.id = Utils.genId("ChunkCache");
    this.chunkSize = 50000;

    _.extend(this, args);

    this.chunkStore = new MemoryStore({});
}


ChunkCache.prototype = {
    getChunk: function (chunkId) {
        return this.chunkStore.get(chunkId);
    },
    putChunk: function (chunkId, items) {
        var value = {items: items, chunkId: chunkId};
        this.chunkStore.add(chunkId, value);
        return value;
    },
    getChunkId: function (position) {
        return Math.floor(position / this.chunkSize);
    },
    getChunkSize: function () {
        return this.chunkSize;
    }
}