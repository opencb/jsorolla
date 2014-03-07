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

function AttributeManagerStore(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('AttributeManagerStore');

    this.model = Ext.define('Attribute', {
        extend: 'Ext.data.Model',
        idProperty: 'Id'
    });
    this.store = Ext.create('Ext.data.Store', {
//        groupField: 'selected',
        pageSize: 50,
        proxy: {
            type: 'memory'
        },
        model: this.model,
        listeners: {
            update: function (st, record, operation, modifiedFieldNames) {
                if (modifiedFieldNames && modifiedFieldNames[0] != 'Selected') {
                    _this.trigger('change:recordsAttribute', {records: [record], attributeName: modifiedFieldNames[0], sender: this});
                }
            }
        }
    });


    this.columnsGrid = [];
    this.attributes = [];
    this.filters = {};

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this._processAttribute({name: "Selected", type: "boolean", defaultValue: false});
    for (var i = 0; i < this.attributes.length; i++) {
        this._processAttribute(this.attributes[i]);
    }
};

AttributeManagerStore.prototype = {
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
            console.log('change:attributes - add one attr')
            this.trigger('change:attributes', {sender: this});
        }
        return true;
    },
    _processAttribute: function (attribute) {
        /** Id column is not editable **/
        var editor;
        if (attribute.name !== 'Id') {
            editor = {xtype: 'textfield', allowBlank: true};
        }

        if (attribute.name !== 'Selected') {
            this.columnsGrid.push({
                "text": attribute.name,
                "dataIndex": attribute.name,
                "editor": editor
            });
        }


        // set model fields
        this.model.setFields(this.attributes);

        //Set default value for existing records
        this.store.suspendEvents();
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record.set(attribute.name, attribute.defaultValue);
        }
        this.store.commitChanges();
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    addAttributes: function (attributes) {
        for (var i = 0; i < attributes.length; i++) {
            this.addAttribute(attributes[i], false);
        }
        console.log('change:attributes - add multiple attr')
        this.trigger('change:attributes', {sender: this});
    },
    removeAttribute: function (attributeName) {
        for (var i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name === attributeName &&
                this.attributes[i].locked !== true &&
                this.attributes[i].name !== 'Selected') {
                this.columnsGrid.splice(i, 1);
                this.attributes.splice(i, 1);

                this.model.setFields(this.attributes);
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
        var record = this.store.getById(id);
        if (record) {
            record.set(attributeName, value);
            record.commit();
        }
    },
    setRecordAttributeByIds: function (records) {
        this.store.suspendEvents();
        for (var i = 0; i < records.length; i++) {
            var recordObject = records[i];
            if (!this.isAttributeLocked(recordObject.attributeName)) {
                var record = this.store.getById(recordObject.id);
                if (record) { // if exists a row with this name
                    for (var attributeName in recordObject) {
                        if (attributeName !== 'id') {
                            record.set(attributeName, recordObject[attributeName]);
                        }
                    }
                    record.commit();
                }
            }
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
        for (var attributeName in recordObject) {
            this.trigger('change:recordsAttribute', {records: records, attributeName: attributeName, sender: this});
        }
    },
    setRecordsAttribute: function (records, attributeName, value) {
        if (this.isAttributeLocked(attributeName)) {
            return false;
        }
        this.store.suspendEvents();
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record.set(attributeName, value);
            record.commit();
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
        this.trigger('change:recordsAttribute', {records: records, attributeName: attributeName, sender: this});
    },
//    addRecord: function (data, append) {
//        this.store.loadData(data, append);
//    },
    addRecord: function (data, append) {
        this.store.loadData(data, append);
    },
    removeRecordById: function (id) {
        var record = this.store.getById(id);
        if (record) {
            this.store.remove(record);
        }
    },
    getValueByAttributeAndId: function (id, attribute) {
        var record = this.store.getById(id);
        if (record) {
            return record.get(attribute);
        }
    },
    getOrderedIdsByAttribute: function (attributeName) {
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        var values = [];

        var type = 'float';
        var checkType = true;

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var id = record.get('Id');
            var value = record.get(attributeName);

            /* detect number or string */
            if (checkType) {
                var parseResult = parseFloat(value);
                if (isNaN(parseResult)) {
                    var type = 'string';
                    checkType = false;
                }
            }
            /* - - - - - - - - - - - - */

            values.push({id: id, value: value});
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
        var mixedCollection = this.store.query(attribute, value, false, false, true);
        for (var i = 0; i < mixedCollection.items.length; i++) {
            var item = mixedCollection.items[i];
            var id = item.data["Id"];
            if (dupHash[id] !== true) {
                ids.push(item.data["Id"]);
            }
            dupHash[id] = true;
        }
        return ids;
    },
    getValuesByAttribute: function (attributeName) {
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        var values = [];
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var value = record.get(attributeName);
            var id = record.get('Id');
            if (value != null && value !== '') {
                values.push({value: value, id: id});
            }
        }
        return values;
    },
    getSelectedValuesByAttribute: function (attributeName) {
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        var values = [];
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var value = record.get(attributeName);
            var id = record.get('Id');
            var selected = record.get('Selected');
            if (selected === true && value != null && value !== '') {
                values.push({value: value, id: id})
            }
        }
        return values;
    },
//    getRecordsByItem: function (items) {
//        var records = [];
//        for (var i = 0; i < items.length; i++) {
//            var item = items[i];
//            var record = this.store.findRecord('Id', item.id);
//            records.push(record);
//        }
//        return records;
//    },
    selectByItems: function (items) {
        this.store.suspendEvents();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var record = this.store.getById(item.id);
            if (record) {
                record.set('Selected', true);
                record.commit();
            }
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    deselectByItems: function (items) {
        this.store.suspendEvents();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var record = this.store.getById(item.id);
            if (record) {
                record.set('Selected', false);
                record.commit();
            }
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    selectAll: function () {
        this.store.suspendEvents();
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record.set('Selected', true);
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    deselectAll: function () {
        this.store.suspendEvents();
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record.set('Selected', false);
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    clean: function () {
        this.attributes = [];
        this.columnsGrid = [];
        this.attributes = [];
        this.filters = {};

        this.store.removeAll();
        this._processAttribute({name: "Selected", type: "boolean", defaultValue: false});
        this.model.setFields(this.attributes);

        this.trigger('change:attributes', {sender: this});
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

        var data = this.store.snapshot || this.store.data;
        var records = data.items;
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
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
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
AttributeManagerStore.prototype.updateAttribute = function (oldName, newName, type, defaultValue) {
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

            this.model.setFields(this.attributes);

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
AttributeManagerStore.prototype.removeRow = function (attribute, value) {
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
AttributeManagerStore.prototype.removeRows = function (attribute, value) {
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
AttributeManagerStore.prototype.removeAll = function () {
    this.store.removeAll(true);
};


//-----------------------getNumberOfRows----------------------------------------//
//Descripcion:
//Cuenta cuantos datos tenemos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManagerStore.prototype.getNumberOfRows = function () {
    return this.store.count();
};


//-----------------------getUniqueByAttribute-----------------------------//
//Descripcion:
//Devuelve los diferentes datos que hay en un atributo
//Parametros:
//attribute: (string) nombre del atributo 
//------------------------------------------------------------------------------//
AttributeManagerStore.prototype.getUniqueByAttribute = function (attribute) {
    return this.store.collect(attribute, false, true);
};


//-----------------------getPositionOfRow---------------------------------------//
//Descripcion:
//Devuelve la posicion de un dato identificado un atributo y su valor
//Parametros:
//attribute: (string) atributo por la que queremos buscar
//value: (string) valor del atributo por la que queremos buscar
//------------------------------------------------------------------------------//
AttributeManagerStore.prototype.getPositionOfRow = function (attribute, value) {
    var aux = this.store.find(attribute, value);
    return(aux);
};


//-----------------------getRowByIndex------------------------------------------//
//Descripcion:
//Muestra el dato que se encuentran en el indice indicado
//Parametros:
//index:(number) index del dato del que queremos obtener informacion
//------------------------------------------------------------------------------//
AttributeManagerStore.prototype.getRowByIndex = function (index) {
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
AttributeManagerStore.prototype.getRowRangeIndex = function (startIndex, endIndex) {
    var aux = this.store.getRange(startIndex, endIndex);

    for (var i = 0; i < aux.length; i++) {
        console.log(aux[i].data);
    }
};


AttributeManagerStore.prototype.addFilter = function (filterName, attribute, value) {
    if (!this.filters[filterName] && attribute != null && value != null) {
        this.filters[filterName] = {"active": false, "attribute": attribute, "value": value};
        this.enableFilter(filterName);
        return true;
    }
    return false;
};

AttributeManagerStore.prototype.removeFilter = function (filterName) {
    if (this.filters[filterName]) {
        this.disableFilter(filterName);
        delete this.filters[filterName];
        return true;
    }
    return false;
};

AttributeManagerStore.prototype.enableFilter = function (filterName) {
    this.filters[filterName].active = true;

    //this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //filter for exactly match
    var reg = new RegExp("" + this.filters[filterName].value);
    this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filterName].attribute, value: reg, root: 'data'}));
};

AttributeManagerStore.prototype.disableFilter = function (filterName) {
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
AttributeManagerStore.prototype.checkFilters = function () {
    console.log(this.store.isFiltered());
    return this.store.isFiltered();
};


//-----------------------clearFilters-------------------------------------------//
//Descripcion:
//Quita los filtros aplicados a los datos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManagerStore.prototype.clearFilters = function () {
    this.store.clearFilter(false);
};


AttributeManagerStore.prototype.loadJSON = function (json) {
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

AttributeManagerStore.prototype.setName = function (vertexId, newName) {
    var register = this.store.getAt(this.store.find("Id", vertexId));
    register.set("Name", newName);
    register.commit();
};

AttributeManagerStore.prototype.setAttributeByName = function (name, attribute, value) {
    var register = this.store.getAt(this.store.find("Name", name));
    if (register) { // if exists a row with this name
        register.set(attribute, value);
        register.commit();
    }
};


AttributeManagerStore.prototype.exportToTab = function (columns, clearFilter) {
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

