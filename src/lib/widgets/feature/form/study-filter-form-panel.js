/*
 * Copyright (c) 2014 Francisco Salavert (SGL-CIPF)
 * Copyright (c) 2014 Alejandro Alemán (SGL-CIPF)
 * Copyright (c) 2014 Ignacio Medina (EBI-EMBL)
 *
 * This file is part of JSorolla.
 *
 * JSorolla is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JSorolla is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JSorolla. If not, see <http://www.gnu.org/licenses/>.
 */
function StudyFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("StudyFilterFormPanel");
    this.target;
    this.autoRender = true;
    this.title = "Select Studies";
//    this.studies = [];
//    this.studiesStore;
    this.border = true;
    this.height = 300;
    this.collapsed = false;


    /**
     * TO BE REMOVED!
     * @type {Ext.data.Store}
     */
    this.studiesStore = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {
            type: 'memory'
        },
        fields: [
            {name: 'studyName', type: 'string'},
            {name: 'studyId', type: 'string'}
        ],
        autoLoad: false
    });



    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);


    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }

}

StudyFilterFormPanel.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing " + this.id);

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);

        this.panel = this._createPanel();
    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.panel.render(this.div);
    },
    _createPanel: function () {
        var _this = this;
//        var store = Ext.create('Ext.data.Store', {
//            fields: [
//                {name: 'studyName', type: 'string'},
//                {name: 'studyId', type: 'string'}
//            ],
//            storeId: this.id + 'ConsequenceTypeSelectorStore',
//            data: []
//        });

//        var cbg = Ext.create('Ext.form.CheckboxGroup', {
////            layout: 'hbox',
//            autoScroll: true,
//            defaultType: 'checkboxfield'
//        });
//
//        var cbgItems = [];
//
//        for (var i = 0; i < this.studies.length; i++) {
//            var study = this.studies[i];
//            cbgItems.push(Ext.create('Ext.form.field.Checkbox', {
//                boxLabel: study.studyName,
//                name: 'studies',
//                inputValue: study.studyId,
//                margin: '0 0 0 5',
//                checked: false
//            }));
//        }
//
//        cbg.add(cbgItems);

//        this.tagField = Ext.create('Ext.form.field.Tag', {
////            fieldLabel: 'Select a study',
////                    labelAlign: 'top',
//            store: this.studiesStore,
//            reference: this.id + 'ConsequenceTypeSelectorStore',
//            displayField: 'studyName',
//            valueField: 'studyId',
//            filterPickList: true,
//            queryMode: 'local',
//            publishes: 'value',
//            flex: 1,
//            grow: false,
//            autoScroll: true,
//            name: 'studies',
//            listeners: {
//                change: function () {
//                    var form = this.up();
//                    if (form) {
//                        form.update();
//                    }
//                }
//            }
//        });

//
//        this.studiesStore = Ext.create('Ext.data.Store', {
//            pageSize: 50,
//            proxy: {
//                type: 'memory'
//            },
//            fields: [
//                {name: 'studyName', type: 'string'},
//                {name: 'studyId', type: 'string'}
//            ],
//            autoLoad: false
//        });

        var studySearchField = Ext.create('Ext.form.field.Text', {
            emptyText: 'search',
            listeners: {
                change: function () {
                    var value = this.getValue();
                    if (value == "") {
                        _this.studiesStore.clearFilter();
                    } else {
                        var regex = new RegExp(value, "i");
                        _this.studiesStore.filterBy(function (e) {
                            return regex.test(e.get('studyName'));
                        });
                    }
                }
            }
        });

        var grid = Ext.create('Ext.grid.Panel', {
                store: this.studiesStore,
                border: this.border,
                loadMask: true,
                hideHeaders: true,
                plugins: 'bufferedrenderer',
                features: [
                    {ftype: 'summary'}
                ],
                height: this.height - 70,
                viewConfig: {
                    emptyText: 'No studies found',
                    enableTextSelection: true,
                    markDirty: false,
                    listeners: {
                        itemclick: function (este, record) {
                        },
                        itemcontextmenu: function (este, record, item, index, e) {

                        }
                    }
                },
                selModel: {
                    listeners: {
                        'selectionchange': function (selModel, selectedRecord) {

                        }
                    }
                },
                columns: [
                    {
                        text: 'Active',
                        xtype: 'checkcolumn',
                        dataIndex: 'uiactive',
                        width: 50
                    },
                    {
                        text: "Name",
                        dataIndex: 'studyName',
//                        flex: 10,
                        width: 500,
                        xtype: 'templatecolumn',
                        tpl:'<tpl>{studyName}(<a href="http://www.ebi.ac.uk/ena/data/view/{studyId}" target="_blank">{studyId}</a>)</tpl>'
                    }
//                    {
//                        text: "ID",
//                        dataIndex: 'studyId',
//                        flex: 3
//                    }
                ]
            }
        );


        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            border: false,
            title: this.title,
            height: this.height,
            collapsed: this.collapsed,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                studySearchField,
                grid
            ]
        });

        return form;
    },
    getPanel: function () {
        return this.panel;
    },
    getValues: function () {
        var values = [];
        var records = this.studiesStore.query().items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var active = record.get('uiactive');
            if (active) {
                values.push(record.get('studyId'))
            }
        }
        var res = {};
        if (values.length > 0) {
            res['studies'] = values;
        }
        return res;
    },
    clear: function () {
        this.panel.reset();
    }
}
