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


XLSXNetworkFileWidget.prototype = new NetworkFileWidget();

function XLSXNetworkFileWidget(args) {
    NetworkFileWidget.prototype.constructor.call(this, args);

    this.title = 'Import a Network XLSX file';
    this.id = Utils.genId('XLSXNetworkFileWidget');
};


XLSXNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;
    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'SIF network file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function (f, v) {
                _this.panel.setLoading(true);
                var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
                var node = Ext.DomQuery.selectNode('input[id=' + f.getInputId() + ']');
                node.value = v.replace("C:\\fakepath\\", "");

                _this.dataAdapter = new XLSXDataAdapter({
                    dataSource: new FileDataSource({file: file, type: 'binary'}),
                    handlers: {
                        'data:load': function (event) {
                            _this.processWorkbook(event.sender);
                        }
                    }
                });
            }
        }
    });

    return this.fileUpload;
};

XLSXNetworkFileWidget.prototype.processWorkbook = function (adapter) {
    var _this = this;

    if (typeof this.sheetCombo !== 'undefined') {
        this.sheetCombo.destroy();
    }
    this.sheetCombo = Ext.create('Ext.form.field.ComboBox', {
        xtype: 'combo',
        labelWidth: 40,
        margin: '0 0 0 10',
        fieldLabel: 'Sheets',
        store: adapter.xlsx.SheetNames,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.processSheet(adapter, value)
                }
            }
        }
    });
    this.infobar.insert(0, this.sheetCombo);


    this.panel.setLoading(false);


};

XLSXNetworkFileWidget.prototype.processSheet = function (adapter, sheetName) {
    var _this = this;
    var csv = adapter.parseSheet(sheetName);

    var sifDataAdapter = new SIFDataAdapter({
        dataSource: new StringDataSource(csv),
        separator: ',',
        handlers: {
            'data:load': function (event) {
                _this.processData(event.graph);
            }
        }
    });

};

XLSXNetworkFileWidget.prototype.processData = function (graph) {
    var _this = this;
    try {
        this.content = graph; //para el onOK.notify event
        var verticesLength = graph.vertices.length;
        var edgesLength = graph.edges.length;

        var edges = graph.edges;
        var storeData = [];
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            storeData.push([edge.source.id, edge.relation, edge.target.id]);
        }
        this.gridStore.loadData(storeData);

        this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>', false);
        this.countLabel.setText('Vertices:<span class="info">' + verticesLength + '</span> edges:<span class="info">' + edgesLength + '</span>', false);

    } catch (e) {
        this.infoLabel.setText('<span class="err">File not valid </span>' + e, false);
    }
    this.panel.setLoading(false);
};