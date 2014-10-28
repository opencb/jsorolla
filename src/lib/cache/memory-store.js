/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/8/13
 * Time: 12:40 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * MemoryStore is a cache with items ordered with "least recently used" criterion (LRU). This allows to remove old data with the "shift" method.
 * The parameter "category" should be a string, and it is used as another level of classification.
 * "get", "getAll" and "foreach" methods can be used with callbacks or with return values.
 */
function MemoryStore(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    // configurable parameters
//    this.limit = 500;

    // Now we set the args parameters
    _.extend(this, args);

    this.init();
};

MemoryStore.prototype = {
    put: function (category, key, value) {
        if (typeof this.stores[category] === 'undefined') {
            this.init(category);
        }
        var item = {key: key, value: value};

        // a item can be overwritten
        this.stores[category][key] = item;

        if (this.tails[category]) {
            this.tails[category].newer = item;
            item.older = this.tails[category];
        } else {
            // the item is the first one
            this.heads[category] = item;
        }

        // add new item to the end of the linked list, it's now the freshest item.
        this.tails[category] = item;

//        if (this.size === this.limit) {
//            // we hit the limit, remove the head
//            this.shift();
//        } else {
//            // increase the size counter
//            this.size++;
//        }
        this.sizes[category]++;

    },
    putAll: function (category, keyArray, valueArray) {
        for (var i = 0; i < keyArray.length; i++) {
            this.put(category, keyArray[i], valueArray[i]);
        }
    },

    shift: function (category) {
        if (typeof this.stores[category] === 'undefined') {
            this.init(category);
        }
        // todo: handle special case when limit == 1
        var item = this.heads[category];
        if (item) {
            if (this.heads[category].newer) {
                this.heads[category] = this.heads[category].newer;
                this.heads[category].older = undefined;
            } else {
                this.heads[category] = undefined;
            }
            // Remove last strong reference to <item> and remove links from the purged
            // item being returned:
            item.newer = item.older = undefined;
            // delete is slow, but we need to do this to avoid uncontrollable growth:
            delete this.stores[category][item.key];
        }
    },
    get : function(category, key, callback) {
        if (typeof this.stores[category] === 'undefined') {
            this.init(category);
        }
        // First, find our cache item
        var item = this.stores[category][key];
        if (item === undefined) {
            if (callback) {
                callback();
            }
            return; // Not cached. Sorry.
        }
        // As <key> was found in the cache, register it as being requested recently
        if (item === this.tails[category]) {
            // Already the most recenlty used item, so no need to update the list
            if (callback) {
                callback(item.value);
            }
            return item.value;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (item.newer) {
            if (item === this.heads[category]){
                this.heads[category] = item.newer;
            }
            item.newer.older = item.older; // C <-- E.
        }
        if (item.older){
            item.older.newer = item.newer; // C. --> E
        }
        item.newer = undefined; // D --x
        item.older = this.tails[category]; // D. --> E
        if (this.tails[category])
            this.tails[category].newer = item; // E. <-- D
        this.tails[category] = item;
        if (callback) {
            callback(item.value);
        }
        return item.value;
    },

    getAll: function (category, keyArray, callback) {
        var valueArray = [];
        for (var i = 0; i < keyArray.length; i++) {
            valueArray[i] = this.get(category, keyArray[i]);
        }
        callback(valueArray);
    },

    foreach: function (category, keyArray, callback) {
        for (var i = 0; i < keyArray.length; i++) {
            callback(this.get(category, keyArray[i]), keyArray[i]);
        }
    },

    init: function (category) {
        if (category != undefined) {
            this.sizes[category] = 0;
            this.stores[category] = {};
            this.heads[category] = undefined;
            this.tails[category] = undefined;
        } else {
            this.sizes = {};
            this.stores = {};
            this.heads = {};
            this.tails = {};
        }
    },
    clear: function () {
        this.stores = null; // TODO delete?
        this.init();
    }


//    get: function (key) {
//        if (typeof this.dataStore === 'undefined') {
//            return undefined;
//        } else {
//            var ms = this.counter++;
//            this.dataStore[key].ms = ms;
//            return this.dataStore[key].data;
//        }
//    },

//    addCollection: function (key, featureArray) {
//        // If 'featureArray' is an Array then we add all elements,
//        // otherwise we call to add()
//        if ($.isArray(featureArray)) {
//            if (typeof this.dataStore === 'undefined') {
//                this.dataStore = {};
//            }
//            for (var feature in featureArray) {
//                this.dataStore[key] = feature;
//                this.lru.push({key: key, ms: this.counter});
//            }
//        } else {
//            this.add(key, featureArray);
//        }
//    },

//    delete: function (key) {
//        if (typeof this.dataStore !== 'undefined') {
//            var aux = this.dataStore[key];
//            delete this.dataStore[key];
//            return aux;
//        }
//    },

//    free: function () {
//        this.lru = [];
//        for (var i in this.dataStore) {
//            this.lru.push({key: i, ms: this.dataStore[i].ms});
//        }
//        this.lru.sort(function (a, b) {
//            return a.ms - b.ms;
//        });
//        this.delete(this.lru[0].key);
//        this.lru.splice(0, 1);
//    },
//
//    close: function () {
//        this.dataStore = null;
//    }
};