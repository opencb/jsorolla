/*
 * Copyright 2015 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by imedina on 21/03/16.
 */

class IndexedDBCache {

    constructor(database) {
        this.database = database || "example_cache";
        this.status = "close";
        this.request = null;
        this.db = null;
    }

    open(os, callback) {
        var database = this.database;
        this.status = "opening";
        var _this = this;

        // var dbOpenRequest = indexedDB.open(database, 2);
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        var request = indexedDB.open(database, 11);
        var db;
        request.onsuccess = function (event) {
            this.status = "open";
            console.log(database + " is " + _this.status);
            db = request.result;

            db.onversionchange = function (e) {
                // if (db) {
                //     db.close();
                //     // dbConnection.closed = true;
                //     db  = undefined;
                // }
                console.log(os)
                db.createObjectStore(os);
            };

            console.log(db)
            callback(db);
        };

        request.onupgradeneeded = function (event) {
            console.log("onupgrade");
            // console.log(event)
            db = request.result;
            // var objectStore = data.createObjectStore(objectStoreName);
            if (!db.objectStoreNames.contains(os)) {
                db.createObjectStore(os);
            }
        };

        request.onerror = function (event) {
            // console.log(event)
            console.log("DB Open Request Error in " + database);
        };
        this.request = request;
    }

    close() {

    }

    clear(os) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readwrite");
            let objectStore = transaction.objectStore(os);
            objectStore.clear(os);
        });
    }

    count(os, callback) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readonly");
            let objectStore = transaction.objectStore(os);
            var request = objectStore.count();
            request.onsuccess = function (event) {
                callback(event.target.result);
            }
        });
    }

    delete(os, key) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readwrite");
            let objectStore = transaction.objectStore(os);
            objectStore.delete(key);
        });
    }

    deleteDatabase() {
        var _this = this;
        try {
            var dbDeleteRequest = window.indexedDB.deleteDatabase(this.database);
            dbDeleteRequest.onsuccess = function (e) {
                console.log("Database " + _this.database + " successfully deleted");
            };
            dbDeleteRequest.onupgradeneeded = function (e) {
                var db = dbOpenRequest.result;
                console.log("Deleting Database upgrade needed");
            };
            dbDeleteRequest.onerror = function (e) {
                console.log("Error deleting DB" + _this.database);
                console.log(e);
            };
            dbDeleteRequest.onblocked = function (e) {
                console.log("Deleting DB Blocked. Try closing the database " + _this.database + " and then deleting it");
            };
        } catch (e) {
            console.log(e);
        }
    }

    get(os, key, callback) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readonly");
            let objectStore = transaction.objectStore(os);
            var request = objectStore.get(key);
            request.onsuccess = function (event) {
                callback(event.target.result);
            }
        });
    };

    getAll(os, keyArray, callback) {
        let _this = this;
        let results = new Array(keyArray.length);
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readonly");
            transaction.oncomplete = function (event) {
                console.log("Transaction has completed with: '" + event.type + "'");
                db.close();
                db.close = true;
                callback(results);
            };
            let objectStore = transaction.objectStore(os);
            for (let i = 0; i < keyArray.length; i++) {
                let request = objectStore.get(keyArray[i]);
                request.onsuccess = function (iteration) {
                    return function (event) {
                        results[iteration] = event.target.result;
                    };
                } (i);
            }
        });
    }

    /**
     * Calls the callback with the value of each key. The callback is called keyArray.length times.
     * @param callback (value, key, i) Receives as parameters the value, its key, and the position of the key in the keyArray.
     * @param whenCompletedCallback Optional. Receives no arguments. it is called when all callbacks have finished.
     */
    foreach(os, keyArray, callback, whenCompletedCallback) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readonly");
            transaction.oncomplete = function (event) {
                console.log("Transaction has completed with: '" + event.type + "'");
                db.close();
                db.close = true;
                if (typeof whenCompletedCallback != "undefined") {
                    whenCompletedCallback();
                }
            };
            let objectStore = transaction.objectStore(os);
            for (let i = 0; i < keyArray.length; i++) {
                let request = objectStore.get(keyArray[i]);
                request.onsuccess = function (iteration) {
                    return function (event) {
                        callback(event.target.result, keyArray[iteration], iteration);
                    };
                } (i); // to force the closure to have each value of i, and not just the last one
            }
        });
    }

    add(os, key, value) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readwrite");
            let objectStore = transaction.objectStore(os);
            objectStore.add(value, key);
        });
    }

    put(os, key, value) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readwrite", "Put: ");
            let objectStore = transaction.objectStore(os);
            objectStore.put(value, key);
        });
    }

    putAll(os, keyArray, valueArray) {
        var _this = this;
        this.open(os, function (db) {
            let transaction = _this._createTransaction(db, os, "readwrite");
            let objectStore = transaction.objectStore(os);
            for (let i = 0; i < keyArray.length; i++) {
                objectStore.put(valueArray[i], keyArray[i]);
            }
        });
    }



    _createTransaction(db, os, mode, prefix = "") {
        if (typeof os == "string") {
            os = os.split(",");
        }

        let transaction = db.transaction(os, mode);
        transaction.oncomplete = function(event) {
            console.log(prefix + "Transaction has completed with: '" + event.type + "'");
            db.close();
            db.close = true;
        };

        transaction.onerror = function(event) {
            console.log(prefix + "There was an error in the transaction: " + event.target.error.message);
            console.log(event);
        };
        return transaction;
    }

    // _error(event) {
    //     console.log("There was an error in the transaction: " + event.target.error.message);
    //     console.log(event);
    // }

    _checkParams(obj) {

    }
}