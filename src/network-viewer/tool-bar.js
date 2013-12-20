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
    this.zoom = 100;

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
            '       <button id="collapseButton" class="btn btn-default" type="button"><span class="ocb-icon icon-collapse"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="layoutButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-layout"></span><span class="caret"></button>' +
            '       <ul id="layoutMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="labelSizeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-label-size"></span><span class="caret"></button>' +
            '       <ul id="labelSizeMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="autoSelectButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-auto-select"></span><span class="caret"></button>' +
            '       <ul id="autoSelectMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="backgroundButton" class="btn btn-default" type="button"><span class="ocb-icon icon-background-option"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs" style="margin:0px 0px 0px 15px;">' +
            '       <button id="zoomOutButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-plus"></span></button>' +
            '       <div id="progressBarCont" class="progress pull-left" style="width:120px;height:10px;margin:5px 2px 0px 2px;background-color: #d5d5d5">' +
            '           <div id="progressBar" class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
            '           </div>' +
            '       </div>' +
            '       <button id="zoomInButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-minus"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="showOverviewButton" class="btn btn-default" type="button"><span class="ocb-icon icon-select"></span></button>' +
            '   </div>' +
            '   <div class="btn-group pull-right">' +
            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Search:&nbsp;</div>' +
            '       <div class="input-group pull-left">' +
            '           <input id="searchField" list="searchDataList" type="text" class="form-control" placeholder="..." style="padding:0px 4px;height:22px;width:100px">' +
            '           <datalist id="searchDataList">' +
            '           </datalist>' +
            '       </div>' +
            '       <button id="quickSearchButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-search"></span></button>' +
            '   </div>' +
            '</div>' +
            '';



        /**************/
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="tool-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);
        /**************/

        this.collapseButton = $(this.div).find('#collapseButton');

        this.layoutButton = $(this.div).find('#layoutButton');
        this.layoutMenu = $(this.div).find('#layoutMenu');

        this.labelSizeButton = $(this.div).find('#labelSizeButton');
        this.labelSizeMenu = $(this.div).find('#labelSizeMenu');

        this.autoSelectButton = $(this.div).find('#autoSelectButton');
        this.autoSelectMenu = $(this.div).find('#autoSelectMenu');

        this.backgroundButton = $(this.div).find('#backgroundButton');

        this.progressBar = $(this.div).find('#progressBar')[0];
        this.progressBarCont = $(this.div).find('#progressBarCont')[0];
        this.zoomOutButton = $(this.div).find('#zoomOutButton')[0];
        this.zoomInButton = $(this.div).find('#zoomInButton')[0];

        this.showOverviewButton = $(this.div).find('#showOverviewButton');

        this.searchField = $(this.div).find('#searchField')[0];
        this.searchDataList = $(this.div).find('#searchDataList')[0];
        this.quickSearchButton = $(this.div).find('#quickSearchButton');

        $(this.collapseButton).click(function (e) {
            _this.trigger('collapseButton:click', {clickEvent: e, sender: {}})
        });

        this._setLayoutMenu();
        this._setLabelSizeMenu();
        this._setAutoSelectMenu();

        $(this.backgroundButton).click(function (e) {
            _this.trigger('backgroundButton:click', {clickEvent: e, sender: {}})
        });

        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });
        $(this.progressBarCont).click(function (e) {
            var offsetX = e.clientX - $(this).offset().left;
            console.log('offsetX '+offsetX);
            console.log('e.offsetX '+ e.offsetX);
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
            _this.trigger('showOverviewButton:change', {selected: $(this).hasClass('active'), sender: _this});
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
        var options = ['Force directed','Dot', 'Neato', 'Twopi', 'Circo', 'Fdp', 'Sfdp', 'Random', 'Circle', 'Square'];
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
            "Small": 8,
            "Medium": 10,
            "Large": 12,
            "x-Large": 16
        };
        var options = ['None', 'Small', 'Medium', 'Large', 'x-Large'];
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
        var options = ['All Nodes', 'All Edges', 'Everything', 'Adjacent', 'Neighbourhood', 'Connected'];
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(this.autoSelectMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('select:change', {option: $(this).text(), sender: _this});
            });
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
    }
}
