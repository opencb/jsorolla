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

function ToolBar(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('ToolBar');

    //set default args
    this.target;
    this.autoRender = true;
    this.height = 32;
    this.zoom = 25;

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

ToolBar.prototype = {
    render: function () {
        var _this = this;

        var HTML = '' +

            '   <label class="ocb-ctrl"><input type="radio" name="mode1" id="selectButton" title="Network select mode" checked="true"><span style="border-right: none"><i class="fa fa-hand-o-up"></i></span></label>' +
            '   <label class="ocb-ctrl"><input type="radio" name="mode1" id="backgroundButton" title="Background select mode"><span><i class="fa fa-image"></i></span></label>' +

            '   <label style="margin-left: 10px;" class="ocb-ctrl"><input type="radio" name="mode1" id="addButton" title="Add mode"><span style="border-right: none"><i class="fa fa-plus"></i></span></label>' +
            '   <label class="ocb-ctrl"><input type="radio" name="mode1" id="linkButton" title="Link mode"><span style="border-right: none"><i class="fa fa-link"></i></span></label>' +
            '   <label class="ocb-ctrl"><input type="radio" name="mode1" id="deleteButton" title="Delete mode"><span><i class="fa fa-times"></i></span></label>' +

            '   <div style="margin-left: 10px" id="collapseButton" class="ocb-ctrl hidden"><span class="ocb-icon icon-collapse"></span></div>' +


            '   <div class="ocb-dropdown" style="margin-left: 10px">' +
            '       <div tabindex="-1" id="layoutButton" class="ocb-ctrl"><i class="fa fa-share-alt"></i></div>' +
            '       <ul id="layoutMenu"></ul>' +
            '  </div>' +

            '   <div class="ocb-dropdown" title="Select" style="margin-left: 10px">' +
            '       <div tabindex="-1"  id="autoSelectButton" class="ocb-ctrl"><i class="fa fa-dot-circle-o"></i></div>' +
            '       <ul id="autoSelectMenu"></ul>' +
            '  </div>' +

            '   <div style="margin-left: 10px" id="importBackgroundImageButton" class="ocb-ctrl"><i class="fa fa-file-image-o"></i></div>' +
            '   <input id="importBackgroundImageField" type="file" style="display:none" />' +

            '   <jso-color-picker id="backgroundColorPicker" color="#ffffff" style="float:left;width:90px;margin-left: 2px;"></jso-color-picker>' +

            '   <div class="ocb-dropdown"  title="Rotate"  style="margin-left: 10px">' +
            '       <div tabindex="-1"  id="rotateButton" class="ocb-ctrl" style="border-right: none"><i class="fa fa-rotate-right"></i></div>' +
            '       <ul id="rotateMenu"></ul>' +
            '   </div>' +
            '   <input id="rotateField" class="ocb-ctrl"  type="text" style="width: 50px;" placeholder="90&deg;">' +

            '   <div id="zoomOutButton" class="ocb-ctrl" style="margin-left: 10px"><span class="fa fa-minus"></span></div>' +
            '   <div id="progressBarCont" class="ocb-zoom-bar">' +
            '       <div id="progressBar" style="width: ' + this.zoom + '%"></div>' +
            '   </div>' +
            '   <div id="zoomInButton" class="ocb-ctrl"><span class="fa fa-plus"></span></div>' +

            '   </div>' +

            '';


        /**************/
        this.div = document.createElement('div');
        this.div.style.height = this.height + 'px';

        var div = document.createElement('div');
        div.setAttribute('class', "ocb-nv-toolbar unselectable");
        div.innerHTML = HTML;
        this.div.appendChild(div);

        var els = this.div.querySelectorAll('[id]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var id = el.getAttribute('id');
            this.els[id] = el;
        }
        /**************/


        this.els.backgroundColorPicker.addEventListener('change', function (e) {
            if (_this.colorPattern.test(e.detail.color)) {
                _this.trigger('backgroundColorField:change', {value: e.detail.color, sender: {}})
            }
        });


        /* buttons */

        this.els.selectButton.addEventListener('click', function (e) {
            _this.trigger('click:selectButton', {clickEvent: e, sender: {}})
        });
        this.els.backgroundButton.addEventListener('click', function (e) {
            _this.trigger('click:backgroundButton', {clickEvent: e, sender: {}})
        });
        this.els.addButton.addEventListener('click', function (e) {
            _this.trigger('addButton:click', {clickEvent: e, sender: {}})
        });
        this.els.linkButton.addEventListener('click', function (e) {
            _this.trigger('linkButton:click', {clickEvent: e, sender: {}})
        });
        this.els.deleteButton.addEventListener('click', function (e) {
            _this.trigger('deleteButton:click', {clickEvent: e, sender: {}})
        });

        this.els.collapseButton.addEventListener('click', function (e) {
            _this.trigger('collapseButton:click', {clickEvent: e, sender: {}})
        });

        this._setLayoutMenu();
        this._setAutoSelectMenu();
        this._setRotateMenu();

        this.els.importBackgroundImageButton.addEventListener('click', function (e) {
            _this.els.importBackgroundImageField.click();
        });

        this.els.importBackgroundImageField.addEventListener('change', function (e) {
            var file = this.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var image = new Image;
                    image.onload = function () {
                        _this.trigger('importBackgroundImageField:change', {clickEvent: e, image: image, sender: {}})
                    };
                    var content = evt.target.result;
                    image.src = content;
                };
                reader.readAsDataURL(file);
                this.value = null;
            }
        });

        this.els.zoomOutButton.addEventListener('click', function () {
            _this._handleZoomOutButton();
        });
        this.els.zoomInButton.addEventListener('click', function () {
            _this._handleZoomInButton();
        });
        this.els.progressBarCont.addEventListener('click', function (e) {
            var zoom = 100 / parseInt(getComputedStyle(this).width) * e.offsetX;
            if (!_this.zoomChanging) {
                _this.els.progressBar.style.width = e.offsetX + 'px';
                _this.zoomChanging = true;
                setTimeout(function () {
                    _this._handleZoomSlider(zoom);
                    _this.zoomChanging = false;
                }, 500);
            }
        });

        this.els.rotateField.addEventListener('keyup', function (event) {
            var query = this.value;
            if (_this.intPattern.test(query)) {
                if (event.which === 13) {
                    _this.trigger('change:rotate', {angle: parseFloat(query), sender: _this});
                }
            }
        });

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
    _setLayoutMenu: function (attributeNames) {
        var _this = this;
        while (this.els.layoutMenu.firstChild) {
            this.els.layoutMenu.removeChild(this.els.layoutMenu.firstChild);
        }

        var options = ['Force directed', 'Circle', 'Random'  /* 'Dot', 'Neato', 'Twopi', 'Circo', 'Fdp', 'Sfdp'*/];

        var processOption = function (option, select) {
            var menuEntry = document.createElement('li');
            menuEntry.setAttribute('data-value', option);
            menuEntry.innerHTML = option;
            select.appendChild(menuEntry);

            if (option === 'Circle') {
                menuEntry.setAttribute('data-sub', true);
                _this.els.circleLayoutMenu = document.createElement('ul');
                menuEntry.appendChild(_this.els.circleLayoutMenu);
            }

            menuEntry.addEventListener('click', function (e) {
                _this.trigger('layout:change', {option: this.getAttribute('data-value'), sender: _this});
            });
        };

        for (var i = 0; i < options.length; i++) {
            processOption(options[i], this.els.layoutMenu);
        }
    },
    _setCircleLayoutMenu: function (attributeNames) {
        var _this = this;
        while (this.els.circleLayoutMenu.firstChild) {
            this.els.circleLayoutMenu.removeChild(this.els.circleLayoutMenu.firstChild);
        }
        for (var i = 0; i < attributeNames.length; i++) {
            var name = attributeNames[i];
            var menuEntry = document.createElement('li');
            menuEntry.setAttribute('data-value', name);
            menuEntry.innerHTML = name;
            this.els.circleLayoutMenu.appendChild(menuEntry);
            menuEntry.addEventListener('click', function (e) {
                e.stopPropagation();
                _this.trigger('layout:change', {option: 'Circle', attributeName: this.getAttribute('data-value'), sender: _this});
            });
        }
    },
    _setAutoSelectMenu: function () {
        var _this = this;
        var verticesOptions = ['All nodes', 'First neighbour nodes', 'Invert node selection'];
        var edgeOptions = ['All edges', 'Adjacent edges'];
        var networkOptions = ['Everything'];

        var addEntries = function (options) {
            for (var i in options) {
                var menuEntry = document.createElement('li');
                menuEntry.innerHTML = options[i];
                _this.els.autoSelectMenu.appendChild(menuEntry);
                menuEntry.addEventListener('click', function (e) {
                    _this.trigger('select:change', {option: this.innerHTML, sender: _this});
                });
            }
        }


        addEntries(verticesOptions);

        var sep1 = document.createElement('li');
        sep1.setAttribute('data-divider', true);
        this.els.autoSelectMenu.appendChild(sep1);

        addEntries(edgeOptions);

        var sep2 = document.createElement('li');
        sep2.setAttribute('data-divider', true);
        this.els.autoSelectMenu.appendChild(sep2);

        addEntries(networkOptions);
    },

    _setRotateMenu: function () {
        var _this = this;
        var clockWise = ['45', '90', '180'];
        var counterClockWise = ['-45', '-90', '-180'];

        var addEntries = function (options) {
            for (var i in options) {
                var menuEntry = document.createElement('li');
                menuEntry.innerHTML = options[i];
                _this.els.rotateMenu.appendChild(menuEntry);
                menuEntry.addEventListener('click', function (e) {
                    _this.trigger('change:rotate', {angle: parseFloat(this.textContent), sender: _this});
                });
            }
        }

        addEntries(clockWise);

        var sep = document.createElement('li');
        sep.setAttribute('data-divider', true);
        this.els.rotateMenu.appendChild(sep);

        addEntries(counterClockWise);
    },

    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
        this.els.progressBar.style.width = this.zoom + '%';
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.trigger('zoom:change', {zoom: this.zoom, sender: this});
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
        this.els.progressBar.style.width = this.zoom + '%';
    },
    setZoom: function (zoom) {
        this.zoom = zoom;
        this.els.progressBar.style.width = zoom + '%';
    },
    setVertexAttributes: function (attributeManager) {
        this._setCircleLayoutMenu(attributeManager.getAttributeNames());
    }
}
