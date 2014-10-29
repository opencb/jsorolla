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

    //save default render reference;
    this.defaultRenderer = this.renderer;
//    this.histogramRenderer = new FeatureClusterRenderer();
    this.histogramRenderer = new HistogramRenderer(args);

    this.featureType = 'Feature';
    this.samples = [];
    //set instantiation args, must be last
    _.extend(this, args);


    this.resource = this.dataAdapter.resource;
    this.species = this.dataAdapter.species;

    this.dataType = 'features';

    this.sampleDivs = {};   // <this.samples.length> children of contentdiv.
    this.sampleMainSvgs = {};   // bijection 1 to 1 with sampleDivs
    this.svgGroups = {};    // wrapper of renderer-related internal svgs.
    // TODO this.renderer.setSamples(this.samples);
};

AlignmentTrack.prototype.updateHeight = function () {
    //TODO if needed
/*
    if (this.histogram) {
        $(this.contentDiv).css({'height': this.histogramRenderer.histogramHeight + 5});
        this.main.setAttribute('height', this.histogramRenderer.histogramHeight);
        return;
    }
    */
    console.log("alignmentTrack::updateHeight: this.height = " + this.height);

    $(this.contentDiv).css({'height': this.height});
    var sampleHeight = this.height/this.samples.length;

    for (var j = 0; j < this.samples.length; j++) {
        var sample = this.samples[j];
        $(this.sampleDivs[sample]).css({'height': sampleHeight});
        // TODO this.sampleMainSvgs[sample].height = sampleHeight;
        var renderedHeight = this.svgGroups[sample].getBoundingClientRect().height;
        this.sampleMainSvgs[sample].setAttribute('height', renderedHeight);
    }
    /*

    if (this.resizable) {   // TODO auto update on resize
        if (this.autoHeight == false) {
            $(this.contentDiv).css({'height': this.height});
        } else if (this.autoHeight == true) {
            var x = this.pixelPosition;
            var width = this.width;
            var lastContains = 0;
            for (var i in this.renderedArea) {
                if (this.renderedArea[i].contains({start: x, end: x + width })) {
                    lastContains = i;
                }
            }
            var visibleHeight = parseInt(lastContains) + 30;
            $(this.contentDiv).css({'height': visibleHeight + 5});
            this.main.setAttribute('height', visibleHeight);
        }
    }

//    this._updateHeight();
*/
};

AlignmentTrack.prototype.clean = function () {
    this._clean();

    console.time("-----------------------------------------empty");
    for (var i = 0; i < this.samples.length; i++) {
        var svgCanvasFeatures = this.svgGroups[this.samples[i]];
        while (svgCanvasFeatures.firstChild) {
            svgCanvasFeatures.removeChild(svgCanvasFeatures.firstChild);
        }
        this.renderedArea[this.samples[i]] = {};
        this.renderer.init(svgCanvasFeatures, this.samples[i]);
    }
    console.timeEnd("-----------------------------------------empty");
};

AlignmentTrack.prototype.render = function (targetId) {
    var _this = this;
    this.initializeDom(targetId);

//    this.contentDiv; //TODO create custom dom structure inside

    console.log("alignmenttrack.render");
    var sampleHeight = this.height/this.samples.length;
    for (var i = 0; i < this.samples.length; i++) {
        var sample = this.samples[i];
//        this.sampleDivs[sample] = $('<div id="' + sample + '-svgdiv" style="height:' + sampleHeight + 'px"></div>')[0];
        _this.sampleDivs[sample] = $('<div id="' + sample + '-svgdiv"></div>')[0];

        // TODO test $(this.contentDiv).css({'height': this.height});
        $(_this.contentDiv).append(_this.sampleDivs[sample]);

        _this.sampleMainSvgs[sample] = SVG.addChild(_this.sampleDivs[sample], 'svg', {
            'class': 'sampleMainSvg',
            'x': 0,
            'y': 0,
            'width': this.width,
            'height': sampleHeight
        });
        /* Internal svg structure */
        _this.svgGroups[sample] = SVG.addChild(_this.sampleMainSvgs[sample], 'svg', {
            'class': 'svgGroup',
            'x': -_this.pixelPosition,
            'width': _this.svgCanvasWidth
//            'height': sampleHeight
        });
        _this.renderer.init(_this.svgGroups[sample], sample);
    }

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;
    this.updateHeight();
};

AlignmentTrack.prototype.draw = function () {
    var _this = this;

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;

    this.updateHistogramParams();
    this.clean();

    this.dataType = 'features';
    if (this.histogram) {
        this.dataType = 'histogram';
    }


    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {
        this.setLoading(true);
        this.dataAdapter.getData({
            categories: this.samples,
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
            done: function () {
                _this.setLoading(false);
            },
            dataReady: function (args) {
                _this.dataReady(args);
            }
        });

//        this.invalidZoomText.setAttribute("visibility", "hidden");
    } else {
        this.invalidZoomText.setAttribute("visibility", "visible");
    }
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

    for (var sample in this.svgGroups) {
        //parseFloat important
        var move = parseFloat(this.svgGroups[sample].getAttribute("x")) + pixelDisplacement;
        this.svgGroups[sample].setAttribute("x", move);
    }

    var virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
    var virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);

    if (typeof this.visibleRegionSize === 'undefined' || this.region.length() < this.visibleRegionSize) {

        if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
            this.dataAdapter.getData({
                categories: this.samples,
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
                done: function () {
                },
                dataReady: function (args) {
                    _this.dataReady(args);
                }
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
            this.dataAdapter.getData({
                categories: this.samples,
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
                done: function () {
                },
                dataReady: function (args) {
                    _this.dataReady(args);
                }
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
        }

    }

};

AlignmentTrack.prototype.dataReady = function (response) {
    var _this = this;
    var features;
    if (response.dataType == 'histogram') {
        _this.renderer = _this.histogramRenderer;
        features = response.items;
        debugger
    } else {
        _this.renderer = _this.defaultRenderer;
        // debugger
        features = _this.getFeaturesToRenderByChunk(response);
    }
//    console.log(response);
//    response.items = features;    // why not?
//    _this.renderer.render(response, {
    _this.renderer.render(features, {
        svgCanvasFeatures: _this.svgGroups[response.category],
        featureTypes: _this.featureTypes,
        renderedArea: _this.renderedArea[response.category],
        pixelBase: _this.pixelBase,
        position: _this.region.center(),
        regionSize: _this.region.length(),
        maxLabelRegionSize: _this.maxLabelRegionSize,
        width: _this.width,
        pixelPosition: _this.pixelPosition,
        resource: _this.resource,
        species: _this.species,
        featureType: _this.featureType,
        sample: response.category
        //, params: response.params
    });
    _this.updateHeight();
};


AlignmentTrack.prototype.getFeaturesToRenderByChunk = function (response, filters) {
    //Returns an array avoiding already drawn features in this.chunksDisplayed

    var getChunkId = function (position) {
        return Math.floor(position / response.chunkSize);
    };
    var getChunkKey = function (chromosome, chunkId) {
        return response.category + "_" + chromosome + ":" + chunkId + "_" + response.dataType + "_" + response.chunkSize;
    };

    var chunks = response.items;
    var chunksToRender = [];
    var features = [];

    debugger
    var feature, displayed, featureFirstChunk, featureLastChunk;
    for (var i = 0, leni = chunks.length; i < leni; i++) {
        if (this.chunksDisplayed[response.category + "_" + chunks[i].chunkKey] != true) {//check if any chunk is already displayed and skip it
            features = [];
            for (var j = 0, lenj = chunks[i].value.alignments.length; j < lenj; j++) {
                feature = chunks[i].value.alignments[j];

                //check if any feature has been already displayed by another chunk
                displayed = false;
                featureFirstChunk = getChunkId(feature.start);
                featureLastChunk = getChunkId(feature.end);
                for (var chunkId = featureFirstChunk; chunkId <= featureLastChunk; chunkId++) {
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
            this.chunksDisplayed[response.category + "_" + chunks[i].chunkKey] = true;
            chunks[i].value.alignments = features;
            chunksToRender.push(chunks[i].value);
        }
    }
    return chunksToRender;
};

    /* when memoryStore is refactored to manage several categories
AlignmentTrack.prototype.getFeaturesToRenderByChunk = function(response) {  // TODO test
    var _this = this;

    var chunks = response.items;
    var chunksToRender = [];//Returns an array avoiding already drawn features in this.chunksDisplayed
    var features, feature, displayed;

    for (var i = 0, leni = chunks.length; i < leni; i++) {  // for each chunk
        _this.chunksDisplayed.getChunks([chunks[i].chunkKey], function (iteration) {
            return function (values) {
                if (values[0].value != true) {//check if the chunk is already displayed and skip it
                    features = [];
                    for (var j = 0, lenj = chunks[iteration].value.alignments.length; j < lenj; j++) {
                        feature = chunks[iteration].value.alignments[j];
                        var region = new Region(feature);
                        displayed = false;

                        _this.chunksDisplayed.get(region, [response.category], response.chunkSize, function (cached, uncached) {
                            for (var k = 0; k < cached.length; k++) {   // check if the feature is in any already displayed chunk
                                if (cached[k].value == true) {
                                    displayed = true;
                                    break;
                                }
                            }
                            if (!displayed) {
                                features.push(feature);
                            }
                        });
                    }
                    _this.chunksDisplayed.putChunks(response.category, [values[0].chunkKey], [true]);   // mark it as displayed
                    chunks[iteration].value.alignments = features;
                    chunksToRender.push(chunks[iteration].value); // add to chunks to render
                }
            };
        } (i));
    }

    return chunksToRender;
};
//    */






















