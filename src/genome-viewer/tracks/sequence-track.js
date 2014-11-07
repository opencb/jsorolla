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

SequenceTrack.prototype = new Track({});

function SequenceTrack(args) {
    args.resizable = false;
    Track.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    _.extend(this, args);
};

SequenceTrack.prototype.clean = function () {
//    console.time("-----------------------------------------empty");
    while (this.svgCanvasFeatures.firstChild) {
        this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
    }
//    console.timeEnd("-----------------------------------------empty");
    this._clean();
};

SequenceTrack.prototype.render = function (targetId) {
    var _this = this;
    this.initializeDom(targetId);
    /* Internal svg structure */
    this.main = SVG.addChild(this.contentDiv, 'svg', {
        'id': this.id,
        'class': 'trackSvg',
        'x': 0,
        'y': 0,
        'width': this.width,
        'height': this.height
    });
    this.svgGroup = SVG.addChild(this.main, "g", {

    });
    this.svgCanvasFeatures = SVG.addChild(this.svgGroup, 'svg', {
        'class': 'features',
        'x': -this.pixelPosition,
        'width': this.svgCanvasWidth,
        'height': this.height
    });
    /**/


    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2

    this.dataAdapter.on('data:ready', function (event) {
        _this.renderer.render(event, {
            svgCanvasFeatures: _this.svgCanvasFeatures,
            pixelBase: _this.pixelBase,
            position: _this.region.center(),
            width: _this.width,
            pixelPosition: _this.pixelPosition
        });
        _this.setLoading(false);
    });
};

SequenceTrack.prototype.draw = function () {
    var _this = this;
    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2

    this.clean();

    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
        this.setLoading(true);
        var data = this.dataAdapter.getData({
            region: new Region({
                chromosome: this.region.chromosome,
                start: this.region.start - this.svgCanvasOffset * 2,
                end: this.region.end + this.svgCanvasOffset * 2
            })
        });
//        this.invalidZoomText.setAttribute("visibility", "hidden");
    } else {
//        this.invalidZoomText.setAttribute("visibility", "visible");
    }


};


SequenceTrack.prototype.move = function (disp) {
    var _this = this;
    var pixelDisplacement = disp * _this.pixelBase;
    this.pixelPosition -= pixelDisplacement;

    //parseFloat important
    var move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
    this.svgCanvasFeatures.setAttribute("x", move);

    var virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
    var virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

    // check if track is visible in this region size
    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
        if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
            this.dataAdapter.getData({
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                    end: this.svgCanvasLeftLimit
                }),
                sender: 'move'
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
            this.dataAdapter.getData({
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: this.svgCanvasRightLimit,
                    end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset),
                }),
                sender: 'move'
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
        }

    }

};