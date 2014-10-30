/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/8/13
 * Time: 12:42 AM
 *
 * This API is asynchronous. When a return value is expected, you must provide a callback function.
 *
 * This class works this way:
 *
 * before executing any request ( get, put, ...),
 * make sure the DataBase connection is alive (this.db) // TODO not yet
 * if the connection is dead: reconnect.
 * make the request to indexedDB.
 */


var iDBInstances = [];
var iDBVersion = 1;
function IndexedDBStore(args) {
    var _this = this;
    this.debug = false;
//debugger
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.lru = [];

    this.cacheId = "DataBase";
//    this.objectStore = "ObjectStore";
    this.opening = false;
    this.timeout = 30;  // time to wait if the DB connection is being already opened
    // Now we set the args parameters
    // must be the last instruction in order to overwrite default attributes
    _.extend(this, args);

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
//    this.db = null;
    this.version = iDBVersion;

    if (!this.cacheId) {
        console.log("IndexedDBStore: not supplied cacheId to constructor. Using default DataBase...");
    }

    iDBInstances.push(this);
//        if (!window.indexedDB) {
//            window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
//        }
    /*
     this._getConnection(function (db) {
     console.log("obtained initial IndexedDB connection for " + _this.cacheId);
     console.log(db);
     });
     */
}

IndexedDBStore.prototype = {
    _getConnection: function (objectStoreName, callback, version) {
        var _this = this;
        if (_this.debug) {
            console.log(_this.cacheId + " opening? " + _this.opening);
            if (objectStoreName == undefined) {
                console.log("WARNING: requested to create objectStore 'undefined'");
                debugger
            }
//        debugger
        }
        if (_this.opening == true) {
            if (_this.debug) {
                console.log("Database " + _this.cacheId + " is already opening. To avoid block: waiting...");
            }
            setTimeout(_this._getConnection.bind(_this), _this.timeout * (1 + Math.random()*0.25), objectStoreName, callback, version);
            /*} else if (dbConnection && !dbConnection.closed && dbConnection.objectStoreNames.contains(objectStoreName)) { // recycle connections
             if (_this.debug) {
             console.log("Database already opened:", dbConnection);
             }
             callback(dbConnection);*/
        } else {
            try {
                if (_this.debug) {
                    console.log("trying opening Database:" + _this.cacheId);
                }
                var dbOpenRequest;
                _this.opening = true;
                if (_this.debug) {
                    console.log("lock:"+_this.cacheId + ", " + objectStoreName + " opening = "+ _this.opening + " version: " + version);
                }
                if (!_.isUndefined(version)) {
                    dbOpenRequest = window.indexedDB.open(_this.cacheId, version); // second parameter is the version. increase to modify tables.
                } else {
                    dbOpenRequest = window.indexedDB.open(_this.cacheId);
                }
                dbOpenRequest.onsuccess = function (event) {
                    _this.opening = false;
                    if (_this.debug) {
                        console.log("unlock:" + _this.cacheId + ", " + objectStoreName + " opening = " + _this.opening);
                    }
//                    if (dbConnection) {
//                        console.log("overwriting DB", dbConnection, " with", event.target.result);
//                        debugger;
//                        dbConnection.close();
//                        dbConnection.closed = true;
//                        dbConnection = undefined;
//                    }
                    var dbConnection = event.target.result;

                    dbConnection.onversionchange = function (e) {
                        if (_this.debug) {
                            console.log("Version change triggered, so closing database connection " + _this.cacheId + ", " + objectStoreName + " (old version, new version, db, event)", e.oldVersion, e.newVersion, dbConnection, e);
                        }
                        if (dbConnection) {
                            dbConnection.close();
                            dbConnection.closed = true;
                            dbConnection = undefined;
                        }
                    };

                    if (objectStoreName != "" && !dbConnection.objectStoreNames.contains(objectStoreName)) {
                        iDBVersion = Math.max(iDBVersion, dbConnection.version) + 1;
                        dbConnection.close();
                        dbConnection.closed = true;
                        dbConnection = undefined;
                        _this.version = iDBVersion;
                        if (_this.debug) {
                            console.log("needed ObjectStore " + objectStoreName + " in " + _this.cacheId + " creating version " + iDBVersion);
                        }
                        _this._getConnection(objectStoreName, callback, _this.version);
                    } else {
                        if (_this.debug) {
                            console.log("connection obtained for " + _this.cacheId + " and " + objectStoreName, dbConnection);
                        }
                        callback(dbConnection);
                    }
                };
                dbOpenRequest.onupgradeneeded = function (e) {
                    if (_this.debug) {
                        console.log("Database upgrade needed in " + _this.cacheId + ", " + objectStoreName);
                    }
                    dbConnection = e.target.result;

                    if (!dbConnection.objectStoreNames.contains(objectStoreName)) {
                        if (_this.debug) {
                            console.log("creating " + objectStoreName + " in Database " + _this.cacheId );
                        }
                        var objectStore = dbConnection.createObjectStore(objectStoreName);
                    }
                };
                dbOpenRequest.onerror = function (e) {
                    console.log("DB Open Request Error in " + _this.cacheId + ", " + objectStoreName);
                    console.log(e);
                };
                dbOpenRequest.onblocked = function (e) {
                    console.log("DB Open Request Blocked in " + _this.cacheId + ", " + objectStoreName, e);
//                    if (dbConnection) {
//                        dbConnection.close();
//                    }
                    _this._getConnection(objectStoreName, callback)
                };
            } catch (e) {
                console.log("catch error:");
                console.error(e);
            }
        }
    },

    clear: function (objectStoreName) {
//        this.db.deleteObjectStore(this.cacheId);

        var _this = this;
        _this._getConnection(objectStoreName, function(dbConnection){
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");
            transaction.oncomplete = function(event) {
                console.log("IndexedDB clear success!");
            };
            var objectStore = transaction.objectStore(objectStoreName);
            var req = objectStore.clear();
            req.onerror = function (evt) {
                console.log("IndexedDB Error trying to clear the object store " + objectStoreName + " in " + _this.cacheId);
            }
        });
    },

    count: function (objectStoreName, callback) {
        var _this = this;
        _this._getConnection(objectStoreName, function(dbConnection){
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");
            var objectStore = transaction.objectStore(objectStoreName);
            var req = objectStore.count();
            req.onerror = function (evt) {
                console.log("IndexedDB Error trying to count the object store " + objectStoreName + " in " + _this.cacheId);
            };
            req.onsuccess = function (event) {
                callback(event.target.result);
            }
        });
    },

    getObjectStoreNames: function (callback) {
        var _this = this;
        _this._getConnection("", function(dbConnection){
            callback(dbConnection.objectStoreNames);
        });
    },

    close: function () {
        var _this = this;
        _this._getConnection(objectStoreName, function(dbConnection){
            dbConnection.close();
            console.log("Database " + _this.cacheId + " closed");
            dbConnection.closed=true;
            dbConnection = undefined;
        });
    },

    destroyDB: function() {
        var _this = this;
        try {
            var dbDeleteRequest = window.indexedDB.deleteDatabase(_this.cacheId);
            dbDeleteRequest.onsuccess = function (e) {
                console.log("Database " + _this.cacheId + " successfully deleted");
            };
            dbDeleteRequest.onupgradeneeded = function (e) {
                var db = dbOpenRequest.result;
                console.log("Deleting Database upgrade needed");
                /* Code for ${db.upgrade} */
            };
            dbDeleteRequest.onerror = function (e) {
                console.log("Error deleting DB" + _this.cacheId);
                console.log(e);
            };
            dbDeleteRequest.onblocked = function (e) {
                console.log("Deleting DB Blocked. Try closing the database " + _this.cacheId + " and then deleting it");
            };
        } catch (e) {
            console.log(e);
        }

    },

    destroyDBs: function() {
        for (var i = 0; i < iDBInstances.length; i++){
            iDBInstances[i].close();
            iDBInstances[i].destroyDB();
        }
    },


    get: function(objectStoreName, key, callback) {
        var timeId;
        var _this = this;
        if (_this.debug) {
            timeId = "IndexedDBStore.get " + objectStoreName + key;
            console.time(timeId);
        }
        var result = null;
        _this._getConnection(objectStoreName, function (dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readonly");
            transaction.oncomplete = function(event) {
                if (_this.debug) {
                    console.timeEnd(timeId);
                }
                dbConnection.close();
                callback(event.target.result);
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction get (" + key + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);
            var request = objectStore.get(key);
            request.onsuccess = function (event) {
                result = event.target.result;
            };
        });
    },


    /**
     * Calls the callback ONCE. As a parameter there is an Array with all the values.
     * @param keyArray
     * @param callback (valuesArray) The order is the same as in the keyArray.
     */
    getAll: function(objectStoreName, keyArray, callback) {
        var _this = this;
        var timeId;
        if (_this.debug) {
            timeId = "IndexedDBStore.getAll " + objectStoreName + ", with " + keyArray.length + " keys.";
            console.time(timeId);
        }
        if (!(keyArray instanceof Array) || !callback) {
            console.error("Bad use of IndexedDBStore: getAll must receive an Array of keys and a callback function.");
            return;
        }
        var results = new Array(keyArray.length);

        _this._getConnection(objectStoreName, function (dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readonly");
            transaction.oncomplete = function(event) {
                if (_this.debug) {
                    console.timeEnd(timeId);
                }
                dbConnection.close();
                callback(results);
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction get (" + keyArray + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);

            for (var i = 0; i < keyArray.length; i++) {
                var request = objectStore.get(keyArray[i]);

                request.onsuccess = function (iteration) {
                    return function (event) {
                        results[iteration] = event.target.result;
                    };
                } (i);     // to force the closure to have each value of i, and not just the last one
            }
        });
    },

    /**
     * Calls the callback with the value of each key. The callback is called keyArray.length times.
     * @param callback (value, key) Receives as parameters the value and its key.
     */
    foreach: function(objectStoreName, keyArray, callback) {
        if (!(keyArray instanceof Array) || !callback) {
            console.error("Bad use of IndexedDBStore: getCollection must receive an Array of keys and a callback function.");
            return;
        }
        var _this = this;

        _this._getConnection(objectStoreName, function (dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readonly");
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction foreach (" + keyArray + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);

            for (var i = 0; i < keyArray.length; i++) {
                var request = objectStore.get(keyArray[i]);

                request.onsuccess = function (iteration) {
                    return function (event) {
                        callback(event.target.result, keyArray[iteration]);
                    };
                } (i);     // to force the closure to have each value of i, and not just the last one
            }
        });
    },

    add: function(objectStoreName, key, value) {
        var _this = this;

        _this._getConnection(objectStoreName, function(dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");

            transaction.onerror = function (event) {
                console.log("There was an error in the transaction add (" + key + ", " + value + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);
            var request = objectStore.add(value, key);    // as the key is optional depending on the database scheme, it is the 2nd parameter
        });
    },

    put: function(objectStoreName, key, value) {
        var _this = this;
        var timeId;
        if (_this.debug) {
            timeId = "IndexedDBStore.put " + objectStoreName + key;
            console.time(timeId);
        }

        _this._getConnection(objectStoreName, function(dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");
            transaction.oncomplete = function(event) {
                if (_this.debug) {
                    console.timeEnd(timeId);
                }
                dbConnection.close();
                dbConnection.close = true;
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction put(" + key + ", ", value, ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);
            var request = objectStore.put(value, key);    // as the key is optional depending on the database scheme, it is the 2nd parameter
        });
    },

    putAll: function(objectStoreName, keyArray, valueArray) {
        var _this = this;
        var timeId;
        if (_this.debug) {
            timeId = "IndexedDBStore.putAll " + objectStoreName + ", with " + keyArray.length;
            console.time(timeId);
        }

        if (!(keyArray instanceof Array) || !(valueArray instanceof Array) || (keyArray.length != valueArray.length)) {
            console.error("Bad use of IndexedDBStore: putAll must receive two Arrays of the same length.");
            return;
        }

        _this._getConnection(objectStoreName, function(dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");
            transaction.oncomplete = function(event) {
                if (_this.debug) {
                    console.timeEnd(timeId);
                }
                dbConnection.close();
                dbConnection.close = true;
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction put(" + key + ", ", value, ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);

            for (var i = 0; i < keyArray.length; i++) {
                objectStore.put(valueArray[i], keyArray[i]);    // as the key is optional depending on the database scheme, it is the 2nd parameter
            }
        });
    },


    delete: function(objectStoreName, key) {
        var _this = this;

        _this._getConnection(objectStoreName, function(dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readwrite");
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction delete (" + key + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);
            var request = objectStore.delete(key);    // as the key is optional depending on the database scheme, it is the 2nd parameter

        });
    }
};

IndexedDBTest = function () {
    var idb = new IndexedDBStore({cacheId: "test"});
    idb.put("os-a", "key-a", "value-a");
    idb.put("os-b", "key-b", "value-b");
};

IndexedDBTest();
//debugger

/*

 console.log("in test");
 var idb = new IndexedDBStore({cacheId: "test"});


 var test = function(dbName, version){
 or1 = window.indexedDB.open(dbName, version);
 or1.onsuccess = function(e){
 var db = e.target.result;
 console.log("or1.onsuccess");
 console.log("Close " + db.version);
 console.log("Opening " + (version+1));
 db.close();
 or3 = window.indexedDB.open(dbName, version+1);
 or3.onsuccess = function(e){console.log("or3.onsuccess " + e.target.result.version)}
 or3.onerror = function(){console.log("or3.onerror")}
 or3.onupgradeneeded = function(){console.log("or3.onupgradeneeded")}
 or3.onblocked = function(){
 console.log("or3.onblocked");
 console.log(e);
 console.log("Try again! Opening " + (version+1));
 or4 = window.indexedDB.open(dbName, version+1);
 or4.onsuccess =         function(e){console.log("or4.onsuccess " + e.target.result.version)}
 or4.onerror =           function(e){console.log("or4.onerror")}
 or4.onupgradeneeded =   function(e){console.log("or4.onupgradeneeded")}
 or4.onblocked =         function(e){console.log("or4.onblocked")}
 }
 }
 or1.onerror = function(){console.log("or1.onerror")}
 or1.onupgradeneeded = function(){console.log("or1.onupgradeneeded")}
 or1.onblocked = function(){console.log("or1.onblocked")}

 or2 = window.indexedDB.open(dbName, version);
 or2.onsuccess =         function(e){console.log("or2.onsuccess " + e.target.result.version);console.log(e);}
 or2.onerror =           function(e){console.log("or2.onerror")}
 or2.onupgradeneeded =   function(e){console.log("or2.onupgradeneeded")}
 or2.onblocked =         function(e){console.log("or2.onblocked")}
 };


 */
//debugger
/*
 idb.init("feature");
 idb.clear();
 ///*


 console.time("creation");
 var n = 1000;
 var keyArray = new Array(n);
 var valueArray = new Array(n);
 for (var i = 0; i < n; i++) {
 keyArray[i] = "key" + i;
 valueArray[i] = "value" + i;
 }
 console.timeEnd("creation");
 console.time("put");
 idb.putAll(keyArray, valueArray);
 // */

/*
 idb2 = new IndexedDBStore();
 idb2.init("feature");
 idb2.count(function(times){
 console.log("numero de lineas rescatadas: " + times);
 })
 */
//console.time("creation");

/*
 console.time("firstget");
 for (var i = 0; i < n; i++) {
 idb.put("key" + i, "value" + i);
 }
 // */

//        this.idb.add("key00", "value00");
//        this.idb.add("key01", "value01");
//    debugger


/*
 idb.count(function(result) {
 console.timeEnd("put");
 console.log("number of rows: " + result);
 });

 console.time("firstget");
 idb.get("key100", function (value){
 console.log("value returned from get is " + value);
 console.timeEnd("firstget");
 //    debugger
 });

 console.time("getcol");
 idb.getCollection(["key10", "key70", "key800", "key5"], function (value){
 console.log("value returned from get is " + value);
 console.log(value);
 console.timeEnd("getcol");
 //    debugger
 });
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




/* featurechunk cache test
 var fcc = new FeatureChunkCache();
 fcc.chunkSize = 10;
 fcc.store = new IndexedDBStore();
 var idb = fcc.store;

 idb.init("chunks");
 idb.clear();

 console.time("creation");
 var n = 10;
 var keyArray = new Array(n);
 var valueArray = new Array(n);
 for (var i = 0; i < n; i++) {
 keyArray[i] = fcc.getChunkKey("1", i);
 valueArray[i] = "value" + i;
 }
 console.log("key for chunk");
 console.log(fcc.getChunkKey("1", fcc.getChunkId(15)));
 console.timeEnd("creation");
 idb.putAll(keyArray, valueArray);

 console.time("firstget");
 idb.get(fcc.getChunkKey("1", fcc.getChunkId(25)), function (value){
 console.log("value returned from get is " + value);
 console.timeEnd("firstget");
 //    debugger
 });

 fcc.getChunk(fcc.getChunkKey("1", fcc.getChunkId(15)), function (value){
 console.log("value getchunk: " + value);
 });

 idb.delete(fcc.getChunkKey("1", fcc.getChunkId(65)));
 idb.delete(fcc.getChunkKey("1", fcc.getChunkId(59)));
 fcc.getAdjustedRegions(
 new Region({start: 45, end: 135, chromosome: "1"})
 , function(results){
 console.log("getAdjustedRegions");
 console.log(results);
 }
 );
 fcc.getCachedByRegion(
 new Region({start: 45, end: 135, chromosome: "1"})
 , function(results){
 console.log("getcachedbyRegions");
 console.log(results);
 }
 );

 fcc.getByRegions([
 new Region({start: 45, end: 48, chromosome: "1"})
 , new Region({start: 80, end: 85, chromosome: "1"})]
 , function(results){
 console.log("getbyRegions");
 console.log(results);
 }
 );

 fcc.getByRegion(new Region({start: 15, end: 120, chromosome:"1"}),function(chunks){
 console.log("getByRegion");
 console.log(chunks);
 });
 // */



