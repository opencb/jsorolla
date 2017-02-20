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

AlignmentTrack.prototype = new Track({});

function AlignmentTrack(args) {
    Track.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    this.retrievedAlignments = null;
    this.retrievedChunkIds = new Set();

    //save default render reference;
    this.defaultRenderer = this.renderer;
    this.histogramRenderer = new window[this.histogramRendererName](args);

    this.dataType = 'features';

    //set instantiation args, must be last
    _.extend(this, args);

};

AlignmentTrack.prototype.clean = function () {
    this._clean();

    //    console.time("-----------------------------------------empty");
    while (this.svgCanvasFeatures.firstChild) {
        this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
    }
    //    console.timeEnd("-----------------------------------------empty");
};

AlignmentTrack.prototype.updateHeight = function () {
    //    this._updateHeight();
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
            var visibleHeight = parseInt(lastContains) + 30;
            this.contentDiv.style.height = visibleHeight + 10 + 'px';
            this.main.setAttribute('height', visibleHeight);
        }
    }
};

AlignmentTrack.prototype.setWidth = function (width) {
    this._setWidth(width);
    this.main.setAttribute("width", this.width);
};

AlignmentTrack.prototype.initializeDom = function (targetId) {
    this._initializeDom(targetId);

    this.main = SVG.addChild(this.contentDiv, 'svg', {
        'class': 'trackSvg',
        'x': 0,
        'y': 0,
        'width': this.width
    });
    this.svgCanvasFeatures = SVG.addChild(this.main, 'svg', {
        'class': 'features',
        'x': -this.pixelPosition,
        'width': this.svgCanvasWidth
    });
    this.updateHeight();
};

AlignmentTrack.prototype.render = function (targetId) {
    this.initializeDom(targetId);

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2
};

AlignmentTrack.prototype.getDataHandler = function (event) {
    var features;
    if (event.dataType == 'histogram') {
        this.renderer = this.histogramRenderer;
        features = event.items;
    } else {
        this.renderer = this.defaultRenderer;
        features = event;

        // If we have paired-end data, we will render them as pairs
        // for (let i = 0; i < features.items.length; i++) {
        //     if (features.items[i].alignments.length > 0) {
        //         if (typeof features.items[i].alignments[0].nextMatePosition !== "undefined") {
        //             features["params"] = {
        //                 view_as_pairs: true
        //             };
        //         }
        //         break;
        //     }
        // }
        // features = this._removeDisplayedChunks(event);
    }
    this.renderedArea = {};
    this.renderer.render(features, {
        cacheItems: event.items,
        svgCanvasFeatures: this.svgCanvasFeatures,
        featureTypes: this.featureTypes,
        renderedArea: this.renderedArea,
        pixelBase: this.pixelBase,
        position: this.region.center(),
        regionSize: this.region.length(),
        maxLabelRegionSize: this.maxLabelRegionSize,
        width: this.width,
        pixelPosition: this.pixelPosition,
        region: this.region,
        trackListPanel: this.trackListPanel
    });
    this.updateHeight();
};

AlignmentTrack.prototype.draw = function () {
    var _this = this;

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2

    this.updateHistogramParams();
    this.clean();

    this.dataType = 'features';
    if (this.histogram) {
        this.dataType = 'histogram';
    }

    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
        this.setLoading(true);
        this.dataAdapter.getData({
            dataType: this.dataType,
            region: new Region({
                chromosome: this.region.chromosome,
                start: this.region.start - this.svgCanvasOffset * 2,
                end: this.region.end + this.svgCanvasOffset * 2
            }),
            params: {
                histogram: this.histogram,
                histogramLogarithm: this.histogramLogarithm,
                histogramMax: this.histogramMax,
                interval: this.interval
            },
            done: function (event) {
                _this.storeRetrievedAlignments(event);
                _this.getDataHandler(event);
                _this.setLoading(false);
            }
        });
        //this.invalidZoomText.setAttribute("visibility", "hidden");
    } else {
        //this.invalidZoomText.setAttribute("visibility", "visible");
    }
    _this.updateHeight();
};

AlignmentTrack.prototype.move = function (disp) {
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
            _this.setLoading(true);
            this.dataAdapter.getData({
                dataType: this.dataType,
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset - 1),
                    end: this.svgCanvasLeftLimit - 1
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                },
                done: function (event) {
                    _this.addNewAlignments(event, "left");
                    _this.getDataHandler(_this.retrievedAlignments);
                    _this.setLoading(false);
                }
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
            _this.setLoading(true);
            this.dataAdapter.getData({
                dataType: this.dataType,
                region: new Region({
                    chromosome: _this.region.chromosome,
                    start: this.svgCanvasRightLimit + 1,
                    end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset + 1)
                }),
                params: {
                    histogram: this.histogram,
                    histogramLogarithm: this.histogramLogarithm,
                    histogramMax: this.histogramMax,
                    interval: this.interval
                },
                done: function (event) {
                    _this.addNewAlignments(event, "right");
                    _this.getDataHandler(_this.retrievedAlignments);
                    _this.setLoading(false);
                }
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
        }

    }

};

AlignmentTrack.prototype._removeDisplayedChunks = function (response) {
    //Returns an array avoiding already drawn features in this.chunksDisplayed

    var getChunkId = function (position) {
        return Math.floor(position / response.chunkSize);
    };
    var getChunkKey = function (chromosome, chunkId) {
        return chromosome + ":" + chunkId + "_" + response.dataType + "_" + response.chunkSize;
    };

    var chunks = response.items;
    var newChunks = [];

    var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
    for (var i = 0, leni = chunks.length; i < leni; i++) { //loop over chunks
        if (this.chunksDisplayed[chunks[i].chunkKey] != true) { //check if any chunk is already displayed and skip it

            features = []; //initialize array, will contain features not drawn by other drawn chunks
            var alignments = chunks[i].value.alignments;
            if (alignments == null) {
                alignments = chunks[i].value;
            }
            for (var j = 0, lenj = alignments.length; j < lenj; j++) {
                feature = alignments[j];

                //check if any feature has been already displayed by another chunk
                displayed = false;
                featureFirstChunk = getChunkId(feature.start);
                featureLastChunk = getChunkId(feature.end);
                for (var chunkId = featureFirstChunk; chunkId <= featureLastChunk; chunkId++) { //loop over chunks touched by this feature
                    var chunkKey = getChunkKey(feature.chromosome, chunkId);
                    if (this.chunksDisplayed[chunkKey] == true) {
                        displayed = true;
                        break;
                    }
                }
                if (!displayed) {
                    features.push(feature);
                }
            }
            this.chunksDisplayed[chunks[i].chunkKey] = true;
            chunks[i].value.alignments = features; //update features array
            newChunks.push(chunks[i]);
        }
    }
    response.items = newChunks;
    return response;
};

AlignmentTrack.prototype.storeRetrievedAlignments = function (event) {
    this.retrievedAlignments = event;

    // Update real left and right limits
    this.svgCanvasLeftLimit = event.items[0].region.start;
    this.svgCanvasRightLimit = event.items[event.items.length - 1].region.end;

    this.retrievedChunkIds = new Set();
    for (let i = 0; i < event.items.length; i++) {
        this.retrievedChunkIds.add(event.items[i].chunkKey);
    }
};



AlignmentTrack.prototype.addNewAlignments = function (event, position) {
    if (position === "right") {
        for (let i = 0; i < event.items.length; i++) {
            if (this.retrievedChunkIds.has(event.items[i].chunkKey)) {
                // We should not call several times to the webservices asking for regions we already have
                debugger
            } else {
                this.retrievedChunkIds.add(event.items[i].chunkKey);
                this.retrievedAlignments.items.push(event.items[i]);
            }
        }

        // Dispose of far away items from the left
        while (this.retrievedAlignments.items[0].region.end < this.region.start - this.svgCanvasOffset) {
            let chunkKey = this.retrievedAlignments.items[0].chunkKey;
            console.log("Dispose region " + chunkKey);
            this.retrievedChunkIds.delete(chunkKey);
            this.retrievedAlignments.items.splice(0, 1);
        }
    } else { // left
        // this.retrievedAlignments.items.unshift(event.items);
        for (let i = event.items.length - 1; i >= 0; i--) {
            if (this.retrievedChunkIds.has(event.items[i].chunkKey)) {
                // We should not call several times to the webservices asking for regions we already have
                debugger
            } else {
                this.retrievedChunkIds.add(event.items[i].chunkKey);
                this.retrievedAlignments.items.unshift(event.items[i]);
            }
        }

        // Dispose of far away items from the right
        while (this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].region.start >
            this.region.end + this.svgCanvasOffset) {
            let chunkKey = this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].chunkKey;
            console.log("Dispose region " + chunkKey);
            this.retrievedChunkIds.delete(chunkKey);
            this.retrievedAlignments.items.splice(this.retrievedAlignments.items.length - 1, 1);
        }

    }

    // Update canvas limits
    this.svgCanvasLeftLimit = this.retrievedAlignments.items[0].region.start;
    this.svgCanvasRightLimit = this.retrievedAlignments.items[this.retrievedAlignments.items.length - 1].region.end;
};
