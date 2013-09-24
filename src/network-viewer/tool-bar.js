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

ToolBar.prototype = {
    render:function(targetId){
        if(targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        var toolbarHtml =
                '<div class="btn-group">' +
                '<span id="collapseButton" class="btn btn-mini"><i class="icon-collapse" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '</div>' +
                '<div class="btn-group">' +
                '<span id="" class="btn btn-mini dropdown-toggle" data-toggle="dropdown"><i class="icon-layout" style="height:16px;width:16px; margin-top: -2px"></i> <span class="caret"></span></span>'+
                '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" id="layoutMenu">' +
                '</ul>' +
                '</div>' +
                '<div class="btn-group">' +
                '<span id="" class="btn btn-mini dropdown-toggle" data-toggle="dropdown"><i class="icon-label-size" style="height:16px;width:16px; margin-top: -2px"></i> <span class="caret"></span></span>'+
                '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" id="labelSizeMenu">' +
                '</ul>' +
                '</div>' +
                '<div class="btn-group">' +
                '<span id="" class="btn btn-mini dropdown-toggle" data-toggle="dropdown"><i class="icon-auto-select" style="height:16px;width:16px; margin-top: -2px"></i> <span class="caret"></span></span>'+
                '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" id="autoSelectMenu">' +
                '</ul>' +
                '</div>' +
                '<div class="btn-group">' +
                '<span id="backgroundButton" class="btn btn-mini"><i class="icon-background-option" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '</div>' +
                '<div class="btn-group" data-toggle="buttons-checkbox">' +
                '<span id="overviewButton" class="btn btn-mini"><i class="icon-select" style="height:16px;width:16px; margin-top: -2px"></i></span>' +
                '</div>' +
                '<span id="" class="btn btn-mini"><i class="" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '<span id="" class="btn btn-mini"><i class="" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '<span id="" class="btn btn-mini"><i class="" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '<span id="" class="btn btn-mini"><i class="" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '<span id="" class="btn btn-mini"><i class="" style="height:16px;width:16px; margin-top: -2px"></i></span>'+
                '';


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="tool-bar" class="nv-toolbar">' + toolbarHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);

        this.collapseButton = $(this.div).find('#collapseButton');

        this.layoutMenu = $(this.div).find('#layoutMenu');
        this._setLayoutMenu();

        this.labelSizeMenu = $(this.div).find('#labelSizeMenu');
        this._setLabelSizeMenu();

        this.autoSelectMenu = $(this.div).find('#autoSelectMenu');
        this._setAutoSelectMenu();

        this.backgroundButton = $(this.div).find('#backgroundButton');


        $(this.collapseButton).click(function () {
            //todo
        });

        $(this.backgroundButton).click(function () {
            //todo
        });

    },
    draw:function(){

    },

    _setLayoutMenu:function(){
        var  _this = this;
        var options = ['Dot','Neato','Twopi','Circo','Fdp','Sfdp','Random','Circle','Square'];
        for (var i in options){
            var menuEntry = $('<li><a tabindex="-1">' + options[i] + '</a></li>')[0];
            $(this.layoutMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.trigger('layout:change',{layout:$(this).text(), sender:_this});
            });
        }
    },
    _setLabelSizeMenu:function(){
        var options = ['None','Small','Medium','Large','x-Large'];
        for (var i in options){
            var menuEntry = $('<li><a tabindex="-1">' + options[i] + '</a></li>')[0];
            $(this.labelSizeMenu).append(menuEntry);
            $(menuEntry).click(function () {
                console.log($(this).text());
            });
        }
    },
    _setAutoSelectMenu:function(){
        var options = ['All Nodes','All Edges','Everything','Adjacent','Neighbourhood','Connected'];
        for (var i in options){
            var menuEntry = $('<li><a tabindex="-1">' + options[i] + '</a></li>')[0];
            $(this.autoSelectMenu).append(menuEntry);
            $(menuEntry).click(function () {
                console.log($(this).text());
            });
        }
    }
}
