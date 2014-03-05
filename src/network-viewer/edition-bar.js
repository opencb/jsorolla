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
    this.id = Utils.genId('EditionBar');

    //set default args
    this.targetId;
    this.autoRender = false;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.vertexAttributeNameSelected;
    this.edgeAttributeNameSelected;

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

        var navgationHtml = '' +
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group" data-toggle="buttons">' +
            '       <label class="btn btn-default btn-sm"><input type="radio" name="selectionelement" id="nodeEditButton" title="Node edit mode">Nodes</label>' +
            '       <label class="btn btn-default btn-sm"><input type="radio" name="selectionelement" id="edgeEditButton" title="Edge edit mode">Edges</label>' +
            '   </div>' +
            '</div>' +


            '<div id="nodeToolbar" class="btn-toolbar" role="toolbar">' +

            '   <div class="btn-group input-group-sm" title="Node name" style="margin-left: 10px;width:80px;">' +
            '       <input id="nodeNameField" type="text" class="form-control" placeholder="name">' +
            '   </div>' +

            '   <div class="btn-group" title="Node shape">' +
            '       <button id="nodeShapeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-shape"></span><span class="caret"></button>' +
            '        <ul id="nodeShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Node size" style="width:110px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-node-size"></span></span>' +
            '       <input id="nodeSizeField" type="text" class="form-control">' +
            '       <div class="input-group-btn">' +
            '           <button id="nodeSizeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="nodeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node stroke size" style="width:110px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-stroke-size"></span></span>' +
            '       <input id="nodeStrokeSizeField" type="text" class="form-control">' +
            '       <div class="input-group-btn">' +
            '           <button id="nodeStrokeSizeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="nodeStrokeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node color" style="width:140px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-fill-color"></span></span>' +
            '       <input id="nodeColorField" type="text" class="form-control">' +
            '       <span class="input-group-addon">' +
            '           <select id="nodeColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node color" style="width:140px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-stroke-color"></span></span>' +
            '       <input id="nodeStrokeColorField" type="text" class="form-control">' +
            '       <span class="input-group-addon">' +
            '           <select id="nodeStrokeColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node opacity">' +
            '       <button id="nodeOpacityButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-opacity"></span><span class="caret"></button>' +
            '       <ul id="nodeOpacityMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group" title="Node label size">' +
            '       <button id="nodeLabelSizeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="nodeLabelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +


            '   <div class="btn-group" title="Node search" style="width:120px">' +
            '   <div class="input-group input-group-sm">' +
            '       <input id="nodeSearchField" type="text" class="form-control" placeholder="Search by...">' +
            '       <div class="input-group-btn">' +
            '           <button id="nodeSearchButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></span></button>' +
            '           <ul id="nodeSearchMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +
            '</div>' +


            /* Edges */
            '<div id="edgeToolbar" class="btn-toolbar hidden">' +

            '   <div class="btn-group input-group-sm" title="Edge name" style="margin-left: 10px;width:80px;">' +
            '       <input id="edgeLabelField" type="text" class="form-control" placeholder="name">' +
            '   </div>' +

            '   <div class="btn-group" title="Edge shape">' +
            '       <button id="edgeShapeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-edge-type"></span><span class="caret"></button>' +
            '        <ul id="edgeShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge size" style="width:110px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-node-size"></span></span>' +
            '       <input id="edgeSizeField" type="text" class="form-control">' +
            '       <div class="input-group-btn">' +
            '           <button id="edgeSizeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="edgeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge color" style="width:140px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon"><span class="ocb-icon icon-fill-color"></span></span>' +
            '       <input id="edgeColorField" type="text" class="form-control">' +
            '       <span class="input-group-addon">' +
            '           <select id="edgeColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge label size">' +
            '       <button id="edgeLabelSizeButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="edgeLabelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge search" style="width:120px">' +
            '   <div class="input-group input-group-sm">' +
            '       <input id="edgeSearchField" type="text" class="form-control" placeholder="Search by...">' +
            '       <div class="input-group-btn">' +
            '           <button id="edgeSearchButton" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></span></button>' +
            '           <ul id="edgeSearchMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '</div>' +
            '';


        /**************/
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="edition-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: '40px'
        });
        $(this.targetDiv).append(this.div);
        /**************/


        this.nodeEditButton = $(this.div).find('#nodeEditButton');
        this.edgeEditButton = $(this.div).find('#edgeEditButton');


        /* node */
        this.nodeShapeButton = $(this.div).find('#nodeShapeButton');
        this.nodeSizeButton = $(this.div).find('#nodeSizeButton');
        this.nodeStrokeSizeButton = $(this.div).find('#nodeStrokeSizeButton');
        this.nodeOpacityButton = $(this.div).find('#nodeOpacityButton');
        this.nodeLabelSizeButton = $(this.div).find('#nodeLabelSizeButton');

        this.nodeShapeMenu = $(this.div).find('#nodeShapeMenu');
        this.nodeSizeMenu = $(this.div).find('#nodeSizeMenu');
        this.nodeSizeField = $(this.div).find('#nodeSizeField');
        this.nodeStrokeSizeMenu = $(this.div).find('#nodeStrokeSizeMenu');
        this.nodeStrokeSizeField = $(this.div).find('#nodeStrokeSizeField');
        this.nodeOpacityMenu = $(this.div).find('#nodeOpacityMenu');

        this.nodeColorField = $(this.div).find('#nodeColorField');
        this.nodeColorSelect = $(this.div).find('#nodeColorSelect');
        this.nodeStrokeColorField = $(this.div).find('#nodeStrokeColorField');
        this.nodeStrokeColorSelect = $(this.div).find('#nodeStrokeColorSelect');

        this.nodeNameField = $(this.div).find('#nodeNameField');
        this.nodeLabelField = $(this.div).find('#nodeLabelField');

        this.nodeLabelSizeMenu = $(this.div).find('#nodeLabelSizeMenu');

        this.nodeSearchField = $(this.div).find('#nodeSearchField');
        this.nodeSearchMenu = $(this.div).find('#nodeSearchMenu');

        /* edge */
        this.edgeShapeButton = $(this.div).find('#edgeShapeButton');
        this.edgeLabelSizeButton = $(this.div).find('#edgeLabelSizeButton');

        this.edgeSizeMenu = $(this.div).find('#edgeSizeMenu');
        this.edgeSizeField = $(this.div).find('#edgeSizeField');

        this.edgeShapeMenu = $(this.div).find('#edgeShapeMenu');

        this.edgeColorField = $(this.div).find('#edgeColorField');
        this.edgeColorSelect = $(this.div).find('#edgeColorSelect');

        this.edgeLabelField = $(this.div).find('#edgeLabelField');

        this.edgeLabelSizeMenu = $(this.div).find('#edgeLabelSizeMenu');

        this.edgeSearchField = $(this.div).find('#edgeSearchField');
        this.edgeSearchMenu = $(this.div).find('#edgeSearchMenu');

        /*************/

        $(this.nodeEditButton).change(function (e) {
            _this.hideEdgeToolbar();
            _this.showNodeToolbar();
        });
        $(this.edgeEditButton).change(function (e) {
            _this.showEdgeToolbar();
            _this.hideNodeToolbar();
        });


        this._setColorSelect(this.nodeColorSelect);
        $(this.nodeColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.nodeColorField).val($(_this.nodeColorSelect).val().replace('#', '')).change();
        });
        $(this.nodeColorSelect).next('.simplecolorpicker').addClass('ocb-icon');


        this._setColorSelect(this.nodeStrokeColorSelect);
        $(this.nodeStrokeColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.nodeStrokeColorField).val($(_this.nodeStrokeColorSelect).val().replace('#', '')).change();
        });
        $(this.nodeStrokeColorSelect).next('.simplecolorpicker').addClass('ocb-icon');

        this._setColorSelect(this.edgeColorSelect);
        $(this.edgeColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.edgeColorField).val($(_this.edgeColorSelect).val().replace('#', '')).change();
        });
        $(this.edgeColorSelect).next('.simplecolorpicker').addClass('ocb-icon');
//        /* Color picker */
//        var pickAColorConfig = {
//            showSpectrum: true,
//            showSavedColors: true,
//            saveColorsPerElement: false,
//            fadeMenuToggle: true,
//            showAdvanced: true,
//            showBasicColors: true,
//            showHexInput: false,
//            allowBlank: true
//        }
//
//
//        $(this.nodeColorField).pickAColor(pickAColorConfig);
//        $(this.nodeStrokeColorField).pickAColor(pickAColorConfig);
//        $(this.edgeColorField).pickAColor(pickAColorConfig);
//
//        $(this.div).find('.pick-a-color-markup').addClass('pull-left');
//        $(this.div).find('.color-dropdown').css({
//            padding: '1px 4px'
//        });

//        $(this.nodeColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');
//        $(this.nodeStrokeColorField).next().find('button').prepend('<span class="ocb-icon icon-stroke-color"></span>');
//        $(this.edgeColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');

//        var colorPattern = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        var colorPattern = /^([A-Fa-f0-9]{6})$/;
        var intPattern = /^\d+$/;
        $(this.nodeColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.nodeColorSelect);
                $(_this.nodeColorSelect).simplecolorpicker('selectColor', color);
                _this.trigger('nodeColorField:change', {value: color, sender: {}})
            }
        });
        $(this.nodeStrokeColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.nodeStrokeColorSelect);
                _this.trigger('nodeStrokeColorField:change', {value: color, sender: {}})
            }
        });
        $(this.edgeColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.edgeColorSelect);
                _this.trigger('edgeColorField:change', {value: color, sender: {}})
            }
        });
        $(this.nodeSizeField).on("keyup", function () {
            var value = $(this).val();
            if (event.which === 13 && intPattern.test(value)) {
                console.log(value);
                _this.trigger('nodeSize:change', {value: value, sender: _this});
            }
        });
        $(this.nodeStrokeSizeField).on("keyup", function () {
            var value = $(this).val();
            if (event.which === 13 && intPattern.test(value)) {
                _this.trigger('nodeStrokeSize:change', {value: value, sender: _this});
            }
        });

        $(this.edgeSizeField).on("keyup", function () {
            var value = $(this).val();
            if (event.which === 13 && intPattern.test(value)) {
                console.log(value);
                _this.trigger('edgeSize:change', {value: value, sender: _this});
            }
        });

        /* Search */
        $(this.nodeSearchField).on("keyup", function () {
            var value = $(this).val();
            var name = $(_this.nodeSearchMenu).children('.active').text();
            if (event.which === 13) {
                console.log(value);
                console.log(name);
                _this.trigger('search:node', {attributeName: name, attributeValue: value, sender: _this});
            }
        });
        $(this.edgeSearchField).on("keyup", function () {
            var value = $(this).val();
            var name = $(_this.edgeSearchMenu).children('.active').text();
            if (event.which === 13) {
                console.log(value);
                console.log(name);
                _this.trigger('search:edge', {attributeName: name, attributeValue: value, sender: _this});
            }
        });

        /* */


        /* menus */
        var opacities = {"none": '1', "low": '0.8', "medium": '0.5', "high": '0.2', "invisible": '0'};
        var strokeSizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '10'];
        var nodeSizeOptions = ['10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '70', '80', '90', '100', '120', '140', '160'];
        var edgeSizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

        this._setMenu({eventName: 'nodeShape', menu: this.nodeShapeMenu, options: ['circle', 'square', 'ellipse', 'rectangle']});
        this._setMenu({eventName: 'nodeSize', menu: this.nodeSizeMenu, options: nodeSizeOptions, field: this.nodeSizeField});
        this._setMenu({eventName: 'nodeStrokeSize', menu: this.nodeStrokeSizeMenu, options: strokeSizeOptions, field: this.nodeStrokeSizeField});
        this._setMenu({eventName: 'opacity', menu: this.nodeOpacityMenu, options: ["none", "low", "medium", "high", "invisible"], hashTable: opacities});
        this._setMenu({eventName: 'edgeShape', menu: this.edgeShapeMenu, options: ["directed", /*"odirected",*/ "undirected", "inhibited", "dot", "odot"]});
        this._setMenu({eventName: 'edgeSize', menu: this.edgeSizeMenu, options: edgeSizeOptions, field: this.edgeSizeField});


        /* fields */
        $(this.nodeNameField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('nodeNameField:change', {value: $(this).val(), sender: _this});
            }
        });
        $(this.nodeLabelField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('nodeLabelField:change', {value: $(this).val(), sender: _this});
            }
        });
        $(this.edgeLabelField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('edgeLabelField:change', {value: $(this).val(), sender: _this});
            }
        });


        this._setLabelSizeMenu(this.nodeLabelSizeMenu, 'nodeLabelSize');
        this._setLabelSizeMenu(this.edgeLabelSizeMenu, 'edgeLabelSize');

        this.rendered = true;
    },

    _setMenu: function (args) {
        var eventName = args.eventName;
        var menu = args.menu;
        var options = args.options;
        var hashTable = args.hashTable;
        var field = args.field;


        var _this = this;
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(menu).append(menuEntry);
            $(menuEntry).click(function () {
                var value = $(this).text();
                if (typeof hashTable !== 'undefined') {
                    value = hashTable[value];
                }
                if (typeof field !== 'undefined') {
                    $(field).val(value);
                }
                _this.trigger(eventName + ':change', {value: value, sender: _this});
            });
        }
    },
    _setLabelSizeMenu: function (menu, eventName) {
        var _this = this;
        var size = {
            "None": 0,
            "8": 8,
            "10": 10,
            "12": 12,
            "14": 14,
            "16": 16
        };
        var options = ['None', '8', '10', '12', '14', '16'];
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(menu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('change:' + eventName, {option: size[$(this).text()], sender: _this});
            });
        }
    },

    _setColorSelect: function (select) {
        var colors = ["cccccc", "888888",'ffffff',
            "ac725e", "d06b64", "f83a22", "fa573c", "ff7537", "ffad46", "42d692", "16a765", "7bd148", "b3dc6c", "fbe983", "fad165",
            "92e1c0", "9fe1e7", "9fc6e7", "4986e7", "9a9cff", "b99aff", "c2c2c2", "cabdbf", "cca6ac", "f691b2", "cd74e6", "a47ae2",
            "000000"
        ];

        for (var i in colors) {
            var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
            $(select).append(menuEntry);
        }
    },
    _checkSelectColor: function (color, select) {
        var found = ($(select).find('option[value="' + color + '"]').length > 0 ) ? true : false;
        if (!found) {
            var menuEntry = $('<option value="' + color + '">' + color + '</option>')[0];
            $(select).append(menuEntry);
            $(this.nodeColorSelect).simplecolorpicker('destroy');
            $(this.nodeColorSelect).simplecolorpicker({picker: true});
        }
    },
    setVertexAttributesMenu: function (attributeManager) {
        this._setAttributeMenu(this.nodeSearchMenu, this.nodeSearchField, attributeManager);
    },
    _setAttributeMenu: function (select, field, attributeManager) {
        $(select).empty();
        var attributes = attributeManager.attributes;
        for (var a in attributes) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + attributes[a].name + '</a></li>')[0];
            $(select).append(menuEntry);

            $(menuEntry).click(function () {
                $(select).children().removeClass('active');
                $(field).attr('placeholder', $(this).text())
                $(this).addClass('active');
            });
        }
        $(select).children().first().addClass('active');
    },
    setEdgeAttributesMenu: function (attributeManager) {
        this._setAttributeMenu(this.edgeSearchMenu, this.edgeSearchField, attributeManager);
    },

    setNodeColor: function (color) {
        this._checkSelectColor(color, this.nodeColorSelect);
        $(this.nodeColorSelect).simplecolorpicker('selectColor', color);
        $(this.nodeColorField).val($(this.nodeColorSelect).val().replace('#', ''));
    },
    setNodeStrokeColor: function (color) {
        this._checkSelectColor(color, this.nodeStrokeColorSelect);
        $(this.nodeStrokeColorSelect).simplecolorpicker('selectColor', color);
        $(this.nodeStrokeColorField).val($(this.nodeStrokeColorSelect).val().replace('#', ''));
    },
    setNodeNameField: function (name) {
        $(this.nodeNameField).val(name);
    },
    setNodeSizeField: function (size) {
        $(this.nodeSizeField).val(size);
    },
    setNodeStrokeSizeField: function (size) {
        $(this.nodeStrokeSizeField).val(size);
    },
    setEdgeColor: function (color) {
        this._checkSelectColor(color, this.edgeColorSelect);
        $(this.edgeColorSelect).simplecolorpicker('selectColor', color);
        $(this.edgeColorField).val($(this.edgeColorSelect).val().replace('#', ''));
    },
    setEdgeNameField: function (name) {
        $(this.edgeLabelField).val(name);
    },
    setEdgeSizeField: function (size) {
        $(this.edgeSizeField).val(size);
    },

    //TODO TEST
    hideNodeToolbar: function () {
        $('#nodeToolbar').addClass("hidden");
    },
    hideEdgeToolbar: function () {
        $('#edgeToolbar').addClass("hidden");
    },
    showNodeToolbar: function () {
        $('#nodeToolbar').removeClass("hidden");
    },
    showEdgeToolbar: function () {
        $('#edgeToolbar').removeClass("hidden");
    }
}
