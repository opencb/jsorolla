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

VariantTrack.prototype = new FeatureTrack({});

function VariantTrack(args) {
    FeatureTrack.call(this, args);

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);
console.log("dentro del variantTRack")

};

VariantTrack.prototype.updateHeight = function () {
    //this._updateHeight();
    if (this.histogram) {
        this.contentDiv.style.height = this.histogramRenderer.histogramHeight + 5 + 'px';
        this.main.setAttribute('height', this.histogramRenderer.histogramHeight);
        return;
    }

    var renderedHeight = this.height;
    var heightKeys = Object.keys(this.renderedArea);
    heightKeys.sort(function (a, b) {
        return parseInt(b) - parseInt(a);
    });
    if (heightKeys.length > 0) {
        renderedHeight = parseInt(heightKeys[0]) + 30;
    }
    renderedHeight = Math.max(renderedHeight,this.height);
    this.main.setAttribute('height', renderedHeight);

    if (this.resizable) {
        if (this.autoHeight == false) {
            this.contentDiv.style.height = this.height + 10 + 'px';
        } else if (this.autoHeight == true) {
            var x = this.pixelPosition;
            var width = this.width;
            var lastContains = 0;
            for (var i in this.renderedArea) {
                if (this.renderedArea[i].contains({
                        start: x,
                        end: x + width
                    })) {
                    lastContains = i;
                }
            }
            var visibleHeight = Math.max(parseInt(lastContains) + 30 , this.height);
            this.contentDiv.style.height = visibleHeight + 10 + 'px';
            this.main.setAttribute('height', visibleHeight);
        }
    }
};



VariantTrack.prototype.move = function (disp) {
    var _this = this;

    this.dataType = 'features';
    if (this.histogram) {
        this.dataType = 'histogram';
    }

    _this.region.center();
    var pixelDisplacement = disp * _this.pixelBase;
    this.pixelPosition -= pixelDisplacement;

    //parseFloat important
    var move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
    this.svgCanvasFeatures.setAttribute("x", move);

    var virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
    var virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {

        if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
            console.log("a por las variantes dentro del rendderer")
            this.dataAdapter.getVariant({
                dataType: this.dataType,
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                    end: this.svgCanvasLeftLimit
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                },
                done: function (event) {
                    _this.getDataHandler(event);
                }
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
            this.dataAdapter.getVariant({
                dataType: this.dataType,
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: this.svgCanvasRightLimit,
                    end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset)
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                },
                done: function (event) {
                    _this.getDataHandler(event);
                }

            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
        }
    }

    if (this.autoHeight == true) {
        this.updateHeight();
    }
};
