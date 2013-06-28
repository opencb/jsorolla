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

function IcgcNavigationBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("IcgcNavigationBar");

    this.species = 'Homo sapiens';
    this.increment = 3;
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

IcgcNavigationBar.prototype = {

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        var navgationHtml =
                '<a id="zoomOutButton" class="btn"><i class="icon-minus"></i></a>' +
                '<div id="slider" class="ocb-zoom-slider"></div>' +
                '<a id="zoomInButton" class="btn"><i class="icon-plus"></i></a>' +
                '<a id="zoomOutButton" class="btn"><i class="icon-resize-full"></i></a>' +
                '';




        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);

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

        this.zoomInButton = $(this.div).find('#zoomInButton');
        this.zoomOutButton = $(this.div).find('#zoomOutButton');
        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });

        this.fullScreenButton = $(this.div).find('#fullScreenButton');
        $(this.fullScreenButton).click(function () {
            _this.trigger('fullscreen:change',{fullscreen:true,sender:_this})
        });

        this.rendered = true;
    },
    draw: function () {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }
    },

    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
        $(this.zoomSlider).slider("value", this.zoom);
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.region.load(this._calculateRegionByZoom());
        $(this.regionField).val(this.region.toString());
        this.trigger('region:change', {region: this.region, sender: this});
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
        $(this.zoomSlider).slider("value", this.zoom);
    },


    setVisible: function (obj) {
        for (key in obj) {
            var query = $(this.div).find('#' + key);
            if (obj[key]) {
                query.css({display: 'inline-block'})
            } else {
                query.css({display: 'none'})
            }
        }
    },

    setRegion: function (region) {
        this.region.load(region);
        $(this.chromosomeText).text(this.region.chromosome);
        $(this.regionField).val(this.region.toString());
        this._recalculateZoom();
    },

    setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
    },

    _recalculateZoom: function () {
        this.zoom = this._calculateZoomByRegion();
        $(this.zoomSlider).slider("value", this.zoom);
    },

    _calculateRegionByZoom: function () {
        var zoomBaseLength = (this.width - this.svgCanvasWidthOffset) / Utils.getPixelBaseByZoom(this.zoom);
        var centerPosition = this.region.center();
        var aux = Math.ceil((zoomBaseLength / 2) - 1);
        var start = Math.floor(centerPosition - aux);
        var end = Math.floor(centerPosition + aux);
        return {start: start, end: end};
    },
    _calculateZoomByRegion: function () {
        return Utils.getZoomByPixelBase((this.width - this.svgCanvasWidthOffset) / this.region.length());
    },
    setVisible: function (obj) {
        for (key in obj) {
            var query = $(this.div).find('#' + key);
            if (obj[key]) {
                query.show();
            } else {
                query.hide();
            }
        }
    },
    setFullScreenButtonVisible: function (bool) {
        this.fullscreenButton.setVisible(bool);
    }

}