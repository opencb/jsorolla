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
            _this.reconfigureComponents();
        });

        this.comboStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.attrMan.attributes
        });

        /****** UI ******/

        var modifyRowsFormPanel = Ext.create('Ext.form.Panel', {
            title: 'Edit multiple values',
            bodyPadding: "10 0 10 10",
            layout: 'vbox',
            items: [
                this.createAttributesCombo(),
                this.createValueField(),
                {
                    xtype: 'button',
                    width: 170,
                    text: 'Apply on selected rows',
                    formBind: true, // only enabled if the form is valid
                    disabled: true,
                    handler: function (bt) {
                        var newValue = bt.prev().getValue();
                        var selectedAttr = bt.prev().prev().getValue();
                        var selectedRecords = _this.grid.getSelectionModel().getSelection();
                        _this.attrMan.setValueByAttributeAndRecords(selectedRecords, selectedAttr, newValue);
                    }
                }
            ]
        });
        var addAttributeFormPanel = Ext.create('Ext.form.Panel', {
            title: 'Add attribute',
            bodyPadding: "10 0 10 10",
            layout: 'vbox',
            items: [
                {
                    xtype: 'textfield',
                    width: 170,
                    fieldLabel: 'Name',
                    labelWidth: 50,
                    allowBlank: false
                },
                {
                    xtype: 'combo',
                    store: ['string'],
                    value: 'string',
                    width: 170,
                    fieldLabel: 'Type',
                    labelWidth: 50,
                    editable: false,
                    queryMode: 'local',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    width: 170,
                    value: '',
                    fieldLabel: 'Default value',
                    labelWidth: 50
                },
                {
                    xtype: 'button',
                    width: 170,
                    text: 'Apply',
                    formBind: true, // only enabled if the form is valid
                    disabled: true,
                    handler: function (bt) {
                        var name = bt.prev().prev().prev().getValue();
                        var type = bt.prev().prev().getValue();
                        var defaultValue = bt.prev().getValue();
                        var created = _this.attrMan.addAttribute({name: name, type: type, defaultValue: defaultValue});
                        var msg = (created === false) ? '<span class="err">Name already exists.</span>' : '';
                        bt.next().update(msg);
                    }
                },
                {
                    xtype: 'box',
                    margin: "10 0 0 0"
                }
            ]
        });

        var removeAttributeFormPanel = Ext.create('Ext.form.Panel', {
            title: 'Remove attribute',
            bodyPadding: "10 0 10 10",
            layout: 'vbox',
            items: [
                this.createAttributesCombo(),
                {
                    xtype: 'button',
                    width: 170,
                    text: 'Apply',
                    formBind: true, // only enabled if the form is valid
                    disabled: true,
                    handler: function (bt) {
                        var attributeName = bt.prev().getValue();
                        var removed = _this.attrMan.removeAttribute(attributeName);
                        var msg = (removed === false) ? '<span class="err">Impossible to remove.</span>' : '';
                        bt.next().update(msg);
                    }
                },
                {
                    xtype: 'box',
                    margin: "10 0 0 0"
                }
            ]
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'top',
            items: [
                {
                    xtype: 'button',
                    text: '<span style="font-size: 12px">Column visibility <span class="caret"></span></span>',
                    cls: 'bootstrap',
                    handler: function (bt, e) {
                        var menu = _this.grid.headerCt.getMenu().down('menuitem[text=Columns]').menu;
                        menu.showBy(bt);
                    }
                },
                '-',
                {
                    xtype: 'fieldcontainer',
                    defaultType: 'radiofield',
                    fieldLabel: 'View',
                    labelWidth: 20,
                    margin: '0 0 0 10',
                    defaults: {
                        margin: '0 0 0 10'
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'All nodes',
                            name: 'nodeselection',
                            inputValue: 'all'
                        },
                        {
                            boxLabel: 'Network selection',
                            name: 'nodeselection',
                            inputValue: 'selected'
                        }
                    ]
                },
                '->',
                {
                    xtype: 'tbtext',
                    text: '<span style="color:gray">Use double-click to edit</span>'
                }
            ]
        });


        this.grid = Ext.create('Ext.grid.Panel', {
            store: this.attrMan.store,
            columns: this.attrMan.columnsGrid,
            flex: 1,
            border: 0,
            selModel: {
                selType: 'rowmodel',
                mode: 'MULTI'
            },
            loadMask: true,
            plugins: ['bufferedrenderer',
                Ext.create('Ext.grid.plugin.CellEditing', {
                    // double click to edit cell
                    clicksToEdit: 2
                })
            ],
            listeners: {
                selectionchange: function (model, selected) {
                    var nodeList = [];
                    for (var i = 0; i < selected.length; i++) {
                        nodeList.push(selected[i].getData().Id);
                    }

                    _this.trigger('vertices:select', {vertices: nodeList, sender: _this});
                }
            },
            dockedItems: [toolbar]
        });

        this.accordionPanel = Ext.create('Ext.container.Container', {
            layout: 'accordion',
            width: 200,
            border: '0 1 0 0',
            style: {
                borderColor: 'lightgray',
                borderStyle: 'solid'
            },
            items: [
                modifyRowsFormPanel,
                addAttributeFormPanel,
                removeAttributeFormPanel,
//                editAttrFormPanel
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
            items: [this.accordionPanel, this.grid],
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
            _this.reconfigureComponents();
        });
        this.reconfigureComponents();
    },
    reconfigureComponents: function () {
        console.log('refresh ' + this.id);
        this.grid.reconfigure(this.attrMan.store, this.attrMan.columnsGrid);

        this.reloadComboStore();
    },
    reloadComboStore: function () {
        this.comboStore.loadData(this.attrMan.attributes);
    },
    select: function (vertices) {
        var selModel = this.grid.getSelectionModel();
        selModel.deselectAll();
        selModel.select(this.attrMan.getRecordsByVertices(vertices));
    },


    /** Create components **/
    createAttributesCombo: function () {
        return {
            xtype: 'combo',
            store: this.comboStore,
            displayField: 'name',
            valueField: 'name',
            width: 170,
            allowBlank: false,
            fieldLabel: 'Attribute',
            labelWidth: 50,
            editable: false,
            queryMode: 'local'
        }
    },
    createValueField: function () {
        return {
            xtype: 'textfield',
            width: 170,
            fieldLabel: 'Value',
            labelWidth: 50,
            allowBlank: false
        }
    }


}