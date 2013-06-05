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

    this.labelZoom = -1;
    this.resizable = true;
    this.targetId;
    this.id;
    this.title;
    this.histogramZoom;
    this.transcriptZoom;
    this.height = 100;
    this.visibleRange = {start:0,end:100},

    _.extend(this, args);

    this.pixelBase;
    this.svgCanvasWidth = 500000;//mesa
    this.pixelPosition = this.svgCanvasWidth / 2;
    this.svgCanvasOffset;
    this.svgCanvasFeatures;
    this.status = undefined;
    this.histogram;
    this.histogramLogarithm;
    this.histogramMax;
    this.interval;
    this.zoom;

    this.svgCanvasLeftLimit;
    this.svgCanvasRightLimit;


    this.invalidZoomText;

    this.renderedArea = {};//used for renders to store binary trees

};

Track.prototype = {

    get: function (attr) {
        return this[attr];
    },

    set: function (attr, value) {
        this[attr] = value;
    },

    setWidth : function(width){
        this.width=width;
        this.main.setAttribute("width",width);
    },
    updateHeight : function(){
        if(!this.histogram){
            var height = Object.keys(this.renderedArea).length * 20;//this must be passed by config, 20 for test
        }else{
            var height = this.height;
        }
        this.main.setAttribute("height",height);
        this.svgCanvasFeatures.setAttribute("height",height);
        this.titlebar.setAttribute("height",height);
    },

    setLoading: function (bool) {
        if (bool) {
            this.svgLoading.setAttribute("visibility", "visible");
            this.status = "rendering";
        } else {
            this.svgLoading.setAttribute("visibility", "hidden");
            this.status = "ready";
        }
    },

    updateHistogramParams: function () {
        if (this.zoom <= this.histogramZoom) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = parseInt(5 / this.pixelBase);//server interval limit 512
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
        }
    },

    cleanSvg : function(filters){//clean
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
        var svgdiv = $('<div id="' + this.id + '-svgdiv"></div>')[0];

        $(targetId).addClass("x-unselectable");
        $(targetId).append(div);
        $(div).append(svgdiv);

        $(svgdiv).css({
            'z-index': 3,
            'height':this.height,
            'overflow-y': (this.resizable) ? 'scroll' : 'hidden',
            'overflow-x': 'hidden'
        });

        var main = SVG.addChild(svgdiv, "svg", {
            "id": this.id,
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width,
            "height": this.height
        });

        if(this.resizable){
            var resizediv = $('<div id="' + this.id + '-resizediv"></div>')[0];
            $(resizediv).css({'background-color': 'lightgray', 'height': 3, opacity:0.3});

            $(resizediv).mousedown(function (event) {
                $('html').addClass('x-unselectable');
                event.stopPropagation();
                var downY = event.clientY;
                $('html').mousemove(function (event) {
                    var despY = (event.clientY - downY);
                    var actualHeight = $(svgdiv).outerHeight();
                    $(svgdiv).css({height: actualHeight + despY});
                    downY = event.clientY;
                });
            });
            $('html').mouseup(function (event) {
                $('html').removeClass("x-unselectable");
                $('html').off('mousemove');
            });



            $(resizediv).mouseenter(function (event) {
                $(this).css({"cursor": "ns-resize"});
                $(this).css({"opacity": 1});
            });
            $(resizediv).mouseleave(function (event) {
                $(this).css({"cursor": "default"});
                $(this).css({"opacity": 0.3});
            });

            $(div).append(resizediv);
        }

        var titleGroup = SVG.addChild(main, "g", {
            "class": "trackTitle"
            //visibility:this.titleVisibility
        });


        var text = this.title;
        var textWidth = 15 + text.length * 6;
        var titlebar = SVG.addChild(titleGroup, "rect", {
            "x": 0,
            "y": 0,
            "width": this.width,
            "height": this.height,
            "opacity": "0.6",
            "fill": "transparent"
        });
        var titleText = SVG.addChild(titleGroup, "text", {
            "x": 4,
            "y": 14,
            "font-size": 12,
            "opacity": "0.4",
            "fill": "black"
        });
        titleText.textContent = text;

        this.svgCanvasFeatures = SVG.addChild(titleGroup, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth,
            "height": this.height
        });


        this.fnTitleMouseEnter = function () {
            titlebar.setAttribute("opacity", "0.1");
            titlebar.setAttribute("fill", "greenyellow");
            titleText.setAttribute("opacity", "1.0");
        };
        this.fnTitleMouseLeave = function () {
            titlebar.setAttribute("opacity", "0.6");
            titlebar.setAttribute("fill", "transparent");
            titleText.setAttribute("opacity", "0.4");
        };

        $(titleGroup).off("mouseenter");
        $(titleGroup).off("mouseleave");
        $(titleGroup).mouseenter(this.fnTitleMouseEnter);
        $(titleGroup).mouseleave(this.fnTitleMouseLeave);


        this.invalidZoomText = SVG.addChild(titleGroup, "text", {
            "x": 154,
            "y": 24,
            "font-size": 10,
            "opacity": "0.6",
            "fill": "black",
            "visibility": "hidden"
        });
        this.invalidZoomText.textContent = "This level of zoom isn't appropiate for this track";


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


        this.main = main;
        this.titleGroup = titleGroup;
        this.titlebar = titlebar;
        this.titleText = titleText;

        this.rendered = true;
        this.status = "ready";

    },

    showInfoWidget: function (args) {
        if (this.dataAdapter.species == "orange") {
            //data.resource+="orange";
            if (args.featureType.indexOf("gene") != -1)
                args.featureType = "geneorange";
            if (args.featureType.indexOf("transcript") != -1)
                args.featureType = "transcriptorange";
        }
        switch (args.featureType) {
            case "gene":
                new GeneInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            case "geneorange":
                new GeneOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            case "transcriptorange":
                new TranscriptOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            case "transcript":
                new TranscriptInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            case "snp" :
                new SnpInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            case "vcf" :
                new VCFVariantInfoWidget(null, this.dataAdapter.species).draw(args);
                break;
            default:
                break;
        }
    },

    draw: function () {

    }
};