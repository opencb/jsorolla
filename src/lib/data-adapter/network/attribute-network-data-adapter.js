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

function AttributeNetworkDataAdapter(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.dataSource;
    this.async = true;
    this.ignoreColumns = {};
    this.renameColumns = {};

    this.useFirstLineAsColumnNames = false;

    //set instantiation args, must be last
    _.extend(this, args);


    this.attributeManager = new AttributeManagerMemory();

    this.on(this.handlers);

    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        _this.parse(data);
    }


};

AttributeNetworkDataAdapter.prototype.parse = function (data) {
    var _this = this;

//    var lines = data.split("\n");
//    if (lines.length > 2) {
//        var types = lines[0].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
//        var defVal = lines[1].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
//        var headers = lines[2].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
//
//        for (var i = 0; i < headers.length; i++) {
//            this.attributes.push({
//                "name": headers[i],
//                "type": types[i],
//                "defaultValue": defVal[i]
//            });
//        }
//    }
//
//    for (var i = 3; i < lines.length; i++) {
//        var line = lines[i].replace(/^\s+|\s+$/g, "");
//        if ((line != null) && (line.length > 0)) {
//            var fields = line.split("\t");
//            if (fields[0].substr(0, 1) != "#") {
//                this.data.push(fields);
//            }
//        }
//    }

    try {
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split(/\n/);


        var firstLine = lines[0].trim();
        var columnNames = [];
        if (firstLine.substr(0, 1) === "#") {
            columnNames = firstLine.split(/\t/);

            //search for first non header line "#"
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.substr(0, 1) !== "#") {
                    firstLine = line;
                    break;
                }
            }

        }
        if (this.useFirstLineAsColumnNames) {
            columnNames = firstLine.split(/\t/);
            //first non header line
            firstLine = lines[1];

        }

        var finalColumnNames = [];
        var numColumns = firstLine.split(/\t/).length;
        for (var i = 0; i < numColumns; i++) {

            if (this.renameColumns[i]) {
                finalColumnNames[i] = this.renameColumns[i];
            } else {
                if (columnNames[i]) {
                    finalColumnNames[i] = columnNames[i];
                } else {
                    finalColumnNames[i] = "Column" + i;
                }
            }

            if (i == 0) {
                finalColumnNames[i] = "id";
            }
            if (this.ignoreColumns[i] !== true) {
                this.attributeManager.addColumn({
                    "name": finalColumnNames[i],
                    "title": finalColumnNames[i],
                    "type": "string",
                    "defaultValue": ""
                });
            }
        }


        //ignore attributes
        if (Object.keys(this.ignoreColumns).length > 0) {
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if ((line != null) &&
                    (line.length > 0) &&
                    line.substr(0, 1) != "#"
                ) {
                    if (i == 0 && this.useFirstLineAsColumnNames == true) continue;

                    var fields = line.split("\t");

                    var row = {};
                    for (var j = 0; j < fields.length; j++) {
                        if (this.ignoreColumns[j] !== true) {
                            row[finalColumnNames[j]] = fields[j].trim();
                        }
                    }
                    this.attributeManager.addRow(row);
                }
            }
        } else {
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if ((line != null) &&
                    (line.length > 0) &&
                    line.substr(0, 1) != "#"
                ) {
                    if (i == 0 && this.useFirstLineAsColumnNames == true) continue;

                    var fields = line.split("\t");

                    var row = {};
                    for (var j = 0; j < fields.length; j++) {
                        row[finalColumnNames[j]] = fields[j].trim();
                    }
                    this.attributeManager.addRow(row);
                }
            }
        }

        this.trigger('data:load', {attributeManager: this.attributeManager, sender: this});
    } catch (e) {
        console.log(e);
        console.log(e.stack);
        this.trigger('error:parse', {errorMsg: 'Parse error', sender: this});
    }


};
