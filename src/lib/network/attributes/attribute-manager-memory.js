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

function AttributeManagerMemory(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.items = [];
    this.itemsIndex = {};
    this.numberOfItems = 0;

    this.attributes = [];

//    this.filters = {};

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

//    this._processAttribute({name: "Selected", type: "boolean", defaultValue: false});
    for (var i = 0; i < this.attributes.length; i++) {
        this._processAttribute(this.attributes[i]);
    }
};

AttributeManagerMemory.prototype = {
    containsAttribute: function (attribute) {
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name == attribute.name) return true; //if exists one with the same name
        }
        return false;
    },
    isAttributeLocked: function (attributeName) {
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name == attributeName && this.attributes[i].locked === true) {
                return true;
            }
        }
        return false;
    },
    addAttribute: function (attribute, fireChangeEvent) {
        if (this.containsAttribute(attribute)) {
            return false;
        }
        this.attributes.push(attribute);
        this._processAttribute(attribute);
        if (fireChangeEvent !== false) {
            console.log('addAttribute - change:attributes');
            this.trigger('change:attributes', {sender: this});
        }
        return true;
    },
    _processAttribute: function (attribute) {
    },
    addAttributes: function (attributes) {
        for (var i = 0; i < attributes.length; i++) {
            this.addAttribute(attributes[i], false);
        }
        console.log('addAttributes - change:attributes');
        this.trigger('change:attributes', {sender: this});
    },
    removeAttribute: function (attributeName) {
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name === attributeName &&
                this.attributes[i].locked !== true &&
                this.attributes[i].name !== 'Selected') {
                this.attributes.splice(i, 1);

                console.log('removeAttribute - change:attributes');
                this.trigger('change:attributes', {sender: this});
                return true;
            }
        }
        return false;
    },
    updateAttribute: function () {
        console.log('TODO');
    },
    getAttribute: function (attributeName) {
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name == attributeName) {
                return this.attributes[i];
            }
        }
    },
    getAttributeNames: function () {
        var nameList = [];
        for (var i = 0; i < this.attributes.length; i++) {
            nameList.push(this.attributes[i].name);
        }
        return nameList;
    },
    // END attribute methods


    setRecordAttributeById: function (id, attributeName, value) {
        if (this.isAttributeLocked(attributeName)) {
            return false;
        }
        var item = this.items[this.itemsIndex[id]];
        if (item) {
            item[attributeName] = value;
        }
    },
    setRecordAttributeByIds: function (records) {
//        console.time('AttributeManagerMemory.setRecordAttributeByIds');
        for (var i = 0; i < records.length; i++) {
            var recordObject = records[i];
            if (!this.isAttributeLocked(recordObject.attributeName)) {
                var item = this.items[this.itemsIndex[id]];
                if (item) {
                    for (var attributeName in recordObject) {
                        if (!this.isAttributeLocked(attributeName)) {
                            item[attributeName] = recordObject[attributeName];
                        }
                    }
                }
            }
        }
    },
    setRecordsAttribute: function (records, attributeName, value) {
        if (this.isAttributeLocked(attributeName)) {
            return false;
        }
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record[attributeName] = value;
        }
    },
//    addRecord: function (data, append) {
//        this.store.loadData(data, append);
//    },

    containsItem: function (item) {
        return this.containsItemById(item.id);
    },
    containsItemById: function (id) {
        if (typeof this.itemsIndex[id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    addRecord: function (item) {
        if (this.containsItem(item)) {
            return false;
        }
        var insertPosition = this.items.push(item) - 1;
        this.itemsIndex[item.id] = insertPosition;

        this.numberOfItems++;
    },
    removeRecordById: function (id) {
        if (!this.containsItemById(id)) {
            return false;
        }
        var position = this.itemsIndex[id];
        delete this.itemsIndex[id];
        delete this.items[position];
    },
    getValueByAttributeAndId: function (id, attribute) {
        var item = this.items[this.itemsIndex[id]];
        if (item) {
            return item[attribute];
        }
    },
    getOrderedIdsByAttribute: function (attributeName) {
        var values = [];

        var type = 'float';
        var checkType = true;

        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item) {
                var id = item['id'];
                var value = item[attributeName];
                if (!value) {
                    value = '';
                }
                /* detect number or string */
                if (checkType) {
                    var parseResult = parseFloat(value);
                    if (isNaN(parseResult)) {
                        type = 'string';
                        checkType = false;
                    }
                }
                values.push({id: id, value: value});
            }
        }
        switch (type) {
            case 'float':
                values.sort(function (a, b) {
                    return a.value - b.value;
                });
                break;
            /* string */
            default:
                values.sort(function (a, b) {
                    return a.value.localeCompare(b.value);
                });
        }
        return values;
    },
    getIdsByAttributeValue: function (attribute, value) {
        var dupHash = {};
        var ids = [];
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item && item[attribute] === value) {
                var id = item['id'];
                if (dupHash[id] !== true) {
                    ids.push(id);
                    dupHash[id] = true;
                }
            }
        }
        return ids;
    },
    eachRecord: function (eachFunction) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if(items){
                eachFunction(item);
            }
        }
    },
    getRecords: function () {
        return this.items;
    },
    getValuesByAttribute: function (attributeName) {
        var values = [];
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var value = item[attributeName];
            var id = item['id'];
            if (value && value !== '') {
                values.push({value: value, id: id});
            }
        }
        return values;
    },
    getSelectedValuesByAttribute: function (attributeName) {
//        var records = this.store.query().items;
//        var values = [];
//        for (var i = 0; i < records.length; i++) {
//            var record = records[i];
//            var value = record.get(attributeName);
//            var id = record.get('id');
//            var selected = record.get('Selected');
//            if (selected === true && value != null && value !== '') {
//                values.push({value: value, id: id})
//            }
//        }
//        return values;
    },
//    getRecordsByItem: function (items) {
//        var records = [];
//        for (var i = 0; i < items.length; i++) {
//            var item = items[i];
//            var record = this.store.findRecord('id', item.id);
//            records.push(record);
//        }
//        return records;
//    },
    selectByItems: function (items) {
//        for (var i = 0; i < items.length; i++) {
//            var item = items[i];
//            var record = this.store.getById(item.id);
//            if (record) {
//                record.set('Selected', true);
////                record.commit();
//            }
//        }
    },
    deselectByItems: function (items) {
//        for (var i = 0; i < items.length; i++) {
//            var item = items[i];
//            var record = this.store.getById(item.id);
//            if (record) {
//                record.set('Selected', false);
////                record.commit();
//            }
//        }
    },
    selectAll: function () {
//        var records = this.store.query().items;
//        for (var i = 0; i < records.length; i++) {
//            var record = records[i];
//            record.set('Selected', true);
////            record.commit();
//        }
    },
    deselectAll: function () {
//        var records = this.store.query().items;
//        for (var i = 0; i < records.length; i++) {
//            var record = records[i];
//            record.set('Selected', false);
////            record.commit();
//        }
    },
    clean: function () {
//        this.attributes = [];
//        this.columnsGrid = [];
//        this.attributes = [];
//        this.filters = {};
//
////        this.store.removeAll();
////        this._processAttribute({name: "Selected", type: "boolean", defaultValue: false});
////        this.store.setFields(this.attributes);
//
//        console.log('clean - change:attributes');
//        this.trigger('change:attributes', {sender: this});
    },
    getAsFile: function (separator) {
        if (typeof separator === 'undefined') {
            separator = '\t';
        }
        // Attribute names
        var text = '';

        text += '#';
        for (var i = 0; i < this.attributes.length; i++) {
            var attrName = this.attributes[i].name;
            if (attrName !== 'Selected') {
                text += attrName;
            }
            if ((i + 1) >= this.attributes.length) {
                break;
            }
            text += separator;
        }
        text += '\n';

        var records = this.store.query().items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            for (var j = 0; j < this.attributes.length; j++) {
                var attrName = this.attributes[j].name;
                if (attrName !== 'Selected') {
                    text += record.get(attrName);
                }
                if ((j + 1) >= this.attributes.length) {
                    break;
                }
                text += separator;
            }
            text += '\n';
        }
        return text;
    },
    //save
    toJSON: function () {
        var json = {};
        json.attributes = this.attributes;
        json.filters = this.filters;
        json.data = [];

        // add row values to data matrix
        var records = this.store.query().items;
        for (var j = 0; j < records.length; j++) {
            json.data.push([]);
            for (var i = 0; i < this.attributes.length; i++) {
                json.data[j].push(records[j].getData()[this.attributes[i].name]);
            }
        }
        return json;
    },
    loadJSON: function () {

    }
}

// TODO CHECK
AttributeManagerMemory.prototype.updateAttribute = function (oldName, newName, type, defaultValue) {
    for (var i = 0; i < this.attributes.length; i++) {
        if (oldName != newName && this.attributes[i].name == newName) return false;
    }

    for (var i = 0; i < this.attributes.length; i++) {
        if (this.attributes[i].name == oldName) {
            if (oldName != newName) {
                this.columnsGrid[i].text = newName;
                this.columnsGrid[i].dataIndex = newName;
                this.attributes[i].name = newName;
            }
            this.attributes[i].type = type;
            this.attributes[i].defaultValue = defaultValue;

            this.store.setFields(this.attributes);

            return true;
        }
    }
    return false;
};


//-------------------------------modifyAttributeOfRows---------------------------//
//Descripcion:
//Modifica un atributo del conjunto de filas seleccionadas, poniendole el mismo 
//valor en todas. 
//Parametros: 
//selectRows: (array de objetos) informacion de las filas seleccionadas
//attributeModify: (string) atributo que se desea modificar
//value: (string) valor nuevo de ese atributo
//-------------------------------------------------------------------------------//


//-----------------------removeRow----------------------------------------------//
//Descripcion:
//Borra una fila identificada a partir del valor de un campo
//Parametros:
//attribute: (string) campo en el que buscar
//value: (string) nombre del campo que buscar
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.removeRow = function (attribute, value) {
    //obtenemos la posicion del dato y lo borramos
    this.store.removeAt(this.store.find(attribute, value));
};


//-----------------------removeRows----------------------------------------------//
//Descripcion:
//Borra todas las filas que tengan el valor indicado en el atributo indicado
//Parametros:
//attribute: (string) campo en el que buscar
//value: (string) nombre del campo que buscar
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.removeRows = function (attribute, value) {
    //obtenemos la posicion del dato y lo borramos
    this.store.removeAt(this.store.find(attribute, value));

    var i = -1;

    while (this.store.find(attribute, value) != -1) {
        //cada vez busca a partir de donde se quedó la ultima vez
        i = this.store.find(attribute, value, i + 1);
        this.store.removeAt(i);

        console.log(i);
    }
};

/**
 * Remove all stored attributes.
 */
AttributeManagerMemory.prototype.removeAll = function () {
    this.store.removeAll(true);
};


//-----------------------getNumberOfRows----------------------------------------//
//Descripcion:
//Cuenta cuantos datos tenemos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.getNumberOfRows = function () {
    return this.store.count();
};


//-----------------------getUniqueByAttribute-----------------------------//
//Descripcion:
//Devuelve los diferentes datos que hay en un atributo
//Parametros:
//attribute: (string) nombre del atributo 
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.getUniqueByAttribute = function (attribute) {
    return this.store.collect(attribute, false, true);
};


//-----------------------getPositionOfRow---------------------------------------//
//Descripcion:
//Devuelve la posicion de un dato identificado un atributo y su valor
//Parametros:
//attribute: (string) atributo por la que queremos buscar
//value: (string) valor del atributo por la que queremos buscar
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.getPositionOfRow = function (attribute, value) {
    var aux = this.store.find(attribute, value);
    return(aux);
};


//-----------------------getRowByIndex------------------------------------------//
//Descripcion:
//Muestra el dato que se encuentran en el indice indicado
//Parametros:
//index:(number) index del dato del que queremos obtener informacion
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.getRowByIndex = function (index) {
    var aux = this.store.getAt(index);
    console.log(aux.data);
};


//-----------------------getRowRangeIndex---------------------------------------//
//Descripcion:
//Muestra los datos que se encuentran entre los dos indices que le pasamos
//Parametros:
//startIndex: (number) index por el cual empezamos
//endIndex: (number) index por el cual acabamos
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.getRowRangeIndex = function (startIndex, endIndex) {
    var aux = this.store.getRange(startIndex, endIndex);

    for (var i = 0; i < aux.length; i++) {
        console.log(aux[i].data);
    }
};


AttributeManagerMemory.prototype.addFilter = function (filterName, attribute, value) {
    if (!this.filters[filterName] && attribute != null && value != null) {
        this.filters[filterName] = {"active": false, "attribute": attribute, "value": value};
        this.enableFilter(filterName);
        return true;
    }
    return false;
};

AttributeManagerMemory.prototype.removeFilter = function (filterName) {
    if (this.filters[filterName]) {
        this.disableFilter(filterName);
        delete this.filters[filterName];
        return true;
    }
    return false;
};

AttributeManagerMemory.prototype.enableFilter = function (filterName) {
    this.filters[filterName].active = true;

    //this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //filter for exactly match
    var reg = new RegExp("" + this.filters[filterName].value);
    this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filterName].attribute, value: reg, root: 'data'}));
};

AttributeManagerMemory.prototype.disableFilter = function (filterName) {
    this.filters[filterName].active = false;

    this.store.clearFilter(false);
    for (var filter in this.filters) {
        if (this.filters[filter].active) {
            //this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //para filtrar cuando este escrito el nombre entero bien
            var reg = new RegExp("" + this.filters[filter].value);
            this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filter].attribute, value: reg, root: 'data'}));
        }
    }
};

//-----------------------checkFilters-------------------------------------------//
//Descripcion:
//Comprueba si hay aplicado algun filtro
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.checkFilters = function () {
    console.log(this.store.isFiltered());
    return this.store.isFiltered();
};


//-----------------------clearFilters-------------------------------------------//
//Descripcion:
//Quita los filtros aplicados a los datos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManagerMemory.prototype.clearFilters = function () {
    this.store.clearFilter(false);
};


AttributeManagerMemory.prototype.loadJSON = function (json) {
    this.attributes = [];
    this.columnsGrid = [];
    console.log(json);
    this.filters = json.filters;

    // add attributes
    for (var i = 0; i < json.attributes.length; i++) {
        this.addAttribute(json.attributes[i].name, json.attributes[i].type, json.attributes[i].defaultValue);
    }

    // add rows
    this.addRows(json.data, false);
};

AttributeManagerMemory.prototype.setName = function (vertexId, newName) {
    var register = this.store.getAt(this.store.find("id", vertexId));
    register.set("Name", newName);
    register.commit();
};

AttributeManagerMemory.prototype.setAttributeByName = function (name, attribute, value) {
    var register = this.store.getAt(this.store.find("Name", name));
    if (register) { // if exists a row with this name
        register.set(attribute, value);
        register.commit();
    }
};


AttributeManagerMemory.prototype.exportToTab = function (columns, clearFilter) {
    if (clearFilter) {
        this.store.clearFilter(false);
    }

    var colNames = [];
    var headerLine = "", typeLine = "", defValLine = "";
    for (var i = 0; i < columns.length; i++) {
        headerLine += columns[i].inputValue + "\t";
        colNames.push(columns[i].inputValue);
    }

    for (var i = 0; i < colNames.length; i++) {
        for (var j = 0; j < this.attributes.length; j++) {
            if (colNames[i] == this.attributes[j].name) {
                typeLine += this.attributes[j].type + "\t";
                defValLine += this.attributes[j].defaultValue + "\t";
                break;
            }
        }
    }

    var output = "";
    output += "#" + typeLine + "\n";
    output += "#" + defValLine + "\n";
    output += "#" + headerLine + "\n";

    var lines = this.store.getRange();
    for (var j = 0; j < lines.length; j++) {
        for (var i = 0; i < colNames.length; i++) {
            output += lines[j].getData()[colNames[i]] + "\t";
        }
        output += "\n";
    }

    if (clearFilter) {
        for (var filter in this.filters) {
            if (this.filters[filter].active) {
                //this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //para filtrar cuando este escrito el nombre entero bien
                var reg = new RegExp("" + this.filters[filter].value);
                this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filter].attribute, value: reg, root: 'data'}));
            }
        }
    }

    return output;
};

