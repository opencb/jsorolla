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

function Track(args) {
    this.width = 200;
    this.height = 200;


    this.dataAdapter;
    this.renderer;
    this.resizable = true;
    this.autoHeight = false;
    this.targetId;
    this.id;
    this.title;
    this.minHistogramRegionSize = 300000000;
    this.maxLabelRegionSize = 300000000;
    this.height = 100;
    this.visibleRegionSize;
    this.fontClass = 'ocb-font-sourcesanspro ocb-font-size-14';

    _.extend(this, args);

    this.pixelBase;
    this.svgCanvasWidth = 500000;//mesa
    this.pixelPosition = this.svgCanvasWidth / 2;
    this.svgCanvasOffset;
    this.svgCanvasFeatures;
    this.status;
    this.histogram;
    this.histogramLogarithm;
    this.histogramMax;
    this.interval;

    this.svgCanvasLeftLimit;
    this.svgCanvasRightLimit;


    this.invalidZoomText;

    this.renderedArea = {};//used for renders to store binary trees
    this.chunksDisplayed = {};//used to avoid painting multiple times features contained in more than 1 chunk

    if ('handlers' in this) {
        for (eventName in this.handlers) {
            this.on(eventName, this.handlers[eventName]);
        }
    }

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

Track.prototype = {

    get: function (attr) {
        return this[attr];
    },

    set: function (attr, value) {
        this[attr] = value;
    },
    hide: function () {
        $(this.div).css({display: 'hidden'});
    },
    show: function () {
        $(this.div).css({display: 'auto'});
    },
    hideContent: function () {
        $(this.svgdiv).css({display: 'hidden'});
        $(this.titlediv).css({display: 'hidden'});
    },
    showContent: function () {
        $(this.svgdiv).css({display: 'auto'});
        $(this.titlediv).css({display: 'auto'});
    },
    toggleContent: function () {
        $(this.svgdiv).toggle('hidden');
        $(this.resizeDiv).toggle('hidden');
        $(this.configBtn).toggle('hidden');
    },
    setSpecies: function (species) {
        this.species = species;
        this.dataAdapter.species = this.species
    },

    setWidth: function (width) {
        this.width = width;
        this.main.setAttribute("width", width);
    },
    _updateDIVHeight: function () {
//        $(this.rrr).remove();
//        delete this.rrr;
//        this.rrr = SVG.addChild(this.svgCanvasFeatures, "rect", {
//            'x': 0,
//            'y': 0,
//            'width': 0,
//            'height': 18,
//            'stroke': '#3B0B0B',
//            'stroke-width': 1,
//            'stroke-opacity': 1,
//            'fill': 'black',
//            'cursor': 'pointer'
//        });
        if (this.resizable) {
            if (this.histogram) {
                $(this.svgdiv).css({'height': this.height + 10});
            } else {
                var x = this.pixelPosition;
                var width = this.width;
                var lastContains = 0;
                for (var i in this.renderedArea) {
                    if (this.renderedArea[i].contains({start: x, end: x + width })) {
                        lastContains = i;
                    }
                }
                var divHeight = parseInt(lastContains) + 20;
                $(this.svgdiv).css({'height': divHeight + 25});
//                this.rrr.setAttribute('x', x);
//                this.rrr.setAttribute('y', divHeight);
//                this.rrr.setAttribute('width', width);
            }
        }
    },
    _updateSVGHeight: function () {
        if (this.resizable && !this.histogram) {
            var renderedHeight = Object.keys(this.renderedArea).length * 20;//this must be passed by config, 20 for test
            this.main.setAttribute('height', renderedHeight);
            this.svgCanvasFeatures.setAttribute('height', renderedHeight);
            this.hoverRect.setAttribute('height', renderedHeight);
        }
    },
    updateHeight: function (ignoreAutoHeight) {
        this._updateSVGHeight();
        if (this.autoHeight || ignoreAutoHeight) {
            this._updateDIVHeight();
        }
    },
    enableAutoHeight: function () {
        this.autoHeight = true;
        this.updateHeight();
    },
    setTitle: function (title) {
        $(this.titlediv).html(title);
    },

    setLoading: function (bool) {
        if (bool) {
            this.svgLoading.setAttribute("visibility", "visible");
            this.status = "rendering";
        } else {
            this.svgLoading.setAttribute("visibility", "hidden");
            this.status = "ready";
//            this.trigger('track:ready', {sender: this});
        }
    },

    updateHistogramParams: function () {
        if (this.region.length() > this.minHistogramRegionSize) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = Math.ceil(10 / this.pixelBase);//server interval limit 512
            this.setTitle(this.title+'&nbsp;<span class="glyphicon glyphicon-signal"></span>')
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
            this.interval = undefined;
            this.setTitle(this.title);
        }

//        if (this.histogramRenderer) {
//            if (this.zoom <= this.histogramZoom) {
//                this.histogramGroup.setAttribute('visibility', 'visible');
//            } else {
//                this.histogramGroup.setAttribute('visibility', 'hidden');
//            }
//        }
    },

    cleanSvg: function (filters) {//clean
//        console.time("-----------------------------------------empty");
        while (this.svgCanvasFeatures.firstChild) {
            this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
        }
//        console.timeEnd("-----------------------------------------empty");
        this.chunksDisplayed = {};
        this.renderedArea = {};
    },

    initializeDom: function (targetId) {

        var _this = this;
        var div = $('<div id="' + this.id + '-div"></div>')[0];
        var titleBardiv = $('' +
            '<div>' +
            '   <div class="btn-group btn-group-xs">' +
            '   <button id="configBtn" type="button" class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-cog"></span></button>' +
            '   <button id="titleBtn" type="button" class="btn btn-xs btn-default" data-toggle="button"><span id="titleDiv">' + this.title + '</span></button>' +
            '   </div>' +
            '</div>')[0];

        if (_.isUndefined(this.title)) {
            $(titleBardiv).addClass("hidden");
        }

        var titlediv = $(titleBardiv).find('#titleDiv')[0];
        var titleBtn = $(titleBardiv).find('#titleBtn')[0];
        var configBtn = $(titleBardiv).find('#configBtn')[0];


        var svgdiv = $('<div id="' + this.id + '-svgdiv"></div>')[0];
        var resizediv = $('<div id="' + this.id + '-resizediv" class="ocb-track-resize"></div>')[0];

        $(targetId).addClass("unselectable");
        $(targetId).append(div);
        $(div).append(titleBardiv);
        $(div).append(svgdiv);
        $(div).append(resizediv);


        /** title div **/
        $(titleBardiv).css({'padding': '4px'})
            .on('dblclick', function (e) {
                e.stopPropagation();
            });
        $(titleBtn).click(function (e) {
            _this.toggleContent();
        });

        /** svg div **/
        $(svgdiv).css({
            'z-index': 3,
            'height': this.height,
            'overflow-y': (this.resizable) ? 'auto' : 'hidden',
            'overflow-x': 'hidden'
        });

        var main = SVG.addChild(svgdiv, 'svg', {
            'id': this.id,
            'class': 'trackSvg',
            'x': 0,
            'y': 0,
            'width': this.width,
            'height': this.height
        });


        if (this.resizable) {
            $(resizediv).mousedown(function (event) {
                $('html').addClass('unselectable');
                event.stopPropagation();
                var downY = event.clientY;
                $('html').bind('mousemove.genomeViewer', function (event) {
                    var despY = (event.clientY - downY);
                    var actualHeight = $(svgdiv).outerHeight();
                    $(svgdiv).css({height: actualHeight + despY});
                    downY = event.clientY;
                    _this.autoHeight = false;
                });
            });
            $('html').bind('mouseup.genomeViewer', function (event) {
                $('html').removeClass('unselectable');
                $('html').off('mousemove.genomeViewer');
            });
            $(svgdiv).closest(".trackListPanels").mouseup(function (event) {
                _this.updateHeight();
            });


            $(resizediv).mouseenter(function (event) {
                $(this).css({'cursor': 'ns-resize'});
                $(this).css({'opacity': 1});
            });
            $(resizediv).mouseleave(function (event) {
                $(this).css({'cursor': 'default'});
                $(this).css({'opacity': 0.3});
            });

        }

        this.svgGroup = SVG.addChild(main, "g", {
        });

        var text = this.title;
        var hoverRect = SVG.addChild(this.svgGroup, 'rect', {
            'x': 0,
            'y': 0,
            'width': this.width,
            'height': this.height,
            'opacity': '0.6',
            'fill': 'transparent'
        });

        this.svgCanvasFeatures = SVG.addChild(this.svgGroup, 'svg', {
            'class': 'features',
            'x': -this.pixelPosition,
            'width': this.svgCanvasWidth,
            'height': this.height
        });


        this.fnTitleMouseEnter = function () {
            hoverRect.setAttribute('opacity', '0.1');
            hoverRect.setAttribute('fill', 'lightblue');
        };
        this.fnTitleMouseLeave = function () {
            hoverRect.setAttribute('opacity', '0.6');
            hoverRect.setAttribute('fill', 'transparent');
        };

        $(this.svgGroup).off('mouseenter');
        $(this.svgGroup).off('mouseleave');
        $(this.svgGroup).mouseenter(this.fnTitleMouseEnter);
        $(this.svgGroup).mouseleave(this.fnTitleMouseLeave);


        this.invalidZoomText = SVG.addChild(this.svgGroup, 'text', {
            'x': 154,
            'y': 18,
            'opacity': '0.6',
            'fill': 'black',
            'visibility': 'hidden',
            'class': this.fontClass
        });
        this.invalidZoomText.textContent = "Zoom in to view the sequence";


        var loadingImg = '<?xml version="1.0" encoding="utf-8"?>' +
            '<svg version="1.1" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<defs>' +
            '<g id="pair">' +
            '<ellipse cx="7" cy="0" rx="4" ry="1.7" style="fill:#ccc; fill-opacity:0.5;"/>' +
            '<ellipse cx="-7" cy="0" rx="4" ry="1.7" style="fill:#aaa; fill-opacity:1.0;"/>' +
            '</g>' +
            '</defs>' +
            '<g transform="translate(11,11)">' +
            '<g>' +
            '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.5s" repeatDur="indefinite"/>' +
            '<use xlink:href="#pair"/>' +
            '<use xlink:href="#pair" transform="rotate(45)"/>' +
            '<use xlink:href="#pair" transform="rotate(90)"/>' +
            '<use xlink:href="#pair" transform="rotate(135)"/>' +
            '</g>' +
            '</g>' +
            '</svg>';

        this.svgLoading = SVG.addChildImage(main, {
            "xlink:href": "data:image/svg+xml," + encodeURIComponent(loadingImg),
            "x": 10,
            "y": 0,
            "width": 22,
            "height": 22,
            "visibility": "hidden"
        });

        this.div = div;
        this.svgdiv = svgdiv;
        this.titlediv = titlediv;
        this.resizeDiv = resizediv;
        this.configBtn = configBtn;

        this.main = main;
        this.hoverRect = hoverRect;
//        this.titleText = titleText;


//        if (this.histogramRenderer) {
//            this._drawHistogramLegend();
//        }

        this.rendered = true;
        this.status = "ready";

    },
    _drawHistogramLegend: function () {
        var histogramHeight = this.histogramRenderer.histogramHeight;
        var multiplier = this.histogramRenderer.multiplier;

        this.histogramGroup = SVG.addChild(this.svgGroup, 'g', {
            'class': 'histogramGroup',
            'visibility': 'hidden'
        });
        var text = SVG.addChild(this.histogramGroup, "text", {
            "x": 21,
            "y": histogramHeight + 4,
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            'class': this.fontClass
        });
        text.textContent = "0-";
        var text = SVG.addChild(this.histogramGroup, "text", {
            "x": 14,
            "y": histogramHeight + 4 - (Math.log(10) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            'class': this.fontClass
        });
        text.textContent = "10-";
        var text = SVG.addChild(this.histogramGroup, "text", {
            "x": 7,
            "y": histogramHeight + 4 - (Math.log(100) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            'class': this.fontClass
        });
        text.textContent = "100-";
        var text = SVG.addChild(this.histogramGroup, "text", {
            "x": 0,
            "y": histogramHeight + 4 - (Math.log(1000) * multiplier),
            "font-size": 12,
            "opacity": "0.9",
            "fill": "orangered",
            'class': this.fontClass
        });
        text.textContent = "1000-";
    },

//    showInfoWidget: function (args) {
//        if (this.dataAdapter.species == "orange") {
//            //data.resource+="orange";
//            if (args.featureType.indexOf("gene") != -1)
//                args.featureType = "geneorange";
//            if (args.featureType.indexOf("transcript") != -1)
//                args.featureType = "transcriptorange";
//        }
//        switch (args.featureType) {
//            case "gene":
//                new GeneInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "geneorange":
//                new GeneOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "transcriptorange":
//                new TranscriptOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "transcript":
//                new TranscriptInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "snp" :
//                new SnpInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "vcf" :
//                new VCFVariantInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            default:
//                break;
//        }
//    },

    draw: function () {

    },

    getFeaturesToRenderByChunk: function (response, filters) {
        //Returns an array avoiding already drawn features in this.chunksDisplayed

        var getChunkId = function (position) {
            return Math.floor(position / response.chunkSize);
        };
        var getChunkKey = function (chromosome, chunkId) {
            return chromosome + ":" + chunkId;
        };

        var chunks = response.items;
        var features = [];


        var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
        for (var i = 0, leni = chunks.length; i < leni; i++) {
            if (this.chunksDisplayed[chunks[i].chunkKey] != true) {//check if any chunk is already displayed and skip it

                for (var j = 0, lenj = chunks[i].value.length; j < lenj; j++) {
                    feature = chunks[i].value[j];

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
                        //apply filter
                        // if(filters != null) {
                        //		var pass = true;
                        // 		for(filter in filters) {
                        // 			pass = pass && filters[filter](feature);
                        //			if(pass == false) {
                        //				break;
                        //			}
                        // 		}
                        //		if(pass) features.push(feature);
                        // } else {
                        features.push(feature);
                    }
                }
                this.chunksDisplayed[chunks[i].chunkKey] = true;
            }
        }
        return features;
    }
};
