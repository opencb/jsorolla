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

    this.sheetStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: []
    });
    this.columnsNumberStore = Ext.create('Ext.data.Store', {
        fields: ['name', 'num'],
        data: []
    });

    this.height = 450;

    this.textNetworkDataAdapter;

    this.sourceColumnIndex;
    this.relationColumnIndex;
    this.targetColumnIndex;
};


XLSXNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;
    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'XLSX network file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function (f, v) {
                _this.panel.setLoading(true);
                var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
                var node = Ext.DomQuery.selectNode('input[id=' + f.getInputId() + ']');
                node.value = v.replace("C:\\fakepath\\", "");

                _this.dataAdapter = new XLSXNetworkDataAdapter({
                    dataSource: new FileDataSource({file: file, type: 'binary'}),
                    handlers: {
                        'data:load': function (event) {
                            _this.processWorkbook(event.sender);
                            _this.parsePanel.show();
                        },
                        'error:parse': function (event) {
                            _this.infoLabel.setText('<span class="err">' + event.errorMsg + '</span>', false);
                            _this.panel.setLoading(false);
                        }
                    }
                });
            }
        }
    });

    return this.fileUpload;
};


XLSXNetworkFileWidget.prototype.addCustomComponents = function () {
    var _this = this;

    this.sheetCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        fieldLabel: 'Select Sheet',
        labelWidth: 40,
        store: this.sheetStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.processSheet(value)
                }
            }
        }
    });

    this.sourceCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        flex: 1,
        fieldLabel: 'Choose source column',
        emptyText: 'Choose column',
        store: this.columnsNumberStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'num',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                console.log(value);
                if (value != null) {
                    _this.sourceColumnIndex = value;
                    _this.processColumnNumbers();
                }
            }
        }
    });
    this.relationCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        flex: 1,
        fieldLabel: 'Choose relation column',
        emptyText: 'Choose column',
        store: this.columnsNumberStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'num',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                console.log(value);
                if (value != null) {
                    _this.relationColumnIndex = value;
                    _this.processColumnNumbers();
                }
            }
        }
    });
    this.targetCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        fieldLabel: 'Choose target column',
        flex: 1,
        emptyText: 'Choose column',
        store: this.columnsNumberStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'num',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                console.log(value);
                if (value != null) {
                    _this.targetColumnIndex = value;
                    _this.processColumnNumbers();
                }
            }
        }
    });

    this.parsePanel = Ext.create('Ext.panel.Panel', {
        dock: 'top',
        hidden: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        bodyPadding: 5,
        items: [
            {
                xtype: 'container',
                margin: 3,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    this.sheetCombo,
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                defaults: {
                    margin: 3
                },
                items: [
                    this.sourceCombo,
                    this.relationCombo,
                    this.targetCombo
                ]
            }
        ]
    });

    this.panel.addDocked(this.parsePanel);

}

XLSXNetworkFileWidget.prototype.processWorkbook = function (adapter) {
    var _this = this;

    var sheets = [];
    for (var sheet in  adapter.xlsx.Sheets) {
        sheets.push({name: sheet});
    }
    this.sheetStore.loadData(sheets);

    this.panel.setLoading(false);
};

XLSXNetworkFileWidget.prototype.processSheet = function (sheetName) {
    var _this = this;

    this.panel.setLoading(true);

    delete this.sourceColumnIndex;
    delete this.relationColumnIndex;
    delete this.targetColumnIndex;
    this.sourceCombo.reset();
    this.relationCombo.reset();
    this.targetCombo.reset();

    this.grid.store.removeAll();

    var csv = this.dataAdapter.parseSheet(sheetName);

    this.textNetworkDataAdapter = new TextNetworkDataAdapter({
        dataSource: new StringDataSource(csv),
        separator: ',',
        handlers: {
            'data:load': function (event) {
                _this._processColumns(event.sender);
            },
            'error:parse': function (event) {
                _this.infoLabel.setText('<span class="err">' + event.errorMsg + '</span>', false);
                _this.panel.setLoading(false);
            }
        }
    });


//    var sifNetworkDataAdapter = new SIFNetworkDataAdapter({
//        dataSource: new StringDataSource(csv),
//        separator: ',',
//        handlers: {
//            'data:load': function (event) {
//                _this.processData(event.graph);
//            }
//        }
//    });

};


XLSXNetworkFileWidget.prototype._processColumns = function (adapter) {
    var _this = this;

    var columnsNumbers = [];
    for (var i = 0; i < adapter.columnLength; i++) {
        columnsNumbers.push({name: 'Column ' + (i + 1), num: i + 1});
    }
    this.columnsNumberStore.loadData(columnsNumbers);

    delete this.sourceColumnIndex;
    delete this.relationColumnIndex;
    delete this.targetColumnIndex;
    this.sourceCombo.reset();
    this.relationCombo.reset();
    this.targetCombo.reset();

    this.infoLabel.setText('<span class="info">Parse complete', false);

    this.panel.setLoading(false);
};

XLSXNetworkFileWidget.prototype.processColumnNumbers = function () {
    var _this = this;

    if (typeof this.sourceColumnIndex !== 'undefined' && typeof this.relationColumnIndex !== 'undefined' && typeof this.targetColumnIndex !== 'undefined') {
        this.panel.setLoading(true);
        var graph = this.textNetworkDataAdapter.parseColumns(this.sourceColumnIndex - 1, this.relationColumnIndex - 1, this.targetColumnIndex - 1);
        this.processData(graph);
    }

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