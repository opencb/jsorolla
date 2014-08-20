/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/8/13
 * Time: 12:42 AM
 *
 * This class stores the events (add put get delete...) in an event queue,
 * so that they are done after creating/opening the database.
 *
 * Each event has to enqueue itself, and when it is done, dequeue itself and call the next event.
 *
 * structure of methods:
 *
 * method = function () {
    var _this = this;
    var myEvent = {func: function () {
        // stuff
        // on complete
            _this._dequeue();
        }
    };
    this._enqueue(myEvent);
 }

 */

var iDBInstances = 0;
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
    iDBInstances++;
    this.dequeues = 0;
};

IndexedDBStore.prototype = {
    _enqueue: function(event) {
        var queue = this.transactionQueue;
//        debugger
        queue.push(event);
        if (event.type =="get" || event.type == "count") {
//            console.log("ENqueue " + event.type + " before and after: ");
            console.log("ENqueue " + event.type + " after: ");
            var snap = _.extend([], queue);
            console.log(snap);
        }
//        console.log(queue);
        if (queue.length == 1) {
            event.func();
        }
    },
    _dequeue: function () {
        this.dequeues++;
        var queue = this.transactionQueue;
//        console.log("DEqueue " + event.type + " before and after: ");
//        console.log(queue.length);

//        if (queue[0].type =="get" || queue[0].type == "count") {
//            debugger
//        }
        queue.shift(); // remove the just finished event.
//        console.log(queue);
        if (queue.length != 0) {
            var next = queue[0];   // run the first in the queue
            next.func();
        }

    },
    init: function(datatype) {
        var _this = this;
        this.datatype = datatype;
        this.size = 0;
        this.cache = {};

//        if (!window.indexedDB) {
//            window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
//        }
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        console.log("Trying to open database ...");
        var myEvent = {type: "init", func: function() {
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
                    var objectStore = _this.db.createObjectStore(_this.datatype);
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
            }
        }};
        console.log("in init");
        _this._enqueue(myEvent);
    },

    clear: function () {
//        this.db.deleteObjectStore(this.datatype);

        var _this = this;
        var myEvent = {type: "clear", func: function(){
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                console.log("clear success!");
                _this._dequeue();
            };
            var objectStore = transaction.objectStore(_this.datatype);
            var req = objectStore.clear();
            req.onerror = function (evt) {
                console.error("Error trying to clear the object store " + _this.datatype);
            }
        }};
        this._enqueue(myEvent);
    },

    count: function (callback) {
        var _this = this;
        var myEvent = {type: "count", func: function(){
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            var objectStore = transaction.objectStore(_this.datatype);
            var req = objectStore.count();
            req.onerror = function (evt) {
                console.error("Error trying to count the object store " + _this.datatype);
            }
            req.onsuccess = function (event) {
                callback(event.target.result);
            }
        }};
        this._enqueue(myEvent);
    },

    close: function () {
        var _this = this;
        var myEvent = {type: "close", func: function(){
                _this.db.close();
                _this._dequeue();
            }};
        this._enqueue(myEvent);
    },

    destroyDB: function() {
        var _this = this;
        var myEvent = {type: "destroy", func: function () {
            console.log("Trying to delete database");
            try {
                var dbDeleteRequest = window.indexedDB.deleteDatabase("IndexedDBStore");
                dbDeleteRequest.onsuccess = function (e) {
                    console.log("Database successfully deleted");
                    _this._dequeue();
                };
                dbDeleteRequest.onupgradeneeded = function (e) {
                    var db = dbOpenRequest.result;
                    console.log("Database upgrade needed");
                    /* Code for ${db.upgrade} */
                };
                dbDeleteRequest.onerror = function (e) {
                    console.log("Error deleting DB");
                    writeError(e);
                };
                dbDeleteRequest.onblocked = function (e) {
                    console.log("Deleting DB Blocked. Try closing the database and then deleting it", dbDeleteRequest.error, e.type);
                };
            } catch (e) {
                console.log(e);
            }
        }
        };

        this._enqueue(myEvent);
    },


    get: function(key, callback) {
        var _this = this;

        var myEvent = {type: "get", func: function () {
            var transaction = _this.db.transaction([_this.datatype], "readonly");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction get (" + key + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(_this.datatype);
            var request = objectStore.get(key);
            request.onsuccess = function (event) {
                console.log("result of get:");  //
                console.log(event.target.result);    //
                callback(event.target.result)
            };
        }
        };

        this._enqueue(myEvent);
    },


    add: function(key, value) {
        var _this = this;

        var myEvent = {type: "add", func: function() {
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction add (" + key + ", " + value + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(_this.datatype);
            var request = objectStore.add(value, key);    // as the key is optional depending on the database scheme, it is the 2nd parameter
        }
        };

        this._enqueue(myEvent);
    },
    put: function(key, value) {
        var _this = this;

        var myEvent = {type: "put", func: function() {
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction put(" + key + ", " + value + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(_this.datatype);
            var request = objectStore.put(value, key);    // as the key is optional depending on the database scheme, it is the 2nd parameter
        }
        };

        this._enqueue(myEvent);
    },

    putCollection: function(keyArray, valueArray) {

        if (!(keyArray instanceof Array) || !(valueArray instanceof Array) || (keyArray.length != valueArray.length)) {
            console.error("Bad use of IndexedDBStore: addCollection must receive two Arrays of the same length.");
            return;
        }

        var _this = this;

        var myEvent = {type: "addCollection", func: function() {
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction put(" + key + ", " + value + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(_this.datatype);

            for (var i = 0; i < keyArray.length; i++) {
                objectStore.put(valueArray[i], keyArray[i]);    // as the key is optional depending on the database scheme, it is the 2nd parameter
            }
        }
        };

        this._enqueue(myEvent);
    },


    delete: function(key) {
        var _this = this;

        var myEvent = {type: "delete", func: function() {
            var transaction = _this.db.transaction([_this.datatype], "readwrite");
            transaction.oncomplete = function(event) {
                _this._dequeue();
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction delete (" + key + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(_this.datatype);
            var request = objectStore.delete(key);    // as the key is optional depending on the database scheme, it is the 2nd parameter

        }
        };

        this._enqueue(myEvent);
    }

};

//console.log("in test");
//var idb = new IndexedDBStore();
//debugger
//idb.init("feature");
//idb.clear();
/*
var n = 150
var keyArray = new Array(n);
var valueArray = new Array(n);
for (var i = 0; i < n; i++) {
    keyArray[i] = "key" + i;
    valueArray[i] = "value" + i;
}
idb.putCollection(keyArray, valueArray);
*/
//console.time("creation");
//var n = 1000;
/*
var keyArray = new Array(n);
var valueArray = new Array(n);
for (var i = 0; i < n; i++) {
    keyArray[i] = "key" + i;
    valueArray[i] = "value" + i;
}
console.timeEnd("creation");
console.time("firstget");
idb.putCollection(keyArray, valueArray);
// */
/*
console.time("firstget");
for (var i = 0; i < n; i++) {
    idb.put("key" + i, "value" + i);
}
// */

//        this.idb.add("key00", "value00");
//        this.idb.add("key01", "value01");
//    debugger



//idb.count(function(result) {console.log("number of rows: " + result);});
//idb.get("key100", function (value){
//    console.log("value returned from get is " + value);
//    console.timeEnd("firstget");
//    debugger
//});

/*

var f = function (tag, lim){
    console.time(tag);
    var t = idb.db.transaction(["feature"], "readwrite");
    t.oncomplete = function(){
        console.log("Fin");
        console.timeEnd(tag);
    };
    var os = t.objectStore("feature");
    for(i = 0; i < lim; i++){
        var r = os.add(i*2,tag+"_"+i);
        if(i%100000 == 0) {
            console.log(i);
            var fAux = function(mensaje){
                return function(){
                    console.log(mensaje);
                };
            };
            r.onsuccess = fAux("Fin Tramo " + i);
        }
    }
};
*/

/*
console.time("secondget");
idb.get("key50000", function (value){
    console.log("value returned from get is " + value);
    console.timeEnd("secondget");
});
*/

//        for (var i = 0; i < 10000; i++) {
//            this.idb.delete("key" + i);
//        }

//debugger
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