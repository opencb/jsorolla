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

function AttributeLayoutConfigureWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('AttributeLayoutConfigureWidget');

    this.width = 400;
    this.height = 300;
    this.networkViewer;
    this.window;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.network = this.networkViewer.network;

    if (this.autoRender) {
        this.render();
    }
};

AttributeLayoutConfigureWidget.prototype = {
    render: function () {
        var _this = this;

        this.vertexAttributeManager = this.networkViewer.network.vertexAttributeManager;
        this.vertexAttributeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.vertexAttributeManager.attributes
        });
        this.vertexAttributeManager.on('change:attributes', function () {
            _this.vertexAttributeStore.loadData(_this.vertexAttributeManager.attributes);
        });

        this.xAtributeCombo = Ext.create('Ext.form.field.ComboBox', {
//            labelAlign: 'top',
            labelWidth: 70,
            fieldLabel: 'X',
            store: this.vertexAttributeStore,
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
                        //
                    }
                }
            }
        });

        this.yAtributeCombo = Ext.create('Ext.form.field.ComboBox', {
//            labelAlign: 'top',
            labelWidth: 70,
            fieldLabel: 'Y',
            store: this.vertexAttributeStore,
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
                        //
                    }
                }
            }
        });

        this.normalizeCheckBox = Ext.create('Ext.form.field.Checkbox', {
            fieldLabel: 'Normalize',
            labelWidth: 70,
            checked: true
        });

        this.window = Ext.create('Ext.window.Window', {
            id: this.id + 'window',
            title: 'Attribute layout configuration',
            bodyStyle: {
                backgroundColor: 'white',
                fontFamily: 'Oxygen'
            },
            bodyPadding: 10,
            width: this.width,
            closable: false,
            minimizable: true,
            constrain: true,
            collapsible: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'box',
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderBottom: '1px solid lightgray',
                        marginBottom: '10px'
                    },
                    html: 'Select attribute as node position'
                },
                {
                    xtype: 'container',
                    style: {
                        marginBottom: '20px'
                    },
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    defaults: { margin: '1 0 1 0' },
                    items: [
                        this.xAtributeCombo,
                        this.yAtributeCombo,
                        this.normalizeCheckBox
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Apply',
                    handler: function () {
                        _this.setLayout();
                    }
                }
            ],
            listeners: {
                minimize: function () {
                    this.hide();
                }
            }
        });
    },
    draw: function () {
        var _this = this;

    },
    show: function () {
        this.window.show();
    },
    hide: function () {
        this.window.hide();
    },
    setLayout: function () {
        var _this = this;
        var xAttributeName = this.xAtributeCombo.getValue();
        var yAttributeName = this.yAtributeCombo.getValue();

        var normalize = this.normalizeCheckBox.getValue();

        if (normalize) {//normalized
            var xMax, xMin, yMax, yMin;
            this.vertexAttributeManager.eachRecord(function (record) {
                var x = parseFloat(record.get(xAttributeName));
                var y = parseFloat(record.get(yAttributeName));

                if (!isNaN(x)) {
                    if (typeof xMax === 'undefined') {
                        xMax = x;
                        xMin = x;
                    }
                    xMax = Math.max(x, xMax);
                    xMin = Math.min(x, xMin);
                }
                if (!isNaN(y)) {
                    if (typeof yMax === 'undefined') {
                        yMax = y;
                        yMin = y;
                    }
                    yMax = Math.max(y, yMax);
                    yMin = Math.min(y, yMin);
                }
            });
            var xRange = xMax - xMin;
            var yRange = yMax - yMin;

            var width = this.networkViewer.getLayoutWidth();
            var height = this.networkViewer.getLayoutHeight();

            this.vertexAttributeManager.eachRecord(function (record) {
                var x = parseFloat(record.get(xAttributeName));
                var y = parseFloat(record.get(yAttributeName));

                //zero based
                x = (x - xMin) * width / xRange;
                y = (y - yMin) * height / yRange;

                if (!isNaN(x) && !isNaN(y)) {
                    _this.network.setVertexCoordsById(record.get("Id"), x, y);
                }
            });


        } else {

            this.vertexAttributeManager.eachRecord(function (record) {
                var x = parseFloat(record.get(xAttributeName));
                var y = parseFloat(record.get(yAttributeName));
                if (!isNaN(x) && !isNaN(y)) {
                    _this.network.setVertexCoordsById(record.get("Id"), x, y);
                }
            });
        }

    }
}