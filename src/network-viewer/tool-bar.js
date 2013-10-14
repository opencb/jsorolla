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

        var html = '' +
            '<a id="collapseButton">&nbsp;</a>' +

            '<button id="layoutButton">&nbsp;</button>' +
            '<ul id="layoutMenu" style="display: inline-block; position: absolute; width: 150px; z-index:100000"></ul>' +

            '<button id="labelSizeButton">&nbsp;</button>' +
            '<ul id="labelSizeMenu" style="display: inline-block; position: absolute; width: 150px; z-index:100000"></ul>' +

            '<button id="autoSelectButton">&nbsp;</button>' +
            '<ul id="autoSelectMenu" style="display: inline-block; position: absolute; width: 150px; z-index:100000"></ul>' +

            '<div class="buttonset inlineblock">' +
            '<a id="zoomOutButton">&nbsp;</a>' +
            '<div id="slider" class="ocb-zoom-slider"></div>' +
            '<a id="zoomInButton">&nbsp;</a>' +
            '</div>' +

            '<a id="backgroundButton">&nbsp;</a>' +

            '<input type="checkbox" checked="true" id="overviewButton" /><label for="overviewButton"></label>' +

            '<label class="ocb-text" style="margin-left:10px" for="searchField">Find:</label><input id="searchField" class="ocb-input-text" placeholder="Enter search..." type="text">' +
            '<button id="searchButton">Go!</button>' +

            '';

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + html + '</div>')[0];
        $(this.targetDiv).append(this.div);

        //set jQuery UI functions
        $(this.div).find('.buttonset').buttonset().css({margin: '0px 10px'});


        /* collapseButton */
        this.collapseButton = $(this.div).find('#collapseButton').button({icons: {primary: 'icon-collapse'}, text: false});
        $(this.collapseButton).click(function (e) {
            _this.trigger('collapseButton:click', {clickEvent: e, sender: {}})
        });

        /* layout BUTTON and MENU*/
        this.layoutButton = $(this.div).find('#layoutButton').button({
            icons: {primary: 'icon-layout', secondary: 'ui-icon-triangle-1-s'}, text: ' '
        });
        this.layoutMenu = $(this.div).find('#layoutMenu').hide().menu();
        this._setLayoutMenu();
        $(this.layoutButton).click(function () {
            return _this._menuClickBehavior($(_this.layoutMenu), this);
        });

        /* labelSize BUTTON and MENU */
        this.labelSizeButton = $(this.div).find('#labelSizeButton').button({
            icons: {primary: 'icon-label-size', secondary: 'ui-icon-triangle-1-s'}, text: ' '
        });
        this.labelSizeMenu = $(this.div).find('#labelSizeMenu').hide().menu();
        this._setLabelSizeMenu();
        $(this.labelSizeButton).click(function () {
            return _this._menuClickBehavior($(_this.labelSizeMenu), this);
        });


        /* autoSelect size BUTTON and MENU */
        this.autoSelectButton = $(this.div).find('#autoSelectButton').button({
            icons: {primary: 'icon-auto-select', secondary: 'ui-icon-triangle-1-s'}, text: ' '
        });
        this.autoSelectMenu = $(this.div).find('#autoSelectMenu').hide().menu();
        this._setAutoSelectMenu();
        $(this.autoSelectButton).click(function () {
            return _this._menuClickBehavior($(_this.autoSelectMenu), this);
        });

        /* backgroundButton */
        this.backgroundButton = $(this.div).find('#backgroundButton').button({icons: {primary: 'icon-background-option'}, text: false});
        $(this.backgroundButton).click(function (e) {
            _this.trigger('backgroundButton:click', {clickEvent: e, sender: {}})
        });




        /* zoom */
        this.zoomSlider = $(this.div).find("#slider");
        $(this.zoomSlider).slider({
            range: "min",
            value: this.zoom,
            min: 0,
            max: 100,
            step: Number.MIN_VALUE,
            stop: function (event, ui) {
                _this._handleZoomSlider(ui.value);
            }
        });

        this.zoomInButton = $(this.div).find('#zoomInButton').button({icons: {primary: 'ocb-icon-plus'}, text: false});
        this.zoomOutButton = $(this.div).find('#zoomOutButton').button({icons: {primary: 'ocb-icon-minus'}, text: false});
        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });


        /* seach */
        this.searchField = $(this.div).find('#searchField')[0];
        $(this.searchField).bind('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) { //Enter keycode
                _this._goRegion($(this).val());
            }
        });

        this.searchButton = $(this.div).find('#searchButton').button();
        $(this.searchButton).click(function () {
           var value =  $(_this.searchField).val();
            if(!_.isEmpty(value)){
                _this.trigger('search:change', {value: value, sender: _this});
            }
        });


        /* overviewButton */
        this.overviewButton = $(this.div).find('#overviewButton').button({icons: {primary: 'icon-select'}, text: false, label: 'Show/Hide Overview'});
        $(this.overviewButton).click(function () {
            _this.trigger('overviewButton:change', {selected: $(this).is(':checked'), sender: _this});
        });




        this.rendered = true;
    },
    draw: function () {

    },

    _menuClickBehavior:function(menu, scope){
        if ($(menu).css('display') == 'none') {
            $(menu).show().position({
                my: "left top",
                at: "left bottom",
                of: scope
            });
            $(document).one("click", function () {
                menu.hide();
            });
        } else {
            menu.hide();
        }
        return false;
    },
    _setLayoutMenu: function () {
        var _this = this;
        var options = ['Dot', 'Neato', 'Twopi', 'Circo', 'Fdp', 'Sfdp', 'Random', 'Circle', 'Square'];
        for (var i in options) {
            var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
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
            var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
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
            var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(this.autoSelectMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('select:change', {option: $(this).text(), sender: _this});
            });
        }
    },
    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
        $(this.zoomSlider).slider("value", this.zoom);
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.trigger('zoom:change', {zoom: this.zoom, sender: this});
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
        $(this.zoomSlider).slider("value", this.zoom);
    }
}
