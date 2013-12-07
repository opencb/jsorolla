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
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="selectButton" class="btn btn-default" type="button"><span class="ocb-icon icon-mouse-select"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="addButton" class="btn btn-default" type="button"><span class="ocb-icon icon-add"></span></button>' +
            '       <button id="linkButton" class="btn btn-default" type="button"><span class="ocb-icon icon-link"></span></button>' +
            '       <button id="deleteButton" class="btn btn-default" type="button"><span class="ocb-icon icon-delete"></span></button>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="nodeShapeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-shape"></span><span class="caret"></button>' +
            '        <ul id="nodeShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '        <button id="nodeSizeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-size"></span><span class="caret"></button>' +
            '        <ul id="nodeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="nodeStrokeSizeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-stroke-size"></span><span class="caret"></button>' +
            '       <ul id="nodeStrokeSizeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <input id="nodeColorField" type="text">' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <input id="nodeStrokeColorField" type="text">' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="nodeOpacityButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-node-opacity"></span><span class="caret"></button>' +
            '       <ul id="nodeOpacityMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group" style="width:220px;margin-left: 5px">' +
            '   <div class="input-group">' +
            '       <input id="nodeNameField" type="text" class="form-control" placeholder="node name" style="padding:0px 4px;height:23px;width:100px">' +
            '       <input id="nodeLabelField" type="text" class="form-control" placeholder="node label" style="padding:0px 4px;height:23px;width:100px">' +
            '   </div>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <button id="edgeShapeButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="ocb-icon icon-edge-type"></span><span class="caret"></button>' +
            '       <ul id="edgeShapeMenu" class="dropdown-menu" role="menu"></ul>' +
            '   </div>' +
            '   <div class="btn-group btn-group-xs">' +
            '       <input id="edgeColorField" type="text">' +
            '   </div>' +
            '   <div class="btn-group" style="width:110px;margin-left: 5px">' +
            '   <div class="input-group">' +
            '       <input id="edgeLabelField" type="text" class="form-control" placeholder="edge label" style="padding:0px 4px;height:23px;width:100px">' +
            '   </div>' +
            '   </div>' +
            '</div>' +
            '';


        /**************/
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="edition-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);
        /**************/

        this.selectButton = $(this.div).find('#selectButton');

        this.addButton = $(this.div).find('#addButton');
        this.linkButton = $(this.div).find('#linkButton');
        this.deleteButton = $(this.div).find('#deleteButton');

        /* node */
        this.nodeShapeButton = $(this.div).find('#nodeShapeButton');
        this.nodeSizeButton = $(this.div).find('#nodeSizeButton');
        this.nodeStrokeSizeButton = $(this.div).find('#nodeStrokeSizeButton');
        this.nodeOpacityButton = $(this.div).find('#nodeOpacityButton');

        this.nodeShapeMenu = $(this.div).find('#nodeShapeMenu');
        this.nodeSizeMenu = $(this.div).find('#nodeSizeMenu');
        this.nodeStrokeSizeMenu = $(this.div).find('#nodeStrokeSizeMenu');
        this.nodeOpacityMenu = $(this.div).find('#nodeOpacityMenu');

        this.nodeColorField = $(this.div).find('#nodeColorField');
        this.nodeStrokeColorField = $(this.div).find('#nodeStrokeColorField');

        this.nodeNameField = $(this.div).find('#nodeNameField');
        this.nodeLabelField = $(this.div).find('#nodeLabelField');


        /* edge */
        this.edgeShapeButton = $(this.div).find('#edgeShapeButton');
        this.edgeShapeMenu = $(this.div).find('#edgeShapeMenu');

        this.edgeColorField = $(this.div).find('#edgeColorField');

        this.edgeLabelField = $(this.div).find('#edgeLabelField');

        /*************/

        /* Color picker */
        var pickAColorConfig = {
            showSpectrum: true,
            showSavedColors: true,
            saveColorsPerElement: false,
            fadeMenuToggle: true,
            showAdvanced: true,
            showBasicColors: true,
            showHexInput: false,
            allowBlank: true
        }


        $(this.nodeColorField).pickAColor(pickAColorConfig);
        $(this.nodeStrokeColorField).pickAColor(pickAColorConfig);
        $(this.edgeColorField).pickAColor(pickAColorConfig);

        $(this.div).find('.pick-a-color-markup').addClass('pull-left');
        $(this.div).find('.color-dropdown').css({
            padding: '1px 4px'
        });

        $(this.nodeColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');
        $(this.nodeStrokeColorField).next().find('button').prepend('<span class="ocb-icon icon-stroke-color"></span>');
        $(this.edgeColorField).next().find('button').prepend('<span class="ocb-icon icon-fill-color"></span>');

        $(this.nodeColorField).on("change", function () {
            _this.trigger('nodeColorField:change', {value: '#' + $(this).val(), sender: {}})
        });
        $(this.nodeStrokeColorField).on("change", function () {
            _this.trigger('nodeStrokeColorField:change', {value: '#' + $(this).val(), sender: {}})
        });
        $(this.edgeColorField).on("change", function () {
            _this.trigger('edgeColorField:change', {value: '#' + $(this).val(), sender: {}})
        });
        /* */

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


        /* menus */
        var opacities = {"none": '1', "low": '0.8', "medium": '0.5', "high": '0.2', "invisible": '0'};
        var sizeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '14', '16', '22', '28', '36', '72'];

        this._setMenu('nodeShape', this.nodeShapeMenu, ['circle', 'square', 'ellipse', 'rectangle']);
        this._setMenu('nodeSize', this.nodeSizeMenu, sizeOptions);
        this._setMenu('nodeStrokeSize', this.nodeStrokeSizeMenu, sizeOptions);
        this._setMenu('opacity', this.nodeOpacityMenu, ["none", "low", "medium", "high", "invisible"], opacities);
        this._setMenu('edgeShape', this.edgeShapeMenu, ["directed", "odirected", "undirected", "inhibited", "dot", "odot"]);


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

        this.rendered = true;
    },

    _setMenu: function (eventName, menu, options, hashTable) {
        var _this = this;
        for (var i in options) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + options[i] + '</a></li>')[0];
            $(menu).append(menuEntry);
            $(menuEntry).click(function () {
                var value = $(this).text();
                if (typeof hashTable !== 'undefined') {
                    value = hashTable[value];
                }
                _this.trigger(eventName + ':change', {value: value, sender: _this});
            });
        }
    }
}
