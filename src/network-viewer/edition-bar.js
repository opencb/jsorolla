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
    this.target;
    this.autoRender = true;
    this.height = 32;

    //set instantiation args, must be last
    _.extend(this, args);

    this.els = {};
    this.colorPattern = /^(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/;
    this.intPattern = /^-?\d+$/;


    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

EditionBar.prototype = {
    render: function () {
        var _this = this;


        var HTML = '' +
            '   <label class="ocb-ctrl"><input type="radio" name="selectionelement" id="vertexEditButton" title="Node edit mode" checked="true"><span style="border-right: none">Nodes</span></label>' +
            '   <label class="ocb-ctrl"><input type="radio" name="selectionelement" id="edgeEditButton" title="Edge edit mode"><span>Edges</span></label>' +

            '   <div id="vertexToolbar" style="width: 800px;">' +
            '       <input id="vertexNameField"  class="ocb-ctrl" type="text" placeholder="name" style="width: 70px;margin-left: 10px;">' +

            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1"  id="vertexShapeButton" class="ocb-ctrl"><i class="fa fa-star"></i></div>' +
            '           <ul id="vertexShapeMenu"></ul>' +
            '       </div>' +

            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1"  id="vertexOpacityButton" class="ocb-ctrl"><i class="fa fa-adjust"></i></div>' +
            '           <ul id="vertexOpacityMenu"></ul>' +
            '       </div>' +

            '       <div class="ocb-dropdown" style="margin-left: 20px">' +
            '           <div tabindex="-1" id="vertexSizeButton" class="ocb-ctrl" style="border-right: none"><i class="fa fa-circle"></i></div>' +
            '           <ul id="vertexSizeMenu"></ul>' +
            '       </div>' +
            '       <input id="vertexSizeField" class="ocb-ctrl"  type="text" style="width: 50px;">' +
//
            '       <jso-color-picker id="vertexColorPicker" color="#ffffff" style="float:left;width:90px;margin-left: 2px;"></jso-color-picker>' +

            '       <div class="ocb-dropdown" style="margin-left: 20px">' +
            '           <div tabindex="-1" id="vertexStrokeSizeButton" class="ocb-ctrl" style="border-right: none"><i class="fa fa-circle-o"></i></div>' +
            '           <ul id="vertexStrokeSizeMenu"></ul>' +
            '       </div>' +
            '       <input id="vertexStrokeSizeField" class="ocb-ctrl"  type="text" style="width: 50px;">' +
//
            '       <jso-color-picker id="vertexStrokeColorPicker" color="#888888" style="float:left;width:90px;margin-left: 2px;"></jso-color-picker>' +


            '       <div class="ocb-dropdown" style="margin-left: 20px">' +
            '           <div tabindex="-1" id="vertexLabelSizeButton" class="ocb-ctrl"><i class="fa fa-text-height"></i></div>' +
            '           <ul id="vertexLabelSizeMenu"></ul>' +
            '       </div>' +


            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1" id="vertexSearchButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-search"></i></div>' +
            '           <ul id="vertexSearchMenu"></ul>' +
            '       </div>' +
            '       <input id="vertexSearchField" class="ocb-ctrl"  type="text" placeholder="Search" style="width: 80px;">' +


            '   </div>' +

            /* Edges */
            '   <div id="edgeToolbar" style="display:none;width: 800px;">' +
            '       <input id="edgeNameField"  class="ocb-ctrl" type="text" placeholder="name" style="width: 70px;margin-left: 10px;">' +

            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1"  id="edgeShapeButton" class="ocb-ctrl"><i class="fa fa-location-arrow"></i></div>' +
            '           <ul id="edgeShapeMenu"></ul>' +
            '       </div>' +

            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1" id="edgeSizeButton" class="ocb-ctrl" style="border-right: none"><i class="fa fa-minus"></i></div>' +
            '           <ul id="edgeSizeMenu"></ul>' +
            '       </div>' +
            '       <input id="edgeSizeField" class="ocb-ctrl"  type="text" style="width: 30px;">' +

            '       <jso-color-picker id="edgeColorPicker" style="float:left;width:90px;margin-left: 2px;" color="#888888"></jso-color-picker>' +


            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1"  id="edgeLabelSizeButton" class="ocb-ctrl"><i class="fa fa-text-height"></i></div>' +
            '           <ul id="edgeLabelSizeMenu"></ul>' +
            '       </div>' +

            '       <div class="ocb-dropdown" style="margin-left: 10px">' +
            '           <div tabindex="-1"  id="edgeSearchButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-search"></i></div>' +
            '           <ul id="edgeSearchMenu"></ul>' +
            '       </div>' +
            '       <input id="edgeSearchField" class="ocb-ctrl"  type="text" placeholder="Search" style="width: 80px;">' +

            '   </div>' +

            '';

        /**************/
        this.div = document.createElement('div');
        this.div.style.height = this.height + 'px';

        var div = document.createElement('div');
        div.setAttribute('class', "ocb-nv-editionbar unselectable");
        div.innerHTML = HTML;
        this.div.appendChild(div);

        var els = this.div.querySelectorAll('[id]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var id = el.getAttribute('id');
            this.els[id] = el;
        }
        /**************/


        //Manage edges or nodes
        this.els.vertexEditButton.addEventListener('change', function (e) {
            _this.hideEdgeToolbar();
            _this.showVertexToolbar();
        });
        this.els.edgeEditButton.addEventListener('change', function (e) {
            _this.showEdgeToolbar();
            _this.hideVertexToolbar();
        });


        this.els.vertexColorPicker.addEventListener('change', function (e) {
            if (_this.colorPattern.test(e.detail.color)) {
                _this.trigger('vertexColorField:change', {value: e.detail.color, sender: {}})
            }
        });
        this.els.vertexStrokeColorPicker.addEventListener('change', function (e) {
            if (_this.colorPattern.test(e.detail.color)) {
                _this.trigger('vertexStrokeColorField:change', {value: e.detail.color, sender: {}})
            }
        });
        this.els.edgeColorPicker.addEventListener('change', function (e) {
            if (_this.colorPattern.test(e.detail.color)) {
                _this.trigger('edgeColorField:change', {value: e.detail.color, sender: {}})
            }
        });


        this.els.vertexSizeField.addEventListener('keyup', function (e) {
            var value = this.value;
            if (event.which === 13 && _this.intPattern.test(value)) {
                console.log(value);
                _this.trigger('vertexSize:change', {value: value, sender: _this});
            }

        });
        this.els.vertexStrokeSizeField.addEventListener('keyup', function () {
            var value = this.value;
            if (event.which === 13 && _this.intPattern.test(value)) {
                console.log(value);
                _this.trigger('vertexStrokeSize:change', {value: value, sender: _this});
            }
        });

        this.els.edgeSizeField.addEventListener('keyup', function () {
            var value = this.value;
            if (event.which === 13 && _this.intPattern.test(value)) {
                console.log(value);
                _this.trigger('edgeSize:change', {value: value, sender: _this});
            }
        });

        /* Search */
        this.els.vertexSearchField.addEventListener('keyup', function () {
            var value = this.value;
            var name = _this.els.vertexSearchMenu.querySelector('.active').innerHTML;
            if (event.which === 13) {
                console.log(value);
                console.log(name);
                _this.trigger('search:vertex', {attributeName: name, attributeValue: value, sender: _this});
            }
        });
        this.els.edgeSearchField.addEventListener('keyup', function () {
            var value = this.value;
            var name = _this.els.edgeSearchMenu.querySelector('.active').innerHTML;
            if (event.which === 13) {
                console.log(value);
                console.log(name);
                _this.trigger('search:edge', {attributeName: name, attributeValue: value, sender: _this});
            }
        });


        /* menus */
        var opacities = {none: '1', low: '0.8', medium: '0.5', high: '0.2', invisible: '0'};
        var strokeSizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '10'];
        var vertexSizeOptions = ['10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '70', '80', '90', '100', '120', '140', '160'];
        var edgeSizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        this._setMenu({eventName: 'vertexShape', menu: this.els.vertexShapeMenu, options: ['circle', 'square', 'ellipse', 'rectangle']});
        this._setMenu({eventName: 'vertexSize', menu: this.els.vertexSizeMenu, options: vertexSizeOptions, field: this.els.vertexSizeField});
        this._setMenu({eventName: 'vertexStrokeSize', menu: this.els.vertexStrokeSizeMenu, options: strokeSizeOptions, field: this.els.vertexStrokeSizeField});
        this._setMenu({eventName: 'opacity', menu: this.els.vertexOpacityMenu, options: ['none', 'low', 'medium', 'high', 'invisible'], hashTable: opacities});
        this._setMenu({eventName: 'edgeShape', menu: this.els.edgeShapeMenu, options: ['directed', /*'odirected',*/ 'undirected', 'inhibited', 'dot', 'odot']});
        this._setMenu({eventName: 'edgeSize', menu: this.els.edgeSizeMenu, options: edgeSizeOptions, field: this.els.edgeSizeField});


        /* fields */
        this.els.vertexNameField.addEventListener('keyup', function (event) {
            if (event.which === 13) {
                _this.trigger('vertexNameField:change', {value: this.value, sender: _this});
            }
        });
        this.els.vertexNameField.addEventListener('keyup', function (event) {
            if (event.which === 13) {
                _this.trigger('vertexNameField:change', {value: this.value, sender: _this});
            }
        });
        this.els.edgeNameField.addEventListener('keyup', function (event) {
            if (event.which === 13) {
                _this.trigger('edgeNameField:change', {value: this.value, sender: _this});
            }
        });


        this._setLabelSizeMenu(this.els.vertexLabelSizeMenu, 'vertexLabelSize');
        this._setLabelSizeMenu(this.els.edgeLabelSizeMenu, 'edgeLabelSize');

        this.rendered = true;
    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    },
    getHeight: function () {
        return this.height;
    },
    _setMenu: function (args) {
        var eventName = args.eventName;
        var menu = args.menu;
        var options = args.options;
        var hashTable = args.hashTable;
        var field = args.field;

        var _this = this;

        for (var i in options) {
            var menuEntry = document.createElement('li');
            menuEntry.innerHTML = options[i];
            menu.appendChild(menuEntry);
            menuEntry.addEventListener('click', function (e) {
                var value = this.innerHTML;
                console.log(value)
                if (typeof hashTable !== 'undefined') {
                    value = hashTable[value];
                }
                if (typeof field !== 'undefined') {
                    field.value = value;
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

            var menuEntry = document.createElement('li');
            menuEntry.innerHTML = options[i];
            menu.appendChild(menuEntry);
            menuEntry.addEventListener('click', function () {
                _this.trigger('change:' + eventName, {option: size[this.innerHTML], sender: _this});
            });
        }
    },
    setVertexAttributesMenu: function (attributeManager) {
        this._setAttributeMenu(this.els.vertexSearchMenu, this.els.vertexSearchField, attributeManager);
    },
    _setAttributeMenu: function (select, field, attributeManager) {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }

        var attributes = attributeManager.attributes;
        for (var a in attributes) {

            var menuEntry = document.createElement('li');
            menuEntry.innerHTML = attributes[a].name;
            select.appendChild(menuEntry);

            menuEntry.addEventListener('click', function () {
                for (var i = 0; i < select.childNodes.length; i++) {
                    select.childNodes[i].classList.remove('active');
                }
                field.setAttribute('placeholder', this.innerText)
                this.classList.add('active');
            });
        }

        if (select.firstChild) {
            select.firstChild.classList.add('active');
        }
    },
    setEdgeAttributesMenu: function (attributeManager) {
        this._setAttributeMenu(this.els.edgeSearchMenu, this.els.edgeSearchField, attributeManager);
    },

    setVertexColor: function (color) {
        if (typeof color !== 'undefined') {
            this.els.vertexColorPicker.setColor(color);
        }
    },
    setVertexStrokeColor: function (color) {
        if (typeof color !== 'undefined') {
            this.els.vertexStrokeColorPicker.setColor(color);
        }
    },
    setVertexNameField: function (name) {
        this.els.vertexNameField.value = name;
    },
    setVertexSizeField: function (size) {
        this.els.vertexSizeField.value = size;
    },
    setVertexStrokeSizeField: function (size) {
        this.els.vertexStrokeSizeField.value = size;
    },
    setEdgeColor: function (color) {
        if (typeof color !== 'undefined') {
            this.els.edgeColorPicker.setColor(color);
        }
    },
    setEdgeNameField: function (name) {
        this.els.edgeNameField.value = name;
    },
    setEdgeSizeField: function (size) {
        this.els.edgeSizeField.value = size;
    },

    hideVertexToolbar: function () {
        this.els.vertexToolbar.style.display = 'none';
    },
    hideEdgeToolbar: function () {
        this.els.edgeToolbar.style.display = 'none';
    },
    showVertexToolbar: function () {
        this.els.vertexToolbar.style.display = 'inline-block';
    },
    showEdgeToolbar: function () {
        this.els.edgeToolbar.style.display = 'inline-block';
    }
}
