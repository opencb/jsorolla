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

function AttributeNetworkFileWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('AttributeNetworkFileWidget');

    this.targetId;
    this.title = 'Open an attributes file';
    this.width = 600;
    this.height = 350;

    //set instantiation args, must be last
    _.extend(this, args);

    this.dataAdapter;

    this.previewId = this.id + '-preview';

    this.on(this.handlers);
};

AttributeNetworkFileWidget.prototype.getTitleName = function () {
    return Ext.getCmp(this.id + "_title").getValue();
};

AttributeNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;

    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'Attributes tabular file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function (f, v) {
                var file = document.getElementById(f.fileInputEl.id).files[0];
                var node = Ext.DomQuery.selectNode('input[id=' + f.getInputId() + ']');
                node.value = v.replace("C:\\fakepath\\", "");

                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    dataSource: new FileDataSource({file: file}),
                    handlers: {
                        'data:load': function (event) {
                            _this.processData(attributeNetworkDataAdapter);
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

AttributeNetworkFileWidget.prototype.processData = function (attributesDataAdapter) {
    var _this = this;
    this.content = attributesDataAdapter.getAttributesJSON(); //para el onOK.notify event

    this.gridTbar.removeAll();
    this.infoLabel.setText("", false);

    var existNameColumn = false;
    var cbgItems = [];
    this.columnsGrid = [];
    this.gridColumnNameFields = [];

    for (var i = 0; i < _this.content.attributes.length; i++) {
        var name = this.content.attributes[i].name;

        this.columnsGrid.push({
            "text": name,
            "dataIndex": name,
            "flex": 1,
            "editor": {xtype: 'textfield', allowBlank: true}
        });

        this.gridColumnNameFields.push({
            xtype: 'textfield',
            value: name,
            index: i,
            vtype: 'alphanum',
            "flex": 1,
            readOnly: (name === "Id") ? true : false,
            listeners: {
                change: function (me, newValue) {
                    var cols = _this.grid.down('headercontainer').getGridColumns();
                    cols[me.index].setText(newValue);
                    _this.columnsGrid[me.index].text = newValue;
                    _this.content.attributes[me.index].name = newValue;
//                    console.log(cols[me.index]);
                    cbgItems[me.index].setBoxLabel(newValue);
                    cbgItems[me.index].updateLayout();
                }
            }
        });

        var disabled = false;
        if (name == "id") {
            disabled = true;
            existNameColumn = true;
        }
        cbgItems.push(Ext.create('Ext.form.field.Checkbox', {
            boxLabel: name,
            name: 'attr',
            margin: '0 0 0 5',
            checked: true,
            disabled: disabled
        }));
    }

    var uniqueNameValues = true;
    var nameValues = {};
    for (var i = 0; i < this.content.data.length; i++) {
        var name = this.content.data[i][0];
        if (nameValues[name]) {
            uniqueNameValues = false;
            break;
        }
        else {
            nameValues[name] = true;
        }
    }

    if (!existNameColumn) {
        this.infoLabel.setText("<span class='err'>Invalid file. The column 'id' is required.</span>", false);
    }
    else if (!uniqueNameValues) {
        this.infoLabel.setText("<span class='err'>Invalid file. The values for 'id' column must be uniques.</span>", false);
    }
    else {
        this.cbgAttributes.add(cbgItems);
        this.fieldContainer.show();
        Ext.getCmp(this.id + 'okBtn').setDisabled(false);
    }

    this.gridTbar.add(this.gridColumnNameFields);

    this.gridStore.setFields(this.content.attributes);

    this.grid.reconfigure(this.gridStore, this.columnsGrid);

    this.gridStore.loadData(this.content.data);
};


AttributeNetworkFileWidget.prototype.filterColumnsToImport = function () {
    var checkeds = this.cbgAttributes.getChecked();

    var data = {};
    var newAttrArray = [];
    var indexToImport = {};

    data.content = {};
    data.createNodes = this.createNodesCkb.getValue();
    if (checkeds.length < this.content.attributes.length) {
        var columnsToImport = {};
        for (var i = 0; i < checkeds.length; i++) {
            columnsToImport[checkeds[i].boxLabel] = true;
        }

        for (var i = 0; i < this.content.attributes.length; i++) {
            var name = this.content.attributes[i].name;
            if (columnsToImport[name]) {
                newAttrArray.push(this.content.attributes[i]);
                indexToImport[i] = true;
            }
        }

        data.content.data = [];
        for (var i = 0; i < this.content.data.length; i++) {
            data.content.data.push([]);
            for (var j = 0; j < this.content.data[i].length; j++) {
                if (indexToImport[j]) {
                    data.content.data[i].push(this.content.data[i][j]);
                }
            }
        }

        data.content.attributes = newAttrArray;
    }
    else {
        data.content = this.content;
    }

    return data;
};

AttributeNetworkFileWidget.prototype.draw = function () {
    var _this = this;

    if (this.panel == null) {
        /** Bar for the file upload browser **/
        var browseBar = Ext.create('Ext.toolbar.Toolbar', {cls: 'bio-border-false', dock: 'top'});
        browseBar.add(this.getFileUpload());


        this.infoLabel = Ext.create('Ext.toolbar.TextItem', {html: 'Please select a network saved File'});
        this.countLabel = Ext.create('Ext.toolbar.TextItem');
        var infobar = Ext.create('Ext.toolbar.Toolbar', {cls: 'bio-border-false', dock: 'bottom'});
        infobar.add([this.infoLabel, '->', this.countLabel]);


        this.cbgAttributes = Ext.create('Ext.form.CheckboxGroup', {
            fieldLabel: 'Import',
            labelWidth: 40,
            layout: 'hbox',
            autoScroll: true,
            defaultType: 'checkboxfield'
        });

        this.createNodesCkb = Ext.create('Ext.form.field.Checkbox', {
            margin: '2 2 2 2',
            boxLabel: "Create nodes for unrecognized names."
        });


        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            margin:'0 0 0 10',
            hidden:true,
            items: [this.cbgAttributes, this.createNodesCkb]
        });


        /** Grid for Preview **/
        this.columnsGrid = [];

        this.gridStore = Ext.create('Ext.data.Store', {
            pageSize: 50,
            proxy: {
                type: 'memory'
            },
            fields: []
        });

        this.gridTbar = Ext.create('Ext.toolbar.Toolbar', {
            items: []
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            border: false,
            flex: 1,
            tbar: this.gridTbar,
            store: this.gridStore,
            columns: this.columnsGrid,
            loadMask: true,
            plugins: ['bufferedrenderer'],
            hideHeaders: true,
            dockedItems: [infobar]
        });

        this.panel = Ext.create('Ext.window.Window', {
            title: this.title,
            resizable: false,
            modal: true,
            items: {
                layout: { type: 'vbox', align: 'stretch'},
                width: this.width,
                height: this.height,
                border: 0,
                items: [
                    this.grid,
                    this.fieldContainer
                ],
                dockedItems: [
                    browseBar
                ],
                bbar: {
                    layout : {
                        pack : 'end'
                    },
                    defaults: {
                        width: 100
                    },
                    items: [
                        {
                            id: _this.id + 'okBtn',
                            text: 'Ok',
                            disabled: true,
                            handler: function () {
                                _this.trigger('okButton:click', {content: _this.filterColumnsToImport(), sender: _this});
                                _this.panel.close();
                            }
                        },
                        {
                            text: 'Cancel',
                            handler: function () {
                                _this.panel.close();
                            }
                        }
                    ]

                }
            },
            listeners: {
                scope: this,
                minimize: function () {
                    this.panel.hide();
                },
                destroy: function () {
                    delete this.panel;
                }
            }
        });
    }
    this.panel.show();
};
