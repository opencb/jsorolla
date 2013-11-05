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
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

//        <button type="button" class="btn btn-default btn-lg">
//            <span class="glyphicon glyphicon-star"></span> Star
//        </button>

        var navgationHtml = '' +
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group btn-group-sm">' +
            '       <button id="zoomOutButton" type="button" class="btn btn-default btn-xs"><span style="color:#428BCA" class="glyphicon glyphicon-minus"></span></button>' +
            '       <button id="zoomInButton" type="button" class="btn btn-default btn-xs"><span style="color:#428BCA" class="glyphicon glyphicon-plus"></span></button>' +
            '   </div>' +
            '</div>' +
            '' +
            '' +
            '' +
            '';

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);


        var zoomOutButton = $(this.div).find('#zoomOutButton')[0];
        var zoomInButton = $(this.div).find('#zoomInButton')[0];
//        $(this.div).find('#')[0];

        $(zoomOutButton).on('click', function () {
            _this.trigger('zoom-out-button:click', { sender: _this});
        });
        $(zoomInButton).on('click', function () {
            _this.trigger('zoom-in-button:click', { sender: _this});
        });

        this.rendered = true;
    },


}