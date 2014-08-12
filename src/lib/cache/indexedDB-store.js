/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/8/13
 * Time: 12:42 AM
 * To change this template use File | Settings | File Templates.
 */

function IndexedDBStore(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.chunkSize = 50000;
    this.lru = [];

    // Now we set the args parameters
    // must be the last instruction
    _.extend(this, args);

};

IndexedDBStore.prototype = {

    init: function() {
        this.size = 0;
        this.cache = {};
    },

//    _getKey:

    get: function(key) {

    },

    add: function(key, feature) {

    },

    addCollection: function(key, featureArray) {

    },

    delete: function(key) {

    }

};