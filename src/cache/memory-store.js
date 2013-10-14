/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/8/13
 * Time: 12:40 AM
 * To change this template use File | Settings | File Templates.
 */

function MemoryStore(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.dataStore = {};
    this.lru = [];
    this.counter = 0;

    // Now we set the args parameters
    // must be the last instruction
    _.extend(this, args);

};

MemoryStore.prototype = {

    init: function() {
        this.size = 0;
        this.dataStore = {};
    },

    add: function(key, feature) {
        if(typeof this.dataStore === 'undefined') {
            this.dataStore = {};
        }
        this.dataStore[key] = {data: feature, ms: this.counter++};

        this.dataStore[key] = {data: feature, ms: this.counter++};
//        this.counter++;
//        this.dataStore[key] = feature;
//        this.lru.push({key: key, ms: Date.now()});
    },

    get: function(key) {
        if(typeof this.dataStore === 'undefined') {
            return undefined;
        }else {
//            this.lru.push({key: key, ms: Date.now()});
            this.dataStore[key].ms = this.counter++;
//            this.counter++;
            return this.dataStore[key].data;
        }
    },

    addCollection: function(key, featureArray) {
        // If 'featureArray' is an Array then we add all elements,
        // otherwise we call to add()
        if($.isArray(featureArray)) {
            if(typeof this.dataStore === 'undefined') {
                this.dataStore = {};
            }
            for(var feature in featureArray) {
                this.dataStore[key] = feature;
                this.lru.push({key: key, ms: this.counter});
            }
        }else {
            this.add(key, featureArray);
        }
    },

    delete: function(key) {
        if(typeof this.dataStore !== 'undefined') {
            var aux = this.dataStore[key];
            delete this.dataStore[key];
            return aux;
        }
    },

    free: function() {
        this.lru = [];
        for(var i in this.dataStore) {
            this.lru.push({key: i, ms: this.dataStore[i].ms});
        }
        this.lru.sort(function(a, b){
            return a.ms - b.ms;
        });
        this.delete(this.lru[0].key);
        this.lru[0] = null;
    },

    clear: function() {
        this.dataStore = null;
        this.init();
    },

    close: function() {
        this.dataStore = null;
    }
};