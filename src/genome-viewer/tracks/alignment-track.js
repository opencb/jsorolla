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

MultisampleTrack.prototype = new Track({});

function MultisampleTrack(args) {
    Track.call(this, args);

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    this.ALIGNMENT_FEATURE = 'alignments';
    this.VARIANT_FEATURE = 'variants';

    //save default render reference;
    this.defaultRenderer = this.renderer;   // TODO deprecated?
//    this.histogramRenderer = new FeatureClusterRenderer();
    var histogramArgs = _.extend({}, args);
    this.histogramRenderer = new HistogramRenderer(_.extend(histogramArgs, {histogramMaxFreqValue: 200,
        height: args.height/args.samples.length}));

    this.featureType = 'Feature';
    this.samples = [];
    //set instantiation args, must be last
    _.extend(this, args);

    this.renderers = {};
    for (var i = 0; i < this.featureTypes.length; i++) {
        if (this.featureTypes[i] == this.ALIGNMENT_FEATURE && this.alignmentRenderer) {
            this.renderers[this.samples[i]] = this.alignmentRenderer;
        } else if (this.featureTypes[i] == this.VARIANT_FEATURE && this.variantRenderer) {
            this.renderers[this.samples[i]] = this.variantRenderer;
        } else {
            this.renderers[this.samples[i]] = null;
            console.log("no renderer provided for sample " + this.samples[i]);
        }
    }

    this.resource = this.dataAdapter.resource;
    this.species = this.dataAdapter.species;

    this.dataType = 'features';

    this.sampleDivs = {};   // <this.samples.length> children of contentdiv.
    this.sampleMainSvgs = {};   // bijection 1 to 1 with sampleDivs
    this.svgGroups = {};    // wrapper of renderer-related internal svgs.
    // TODO this.renderer.setSamples(this.samples);

    this.chunksDisplayed = new FeatureChunkCache({storeType: "MemoryStore"});
};

MultisampleTrack.prototype.updateHeight = function () {
    //TODO if needed

    $(this.contentDiv).css({'height': this.height});
    var sampleHeight = this.height/this.samples.length;

    if (this.histogram) {
        for (var j = 0; j < this.samples.length; j++) {
            var sample = this.samples[j];
//        $(this.contentDiv).css({'height': this.histogramRenderer.histogramHeight + 5});
            $(this.sampleDivs[sample]).css({'height': sampleHeight});
            this.sampleMainSvgs[sample].setAttribute('height', this.histogramRenderer.histogramHeight);
            this.svgGroups[sample].setAttribute('height', this.histogramRenderer.histogramHeight);
        }
        return;
    }

    for (var j = 0; j < this.samples.length; j++) {
        var sample = this.samples[j];
        $(this.sampleDivs[sample]).css({'height': sampleHeight});
        // TODO this.sampleMainSvgs[sample].height = sampleHeight;
        var renderedHeight = this.svgGroups[sample].getBoundingClientRect().height;
        this.sampleMainSvgs[sample].setAttribute('height', renderedHeight);
    }


    if (this.resizable) {
        if (this.autoHeight == true) {
            var heightSum = 0;
            for (var k = 0; k < this.samples.length; k++) {
                var sample = this.samples[k];
                /*
                var x = this.pixelPosition;
                var width = this.width;
                var lastContains = 0;
                for (var i in this.renderedArea[sample]) {
                    if (this.renderedArea[sample][i].contains({start: x, end: x + width })) {
                        lastContains = k;
                    }
                }
                var visibleHeight = parseInt(lastContains) + 30;
//                this.sampleMainSvgs[sample].setAttribute('height', visibleHeight);
                heightSum += visibleHeight;
                */

                var renderedHeight = this.svgGroups[sample].getBoundingClientRect().height;
                if (renderedHeight > 200) {
                    renderedHeight = 200;
                }
                $(this.sampleDivs[sample]).css({'height': renderedHeight});
                heightSum += renderedHeight;

            }
            $(this.contentDiv).css({'height': heightSum + 5});
        }
    }

//    this._updateHeight();

};

MultisampleTrack.prototype.clean = function () {
//    this._clean();

    this.chunksDisplayed = new FeatureChunkCache({storeType: "MemoryStore"});
    this.renderedArea = {};

//    console.time("-----------------------------------------empty");
    for (var i = 0; i < this.samples.length; i++) {
        var svgCanvasFeatures = this.svgGroups[this.samples[i]];
        while (svgCanvasFeatures.firstChild) {
            svgCanvasFeatures.removeChild(svgCanvasFeatures.firstChild);
        }
        this.renderedArea[this.samples[i]] = {};

        if (this.renderers[this.samples[i]]) {
            this.renderers[this.samples[i]].init(svgCanvasFeatures, this.samples[i]);
        }
    }
//    console.timeEnd("-----------------------------------------empty");
};

MultisampleTrack.prototype.render = function (targetId) {
    var _this = this;
    this.initializeDom(targetId);

//    this.contentDiv; //TODO create custom dom structure inside

    var sampleHeight = this.height/this.samples.length;
    for (var i = 0; i < this.samples.length; i++) {
        var sample = this.samples[i];
//        this.sampleDivs[sample] = $('<div id="' + sample + '-svgdiv" style="height:' + sampleHeight + 'px"></div>')[0];
        _this.sampleDivs[sample] = $('<div id="' + sample + '-svgdiv" style="overflow-y: scroll"></div>')[0];

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
        _this.renderers[sample].init(_this.svgGroups[sample], sample);
    }

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2;
    this.updateHeight();
};

MultisampleTrack.prototype.draw = function () {
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


MultisampleTrack.prototype.move = function (disp) {
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

MultisampleTrack.prototype.dataReady = function (response) {
    var _this = this;
    var features;
    if (response.dataType == 'histogram') {
        _this.renderer = _this.histogramRenderer;
        features = response.items;
//        debugger
    } else {
        _this.renderer = _this.renderers[response.category];
        // debugger
        features = _this.getFeaturesToRenderByChunk(response);
    }
//    console.log(response);
//    response.items = features;    // why not?
//    _this.renderer.render(response, {
    _this.renderer.render(features, {
        svgCanvasFeatures: _this.svgGroups[response.category],
        featureTypes: _this.featureTypes,   // FIXME
        renderedArea: _this.renderedArea[response.category],
        pixelBase: _this.pixelBase,
        position: _this.region.center(),
        regionSize: _this.region.length(),
        maxLabelRegionSize: _this.maxLabelRegionSize,
        width: _this.width,
        pixelPosition: _this.pixelPosition,
        resource: _this.resource,
        species: _this.species,
        featureType: _this.featureType, // FIXME
        sample: response.category
//        height: _this.sampleDivs[response.category].offsetHeight
        //, params: response.params
    });
    _this.updateHeight();
};

/*
MultisampleTrack.prototype.getFeaturesToRenderByChunk = function (response, filters) {
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

    var feature, displayed, featureFirstChunk, featureLastChunk;
    for (var i = 0, leni = chunks.length; i < leni; i++) {
        if (this.chunksDisplayed[response.category + "_" + chunks[i].chunkKey] != true) {//check if any chunk is already displayed and skip it
            features = [];
            var featuresArray = chunks[i].value.alignments? chunks[i].value.alignments : chunks[i].value;
            for (var j = 0, lenj = featuresArray.length; j < lenj; j++) {
                feature = featuresArray[j];

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
            if (chunks[i].value.alignments) {
                chunks[i].value.alignments = features;
            } else {
                chunks[i].value = features;
            }
            chunksToRender.push(chunks[i].value);
        }
    }
    return chunksToRender;
};
*/
    /* when memoryStore is refactored to manage several categories*/
MultisampleTrack.prototype.getFeaturesToRenderByChunk = function(response) {  // TODO test
    var _this = this;

    var chunks = response.items;
    var chunksToRender = [];//Returns an array avoiding already drawn features in this.chunksDisplayed
    var features, feature, displayed;

    for (var i = 0, leni = chunks.length; i < leni; i++) {  // for each chunk
        _this.chunksDisplayed.getChunks(response.category, [chunks[i].chunkKey], function (iteration) {
            return function (values) {
                if (values[0] == undefined || values[0].value != true) {//check if the chunk is already displayed and skip it
                    features = [];
                    var featuresArray = chunks[iteration].value.alignments? chunks[iteration].value.alignments : chunks[iteration].value;
                    for (var j = 0, lenj = featuresArray.length; j < lenj; j++) {
                        feature = featuresArray[j];
//                    for (var j = 0, lenj = chunks[iteration].value.alignments.length; j < lenj; j++) {
//                        feature = chunks[iteration].value.alignments[j];
                        var region = new Region(feature);
                        displayed = false;

                        _this.chunksDisplayed.get(region, [response.category], response.dataType, response.chunkSize, function (cached, uncached) {
                            for (var k = 0; k < cached[response.category].length; k++) {   // check if the feature is in any already displayed chunk
                                if (cached[response.category][k].value == true) {
                                    displayed = true;
                                    break;
                                }
                            }
                            if (!displayed) {
                                features.push(feature);
                            }
                        });
                    }

                    _this.chunksDisplayed.putChunks([chunks[iteration].chunkKey], [true], response.category);   // mark it as displayed
//                    chunks[iteration].value.alignments = features;
                    if (chunks[iteration].value.alignments) {
                        chunks[iteration].value.alignments = features;
                    } else {
                        chunks[iteration].value = features;
                    }
                    chunksToRender.push(chunks[iteration].value); // add to chunks to render
                }
            };
        } (i));
    }

    return chunksToRender;
};
//    */






















