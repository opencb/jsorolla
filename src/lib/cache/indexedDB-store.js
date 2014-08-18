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

    this.db = null;
    this.transactionQueue = [];
};

IndexedDBStore.prototype = {
    /**
     * Pushes always. The first in the queue can be run.
     */
    _enqueue: function(event) {
        var queue = this.transactionQueue;
        console.log("enqueue before and after: ");
        console.log(queue);
        queue.push(event);
        console.log(queue);
        if (queue.length == 1) {
            event.func();
        }
    },
    _dequeue: function () {
        var queue = this.transactionQueue;
        console.log("dequeue before and after: ");
        console.log(queue);
        queue.shift(); // remove the just finished event.
        console.log(queue);
        if (queue.length != 0) {
            var next = queue[0];   // run the first in the queue
            next.func();
        }
    },
    init: function() {
        var _this = this;
        this.size = 0;
        this.cache = {};

//        if (!window.indexedDB) {
//            window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
//        }
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        console.log("Trying to open database ...");
        var myEvent = {func: function() {
        try {
            var dbOpenRequest = window.indexedDB.open("IndexedDBStore");
            dbOpenRequest.onsuccess = function(event){
                _this.db = dbOpenRequest.result;

                var thisDB = _this.db; // Need to create this variable since the variable db is assigned to other things later
                _this.db.onversionchange = function(e){
                    console.log("Version change triggered, so closing database connection", e.oldVersion, e.newVersion, thisDB);
                    thisDB.close();
                };
                console.log("Database Opened", _this.db, event);
                _this._dequeue();
                /* Code for ${db.open} */
            };
            dbOpenRequest.onupgradeneeded = function(e){
                console.log("Database upgrade needed");
                _this.db = dbOpenRequest.result;
                var db2 = e.target.result;

//                if(!objectStoreNames.contains('storename'))
                var objectStore = _this.db.createObjectStore("dataObjectStore");
                var transaction = dbOpenRequest.transaction;
                /* Code for ${db.upgrade} */
            };
            dbOpenRequest.onerror = function(e){
                console.log("DB Open Request Error");
            };
            dbOpenRequest.onblocked = function(e){
                console.log("DB Open Request Blocked");
            };
        } catch (e) {
            console.error(e);
        }}};
        _this._enqueue(myEvent);
    },


    get: function(key, callback) {
        var _this = this;

        var myEvent = {func: function () {
            var transaction = _this.db.transaction(["dataObjectStore"], "readwrite");
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction");
                console.log(event);
            };

            var objectStore = transaction.objectStore("dataObjectStore");
            var request = objectStore.get(key);
            request.onsuccess = function (event) {
                console.log("result of get:");
                console.log(request.result);
                callback(request.result);
                _this._dequeue();   // TODO: before or after the callback?
            };
            request.onerror = function (event) {
                console.log("error in get");
                console.log(event);
                // Handle errors!
            };
        }
        };

        this._enqueue(myEvent);
    },

    clear: function () {

    },


    add: function(key, value) {
        var _this = this;

        var myEvent = {func: function() {
                var transaction = _this.db.transaction(["dataObjectStore"], "readwrite");
                transaction.onerror = function (event) {
                    console.log("There was an error in the transaction");
                    console.log(event);
                };

                var objectStore = transaction.objectStore("dataObjectStore");
                var request = objectStore.add(value, key);    // as the key is optional depending on the database scheme, it is the 2nd parameter

                request.onsuccess = function(event) {
                    _this._dequeue();
                };
            }
        };

        this._enqueue(myEvent);
    },

    addCollection: function(key, featureArray) {

    },


    delete: function(key) {
        var _this = this;

        var myEvent = {func: function() {
            var transaction = _this.db.transaction(["dataObjectStore"], "readwrite");
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction");
                console.log(event);
            };

            var objectStore = transaction.objectStore("dataObjectStore");
            var request = objectStore.delete(key);    // as the key is optional depending on the database scheme, it is the 2nd parameter

            request.onsuccess = function(event) {
                _this._dequeue();
            };
        }
        };

        this._enqueue(myEvent);
    }

};

/*

 write("Trying to delete database");
 try {
 var dbDeleteRequest = window.indexedDB.deleteDatabase("BookShop1");
 dbDeleteRequest.onsuccess = function(e){
 write("Database successfully deleted");
 // Code for ${db.open}
};
dbDeleteRequest.onupgradeneeded = function(e){
    var db = dbOpenRequest.result;
    write("Database upgrade needed");
    // Code for ${db.upgrade}
};
dbDeleteRequest.onerror = function(e){
    write("Error deleting DB");
    writeError(e);
};
dbDeleteRequest.onblocked = function(e){
    write("Deleting DB Blocked. Try closing the database and then deleting it", dbDeleteRequest.error, e.type);
};
} catch (e) {
    writeError(e);
}
}
 */