/*
 * Copyright (c) 2012-2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012-2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012-2013 Ignacio Medina (ICM-CIPF)
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

function EditionBar(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('edition-bar');

    //set default args
    this.targetId;
    this.autoRender = false;
    this.zoom = 100;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

EditionBar.prototype = {
    render: function (targetId) {
        var _this = this;
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="edition-bar" class="unselectable"></div>')[0];
        $(this.targetDiv).append(this.div);


        /////////////////
        /////////////////
        /////////////////
        /////////////////
        /////////////////
        /////////////////
        /////////////////

        this.textBoxName = Ext.create('Ext.form.field.Text', {
            emptyText: 'Name (node0)',
//		value : 'node0',
            width: 100,
            enableKeyEvents: true,
            disabled: true,
            listeners: {
                keyup: function () {
                    _this.trigger('nodeName:change', this.getValue())
                }
            }
        });

        this.textBoxLabel = Ext.create('Ext.form.field.Text', {
            emptyText: 'Node label',
            width: 100,
            enableKeyEvents: true,
            disabled: true,
            listeners: {
                keyup: function () {
                    _this.trigger('nodeLabel:change', this.getValue())
                }
            }
        });

        this.textBoxEdgeName = Ext.create('Ext.form.field.Text', {
            emptyText: 'Edge name',
            width: 100,
            enableKeyEvents: true,
            disabled: true,
            listeners: {
                keyup: function () {
                    _this.trigger('edgeLabel:change', this.getValue())
                }
            }
        });

        this.edgeColorPicker = Ext.create('Ext.picker.Color', {
            value: '000000',
            listeners: {
                select: function (picker, selColor) {
                    _this.trigger('edgeColor:change', "#" + selColor)
                }
            }
        });

        this.edgeColorPickerButton = Ext.create('Ext.button.Button', {
            iconCls: 'icon-fill-color',
            tooltip: "Line color",
            disabled: true,
            menu: new Ext.menu.Menu({
                items: this.edgeColorPicker
            })
        });

        this.innerColorPicker = Ext.create('Ext.picker.Color', {
            value: '993300',
            listeners: {
                select: function (picker, selColor) {
                    _this.trigger('nodeColor:change', "#" + selColor)
                }
            }
        });

        this.colorPickerButton = Ext.create('Ext.button.Button', {
            iconCls: 'icon-fill-color',
            tooltip: "Color",
            disabled: true,
            menu: new Ext.menu.Menu({
                items: this.innerColorPicker
            })
        });

        this.strokeColorPicker = Ext.create('Ext.picker.Color', {
            value: '993300', // initial selected color
            listeners: {
                select: function (picker, selColor) {
                    _this.trigger('nodeStrokeColor:change', "#" + selColor)
                }
            }
        });

        this.strokeColorPickerButton = Ext.create('Ext.button.Button', {
            iconCls: 'icon-stroke-color',
            tooltip: "Stroke color",
            disabled: true,
            menu: new Ext.menu.Menu({
                items: this.strokeColorPicker
            })
        });

        this.comboSizeId = "Size";
        var buttons = this._createButtons({
            group: this.comboSizeId,
            data: [
                {
                    text: "1"
                },
                {
                    text: "2"
                },
                {
                    text: "3"
                },
                {
                    text: "4"
                },
                {
                    text: "5"
                },
                {
                    text: "6"
                },
                {
                    text: "7"
                },
                {
                    text: "8"
                },
                {
                    text: "10"
                },
                {
                    text: "12"
                },
                {
                    text: "14"
                },
                {
                    text: "16"
                },
                {
                    text: "18"
                },
                {
                    text: "22"
                },
                {
                    text: "28"
                },
                {
                    text: "36"
                },
                {
                    text: "72"
                }
            ]
        });

        this.comboSize = Ext.create('Ext.button.Button', {
            iconCls: 'icon-node-size',
            tooltip: this.comboSizeId,
            disabled: true,
            menu: {
                items: buttons,
                plain: true
            }
        });


        this.comboStrokeWidthId = "Stroke size";
        var buttons = this._createButtons({
            group: this.comboStrokeWidthId,
            data: [
                {
                    text: "1"
                },
                {
                    text: "2"
                },
                {
                    text: "3"
                },
                {
                    text: "4"
                },
                {
                    text: "5"
                },
                {
                    text: "6"
                },
                {
                    text: "7"
                },
                {
                    text: "8"
                },
                {
                    text: "10"
                },
                {
                    text: "12"
                },
                {
                    text: "14"
                },
                {
                    text: "16"
                },
                {
                    text: "18"
                },
                {
                    text: "22"
                },
                {
                    text: "28"
                },
                {
                    text: "36"
                },
                {
                    text: "72"
                }
            ]
        });
        this.comboStrokeWidth = Ext.create('Ext.button.Button', {
            iconCls: 'icon-stroke-size',
            tooltip: this.comboStrokeWidthId,
            disabled: true,
            menu: {
                items: buttons,
                plain: true
            }
        });

        this.comboBoxOpacityId = "Opacity";
        var buttons = this._createButtons({
            group: this.comboBoxOpacityId,
            data: [
                {
                    text: "none"
                },
                {
                    text: "low"
                },
                {
                    text: "medium"
                },
                {
                    text: "high"
                },
                {
                    text: "invisible"
                }
            ]
        });
        this.comboBoxOpacity = Ext.create('Ext.button.Button', {
            iconCls: 'icon-node-opacity',
            tooltip: this.comboBoxOpacityId,
            disabled: true,
            menu: {
                items: buttons,
                plain: true
            }
        });

        this.comboBoxEdgeId = "Edge type";
        var buttons = this._createButtons({
            group: this.comboBoxEdgeId,
            data: [
                {
                    text: "directed"
                },
                {
                    text: "odirected"
                },
                {
                    text: "undirected"
                },
                {
                    text: "inhibited"
                },
                {
                    text: "dot"
                },
                {
                    text: "odot"
                }
            ]
        });
        this.comboBoxEdge = Ext.create('Ext.button.Button', {
            iconCls: 'icon-edge-type',
            tooltip: this.comboBoxEdgeId,
            disabled: true,
            menu: {
                items: buttons,
                plain: true
            }
        });

        this.comboBoxNodeId = "Node shape";
        var buttons = this._createButtons({
            group: this.comboBoxNodeId,
            data: [
                {
                    text: "circle"
                },
                {
                    text: "square"
                },
                {
                    text: "ellipse"
                },
                {
                    text: "rectangle"
                }
            ]
        });
        this.comboBoxNode = Ext.create('Ext.button.Button', {
            iconCls: 'icon-node-shape',
            tooltip: this.comboBoxNodeId,
            disabled: true,
            menu: {
                items: buttons,
                plain: true
            }
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.id + "navToolbar",
            renderTo: $(this.div).attr('id'),
            cls: 'gm-navigation-bar',
            region: "north",
            width: '100%',
            height: 34,
            border: false,
            items: [
                {
                    id: 'selectButton',
                    iconCls: 'icon-mouse-select',
                    tooltip: 'Select',
                    toggleGroup: 'action',
                    margin: '0 0 0 3',
                    pressed: 'true',
                    handler: function () {
                        this.toggle(true);
                        _this.hideNodeButtons();
                        _this.hideEdgeButtons();
                        _this.trigger('mode:select', {sender: _this});
//                        _this.networkViewer.handleActionMenu("select");
                    }
                },
                '-',
                {
                    iconCls: 'icon-add',
                    tooltip: 'Add node',
                    toggleGroup: 'action',
                    handler: function () {
                        this.toggle(true);
                        _this.showNodeButtons();
                        _this.hideEdgeButtons();
                        _this.trigger('mode:add', {sender: _this});
//                        _this.networkViewer.handleActionMenu("add");
                    }
                },
                {
                    iconCls: 'icon-link',
                    tooltip: 'Join nodes',
                    toggleGroup: 'action',
                    handler: function () {
                        this.toggle(true);
                        _this.hideNodeButtons();
                        _this.showEdgeButtons();
                        _this.trigger('mode:join', {sender: _this});
//                        _this.networkViewer.handleActionMenu("join");
                    }
                },
                {
                    iconCls: 'icon-delete',
                    tooltip: 'Delete',
                    toggleGroup: 'action',
                    handler: function () {
                        this.toggle(true);
                        _this.hideNodeButtons();
                        _this.hideEdgeButtons();
                        _this.trigger('mode:delete', {sender: _this});
//                        _this.networkViewer.handleActionMenu("delete");
                    }
                },

                "-",
                this.comboBoxNode,
                this.comboSize,
                this.colorPickerButton,
                this.comboStrokeWidth,
                this.strokeColorPickerButton,
                this.comboBoxOpacity,
                this.textBoxName,
                this.textBoxLabel,
                this.comboBoxEdge,
                this.edgeColorPickerButton,
                this.textBoxEdgeName
            ]
        });
        this.rendered = true;
    },
    draw: function () {

    },
    setNodeButtons: function (args) {
        if (args.size) {
            var shapes = {
                "circle": 0,
                "square": 1,
                "ellipse": 2,
                "rectangle": 3
            };
            this.comboBoxNode.menu.items.items[shapes[args.shape]].setChecked(true);// || null;

            var sizes = {
                "1": 0,
                "2": 1,
                "3": 2,
                "4": 3,
                "5": 4,
                "6": 5,
                "7": 6,
                "8": 7,
                "10": 8,
                "12": 9,
                "14": 10,
                "16": 11,
                "18": 12,
                "22": 13,
                "28": 14,
                "36": 15,
                "72": 16
            };
            this.comboSize.menu.items.items[sizes[args.size]].setChecked(true);
            this.comboStrokeWidth.menu.items.items[sizes[args.strokeWidth]].setChecked(true);

            this.innerColorPicker.select(args.color, true);
            this.strokeColorPicker.select(args.strokeColor, true);

            var opacities = {
                "1": 0,
                "0.8": 1,
                "0.5": 2,
                "0.2": 3,
                "0": 4
            };
            this.comboBoxOpacity.menu.items.items[opacities[args.opacity]].setChecked(true);

            this.textBoxName.setValue(args.name);
            if (args.label != "") this.textBoxLabel.setValue(args.label);
        }
    },
    unsetNodeButtons: function () {
        for (var i = 0, len = this.comboBoxNode.menu.items.items.length; i < len; i++) {
            this.comboBoxNode.menu.items.items[i].setChecked(false);
        }

        for (var i = 0, len = this.comboSize.menu.items.items.length; i < len; i++) {
            this.comboSize.menu.items.items[i].setChecked(false);
        }

        for (var i = 0, len = this.comboStrokeWidth.menu.items.items.length; i < len; i++) {
            this.comboStrokeWidth.menu.items.items[i].setChecked(false);
        }

        this.innerColorPicker.select("#", true);

        this.strokeColorPicker.select("#", true);

        for (var i = 0, len = this.comboBoxOpacity.menu.items.items.length; i < len; i++) {
            this.comboBoxOpacity.menu.items.items[i].setChecked(false);
        }

        this.textBoxName.setValue("");
        this.textBoxLabel.setValue("");
    },
    showNodeButtons: function () {
        this.textBoxName.enable();
        this.textBoxLabel.enable();
        this.strokeColorPickerButton.enable();
        this.colorPickerButton.enable();
        this.comboBoxOpacity.enable();
        this.comboSize.enable();
        this.comboStrokeWidth.enable();
        this.comboBoxNode.enable();
    },
    setEdgeButtons: function (args) {
        var types = {
            "directed": 0,
            "odirected": 1,
            "undirected": 2,
            "inhibited": 3,
            "dot": 4,
            "odot": 5
        };
        this.comboBoxEdge.menu.items.items[types[args.type]].setChecked(true);

        this.textBoxEdgeName.setValue(args.label);

        this.edgeColorPicker.select(args.color, true);
    },
    unsetEdgeButtons: function () {
        for (var i = 0, len = this.comboStrokeWidth.menu.items.items.length; i < len; i++) {
            this.comboBoxEdge.menu.items.items[i].setChecked(false);
        }

        this.textBoxEdgeName.setValue("");

        this.edgeColorPicker.select("#", true);
    },
    showEdgeButtons: function () {
        this.comboBoxEdge.enable();
        this.textBoxEdgeName.enable();
        this.edgeColorPickerButton.enable();
    },
    hideNodeButtons: function () {
        this.textBoxName.disable();
        this.textBoxLabel.disable();
        this.strokeColorPickerButton.disable();
        this.colorPickerButton.disable();
        this.comboBoxOpacity.disable();
        this.comboSize.disable();
        this.comboStrokeWidth.disable();
        this.comboBoxNode.disable();
    },
    hideEdgeButtons: function () {
        this.comboBoxEdge.disable();
        this.textBoxEdgeName.disable();
        this.edgeColorPickerButton.disable();
    },
    onSelect: function () {
        var nodesSelectedCount = this.networkWidget.getSelectedVertices().length;
        var edgesSelectedCount = this.networkWidget.getSelectedEdges().length;

        if ((nodesSelectedCount > 0)) {
            // this.comboBoxEdge.setV([{name:"directed"},{name:"odirected"},{name:"undirected"},{name:"inhibited"},{name:"dot"},{name:"odot"}]);
            this.textBoxName.enable(true);
            this.textBoxLabel.enable(true);
            if (edgesSelectedCount > 0) {
                this.strokeColorPickerButton.disable(false);
                // this.comboEdgeType.disable(false);
            }
        }

        /** Solo un nodo seleccionado * */
        if ((nodesSelectedCount == 1) && (edgesSelectedCount == 0)) {
            this.textBoxName.enable(true);
            this.textBoxLabel.enable(true);
            this.strokeColorPickerButton.enable(true);
            this.colorPickerButton.enable(true);
            this.comboBoxNode.enable(true);
            this.comboBoxOpacity.enable(true);
            this.comboBoxEdge.disable(true);
            this.comboSize.enable(true);
            this.comboStrokeWidth.enable(true);
            this.textBoxName.setValue(this.networkWidget.getDataset()
                .getVertexById(this.networkWidget.getSelectedVertices()[0])
                .getName());

            // var x =
            // this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize();
            // var y = this.comboSize.view.store.findRecord("name",x);
            // this.comboSize.view.getSelectionModel().select([y]);

            // this.comboSize.setValue(this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize()+"");
        }
        /** Solo una arista seleccionado * */
        if ((nodesSelectedCount == 0) && (edgesSelectedCount >= 1)) {
            // this.textBoxName.enable(true);

            // this.strokeColorPickerButton.disable(false);
            this.colorPickerButton.enable(true);
            this.comboBoxOpacity.enable(true);
            this.comboBoxEdge.enable(true);
            this.comboSize.enable(true);
            this.comboBoxNode.disable(true);
            // this.comboEdgeType.enable(true);
            // this.textBoxName.disable(false);
        }
    },

//    changeOpacity: function (opacityString) {
//        var opacity = 1;
//        switch (opacityString) {
//            case "none" :
//                opacity = 1;
//                break;
//            case "low" :
//                opacity = 0.8;
//                break;
//            case "medium" :
//                opacity = 0.5;
//                break;
//            case "high" :
//                opacity = 0.2;
//                break;
//            case "invisible" :
//                opacity = 0;
//                break;
//        }
//
//
//    },
    changeStroke: function (color) {
        for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
            this.networkWidget.setVertexStroke(this.networkWidget
                .getSelectedVertices()[i], color);
        }
    },
    changeStrokeWidth: function (value) {
        // debugger
        for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
            this.networkWidget.getFormatter().getVertexById(this.networkWidget
                .getSelectedVertices()[i]).getDefault().setStrokeWidth(value);
        }

        for (var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
            // this.networkWidget.getSelectedEdges()[i].getDefault().setStrokeWidth(value);

            this.networkWidget.getFormatter().getEdgeById(this.networkWidget
                .getSelectedEdges()[i]).getDefault().setStrokeWidth(value);
        }

        // for ( var i = 0; i < this.networkWidget.getSelectedVertices().length;
        // i++) {
        // this.networkWidget.setVertexFill(this.networkWidget.getSelectedVertices()[i],
        // color);
        // }

        // for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
        // this.networkWidget.setEdgeStroke(this.networkWidget.getSelectedEdges()[i],
        // color);
        // }
    },
    changeColor: function (color) {
        for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
            this.networkWidget.setVertexFill(this.networkWidget
                .getSelectedVertices()[i], color);
        }

        for (var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
            this.networkWidget.setEdgeStroke(
                this.networkWidget.getSelectedEdges()[i], color);
        }
    },
    changeName: function (name) {
        for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
            this.networkWidget.getDataset().getVertexById(this.networkWidget
                .getSelectedVertices()[i]).setName(name);
        }
    },
    _createButtons: function (config) {
        var _this = this;
        var buttons = new Array();
        for (var i = 0; i < config.data.length; i++) {
            var btn = {
                // xtype:'button',
                xtype: 'menucheckitem',
                text: config.data[i].text,
                // checked:false,
                // cls:"bio-toolbar greyborder",
                // overCls:"list-item-hover",
                group: config.group, // only one pressed
                handler: function (este) {
                    _this._handleButtons({
                        text: este.text,
                        parent: config.group
                    });
                }
            };
            buttons.push(btn);
        }
        return buttons;
    },
    _handleButtons: function (config) {
        switch (config.parent) {
            case this.comboBoxNodeId :
                this.trigger('nodeShape:change',config.text);
                break;
            case this.comboBoxEdgeId :
                this.trigger('edgeType:change',config.text);
                break;
            case this.comboSizeId :
                this.trigger('nodeSize:change',config.text);
                break;
            case this.comboStrokeWidthId :
                this.trigger('nodeStrokeSize:change',config.text);
                break;
            case this.comboBoxOpacityId :
                var opacity = {
                    "none": 1,
                    "low": 0.8,
                    "medium": 5,
                    "high": 0.2,
                    "invisible": 0
                };
                this.trigger('nodeOpacity:change',opacity[config.text]);
                break;
            default :
                console.log(config.parent + " not yet defined");
        }
    }

}
