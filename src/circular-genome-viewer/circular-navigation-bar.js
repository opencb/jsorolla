/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
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

function CircosNavigationBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("NavigationBar");

    this.zoom;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.currentChromosomeList = [];

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CircosNavigationBar.prototype = {

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($(this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

//        <button type="button" class="btn btn-default btn-lg">
//            <i class="fa fa-star" aria-hidden="true"></i> Star
//        </button>


        var navgationHtml = '' +
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group btn-group-sm">' +
            '       <button id="zoomOutButton" type="button" class="btn btn-light btn-sm"><i style="color:#428BCA" class="fa fa-minus" aria-hidden="true"></i></button>' +
            '       <button id="zoomInButton" type="button" class="btn btn-light btn-sm"><i style="color:#428BCA" class="fa fa-plus" aria-hidden="true"></i></button>' +
            '       <button id="zoomRestoreButton" type="button" class="btn btn-light btn-sm"><i style="color:#428BCA" class="fa fa-repeat" aria-hidden="true"></i></button>' +
            '   </div>' +
//            '   <div class="btn-group btn-group-sm">' +
//            '       <button id="chromosomesButton" type="button" class="btn btn-default btn-xs" data-toggle="button">Chromosomes</button>' +
//            '   </div>' +
            '</div>' +
            '<br>'+
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div id="chromosomeBtns" class="btn-group btn-group-sm">' +
            '   </div>' +
            '</div>' +
//            '' +
//            '<ul class="nav nav-pills">'+
//            '    <li id="zoomOutButton"     class=""><a><i class="fa fa-minus" aria-hidden="true"></i></a></li>'+
//            '    <li id="zoomInButton"      class=""><a><i class="fa fa-plus" aria-hidden="true"></i></a></li>'+
//            '    <li id="zoomRestoreButton" class=""><a><i class="fa fa-repeat" aria-hidden="true"></i></a></li>'+
//            '    <li class="dropdown">'+
//            '        <a id="drop4" role="button" data-toggle="dropdown" href="#">Chromosomes <b class="caret"></b></a>'+
//            '        <ul id="menu1" class="dropdown-menu" role="menu" aria-labelledby="drop4">'+
//            '            <li role="presentation" class=""><a role="menuitem" tabindex="-1"><button type="button" class="btn btn-primary" data-toggle="button">1</button></a></li>'+
//            '        </ul>'+
//            '    </li>'+
//            '</ul>'+
            '' +
            '' +
            '';

        var chromosomesHtml = '' +
            '<button id="chromosomesButton" type="button" class="btn btn-light btn-sm" data-toggle="button">1</button>' +
            '';

        this.targetDiv = this.targetId;
        this.div = $('<div id="navigation-bar" class="unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);


        var zoomOutButton = $(this.div).find('#zoomOutButton')[0];
        var zoomInButton = $(this.div).find('#zoomInButton')[0];
        var zoomRestoreButton = $(this.div).find('#zoomRestoreButton')[0];
        var chromosomesButton = $(this.div).find('#chromosomesButton')[0];

        var buttonsHtml = this.createChromosomeButtons()
        var chromosomeBtns = $(this.div).find('#chromosomeBtns')[0];
        $(chromosomeBtns).append(buttonsHtml)
//        $(this.div).find('#')[0];

        $(zoomOutButton).on('click', function () {
            _this.trigger('zoom-out-button:click', { sender: _this});
        });
        $(zoomInButton).on('click', function () {
            _this.trigger('zoom-in-button:click', { sender: _this});
        });
        $(zoomRestoreButton).on('click', function () {
            _this.trigger('zoom-restore-button:click', { sender: _this});
        });
        $(chromosomeBtns).on('click', function (e) {
            $(e.target).toggleClass('btn-primary active');
            var obj = {};
            $(this).find('button').each(function(){
                obj[$(this).text()] = false;
                if($(this).hasClass('active')){
                    obj[$(this).text()] = true;
                }
            });
            _this.trigger('chromosome-buttons:click', { names:obj, sender: _this});
        });

        this.rendered = true;
    },
    createChromosomeButtons: function () {
        var html = '';
        var chromosomes = this.genomesChromosomes['hsapiens'];
        for (var i = 0; i < chromosomes.length; i++) {
            var chr = chromosomes[i];
           html+= '<button id="chromosomesButton" type="button" class="btn btn-light btn-sm" style="width:34px">'+chr.name+'</button>';
        }
        html += '</div>';
        return html;
    }


}
