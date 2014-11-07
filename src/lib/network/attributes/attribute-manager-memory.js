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
        delete this.dataIndex[row.id];
        var removedRow = this.data.splice(position, 1);

        return removedRow;
    },
    removeById: function (id) {
        return this.remove(this.data[this.dataIndex[id]]);
    },
    getRow: function (id) {
        return this.data[this.dataIndex[id]]
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
        if (!this.containsRow(column)) {
            return;
        }
        var position = this.columnsIndex[column.name];
        delete this.columnsIndex[column.name];
        var removeColumn = this.columns.splice(position, 1);

        return removeColumn;
    },
    removeColumnByName: function (name) {
        return this.removeColumn(this.columns[this.columnsIndex[name]]);
    },

    /* Selection */
    select: function (id) {
        this.selected = [this.getRow(id)];
    },
    addToSelection: function (id) {
        this.selected.push(this.getRow(id));
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

    /*
     *
     *
     *
     *
     *
     *
     *
     * OLD
     *
     *
     *
     *
     *
     *
     *
     * */
};