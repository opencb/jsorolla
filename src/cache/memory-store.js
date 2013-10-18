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

    // configurable parameters
//    this.limit = 500;

    // Now we set the args parameters
    _.extend(this, args);

    // internal parameters
    this.size = 0;
    this.store = {};
};

MemoryStore.prototype = {
    add: function (key, value) {
        if (typeof this.dataStore === 'undefined') {
            this.dataStore = {};
        }
        var item = {key: key, value: value};

        // a item can be overwritten
        this.store[key] = item;

        if (this.tail) {
            this.tail.newer = item;
            item.older = this.tail;
        } else {
            // the item is the first one
            this.head = item;
        }

        // add new item to the end of the linked list, it's now the freshest item.
        this.tail = item;

//        if (this.size === this.limit) {
//            // we hit the limit, remove the head
//            this.shift();
//        } else {
//            // increase the size counter
//            this.size++;
//        }
        this.size++;

    },
    shift: function () {
        // todo: handle special case when limit == 1
        var item = this.head;
        if (item) {
            if (this.head.newer) {
                this.head = this.head.newer;
                this.head.older = undefined;
            } else {
                this.head = undefined;
            }
            // Remove last strong reference to <item> and remove links from the purged
            // item being returned:
            item.newer = item.older = undefined;
            // delete is slow, but we need to do this to avoid uncontrollable growth:
            delete this.store[item.key];
        }
    },
    get : function(key) {
        // First, find our cache item
        var item = this.store[key];
        if (item === undefined) return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        if (item === this.tail) {
            // Already the most recenlty used item, so no need to update the list
            return item.value;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (item.newer) {
            if (item === this.head){
                this.head = item.newer;
            }
            item.newer.older = item.older; // C <-- E.
        }
        if (item.older){
            item.older.newer = item.newer; // C. --> E
        }
        item.newer = undefined; // D --x
        item.older = this.tail; // D. --> E
        if (this.tail)
            this.tail.newer = item; // E. <-- D
        this.tail = item;
        return item.value;
    },

    init: function () {
        this.size = 0;
        this.store = {};
        this.head = undefined;
        this.tail = undefined;
    },
    clear: function () {
        this.dataStore = null;
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