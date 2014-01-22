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

    this.model = Ext.define('AttributesModel', {
        extend: 'Ext.data.Model'
    });
    this.store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {
            type: 'memory'
        },
        model: this.model
    });

    this.columnsGrid = [];
    this.attributes = [];
    this.filters = {};

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

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
        this.columnsGrid.push({
            "text": attribute.name,
            "dataIndex": attribute.name,
            "editor": editor
        });
        // set model fields
        this.model.setFields(this.attributes);

        //Set default value for existing records
        this.store.suspendEvents();
        this.store.each(function(record){
            record.set(attribute.name, attribute.defaultValue);
        });
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
            if (this.attributes[i].name === attributeName && this.attributes[i].locked !== true) {
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


    setValueByAttributeAndId: function (id, attributeName, value) {
        if (this.isAttributeLocked(attributeName)) {
            return false;
        }
        var record = this.store.findRecord("Id", id);
        if (record) { // if exists a row with this name
            record.set(attributeName, value);
            record.commit();
        }
    },
    setValueByAttributeAndIds: function (values) {
        this.store.suspendEvents();
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            if (!this.isAttributeLocked(value.attributeName)) {
                var record = this.store.findRecord("Id", value.id);
                if (record) { // if exists a row with this name
                    record.set(value.attributeName, value.value);
                    record.commit();
                }
            }
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');
    },
    setValueByAttributeAndRecords: function (records, attributeName, value) {
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
    },
    addRecord: function (data, append) {
        this.store.loadData(data, append);
    },
    removeRecordById: function (id) {
        var record = this.store.findRecord("Id", id);
        this.store.remove(record);
    },
    getValueByAttributeAndId: function (id, attribute) {
        var record = this.store.findRecord('Id', id);
        if (record) {
            return record.get(attribute);
        }
    },
    getIdsByAttributeValue: function (attribute, value) {
//        var logDupCount = 0; //for logging only
        var dupHash = {};
        var ids = [];
        var mixedCollection = this.store.query(attribute, value);
        for (var i = 0; i < mixedCollection.items.length; i++) {
            var item = mixedCollection.items[i];
            var id = item.data["Id"];
            if (dupHash[id] !== true) {
                ids.push(item.data["Id"]);
            } else {
                logDupCount++;
            }
            dupHash[id] = true;
        }
//        console.log('AttributeManagerStore.getIdsByAttributeValue: ' + logDupCount);
        return ids;
    },
    getRecordsByVertices:function(vertices){
        var records = [];
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var record = this.store.findRecord('Id', vertex.id);
            records.push(record);
        }
        return records;
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

AttributeManagerStore.prototype.toJSON = function () {
    var json = {};
    json.attributes = this.attributes;
    json.filters = this.filters;
    json.data = [];

    // add row values to data matrix
    var rows = this.store.getRange();
    for (var j = 0; j < rows.length; j++) {
        json.data.push([]);
        for (var i = 0; i < this.attributes.length; i++) {
            json.data[j].push(rows[j].getData()[this.attributes[i].name]);
        }
    }

    return json;
};

AttributeManagerStore.prototype.setName = function (nodeId, newName) {
    var register = this.store.getAt(this.store.find("Id", nodeId));
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


AttributeManagerStore.prototype.getAttrNameList = function () {
    var nameList = [];
    for (var i = 0; i < this.attributes.length; i++) {
        nameList.push(this.attributes[i].name);
    }
    return nameList;
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

