/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function AttributeManager(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('AttributeManager');
    this.dbName = 'AttributeManager';

    this._deleteDatabase();
    this._createDatabase();
};

AttributeManager.prototype = {
    _createDatabase: function () {
        var openRequest = indexedDB.open(this.dbName);
        openRequest.onerror = function (event) {
            console.log(event)
        };
        openRequest.onsuccess = function (event) {
            console.log(event)
        };

        openRequest.onupgradeneeded = function (event) {
            var db = event.target.result;

            // Create an objectStore to hold information about our customers. We're
            // going to use "ssn" as our key path because it's guaranteed to be
            // unique.
            var attributesObjectStore = db.createObjectStore("attribute", { autoIncrement: true });
            var attributeNameIdObjectStore = db.createObjectStore("attributeNameId", { autoIncrement: true });

            // Create an index to search customers by name. We may have duplicates
            // so we can't use a unique index.
            attributesObjectStore.createIndex("name", "name", { unique: false });
            attributesObjectStore.createIndex("attrId", "attrId", { unique: false });
            attributeNameIdObjectStore.createIndex("name", "name", { unique: true });
        };
    },
    _deleteDatabase: function () {
        // delete database
        var deleteRequest = indexedDB.deleteDatabase(this.dbName);
        deleteRequest.onsuccess = function (event) {
            console.log(event)
        };
        deleteRequest.onerror = function (event) {
            console.log(event)
        };
    },

    addAttribute: function (vertices, name, type, defaultValue) {
        var openRequest = indexedDB.open(this.dbName);
        openRequest.onerror = function (event) {
            console.log(event)
        };
        openRequest.onsuccess = function (event) {
            var db = openRequest.result;
            var transaction = db.transaction(["attribute", "attributeNameId"], "readwrite");
            var attributesObjectStore = transaction.objectStore("attribute");
            var attributeNameIdObjectStore = transaction.objectStore("attributeNameId");

            var addAttribute = attributeNameIdObjectStore.add({
                name: name,
                type: type
            });

            addAttribute.onsuccess = function (event) {
                var attributeKey = event.target.result;
                for (var i = 0; i < vertices.length; i++) {
                    var vertex = vertices[i];
                    attributesObjectStore.add({
                        name: vertex.name,
                        attrId: attributeKey,
                        value: defaultValue
                    });
                }
            };
        };
    },
    removeAttribute: function (name) {
        var openRequest = indexedDB.open(this.dbName);
        openRequest.onerror = function (event) {
            console.log(event);
        };
        openRequest.onsuccess = function (event) {

            var db = openRequest.result;
            var transaction = db.transaction(["attribute", "attributeNameId"], "readwrite");


            var attributesObjectStore = transaction.objectStore("attribute");
            var attributeNameIdObjectStore = transaction.objectStore("attributeNameId");


            var index = attributeNameIdObjectStore.index("name");
            index.getKey(name).onsuccess = function (event) {
                var attributeKey = event.target.result
                attributeNameIdObjectStore.delete(attributeKey);


                var attrIdIndex = attributesObjectStore.index("attrId");
                var singleKeyRange = IDBKeyRange.only(attributeKey);
                attrIdIndex.openKeyCursor(singleKeyRange).onsuccess = function (event) {
                    var cursor = event.target.result;
                    console.log(cursor)
                    if (cursor) {
                        attributesObjectStore.delete(cursor.primaryKey);
                        cursor.continue();
                    }
                };
            };

        };
    },
    getVertexAttributes: function (vertex,success) {
        var attributes = {};

        var openRequest = indexedDB.open(this.dbName);
        openRequest.onerror = function (event) {
            console.log(event);
        };
        openRequest.onsuccess = function (event) {

            var db = openRequest.result;
            var transaction = db.transaction(["attribute", "attributeNameId"]);//read

            var attributesObjectStore = transaction.objectStore("attribute");
            var attributeNameIdObjectStore = transaction.objectStore("attributeNameId");


            var index = attributesObjectStore.index("name");
            var singleKeyRange = IDBKeyRange.only(vertex.name);
            index.openCursor(singleKeyRange).onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    var attrId = event.target.result.value.attrId;
                    var value = event.target.result.value.value;
                    attributeNameIdObjectStore.get(attrId).onsuccess = function (event) {
                        var attr = event.target.result.name;
                        attributes[attr] = value;
                    };
                    cursor.continue();
                } else {
                    success(attributes);
                }

            }
        };

    }

}

