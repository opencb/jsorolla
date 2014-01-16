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
    this.id = Utils.genId('tool-bar');

    //set default args
    this.targetId;
    this.autoRender = false;
    this.zoom = 25;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

ToolBar.prototype = {
    render: function (targetId) {
        var _this = this;
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        var navgationHtml = '' +
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="selectButton" class="btn btn-default" type="button" title="Select mode"><span class="ocb-icon icon-mouse-select"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="addButton" class="btn btn-default" type="button" title="Add mode"><span class="ocb-icon icon-add"></span></button>' +
            '       <button id="linkButton" class="btn btn-default" type="button" title="Link mode"><span class="ocb-icon icon-link"></span></button>' +
            '       <button id="deleteButton" class="btn btn-default" type="button" title="Delete mode"><span class="ocb-icon icon-delete"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs hidden">' +
            '       <button id="collapseButton" class="btn btn-default" type="button"><span class="ocb-icon icon-collapse"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs" title="Layouts">' +
            '       <button id="layoutButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-layout"></span><span class="caret"></button>' +
            '       <ul id="layoutMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs hidden" title="Label size">' +
            '       <button id="labelSizeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="labelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs" title="Select">' +
            '       <button id="autoSelectButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-auto-select"></span><span class="caret"></button>' +
            '       <ul id="autoSelectMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs hidden">' +
            '       <button id="backgroundButton" class="btn btn-default" type="button"><span class="ocb-icon icon-background-option"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '   <div class="input-group" title="Background color">' +
            '       <span class="input-group-addon" style="display:inline-block;width:40px;height:23px;padding:3px;"><span class="ocb-icon icon-background-option"></span>&nbsp;&nbsp;#</span>' +
            '       <input id="backgroundColorField" class="form-control" type="text" style="padding:0px 4px;height:23px;width:60px;display:inline-block;">' +
            '       <span class="input-group-addon" style="display:inline-block;width:25px;height:23px;padding:2px;">' +
            '           <select id="backgroundColorSelect"></select>' +
            '       </span>' +
            '       <span class="input-group-addon" style="display:inline-block;width:85px;height:23px;padding:3px;" title="Add image to the background">' +
            '           <a id="importBackgroundImageButton">Add image... </a>' +
            '           <input id="importBackgroundImageField" type="file" style="visibility:hidden" />' +
            '       </span>' +
            '   </div>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs" style="margin:0px 0px 0px 15px;">' +
            '       <button id="zoomOutButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-minus"></span></button>' +
            '       <div id="progressBarCont" class="progress pull-left" style="width:120px;height:10px;margin:5px 2px 0px 2px;background-color: #d5d5d5">' +
            '           <div id="progressBar" class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: ' + this.zoom + '%">' +
            '           </div>' +
            '       </div>' +
            '       <button id="zoomInButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-plus"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs" title="Show/hide overview">' +
            '       <button id="showOverviewButton" class="btn btn-default active" type="button"><span class="ocb-icon icon-select"></span></button>' +
            '   </div>' +
            '   <div class="btn-group pull-right hidden">' +
            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Search:&nbsp;</div>' +
            '       <div class="input-group pull-left">' +
            '           <input id="searchField" list="searchDataList" type="text" class="form-control" placeholder="..." style="padding:0px 4px;height:22px;width:100px">' +
            '           <datalist id="searchDataList">' +
            '           </datalist>' +
            '       </div>' +
            '       <button id="quickSearchButton" class="btn btn-default btn-xs" type="button"  style="height:22px;"><span class="glyphicon glyphicon-search"></span></button>' +
            '   </div>' +
            '</div>' +
            '';


        /**************/
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="tool-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: '32px'
        });
        $(this.targetDiv).append(this.div);
        /**************/

        this.selectButton = $(this.div).find('#selectButton');

        this.addButton = $(this.div).find('#addButton');
        this.linkButton = $(this.div).find('#linkButton');
        this.deleteButton = $(this.div).find('#deleteButton');

        this.collapseButton = $(this.div).find('#collapseButton');

        this.layoutButton = $(this.div).find('#layoutButton');
        this.layoutMenu = $(this.div).find('#layoutMenu');

        this.labelSizeButton = $(this.div).find('#labelSizeButton');
        this.labelSizeMenu = $(this.div).find('#labelSizeMenu');

        this.autoSelectButton = $(this.div).find('#autoSelectButton');
        this.autoSelectMenu = $(this.div).find('#autoSelectMenu');

        this.backgroundButton = $(this.div).find('#backgroundButton');
        this.backgroundColorField = $(this.div).find('#backgroundColorField');
        this.backgroundColorSelect = $(this.div).find('#backgroundColorSelect');
        this.importBackgroundImageButton = $(this.div).find('#importBackgroundImageButton');
        this.importBackgroundImageField = $(this.div).find('#importBackgroundImageField');


        this.progressBar = $(this.div).find('#progressBar')[0];
        this.progressBarCont = $(this.div).find('#progressBarCont')[0];
        this.zoomOutButton = $(this.div).find('#zoomOutButton')[0];
        this.zoomInButton = $(this.div).find('#zoomInButton')[0];

        this.showOverviewButton = $(this.div).find('#showOverviewButton');

        this.searchField = $(this.div).find('#searchField')[0];
        this.searchDataList = $(this.div).find('#searchDataList')[0];
        this.quickSearchButton = $(this.div).find('#quickSearchButton');


        this._setColorSelect(this.backgroundColorSelect);
        $(this.backgroundColorSelect).simplecolorpicker({picker: true}).on('change', function () {
            $(_this.backgroundColorField).val($(_this.backgroundColorSelect).val().replace('#', '')).change();
        });
        var colorPattern = /^([A-Fa-f0-9]{6})$/;
        $(this.backgroundColorField).on("change input", function () {
            var val = $(this).val();
            if (colorPattern.test(val)) {
                var color = '#' + $(this).val();
                _this._checkSelectColor(color, _this.backgroundColorSelect);
                $(_this.backgroundColorSelect).simplecolorpicker('selectColor', color);
                _this.trigger('backgroundColorField:change', {value: color, sender: {}})
            }
        });


        /* buttons */
        $(this.selectButton).click(function (e) {
            _this.trigger('selectButton:click', {clickEvent: e, sender: {}})
        });
        $(this.addButton).click(function (e) {
            _this.trigger('addButton:click', {clickEvent: e, sender: {}})
        });
        $(this.linkButton).click(function (e) {
            _this.trigger('linkButton:click', {clickEvent: e, sender: {}})
        });
        $(this.deleteButton).click(function (e) {
            _this.trigger('deleteButton:click', {clickEvent: e, sender: {}})
        });


        $(this.collapseButton).click(function (e) {
            _this.trigger('collapseButton:click', {clickEvent: e, sender: {}})
        });

        this._setLayoutMenu();
        this._setLabelSizeMenu();
        this._setAutoSelectMenu();

        $(this.backgroundButton).click(function (e) {
            $(this).toggleClass('active');
            var pressed = $(this).hasClass('active');
            _this.trigger('backgroundButton:click', {clickEvent: e, pressed: pressed, sender: {}})
        });
        $(this.importBackgroundImageButton).click(function (e) {
            $(_this.importBackgroundImageField).click();
        });
        $(this.importBackgroundImageField).change(function (e) {
            var file = this.files[0];
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

        });

        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });
        $(this.progressBarCont).click(function (e) {
            var offsetX = e.clientX - $(this).offset().left;
            console.log('offsetX ' + offsetX);
            console.log('e.offsetX ' + e.offsetX);
            var zoom = 100 / $(this).width() * offsetX;
            if (!_this.zoomChanging) {
                $(_this.progressBar).width(offsetX);
                _this.zoomChanging = true;
                setTimeout(function () {
                    _this._handleZoomSlider(zoom);
                    _this.zoomChanging = false;
                }, 500);
            }
        });

        $(this.showOverviewButton).click(function () {
            $(this).toggleClass('active');
            var pressed = $(this).hasClass('active');
            _this.trigger('showOverviewButton:change', {pressed: pressed, sender: _this});
        });

        $(this.searchField).bind("keyup", function (event) {
            var query = $(this).val();
            if (event.which === 13) {
                _this.trigger('search', {query: query, sender: _this});
            }
        });

        $(this.quickSearchButton).click(function () {
            var query = $(_this.searchField).val();
            _this.trigger('search', {query: query, sender: _this});
        });
        this.rendered = true;
    },
    draw: function () {

    },
    _setLayoutMenu: function () {
        var _this = this;
        var options = [/*'Force directed',*/'Dot', 'Neato', 'Twopi', 'Circo', 'Fdp', 'Sfdp'/*, 'Random', 'Circle', 'Square'*/];
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(this.layoutMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('layout:change', {option: $(this).text(), sender: _this});
            });
        }
    },
    _setLabelSizeMenu: function () {
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
            $(this.labelSizeMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('labelSize:change', {option: size[$(this).text()], sender: _this});
            });
        }
    },
    _setAutoSelectMenu: function () {
        var _this = this;
        var options = ['All Nodes', 'All Edges', 'Everything'/*, 'Adjacent', 'Neighbourhood', 'Connected'*/];
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(this.autoSelectMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('select:change', {option: $(this).text(), sender: _this});
            });
        }
    },

    _setColorSelect: function (select) {

//        var colors = ["cccccc", "888888",
//            "F26C4F", "F68E55", "FBAF5C", "FFF467", "ACD372", "7CC576", "3BB878", "1ABBB4", "00BFF3", "438CCA", "5574B9", "605CA8",
//            "855FA8", "A763A8", "F06EA9", "F26D7D",
//            "000000"
//        ];

        var colors = ["FFFFFF", "000000", "888888", "CCCCCC",
            "F7977A", "F9AD81", "FDC68A", "FFF79A", "C4DF9B", "A2D39C", "82CA9D", "7BCDC8", "6ECFF6", "7EA7D8", "8493CA", "8882BE",
            "A187BE", "BC8DBF", "F49AC2", "F6989D"
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
    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
        $(this.progressBar).css("width", this.zoom + '%');
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.trigger('zoom:change', {zoom: this.zoom, sender: this});
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
        $(this.progressBar).css("width", this.zoom + '%');
    },
    setZoom: function (zoom) {
        this.zoom = zoom;
        $(this.progressBar).css("width", zoom + '%');
    }
}
