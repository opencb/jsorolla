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

    this.columns = [];
    this.columnsIndex = {};
    this.columnsCount = 0;

    this.data = [];
    this.dataIndex = {};
    this.dataCount = 0;

    this.selected = [];

    if (args instanceof Object) {
        if (args.data != null) {
            this.data = [];
        }
        if (args.columns != null) {
            this.columns = [];
        }
    }
};

AttributeManagerMemory.prototype = {
    containsRow: function (row) {
        if (typeof row !== 'undefined') {
            return this.containsRowById(row.id);
        } else {
            return false;
        }
    },
    containsRowById: function (id) {
        if (typeof this.dataIndex[id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    addRow: function (row) {
        if (this.containsRow(row)) {
            return false;
        }
        var insertPosition = this.data.push(row) - 1;
        this.dataIndex[row.id] = insertPosition;
        this.dataCount++;
        return true;
    },
    removeRow: function (row) {
        if (!this.containsRow(row)) {
            return;
        }
        var position = this.dataIndex[row.id];
        var removedRow = this.data.splice(position, 1);
        this._rebuildDataIndex();

        return removedRow;
    },
    removeRows: function (rows) {
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            if (this.containsRow(row)) {
                this.data[this.dataIndex[row.id]] = null;
            }
        }
        this._rebuildData();
    },
    removeRowById: function (id) {
        return this.removeRow(this.data[this.dataIndex[id]]);
    },
    removeRowsByIds: function (ids) {
        for (var i = 0, l = ids.length; i < l; i++) {
            var id = ids[i];
            if (this.containsRowById(id)) {
                this.data[this.dataIndex[id]] = null;
            }
        }
        this._rebuildData();
    },
    getRow: function (id) {
        return this.data[this.dataIndex[id]]
    },

    _update: function () {
        if (this.data.length > 0) {
            this._updateRow(this.data[0]);
        }
    },
    _updateRow: function (row) {
        var r = {};
        for (var i in row) {
            if (row.hasOwnProperty(i)) {
                r[i] = row[i];
            }
        }
        this.data[this.dataIndex[r.id]] = r;
    },

    _rebuildData: function () {
        var newData = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row != null) {
                newData.push(row);
            }
        }
        this.data = newData;
        this._rebuildDataIndex();
    },
    _rebuildDataIndex: function () {
        this.dataIndex = {};
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            this.dataIndex[row.id] = i;
        }
    },
    /*
     * Columns
     * */
    containsColumn: function (column) {
        if (typeof column !== 'undefined') {
            return this.containsColumnByName(column.name);
        } else {
            return false;
        }
    },
    containsColumnByName: function (name) {
        if (typeof this.columnsIndex[name] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    addColumn: function (column) {
        if (this.containsColumn(column)) {
            return false;
        }
        var insertPosition = this.columns.push(column) - 1;
        this.columnsIndex[column.name] = insertPosition;
        this.columnsCount++;
        return true;
    },
    removeColumn: function (column) {
        if (!this.containsColumn(column) || column.name == 'id') {
            return false;
        }
        var position = this.columnsIndex[column.name];
        var removedColumn = this.columns.splice(position, 1);
        this._rebuildColumnsIndex();

        return removedColumn;
    },
    removeColumnByName: function (name) {
        return this.removeColumn(this.columns[this.columnsIndex[name]]);
    },
    _rebuildColumnsIndex: function () {
        this.columnsIndex = {};
        for (var i = 0, l = this.columns.length; i < l; i++) {
            var col = this.columns[i];
            this.columnsIndex[col.name] = i;
        }
    },

    /* Selection */
    select: function (id) {
        this.selected = [this.getRow(id)];
    },
    addToSelection: function (id) {
        this.selected.push(this.getRow(id));
    },
    removeFromSelection: function (id) {
        var index = this.selected.indexOf(this.getRow(id));
        this.selected.splice(index, 1);
    },
    selectAll: function () {
        var selection = [];
        for (var i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            selection.push(row);
        }
        this.selected = selection;
    },
    deselectAll: function () {
        this.selected = [];
    },
    selectByIds: function (ids) {
        var selected = [];
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            selected.push(this.getRow(id));
        }
        this.selected = selected;
    },
    selectByColumnValue: function (column, value) {
        var selected = [];
        for (var i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            if (row[column] === value) {
                selected.push(row);
            }
        }
        this.selected = selected;
    },
    selectByColumnContainsValue: function (column, value, notContains) {
        var selected = [];
        if (notContains == true) {
            for (var i = 0; i < this.data.length; i++) {
                var row = this.data[i];
                if (row[column].indexOf(value) == -1) {
                    selected.push(row);
                }
            }
        } else {
            for (var i = 0; i < this.data.length; i++) {
                var row = this.data[i];
                if (row[column].indexOf(value) != -1) {
                    selected.push(row);
                }
            }
        }
        this.selected = selected;
    },
    selectByColumnComparationValue: function (column, value, comparation, includeValue) {
        if (!isNaN(value)) {
            var selected = [];
            if (comparation == '>') {
                if (includeValue) {
                    for (var i = 0; i < this.data.length; i++) {
                        var row = this.data[i];
                        if (!isNaN(row[column]) && parseFloat(row[column]) >= parseFloat(value)) {
                            selected.push(row);
                        }
                    }
                } else {
                    for (var i = 0; i < this.data.length; i++) {
                        var row = this.data[i];
                        if (!isNaN(row[column]) && parseFloat(row[column]) > parseFloat(value)) {
                            selected.push(row);
                        }
                    }
                }
            } else if (comparation == '<') {
                if (includeValue) {
                    for (var i = 0; i < this.data.length; i++) {
                        var row = this.data[i];
                        if (!isNaN(row[column]) && parseFloat(row[column]) <= parseFloat(value)) {
                            selected.push(row);
                        }
                    }
                } else {
                    for (var i = 0; i < this.data.length; i++) {
                        var row = this.data[i];
                        if (!isNaN(row[column]) && parseFloat(row[column]) < parseFloat(value)) {
                            selected.push(row);
                        }
                    }
                }
            }
            this.selected = selected;
        }
    },
    removeSelected: function () {
        this.removeRows(this.selected);
        this.deselectAll();
    },

    /* Edition */
    updateRows: function (newRows) {
        for (var i = 0, l = newRows.length; i < l; i++) {
            var newRow = newRows[i];
            var row = this.getRow(newRow.id);
            if (row) {
                for (key in newRows) {
                    row[key] = newRows;
                }
            }
        }
    },
    updateRowsColumn: function (rows, column, value) {
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = this.getRow(rows[i].id);
            if (row) {
                row[column] = value;
            }
        }
    },
    fromJSON: function (json) {
        for (var i = 0, l = json.columns.length; i < l; i++) {
            this.addColumn(json.columns[i]);
        }
        for (var i = 0, l = json.data.length; i < l; i++) {
            this.addRow(json.data[i]);
        }
    },
    toJSON: function () {
        return {columns: this.columns, data: this.data};
    },
    getAsFile: function (separator) {
        if (!separator) {
            separator = '\t';
        }
        // Attribute names
        var text = '';

        var lc = this.columns.length
        text += '#';
        for (var i = 0; i < lc; i++) {
            var attrName = this.columns[i].name;
            text += attrName + separator;
        }
        text += '\n';

        var row, attr;
        for (var i = 0, l = this.data.length; i < l; i++) {
            row = this.data[i];
            for (var j = 0; j < lc; j++) {
                attr = this.columns[j].name;
                text += row[attr] + separator;
            }
            text += '\n';
        }
        return text;
    }
};