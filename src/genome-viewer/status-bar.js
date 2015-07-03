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

function StatusBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("StatusBar");

    this.target;
    this.autoRender = true;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

StatusBar.prototype = {
    render: function () {

        this.div = $('<div id="' + this.id + '" class="ocb-gv-status-bar"></div>')[0];

        this.rightDiv = $('<div class="ocb-gv-status-right" id="' + this.id + 'position"</div>')[0];
        this.leftDiv = $('<div class="ocb-gv-status-left" id="' + this.id + 'position"></div>')[0];
        $(this.div).append(this.leftDiv);
        $(this.div).append(this.rightDiv);

        this.mousePositionEl = $('<span id="' + this.id + 'position"></span>')[0];
        this.mousePositionBase = document.createElement('span');
        this.mousePositionBase.style.marginRight = '5px';
        this.mousePositionRegion = document.createElement('span');
        this.mousePositionEl.appendChild(this.mousePositionBase);
        this.mousePositionEl.appendChild(this.mousePositionRegion);

        this.versionEl = $('<span id="' + this.id + 'version">' + this.version + '</span>')[0];
        $(this.rightDiv).append(this.mousePositionEl);
        $(this.leftDiv).append(this.versionEl);

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    },
    setRegion: function (event) {
        this.region.load(event.region);
        $(this.mousePositionEl).html(Utils.formatNumber(event.region.center()));
    },
    setMousePosition: function (event) {
        this.mousePositionBase.style.color = SEQUENCE_COLORS[event.base];
        this.mousePositionBase.textContent = event.base;

        this.mousePositionRegion.textContent = this.region.chromosome + ':' + Utils.formatNumber(event.mousePos);
    }

}