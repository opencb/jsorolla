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

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.rendered=false;
    if(this.autoRender){
        this.render();
    }
};

StatusBar.prototype = {
    render: function (targetId) {
        this.targetId = (targetId) ? targetId : this.targetId;
        if($('#' + this.targetId).length < 1){
            console.log('targetId not found in DOM');
            return;
        }
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="gv-status-bar" align="right"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.mousePositionDiv = $('<div id="' + this.id + 'position" style="display: inline">&nbsp;</div>')[0];
        $(this.mousePositionDiv).css({
            'margin-left': '5px',
            'margin-right': '5px',
            'font-size':'12px'
        });

        this.versionDiv = $('<div id="' + this.id + 'version" style="display: inline">' + this.version + '</div>')[0];
        $(this.versionDiv).css({
            'margin-left': '5px',
            'margin-right': '5px'
        });


        $(this.div).append(this.mousePositionDiv);
        $(this.div).append(this.versionDiv);

        this.rendered = true;
    },
    setRegion: function (event) {
        this.region.load(event.region);
        $(this.mousePositionDiv).html(Utils.formatNumber(event.region.center()));
    },
    setMousePosition: function (event) {
        $(this.mousePositionDiv).html(event.baseHtml+' '+this.region.chromosome+':'+Utils.formatNumber(event.mousePos));
    }

}