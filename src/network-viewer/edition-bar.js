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
            '<div style="width: 790px">' +

            '<div style="display:inline-block; width: 90px">' +
            '   <div class="btn-group" data-toggle="buttons">' +
            '       <label class="btn btn-default btn-xs active"><input type="radio" name="selectionelement" id="vertexEditButton" title="Node edit mode">Nodes</label>' +
            '       <label class="btn btn-default btn-xs"><input type="radio" name="selectionelement" id="edgeEditButton" title="Edge edit mode">Edges</label>' +
            '   </div>' +
            '</div>' +


            '<div id="vertexToolbar" style="display:inline-block; width: 700px">' +

            '   <div class="btn-group input-group-sm" title="Node name" style="margin-left: 10px;width:80px;">' +
            '       <input id="vertexNameField" type="text" class="form-control custom-xs" placeholder="name">' +
            '   </div>' +

            '   <div class="btn-group" title="Node shape">' +
            '       <button id="vertexShapeButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-shape"></span><span class="caret"></button>' +
            '        <ul id="vertexShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Node size" style="width:80px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-node-size"></span></span>' +
            '       <input id="vertexSizeField" type="text" class="form-control custom-xs">' +
            '       <div class="input-group-btn">' +
            '           <button id="vertexSizeButton" class="btn btn-default btn-sm dropdown-toggle custom-xs" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="vertexSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node stroke size" style="width:80px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-stroke-size"></span></span>' +
            '       <input id="vertexStrokeSizeField" type="text" class="form-control custom-xs">' +
            '       <div class="input-group-btn">' +
            '           <button id="vertexStrokeSizeButton" class="btn btn-default btn-sm dropdown-toggle custom-xs" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="vertexStrokeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node color" style="width:100px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-fill-color"></span></span>' +
            '       <input id="vertexColorField" type="text" class="form-control custom-xs">' +
            '       <span class="input-group-addon custom-xs">' +
            '           <select id="vertexColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node color" style="width:100px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-stroke-color"></span></span>' +
            '       <input id="vertexStrokeColorField" type="text" class="form-control custom-xs">' +
            '       <span class="input-group-addon custom-xs">' +
            '           <select id="vertexStrokeColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Node opacity">' +
            '       <button id="vertexOpacityButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-opacity"></span><span class="caret"></button>' +
            '       <ul id="vertexOpacityMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group" title="Node label size">' +
            '       <button id="vertexLabelSizeButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="vertexLabelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +


            '   <div class="btn-group" title="Node search" style="width:100px">' +
            '   <div class="input-group input-group-sm">' +
            '       <input id="vertexSearchField" type="text" class="form-control custom-xs" placeholder="Search by...">' +
            '       <div class="input-group-btn">' +
            '           <button id="vertexSearchButton" class="btn btn-default btn-sm custom-xs dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></span></button>' +
            '           <ul id="vertexSearchMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +
            '</div>' +


            /* Edges */
            '<div id="edgeToolbar" style="display:none; width: 700px">' +

            '   <div class="btn-group input-group-sm" title="Edge name" style="margin-left: 10px;width:80px;">' +
            '       <input id="edgeNameField" type="text" class="form-control custom-xs" placeholder="name">' +
            '   </div>' +

            '   <div class="btn-group" title="Edge shape">' +
            '       <button id="edgeShapeButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-edge-type"></span><span class="caret"></button>' +
            '        <ul id="edgeShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge size" style="width:80px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-node-size"></span></span>' +
            '       <input id="edgeSizeField" type="text" class="form-control custom-xs">' +
            '       <div class="input-group-btn">' +
            '           <button id="edgeSizeButton" class="btn btn-default btn-sm dropdown-toggle custom-xs" data-toggle="dropdown" type="button"><span class="caret"></button>' +
            '           <ul id="edgeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge color" style="width:100px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"><span class="ocb-icon icon-fill-color"></span></span>' +
            '       <input id="edgeColorField" type="text" class="form-control custom-xs">' +
            '       <span class="input-group-addon custom-xs">' +
            '           <select id="edgeColorSelect"></select>' +
            '      </span>' +
            '   </div>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge label size">' +
            '       <button id="edgeLabelSizeButton" class="btn btn-default btn-sm custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="edgeLabelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +

            '   <div class="btn-group" title="Edge search" style="width:100px">' +
            '   <div class="input-group input-group-sm">' +
            '       <input id="edgeSearchField" type="text" class="form-control custom-xs" placeholder="Search by...">' +
            '       <div class="input-group-btn">' +
            '           <button id="edgeSearchButton" class="btn btn-default btn-sm custom-xs dropdown-toggle" data-toggle="dropdown" type="button"><span class="caret"></span></button>' +
            '           <ul id="edgeSearchMenu" class="dropdown-menu" role="menu"></ul>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

            '</div>' +
            '</div>' +
            '';


        /**************/
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="edition-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: '32px'
        });
        $(this.targetDiv).append(this.div);
        /**************/


        /*************/
        $(this.div).find('.custom-xs').css({
            padding: '2px 4px',
            height: '22px'
        });
        /*************/

        this.vertexEditButton = $(this.div).find('#vertexEditButton');
        this.edgeEditButton = $(this.div).find('#edgeEditButton');


        /* vertex */
        this.vertexShapeButton = $(this.div).find('#vertexShapeButton');
        this.vertexSizeButton = $(this.div).find('#vertexSizeButton');
        this.vertexStrokeSizeButton = $(this.div).find('#vertexStrokeSizeButton');
        this.vertexOpacityButton = $(this.div).find('#vertexOpacityButton');
        this.vertexLabelSizeButton = $(this.div).find('#vertexLabelSizeButton');

        this.vertexShapeMenu = $(this.div).find('#vertexShapeMenu');
        this.vertexSizeMenu = $(this.div).find('#vertexSizeMenu');
        this.vertexSizeField = $(this.div).find('#vertexSizeField');
        this.vertexStrokeSizeMenu = $(this.div).find('#vertexStrokeSizeMenu');
        this.vertexStrokeSizeField = $(this.div).find('#vertexStrokeSizeField');
        this.vertexOpacityMenu = $(this.div).find('#vertexOpacityMenu');

        this.vertexColorField = $(this.div).find('#vertexColorField');
        this.vertexColorSelect = $(this.div).find('#vertexColorSelect');
        this.vertexStrokeColorField = $(this.div).find('#vertexStrokeColorField');
        this.vertexStrokeColorSelect = $(this.div).find('#vertexStrokeColorSelect');

        this.vertexNameField = $(this.div).find('#vertexNameField');

        this.vertexLabelSizeMenu = $(this.div).find('#vertexLabelSizeMenu');

        this.vertexSearchField = $(this.div).find('#vertexSearchField');
        this.vertexSearchMenu = $(this.div).find('#vertexSearchMenu');

        /* edge */
        this.edgeShapeButton = $(this.div).find('#edgeShapeButton');
        this.edgeLabelSizeButton = $(this.div).find('#edgeLabelSizeButton');

        this.edgeSizeMenu = $(this.div).find('#edgeSizeMenu');
        this.edgeSizeField = $(this.div).find('#edgeSizeField');

        this.edgeShapeMenu = $(this.div).find('#edgeShapeMenu');

        this.edgeColorField = $(this.div).find('#edgeColorField');
        this.edgeColorSelect = $(this.div).find('#edgeColorSelect');

        this.edgeNameField = $(this.div).find('#edgeNameField');

        this.edgeLabelSizeMenu = $(this.div).find('#edgeLabelSizeMenu');

        this.edgeSearchField = $(this.div).find('#edgeSearchField');
        this.edgeSearchMenu = $(this.div).find('#edgeSearchMenu');


        $(this.vertexEditButton).change(function (e) {
            _this.hideEdgeToolbar();
            _this.showVertexToolbar();
        });
        $(this.edgeEditButton).change(function (e) {
            _this.showEdgeToolbar();
            _this.hideVertexToolbar();
        });


        this._setColorSelect(this.vertexColorSelect);
        $(this.vertexColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.vertexColorField).val($(_this.vertexColorSelect).val().replace('#', '')).change();
        });
        $(this.vertexColorSelect).next('.simplecolorpicker').addClass('ocb-icon');


        this._setColorSelect(this.vertexStrokeColorSelect);
        $(this.vertexStrokeColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.vertexStrokeColorField).val($(_this.vertexStrokeColorSelect).val().replace('#', '')).change();
        });
        $(this.vertexStrokeColorSelect).next('.simplecolorpicker').addClass('ocb-icon');

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
//        $(this.vertexColorField).pickAColor(pickAColorConfig);
//        $(this.vertexStrokeColorField).pickAColor(pickAColorConfig);
//        $(this.edgeColorField).pickAColor(pickAColorConfig);
//
//        $(this.div).find('.pick-a-color-markup').addClass('pull-left');
//        $(this.div).find('.color-dropdown').css({
//            padding: '1px 4px'
//        });

//        $(this.vertexColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');
//        $(this.vertexStrokeColorField).next().find('button').prepend('<span class="ocb-icon icon-stroke-color"></span>');
//        $(this.edgeColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');

//        var colorPattern = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        var colorPattern = /^([A-Fa-f0-9]{6})$/;
        var intPattern = /^\d+$/;
        $(this.vertexColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.vertexColorSelect);
                $(_this.vertexColorSelect).simplecolorpicker('selectColor', color);
                _this.trigger('vertexColorField:change', {value: color, sender: {}})
            }
        });
        $(this.vertexStrokeColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.vertexStrokeColorSelect);
                _this.trigger('vertexStrokeColorField:change', {value: color, sender: {}})
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
        $(this.vertexSizeField).on("keyup", function () {
            var value = $(this).val();
            if (event.which === 13 && intPattern.test(value)) {
                console.log(value);
                _this.trigger('vertexSize:change', {value: value, sender: _this});
            }
        });
        $(this.vertexStrokeSizeField).on("keyup", function () {
            var value = $(this).val();
            if (event.which === 13 && intPattern.test(value)) {
                _this.trigger('vertexStrokeSize:change', {value: value, sender: _this});
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
        $(this.vertexSearchField).on("keyup", function () {
            var value = $(this).val();
            var name = $(_this.vertexSearchMenu).children('.active').text();
            if (event.which === 13) {
                console.log(value);
                console.log(name);
                _this.trigger('search:vertex', {attributeName: name, attributeValue: value, sender: _this});
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
        var vertexSizeOptions = ['10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '70', '80', '90', '100', '120', '140', '160'];
        var edgeSizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

        this._setMenu({eventName: 'vertexShape', menu: this.vertexShapeMenu, options: ['circle', 'square', 'ellipse', 'rectangle']});
        this._setMenu({eventName: 'vertexSize', menu: this.vertexSizeMenu, options: vertexSizeOptions, field: this.vertexSizeField});
        this._setMenu({eventName: 'vertexStrokeSize', menu: this.vertexStrokeSizeMenu, options: strokeSizeOptions, field: this.vertexStrokeSizeField});
        this._setMenu({eventName: 'opacity', menu: this.vertexOpacityMenu, options: ["none", "low", "medium", "high", "invisible"], hashTable: opacities});
        this._setMenu({eventName: 'edgeShape', menu: this.edgeShapeMenu, options: ["directed", /*"odirected",*/ "undirected", "inhibited", "dot", "odot"]});
        this._setMenu({eventName: 'edgeSize', menu: this.edgeSizeMenu, options: edgeSizeOptions, field: this.edgeSizeField});


        /* fields */
        $(this.vertexNameField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('vertexNameField:change', {value: $(this).val(), sender: _this});
            }
        });
        $(this.vertexNameField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('vertexNameField:change', {value: $(this).val(), sender: _this});
            }
        });
        $(this.edgeNameField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this.trigger('edgeNameField:change', {value: $(this).val(), sender: _this});
            }
        });


        this._setLabelSizeMenu(this.vertexLabelSizeMenu, 'vertexLabelSize');
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
        var colors = ["cccccc", "888888", 'ffffff',
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
            $(select).simplecolorpicker('destroy');
            $(select).simplecolorpicker({picker: true});
            $(select).next('.simplecolorpicker').addClass('ocb-icon');
        }
    },
    setVertexAttributesMenu: function (attributeManager) {
        this._setAttributeMenu(this.vertexSearchMenu, this.vertexSearchField, attributeManager);
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

    setVertexColor: function (color) {
        if (typeof color !== 'undefined') {
            this._checkSelectColor(color, this.vertexColorSelect);
            $(this.vertexColorSelect).simplecolorpicker('selectColor', color);
            $(this.vertexColorField).val($(this.vertexColorSelect).val().replace('#', ''));
        }
    },
    setVertexStrokeColor: function (color) {
        if (typeof color !== 'undefined') {
            this._checkSelectColor(color, this.vertexStrokeColorSelect);
            $(this.vertexStrokeColorSelect).simplecolorpicker('selectColor', color);
            $(this.vertexStrokeColorField).val($(this.vertexStrokeColorSelect).val().replace('#', ''));
        }
    },
    setVertexNameField: function (name) {
        $(this.vertexNameField).val(name);
    },
    setVertexSizeField: function (size) {
        $(this.vertexSizeField).val(size);
    },
    setVertexStrokeSizeField: function (size) {
        $(this.vertexStrokeSizeField).val(size);
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
    hideVertexToolbar: function () {
        $('#vertexToolbar').css("display", "none");
    },
    hideEdgeToolbar: function () {
        $('#edgeToolbar').css("display", "none");
    },
    showVertexToolbar: function () {
        $('#vertexToolbar').css("display", "inline-block");
    },
    showEdgeToolbar: function () {
        $('#edgeToolbar').css("display", "inline-block");
    }
}
