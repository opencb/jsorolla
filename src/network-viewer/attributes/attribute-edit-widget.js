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

function AttributeEditWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('AttributeEditWidget');

    this.window;
    this.grid;
    this.accordionPanel;

    this.attrMan;
    this.type;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    if (this.autoRender) {
        this.render();
    }
};

AttributeEditWidget.prototype = {
    render: function () {
        var _this = this;

        this.attrMan.on('change:attributes', function () {
            _this.updateAttributeManager();
        });

        /****** UI ******/

        var modifyRowsFormPanel = Ext.create('Ext.form.Panel', {
            border: false,
            bodyPadding: "10 0 10 10",
            layout: 'vbox',
            items: [
                {
                    xtype: 'combo',
                    id: this.id + "rowsAttrCombo",
                    store: {fields: ['name'], data: this.attrMan.attributes},
                    displayField: 'name',
                    valueField: 'name',
                    width: 170,
                    allowBlank: false,
                    fieldLabel: 'Attribute',
                    labelWidth: 50,
                    editable: false,
                    queryMode: 'local'
                },
                {
                    xtype: 'textfield',
                    width: 170,
                    fieldLabel: 'Value',
                    labelWidth: 50,
                    allowBlank: false
                },
                {
                    xtype: 'button',
                    width: 170,
                    text: 'Apply on selected rows',
                    formBind: true, // only enabled if the form is valid
                    disabled: true,
                    handler: function (bt) {
                        var newValue = bt.prev().getValue();
                        var selectedAttr = bt.prev().prev().getValue();
                        var selectedRows = _this.grid.getSelectionModel().getSelection();
                        _this.attrMan.modifyAttributeOfRows(selectedRows, selectedAttr, newValue);
                    }
                }
            ]
        });


        this.grid = Ext.create('Ext.grid.Panel', {
            store: this.attrMan.store,
            columns: this.attrMan.columnsGrid,
            flex: 1,
            border: 0
        });

        this.accordionPanel = Ext.create('Ext.container.Container', {
            layout: 'accordion',
            width: 200,
            border: '0 0 0 1',
            style: {
                borderColor: 'lightgray',
                borderStyle: 'solid'
            },
            items: [
                {
                    xtype: 'panel',
                    title: 'Edit rows',
                    items: modifyRowsFormPanel
                },
                {
                    xtype: 'panel',
                    title: 'Edit attributes',
                    layout: {
                        pack: 'hbox'
                    },
//                    items: editAttrFormPanel
                },
            ]
        });

        this.window = Ext.create('Ext.window.Window', {
            id: "edit" + this.type + "AttrWindow",
            title: "Edit " + this.type.toLowerCase() + " attributes",
            width: 800,
            height: 600,
            closable: false,
            minimizable: true,
            constrain: true,
            collapsible: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            renderTo: Ext.getBody(),
            items: [this.grid, this.accordionPanel],
            listeners: {
                minimize: function () {
                    this.hide();
                }
            }
        });
    },
    draw: function () {
        this.window.show();

    },
    setAttributeManager: function (attrMan) {
        var _this = this;
        this.attrMan = attrMan;
        this.attrMan.on('change:attributes', function () {
            _this.updateAttributeManager();
        });
        this.updateAttributeManager();
    },
    updateAttributeManager: function () {
        console.log('refresh ' + this.id);
        this.grid.reconfigure(this.attrMan.store, this.attrMan.columnsGrid);

        var rowsAttrCombo = Ext.getCmp(this.id + 'rowsAttrCombo');
        rowsAttrCombo.store.loadData(this.attrMan.attributes);
    }

}

//function AttributeEditWidget(args) {
//    var _this = this;
//    _.extend(this, Backbone.Events);
//    this.id = Utils.genId('AttributeEditWidget');
//
//    this.attrMan;
//    this.type;
//
//    //set instantiation args, must be last
//    _.extend(this, args);
//
//    this.attrMan.store.on('datachanged', function () {
//        if (Ext.getCmp("edit" + _this.type + "AttrWindow")) {
//            _this.updateNumRowsLabel();
//        }
//    });
//    this.on(this.handlers);
//};
//
//AttributeEditWidget.prototype.draw = function (selectedNodes) {
//    var _this = this;
//
//    this.attrNameStore = Ext.create('Ext.data.Store', {
//        fields: ['name'],
//        data: this.getAttributeNames()
//    });
//
//    this.attrNameStore2 = Ext.create('Ext.data.Store', {
//        fields: ['name'],
//        data: this.getAttributeNames()
//    });
//
//    var modifyRowsFormPanel = Ext.create('Ext.form.Panel', {
//        border: false,
//        bodyPadding: "10 0 10 10",
//        layout: 'vbox',
//        items: [
//            {
//                xtype: 'combo',
//                id: this.id + "selectedAttr",
//                width: 170,
//                allowBlank: false,
//                fieldLabel: 'Attribute',
//                labelWidth: 50,
//                editable: false,
//                displayField: 'name',
//                valueField: 'name',
//                queryMode: 'local',
//                store: this.attrNameStore2
//            },
//            {
//                xtype: 'textfield',
//                id: this.id + "newValue",
//                width: 170,
//                fieldLabel: 'Value',
//                labelWidth: 50,
//                allowBlank: false
//            },
//            {
//                xtype: 'button',
//                width: 170,
//                text: 'Apply on selected rows',
//                formBind: true, // only enabled if the form is valid
//                disabled: true,
//                handler: function () {
//                    var newValue = Ext.getCmp(_this.id + "newValue").getValue();
//                    var selectedAttr = Ext.getCmp(_this.id + "selectedAttr").getValue();
//                    var selectedRows = _this.grid.getSelectionModel().getSelection();
//
//                    _this.attrMan.modifyAttributeOfRows(selectedRows, selectedAttr, newValue);
//                }
//            }
//        ]
//    });
//
//    var attrSelected;
//
//    var editAttrFormPanel = Ext.create('Ext.form.Panel', {
//        border: false,
//        bodyPadding: "10 0 10 10",
//        layout: 'vbox',
//        items: [
//            {
//                xtype: 'combo',
//                id: this.id + "attrName",
//                width: 170,
//                fieldLabel: 'Attribute',
//                labelWidth: 50,
//                allowBlank: false,
//                editable: true,
//                displayField: 'name',
//                valueField: 'name',
//                queryMode: 'local',
//                store: this.attrNameStore,
//                listeners: {
//                    select: function (combo, record, index) {
//                        // set other fields
//                        for (var i = 0; i < _this.attrMan.attributes.length; i++) {
//                            if (combo.getValue() == _this.attrMan.attributes[i].name) {
//                                attrSelected = combo.getValue();
//                                Ext.getCmp(_this.id + "attrType").setValue(_this.attrMan.attributes[i].type);
//                                Ext.getCmp(_this.id + "attrDefault").setValue(_this.attrMan.attributes[i].defaultValue);
//                                break;
//                            }
//                        }
//                    }
//                }
//            },
//            {
//                xtype: 'combo',
//                id: this.id + "attrType",
//                width: 170,
//                fieldLabel: 'Type',
//                labelWidth: 50,
//                combineErrors: true,
//                msgTarget: 'side',
//                mode: 'local',
//                value: 'string',
//                editable: false,
//                displayField: 'name',
//                valueField: 'value',
//                store: Ext.create('Ext.data.Store', {
//                    fields: [ 'name', 'value' ],
//                    data: [
//                        {
//                            name: 'Number',
//                            value: 'number'
//                        },
//                        {
//                            name: 'String',
//                            value: 'string'
//                        },
//                        {
//                            name: 'Boolean',
//                            value: 'bool'
//                        }
//                    ]
//                })
//            },
//            {
//                xtype: 'textfield',
//                id: this.id + "attrDefault",
//                width: 170,
//                fieldLabel: 'Default value',
//                labelWidth: 50
//            },
//            {
//                xtype: 'button',
//                tooltip: "Add attribute",
//                iconCls: 'icon-add',
//                margin: "0 0 0 5",
//                formBind: true, // only enabled if the form is valid
//                disabled: true,
//                handler: function () {
//                    var name = Ext.getCmp(_this.id + "attrName").getValue();
//                    var type = Ext.getCmp(_this.id + "attrType").getValue();
//                    var defaultValue = Ext.getCmp(_this.id + "attrDefault").getValue();
//
//                    if (_this.attrMan.addAttribute(name, type, defaultValue)) {
//                        _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
//
//                        // set default value for new attribute in existing rows
//                        if (_this.attrMan.getNumberOfRows() > 0) {
//                            _this.grid.getSelectionModel().selectAll();
//                            _this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length - 1].name, defaultValue);
//                            _this.grid.getSelectionModel().deselectAll();
//                        }
//
//                        console.log(_this.getAttributeNames());
//                        _this.attrNameStore.loadData(_this.getAttributeNames());
//                        _this.attrNameStore2.loadData(_this.getAttributeNames());
//                    }
//                    else {
//                        Ext.Msg.show({
//                            title: "Error",
//                            msg: "Already exists an attribute with this name.",
//                            buttons: Ext.Msg.OK,
//                            icon: Ext.Msg.ERROR
//                        });
//                    }
//                }
//            },
//            {
//                xtype: 'button',
//                tooltip: "Save changes for this attribute",
//                iconCls: 'icon-save',
//                margin: "0 0 0 5",
//                formBind: true, // only enabled if the form is valid
//                disabled: true,
//                handler: function () {
//                    var newName = Ext.getCmp(_this.id + "attrName").getValue();
//                    var type = Ext.getCmp(_this.id + "attrType").getValue();
//                    var defaultValue = Ext.getCmp(_this.id + "attrDefault").getValue();
//
//                    if (_this.attrMan.updateAttribute(attrSelected, newName, type, defaultValue)) {
//                        _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
//
//                        _this.attrNameStore.loadData(_this.getAttributeNames());
//                        _this.attrNameStore2.loadData(_this.getAttributeNames());
//                    }
//                    else {
//                        Ext.Msg.show({
//                            title: "Error",
//                            msg: "Imposible to save changes.",
//                            buttons: Ext.Msg.OK,
//                            icon: Ext.Msg.ERROR
//                        });
//                    }
//                }
//            },
//            {
//                xtype: 'button',
//                tooltip: "Remove this attribute",
//                iconCls: 'icon-delete',
//                margin: "0 10 0 5",
//                formBind: true, // only enabled if the form is valid
//                disabled: true,
//                handler: function () {
//                    Ext.Msg.show({
//                        title: 'Delete',
//                        msg: 'Confirm delete. Are you sure?',
//                        buttons: Ext.Msg.YESNO,
//                        icon: Ext.Msg.QUESTION,
//                        fn: function (resp) {
//                            if (resp == "yes") {
//                                var name = Ext.getCmp(_this.id + "attrName").getValue();
//                                if (_this.attrMan.removeAttribute(name)) {
//                                    _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
//                                    _this.attrNameStore.loadData(_this.getAttributeNames());
//                                    _this.attrNameStore2.loadData(_this.getAttributeNames());
//
//                                    Ext.getCmp(_this.id + "attrName").reset();
//                                    Ext.getCmp(_this.id + "attrType").reset();
//                                    Ext.getCmp(_this.id + "attrDefault").reset();
//                                }
//                                else {
//                                    Ext.Msg.show({
//                                        title: "Error",
//                                        msg: "Imposible to delete this attribute.",
//                                        buttons: Ext.Msg.OK,
//                                        icon: Ext.Msg.ERROR
//                                    });
//                                }
//                            }
//                        }
//                    });
//                }
//            }
//        ]
//    });
//
//    this.grid = Ext.create('Ext.grid.Panel', {
//        store: this.attrMan.store,
//        columns: this.attrMan.columnsGrid,
//        flex: 1,
//        selModel: {
//            selType: 'rowmodel',
//            mode: 'MULTI'
//        },
//        border: 0,
//        dockedItems: [
//            {
//                xtype: 'toolbar',
//                dock: 'top',
//                items: [
//                    {
//                        xtype: 'button',
//                        text: '<span style="font-size: 12px">Show attributes (columns) <span class="caret"></span></span>',
//                        cls: 'bootstrap',
//                        handler: function (bt, e) {
//                            var menu = bt.up('grid').headerCt.getMenu().down('menuitem[text=Columns]').menu;
//                            menu.showBy(bt);
//                        }
//                    },
//                    {
//                        xtype: 'fieldcontainer',
////                        fieldLabel : 'Color',
//                        defaultType: 'radiofield',
//                        defaults: {
//                            margin:'0 0 0 10'
//                        },
//                        layout: 'hbox',
//                        items: [
//                            {
//                                boxLabel: 'All nodes',
//                                name: 'nodeselection',
//                                inputValue: 'all'
//                            },
//                            {
//                                boxLabel: 'Selected nodes',
//                                name: 'nodeselection',
//                                inputValue: 'selected'
//                            }
//                        ]
//                    },
//                    '->',
//                    {
//                        xtype: 'tbtext',
//                        text: '<span style="color:gray">Use double-click to edit</span>'
//                    }
//                ]
//            },
//            {
//                xtype: 'toolbar',
//                dock: 'bottom',
//                items: [
//                    {
//                        xtype: 'tbtext',
//                        id: this.id + "numRowsLabel"
//                    },
//                    '->',
//                    {
//                        xtype: 'button',
//                        text: 'Export...',
//                        handler: function () {
//                            if (!Ext.getCmp("exportWindow")) {
//                                var cbgItems = [];
//                                var attrList = _this.attrMan.getAttrNameList();
//
//                                cbgItems.push({
//                                    boxLabel: attrList[1],
//                                    name: 'attr',
//                                    inputValue: attrList[1],
//                                    checked: true,
//                                    disabled: true
//                                });
//
//                                for (var i = 2; i < attrList.length; i++) {
//                                    cbgItems.push({
//                                        boxLabel: attrList[i],
//                                        name: 'attr',
//                                        inputValue: attrList[i],
//                                        checked: true
//                                    });
//                                }
//
//                                Ext.create('Ext.window.Window', {
//                                    id: "exportWindow",
//                                    title: "Export attributes",
//                                    height: 250,
//                                    maxHeight: 250,
//                                    width: 400,
//                                    autoScroll: true,
//                                    layout: "vbox",
//                                    modal: true,
//                                    items: [
//                                        {
//                                            xtype: 'checkboxgroup',
//                                            id: _this.id + "cbgAttributes",
//                                            layout: 'vbox',
////		            	        				        	   width: 380,
////		            	        				        	   height: 200,
////		            	        				        	   maxHeight: 200,
////		            	        				        	   autoScroll: true,
////		            	        				        	   defaultType: 'checkboxfield',
////		            	        				        	   columns: 2,
////		            	        				        	   vertical: true,
//                                            items: cbgItems
//                                        }
//                                    ],
//                                    buttons: [
//                                        {
//                                            xtype: 'textfield',
//                                            id: _this.id + "fileName",
//                                            emptyText: "enter file name",
//                                            flex: 1
//                                        },
//                                        {
//                                            text: 'Download',
//                                            href: "none",
//                                            handler: function () {
//                                                var fileName = Ext.getCmp(_this.id + "fileName").getValue();
//                                                if (fileName == "") {
//                                                    fileName = "attributes";
//                                                }
//                                                var columns = Ext.getCmp(_this.id + "cbgAttributes").getChecked();
//                                                var content = _this.attrMan.exportToTab(columns, true);
//                                                this.getEl().child("em").child("a").set({
//                                                    href: 'data:text/csv,' + encodeURIComponent(content),
//                                                    download: fileName + ".txt"
//                                                });
//                                            }
//                                        }
//                                    ]
//                                }).show();
//                            }
//                        }
//                    }
//                ]
//            }
//        ],
//        plugins: [
//            // double click to edit cell
//            Ext.create('Ext.grid.plugin.CellEditing', {
//                clicksToEdit: 2
//            })
//        ],
//        renderTo: Ext.getBody(),
//        listeners: {
//            afterrender: function () {
//                var menu = this.headerCt.getMenu();
//                menu.add([
//                    {
//                        text: 'Reset to default',
//                        handler: function () {
//                            var columnDataIndex = menu.activeHeader.dataIndex;
//                            alert('TODO: custom item for column "' + columnDataIndex + '" was pressed');
//                        }
//                    }
//                ]);
//            },
//            selectionchange: function (model, selected) {
//                var nodeList = [];
//                for (var i = 0; i < selected.length; i++) {
//                    nodeList.push(selected[i].getData().Id);
//                }
//                _this.trigger('vertices:select', {vertices: nodeList, sender: _this});
//            }
//        }
//    });
//
//    this.accordionPanel = Ext.create('Ext.container.Container', {
//        layout: 'accordion',
//        width: 200,
//        border: '0 0 0 1',
//        style: {
//            borderColor: 'lightgray',
//            borderStyle: 'solid'
//        },
//        items: [
//            {
//                xtype: 'panel',
//                title: 'Edit attributes',
//                layout: {
//                    pack: 'hbox'
//                },
//                items: editAttrFormPanel
//            },
//            {
//                xtype: 'panel',
//                title: 'Edit rows',
//                items: modifyRowsFormPanel
//            }
//        ]
//    });
//
//    Ext.create('Ext.window.Window', {
//        id: "edit" + this.type + "AttrWindow",
//        title: "Edit " + this.type.toLowerCase() + " attributes",
//        width: 800,
//        height: 600,
//        layout: {
//            type: 'hbox',
//            align: 'stretch'
//        },
//        items: [this.grid, this.accordionPanel]
//    }).show();
//
//    this.selectRowsById(selectedNodes);
//    this.updateNumRowsLabel();
//};
//
////XXX DEPRECATED
//AttributeEditWidget.prototype.addAttribute = function () {
//    var _this = this;
//
//    var items = [
//        {
//            xtype: 'textfield',
//            id: this.id + "newAttrName",
//            fieldLabel: 'Name',
//            allowBlank: false
//        },
//        {
//            id: this.id + "newAttrType",
//            combineErrors: true,
//            msgTarget: 'side',
//            fieldLabel: 'Type',
//            defaults: {hideLabel: true},
//            width: 50,
//            xtype: 'combo',
//            mode: 'local',
//            value: 'string',
//            editable: false,
//            margin: "15 0 0 0",
//            displayField: 'name',
//            valueField: 'value',
//            store: Ext.create('Ext.data.Store', {
//                fields: [ 'name', 'value' ],
//                data: [
//                    {
//                        name: 'Number',
//                        value: 'float'
//                    },
//                    {
//                        name: 'String',
//                        value: 'string'
//                    },
//                    {
//                        name: 'Boolean',
//                        value: 'boolean'
//                    }
//                ]
//            })
//        },
//        {
//            xtype: 'textfield',
//            fieldLabel: 'DefalutValue',
//            id: this.id + "newAttrDef",
//            margin: "19 0 0 0",
//            allowBlank: false
//        }
//    ];
//
//    var formPanel = Ext.create('Ext.form.Panel', {
//        border: false,
//        bodyPadding: "15 15 15 15",
//        layout: {
//            type: 'vbox',
//            align: 'stretch'
//        },
//        items: items,
//        buttons: [
//            {
//                text: 'Ok',
//                formBind: true, // only enabled once the form is valid
//                disabled: true,
//                handler: function () {
//                    var name = Ext.getCmp(_this.id + "newAttrName").getValue();
//                    var type = Ext.getCmp(_this.id + "newAttrType").getValue();
//                    var defaultValue = Ext.getCmp(_this.id + "newAttrDef").getValue();
//
//                    _this.attrMan.addAttribute(name, type, defaultValue);
//                    _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
//
//                    // set default value for new attribute in existing rows
//                    if (_this.attrMan.getNumberOfRows() > 0) {
//                        _this.grid.getSelectionModel().selectAll();
//                        _this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length - 1].name, defaultValue);
//                        _this.grid.getSelectionModel().deselectAll();
//                    }
//
//                    Ext.getCmp("addAttrWindow").close();
//                }
//            }
//        ]
//    });
//
//    Ext.create('widget.window', {
//        id: "addAttrWindow",
//        title: "Add attribute",
//        modal: true,
//        height: 225,
//        width: 420,
//        layout: "fit",
//        items: formPanel
//    }).show();
//};
//
////---------------------------getAttributeNames---------------------------------//
////Descripcion:
////	Coge los nombres de los atributos y los pasa en el formato
////	adecuado para poder pasarselo al combobox del search
////Parametros: (ninguno)
////-----------------------------------------------------------------------------//
//AttributeEditWidget.prototype.getAttributeNames = function () {
//    var names = [];
//    var nameList = this.attrMan.getAttrNameList();
//    for (var i = 0; i < nameList.length; i++) {
//        var attr = nameList[i];
//        if (attr != "Id" && attr != "Name") {
//            names.push({"name": attr});
//        }
//    }
//    return names;
//};
//
//
//AttributeEditWidget.prototype.selectRowsById = function (arrayNodes) {
//    this.grid.getSelectionModel().deselectAll();
//    for (var i = 0; i < arrayNodes.length; i++) {
//        var idx = this.attrMan.store.find("Id", arrayNodes[i].id);
//        this.grid.getSelectionModel().select(idx, true);
//    }
//};
//
//AttributeEditWidget.prototype.updateNumRowsLabel = function () {
//    Ext.getCmp(this.id + "numRowsLabel").setText(this.attrMan.getNumberOfRows() + " rows");
//};
