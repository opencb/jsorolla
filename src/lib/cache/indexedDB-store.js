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
    this.profile = false;
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
                console.log("IndexedDB " + _this.cacheId + ", " + objectStoreName + " clear success!");
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
                callback(result);
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
        if (_this.profile || _this.debug) {
            timeId = "IndexedDBStore.getAll " + objectStoreName + ", with " + keyArray.length + " keys.";
            console.time(timeId);
        }
        if (!(keyArray instanceof Array) || !callback) {
            console.error("Bad use of IndexedDBStore: getAll must receive an ObjectStoreName, an Array of keys and a callback function.");
            return;
        }
        var results = new Array(keyArray.length);

        _this._getConnection(objectStoreName, function (dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readonly");
            transaction.oncomplete = function(event) {
                if (_this.profile || _this.debug) {
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
     * @param callback (value, key, i) Receives as parameters the value, its key, and the position of the key in the keyArray.
     * @param whenCompletedCallback Optional. Receives no arguments. it is called when all callbacks have finished.
     */
    foreach: function(objectStoreName, keyArray, callback, whenCompletedCallback) {
        if (!(keyArray instanceof Array) || !callback) {
            console.error("Bad use of IndexedDBStore: foreach must receive an ObjectStoreName, an Array of keys and a callback function.");
            return;
        }
        var _this = this;
        var timeId;
        if (_this.profile || _this.debug) {
            timeId = "IndexedDBStore.getAll " + objectStoreName + ", with " + keyArray.length + " keys.";
            console.time(timeId);
        }

        _this._getConnection(objectStoreName, function (dbConnection) {
            var transaction = dbConnection.transaction([objectStoreName], "readonly");
            transaction.oncomplete = function(event) {
                dbConnection.close();
                if (_this.profile || _this.debug) {
                    console.timeEnd(timeId);
                }
                if (whenCompletedCallback) {
                    whenCompletedCallback();
                }
            };
            transaction.onerror = function (event) {
                console.log("There was an error in the transaction foreach (" + keyArray + ")");
                console.log(event);
            };

            var objectStore = transaction.objectStore(objectStoreName);

            for (var i = 0; i < keyArray.length; i++) {
                var request = objectStore.get(keyArray[i]);

                request.onsuccess = function (iteration) {
                    return function (event) {
                        callback(event.target.result, keyArray[iteration], iteration);
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
        if (_this.profile || _this.debug) {
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
                if (_this.profile || _this.debug) {
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
