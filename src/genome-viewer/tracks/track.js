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

    this.id = Utils.genId('track');
    this.dataAdapter;
    this.renderer;
    this.resizable = true;
    this.autoHeight = false;
    this.targetId;
    this.title;
    this.minHistogramRegionSize = 300000000;
    this.maxLabelRegionSize = 300000000;
    this.width = 200;
    this.height = 100;
    this.visibleRegionSize;
    this.visible = true;
    this.contentVisible = true;
    this.closable = false;
    this.fontClass = 'ocb-font-roboto ocb-font-size-14';
    this.externalLink = '';

    _.extend(this, args);

    this.pixelBase;
    this.svgCanvasWidth = 500000;//mesa
    this.pixelPosition = this.svgCanvasWidth / 2;
    this.svgCanvasOffset;
//    this.svgCanvasFeatures;
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
        this.visible = false;
        this.div.classList.add('hidden');
    },
    show: function () {
        this.visible = true;
        this.div.classList.remove('hidden');
    },
    toggle: function () {
        if (this.visible) {
            this.hide();
        } else {
            this.show();

        }
    },
    hideContent: function () {
        this.contentVisible = false;
        this.contentDiv.classList.add('hidden');
        this.resizeDiv.classList.add('hidden');

        this.iToggleEl.classList.remove('fa-minus');
        this.iToggleEl.classList.add('fa-plus');
    },
    showContent: function () {
        this.contentVisible = true;
        this.contentDiv.classList.remove('hidden');
        this.resizeDiv.classList.remove('hidden');

        this.iToggleEl.classList.remove('fa-plus');
        this.iToggleEl.classList.add('fa-minus');
    },
    toggleContent: function () {
        if (this.contentVisible) {
            this.hideContent();
        } else {
            this.showContent();

        }
    },
    close: function () {
        this.trigger('track:close', {sender: this});
    },
    up: function () {
        this.trigger('track:up', {sender: this});
    },
    down: function () {
        this.trigger('track:down', {sender: this});
    },
    setSpecies: function (species) {
        this.species = species;
        this.dataAdapter.species = this.species
    },

    setWidth: function (width) {
        this.width = width;
//        this.main.setAttribute("width", width);
    },
    updateHeight: function () {
        this._updateHeight();
    },
    _updateHeight: function () {
        $(this.contentDiv).css({'height': this.height});
    },
    enableAutoHeight: function () {
        console.log('enable autoHeigth');
        this.autoHeight = true;
        this.updateHeight();
    },
    disableAutoHeight: function () {
        console.log('disable autoHeigth');
        this.autoHeight = false;
        this.updateHeight();
    },
    toggleAutoHeight: function (bool) {
        if (bool == true) {
            this.enableAutoHeight();
            return;
        } else if (bool == false) {
            this.disableAutoHeight();
            return;
        }
        if (this.autoHeight == true) {
            this.disableAutoHeight();
            return;
        } else if (this.autoHeight == false) {
            this.enableAutoHeight();
            return;
        }
    },
    setTitle: function (title) {
        $(this.titleText).html(title);
    },

    setLoading: function (bool) {
        if (bool) {
            this.status = "rendering";
            $(this.loadingEl).html('&nbsp; &nbsp;<i class="fa fa-spinner fa-spin"></i> Loading...</span>');
        } else {
            this.status = "ready";
            $(this.loadingEl).html('');
        }
    },

    updateHistogramParams: function () {
        if (this.region.length() > this.minHistogramRegionSize) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = Math.ceil(10 / this.pixelBase);//server interval limit 512
            $(this.histogramEl).html('&nbsp;<i class="fa fa-signal"></i>');
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
            this.interval = undefined;
            $(this.histogramEl).html('');
        }

//        if (this.histogramRenderer) {
//            if (this.zoom <= this.histogramZoom) {
//                this.histogramGroup.setAttribute('visibility', 'visible');
//            } else {
//                this.histogramGroup.setAttribute('visibility', 'hidden');
//            }
//        }
    },
    clean: function () {
        this._clean();
    },
    _clean: function () {
        //Must be called on child clean method
        this.chunksDisplayed = {};
        this.renderedArea = {};
    },
    initializeDom: function (targetId) {
        this._initializeDom(targetId);
    },
    _initializeDom: function (targetId) {

        var _this = this;
        var div = $('<div id="' + this.id + '-div"></div>')[0];
        div.classList.add('ocb-gv-track');
        var titleBarHtml = '';
        titleBarHtml += '   <div class="ocb-gv-track-title">';
//      titleBarHtml+=       '   <button id="configBtn" type="button" class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-cog"></span></button>' ;
        titleBarHtml += '   <div class="ocb-gv-track-title-el">';
        titleBarHtml += '       <span class="ocb-gv-track-title-text">' + this.title + '</span>';
        titleBarHtml += '       <span class="ocb-gv-track-title-histogram"></span>';
        titleBarHtml += '       <span class="ocb-gv-track-title-toggle"><i class="fa fa-minus"></i></span>';
        titleBarHtml += '       <span class="ocb-gv-track-title-down"><i class="fa fa-chevron-down"></i></span>';
        titleBarHtml += '       <span class="ocb-gv-track-title-up"><i class="fa fa-chevron-up"></i></span>';

        if (this.closable == true) {
            titleBarHtml += '       <span class="ocb-gv-track-title-close"><i class="fa fa-times"></i></span>';
        }

        if (this.externalLink !== '') {
            titleBarHtml += '       <span class="ocb-gv-track-title-external-link"><i class="fa fa-external-link"></i></span>';
        }

        titleBarHtml += '       <span class="ocb-gv-track-title-loading"></span>';
        titleBarHtml += '   </div>';
        titleBarHtml += '   </div>';


        var titleBardiv = $(titleBarHtml)[0];


        if (typeof this.title === 'undefined') {
            $(titleBardiv).addClass("hidden");
        }

        var titlediv = titleBardiv.querySelector('.ocb-gv-track-title');
        this.titleEl = titleBardiv.querySelector('.ocb-gv-track-title-el');

        this.titleText = titleBardiv.querySelector('.ocb-gv-track-title-text');
        this.histogramEl = titleBardiv.querySelector('.ocb-gv-track-title-histogram');
        this.toggleEl = titleBardiv.querySelector('.ocb-gv-track-title-toggle');
        this.iToggleEl = this.toggleEl.querySelector('i');
        this.loadingEl = titleBardiv.querySelector('.ocb-gv-track-title-loading');
        this.closeEl = titleBardiv.querySelector('.ocb-gv-track-title-close');
        this.upEl = titleBardiv.querySelector('.ocb-gv-track-title-up');
        this.downEl = titleBardiv.querySelector('.ocb-gv-track-title-down');
        this.externalLinkEl = titleBardiv.querySelector('.ocb-gv-track-title-external-link');

        var contentDiv = $('<div id="' + this.id + '-svgdiv"></div>')[0];
        $(contentDiv).css({
            'position': 'relative',
            'box-sizing': 'boder-box',
            'z-index': 3,
            'height': this.height,
            'overflow-y': (this.resizable) ? 'auto' : 'hidden',
            'overflow-x': 'hidden'
        });

        var resizediv = $('<div id="' + this.id + '-resizediv" class="ocb-track-resize"></div>')[0];

        $(targetId).addClass("unselectable");
        $(targetId).append(div);
        $(div).append(titleBardiv);
        $(div).append(contentDiv);
        $(div).append(resizediv);


        /** title div **/
        $(titleBardiv).css({'padding': '4px'})
            .on('dblclick', function (e) {
                e.stopPropagation();
            });
//        $(this.titleText).click(function (e) {
//            _this.toggleContent();
//        });
        $(this.toggleEl).click(function (e) {
            _this.toggleContent();
        });
        $(this.closeEl).click(function (e) {
            _this.close();
        });
        $(this.upEl).click(function (e) {
            _this.up();
        });
        $(this.downEl).click(function (e) {
            _this.down();
        });
        $(this.externalLinkEl).click(function (e) {
            window.open(_this.externalLink);
        });

        if (this.resizable) {
            $(resizediv).mousedown(function (event) {
                $('html').addClass('unselectable');
                event.stopPropagation();
                var downY = event.clientY;
                $('html').bind('mousemove.genomeViewer', function (event) {
                    var despY = (event.clientY - downY);
                    var actualHeight = $(contentDiv).outerHeight();
                    _this.height = actualHeight + despY;
                    $(contentDiv).css({height: _this.height});
                    downY = event.clientY;
//                    _this.autoHeight = false;
                });
            });
            $('html').bind('mouseup.genomeViewer', function (event) {
                $('html').removeClass('unselectable');
                $('html').off('mousemove.genomeViewer');
            });
            $(contentDiv).closest(".trackListPanels").mouseup(function (event) {
                _this.updateHeight();
            });
        }


//        var hoverRect = SVG.addChild(this.svgGroup, 'rect', {
//            'x': 0,
//            'y': 0,
//            'width': this.width,
//            'height': this.height,
//            'opacity': '0.6',
//            'fill': 'transparent'
//        });

//        this.fnTitleMouseEnter = function () {
//            hoverRect.setAttribute('opacity', '0.1');
//            hoverRect.setAttribute('fill', 'lightblue');
//        };
//        this.fnTitleMouseLeave = function () {
//            hoverRect.setAttribute('opacity', '0.6');
//            hoverRect.setAttribute('fill', 'transparent');
//        };

//        $(this.svgGroup).off('mouseenter');
//        $(this.svgGroup).off('mouseleave');
//        $(this.svgGroup).mouseenter(this.fnTitleMouseEnter);
//        $(this.svgGroup).mouseleave(this.fnTitleMouseLeave);


//        this.invalidZoomText = SVG.addChild(this.svgGroup, 'text', {
//            'x': 154,
//            'y': 18,
//            'opacity': '0.6',
//            'fill': 'black',
//            'visibility': 'hidden',
//            'class': this.fontClass
//        });
//        this.invalidZoomText.textContent = "No information available at this zoom";

        this.div = div;
        this.contentDiv = contentDiv;
        this.titlediv = titlediv;
        this.resizeDiv = resizediv;
//        this.configBtn = configBtn;

//        this.main = main;
//        this.hoverRect = hoverRect;
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
            return chromosome + ":" + chunkId + "_" + response.dataType + "_" + response.chunkSize;
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
