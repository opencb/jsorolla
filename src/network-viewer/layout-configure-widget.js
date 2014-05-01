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

function LayoutConfigureWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('LayoutConfigureWidget');

    this.width = 400;
    this.height = 300;
    this.window;
    this.networkViewer;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.network = this.networkViewer.network;

    if (this.autoRender) {
        this.render();
    }
};

LayoutConfigureWidget.prototype = {
    render: function () {
        var _this = this;

        this.edgeAttributeManager = this.network.edgeAttributeManager;
        this.edgeAttributeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'Non weighted'}
            ].concat(this.edgeAttributeManager.attributes)
        });
        this.edgeAttributeManager.on('change:attributes', function () {
            _this.edgeAttributeStore.loadData([
                {name: 'Non weighted'}
            ].concat(_this.edgeAttributeManager.attributes));
        });

        this.vertexAttributeManager = this.network.vertexAttributeManager;
        this.vertexAttributeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'Non weighted'}
            ].concat(this.vertexAttributeManager.attributes)
        });
        this.vertexAttributeManager.on('change:attributes', function () {
            _this.vertexAttributeStore.loadData([
                {name: 'Non weighted'}
            ].concat(_this.vertexAttributeManager.attributes));
        });

        var nodeChargeAttributeCombo = this.createComponent({
            text: 'Charge',
            store: this.vertexAttributeStore,
            value: -30,
//            maxValue: 100,
//            minValue: -100,
            step: 1,
            changeNumberField: function () {
            },
            changeCombo: function () {
            }

        });

        var edgeDistanceAttributeCombo = this.createComponent({
            text: 'Link distance',
            store: this.edgeAttributeStore,
            value: 20,
//            maxValue: 100,
            minValue: 0,
            step: 1,
            changeNumberField: function () {
            },
            changeCombo: function () {
            }
        });

        var edgeStrengthAttributeCombo = this.createComponent({
            text: 'Link strength',
            store: this.edgeAttributeStore,
            value: 1,
            maxValue: 1,
            minValue: 0,
            step: 0.1,
            changeNumberField: function () {
            },
            changeCombo: function () {
            }
        });

        var frictionField = Ext.create('Ext.form.field.Number', {
            xtype: 'numberfield',
            fieldLabel: '<span style="font-family: Oxygen">Friction</span>',
            value: 0.9,
            maxValue: 1,
            minValue: 0,
            step: 0.1,
            listeners: {
                change: {
                    buffer: 100,
                    fn: function (field, newValue) {
                        if (newValue != null) {
                            console.log(newValue);
                        }
                    }
                }
            }
        });
        var gravityField = Ext.create('Ext.form.field.Number', {
            xtype: 'numberfield',
            fieldLabel: '<span style="font-family: Oxygen">Gravity</span>',
            value: 0.1,
//                            maxValue: ,
            minValue: 0,
            step: 0.1,
            listeners: {
                change: {
                    buffer: 100,
                    fn: function (field, newValue) {
                        if (newValue != null) {
                            console.log(newValue);
                        }
                    }
                }
            }
        });
        var chargeDistanceField = Ext.create('Ext.form.field.Number', {
            xtype: 'numberfield',
            fieldLabel: '<span style="font-family: Oxygen">Charge distance</span>',
            value: 500,
//            maxValue: 100,
            minValue: 0,
            step: 1,
            listeners: {
                change: {
                    buffer: 100,
                    fn: function (field, newValue) {
                        if (newValue != null) {
                            console.log(newValue);
                        }
                    }
                }
            }
        });


        this.window = Ext.create('Ext.window.Window', {
            id: this.id + 'window',
            title: 'Force directed layout configuration',
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
                        textAlign: 'right'
                    },
                    html: '<a target="_blank" href="https://github.com/mbostock/d3/wiki/Force-Layout">About force directed layout </a>'
                },
                {
                    xtype: 'box',
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderBottom: '1px solid lightgray',
                        marginBottom: '10px'
                    },
                    html: 'Node related settings'
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
                        nodeChargeAttributeCombo
                    ]
                },
                {
                    xtype: 'box',
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderBottom: '1px solid lightgray',
                        marginBottom: '10px'
                    },
                    html: 'Edge related settings'
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    defaults: { margin: '1 0 1 0' },
                    items: [
                        edgeDistanceAttributeCombo,
                        edgeStrengthAttributeCombo
                    ]
                },
                {
                    xtype: 'box',
                    style: {
                        fontSize: '13px',
                        fontWeight: 'bold',
                        borderBottom: '1px solid lightgray',
                        marginBottom: '10px',
                        marginTop: '20px'
                    },
                    html: 'Global settings'
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    defaults: { margin: '1 0 1 0' },
                    items: [
                        frictionField,
                        gravityField,
                        chargeDistanceField

                    ]
                }
            ],
            buttons: [
                {
                    text: 'Apply',
                    handler: function () {

                        var linkDistanceValue = edgeDistanceAttributeCombo.down('combo').getValue();
                        var linkStrengthValue = edgeStrengthAttributeCombo.down('combo').getValue();
                        var chargeValue = nodeChargeAttributeCombo.down('combo').getValue();

                        var linkDistanceDefaultValue = edgeDistanceAttributeCombo.down('numberfield').getValue();
                        var linkStrengthDefaultValue = edgeStrengthAttributeCombo.down('numberfield').getValue();
                        var chargeDefaultValue = nodeChargeAttributeCombo.down('numberfield').getValue();

                        linkDistanceValue = linkDistanceValue === 'Non weighted' ? linkDistanceDefaultValue : linkDistanceValue;
                        linkStrengthValue = linkStrengthValue === 'Non weighted' ? linkStrengthDefaultValue : linkStrengthValue;
                        chargeValue = chargeValue === 'Non weighted' ? chargeDefaultValue : chargeValue;

                        GraphLayout.force({
                            network: _this.network,
                            width: _this.networkViewer.networkSvgLayout.getWidth(),
                            height: _this.networkViewer.networkSvgLayout.getHeight(),
                            linkDistance: linkDistanceValue,
                            linkStrength: linkStrengthValue,
                            charge: chargeValue,
                            multipliers: {
                                linkDistance: linkDistanceDefaultValue,
                                linkStrength: linkStrengthDefaultValue,
                                charge: chargeDefaultValue
                            },
                            friction: frictionField.getValue(),
                            gravity: gravityField.getValue(),
                            chargeDistance: chargeDistanceField.getValue(),

                            simulation: false,
                            end: function (verticesArray) {
                                for (var i = 0, l = verticesArray.length; i < l; i++) {
                                    var v = verticesArray[i];
                                    _this.networkViewer.setVertexCoords(v.id, v.x, v.y);
                                }
                            }
                        });
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
    createComponent: function (args) {
        var _this = this;
        return Ext.create('Ext.container.Container', {
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'numberfield',
                    fieldLabel: '<span style="font-family: Oxygen">' + args.text + '</span>',
                    value: args.value,
                    maxValue: args.maxValue,
                    minValue: args.minValue,
                    step: args.step,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    args.changeNumberField(newValue);
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'combo',
                    store: args.store,
                    displayField: 'name',
                    valueField: 'name',
                    width: 100,
                    queryMode: 'local',
                    forceSelection: true,
                    editable: false,
                    listeners: {
                        afterrender: function () {
                            this.select(this.getStore().getAt(0));
                        },
                        change: function (field, e) {
                            var value = field.getValue();
                            if (value != null) {
                                args.changeCombo(value);
                            }
                        }
                    }
                }
            ]
        })
    }
}