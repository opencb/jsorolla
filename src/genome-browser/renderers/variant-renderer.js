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

/**
 * Stateless (or almost) object to render variants.
 *
 * If you have a svg element where you want to draw, pass it to VariantRenderer.init()
 * and later, in each VariantRenderer.render() as args.svgCanvasFeatures.
 *
 * @type {Renderer}
 */
VariantRenderer.prototype = new Renderer({});

function VariantRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-roboto ocb-font-size-11';
    this.toolTipfontClass = 'ocb-tooltip-font';

    if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
};


VariantRenderer.prototype.init = function (svgGroup, sample) {
    //Prevent browser context menu

    var _this = this;
    console.log(this.track.main);
    $(svgGroup).contextmenu(function (e) {
        console.log("right click");
        e.preventDefault();
    });

    var samplesname = _.isFunction(_this.sampleNames) ? _this.sampleNames(feature) : _this.sampleNames;
    console.log("Probando el samplesnames");
    console.log(samplesname);

    var studies = Object.keys(samplesname); // is possible there are various studies
    var y = 8;
    for(var i = 0; i < studies.length ; i ++){
        var samplesinstudy = samplesname[studies[i]];
        for(var j = 0; j < samplesinstudy.length ; j ++){

            var sample= SVG.addChild(this.track.main, "text", {
                'x': 0,
                'y': y,
                'stroke': 'black',
                'stroke-width': 1,
                'font-size':"8",
                'cursor': 'pointer'
            });
            y += 10;

            sample.textContent = samplesinstudy[j];
            $(sample).click(function (event) {
               // $(this).css({"strokeWidth":"3","stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#51c000"})});
                // amarillo FCFC92
                var label = $(this);
                //label.css({"stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#ff7200"});

                //POSIBILIDAD 1
                //var rect = SVG.addChild(_this.track.main,  "rect",{
                //    'x': 0,
                //    'y': label[0].y.baseVal[0].value-7,
                //    'width': _this.track.width,
                //    'height': 8,
                //    'stroke': '#FFFF00',
                //    'fill': '#FCFC92'
                //});
                //$(rect).css({"z-index": -1});

                //POSIBILIDAD 2
                var yrect = label[0].y.baseVal[0].value-7;
                if(this.getAttribute("stroke") == "black"){
                    label.css({"stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#ff7200"});
                    this.setAttribute("stroke", "#ff7200");
                    var rect =  SVG.create("rect",{
                        'x': 0,
                        'y': yrect,
                        'width': _this.track.width,
                        'height': 8,
                        'stroke': '#FFFF00',
                        'fill': '#F2F5A9',
                        'opacity': 0.5
                    });
                    rect.setAttribute("id",this.innerHTML + "_rect" +yrect);
                    _this.track.main.insertBefore(rect,this);
                }else{
                    var rect = document.getElementById(this.innerHTML + "_rect" +yrect);
                    rect.parentNode.removeChild(rect);
                    this.setAttribute("stroke", "black");
                    label.css({"stroke":"black"});
                }

                //var divpadre = _this.track.main.parentNode;
                //var selBox = $('<div id="' + this.id + 'selBox"></div>')[0];
                //divpadre.append(selBox);
                //$(selBox).css({
                //    'z-index': 0,
                //    'position': 'absolute',
                //    'left': 0,
                //    'top': label[0].y.baseVal[0].value-8,
                //    'height': 8,
                //    'width':'100%',
                //    'border': '2px solid #FFFF00',
                //    'opacity': 0.5,
                //    //'visibility': 'hidden',
                //    'background-color': '#F2F5A9'
                //});
                //$(selBox).click(function(event){
                //    this.parentNode.removeChild(this);
                //});
            });
        }
    }

};

VariantRenderer.prototype.render = function (features, args) {

    //for (var i = 0, leni = features.length; i < leni; i++) {
    //    for (var j = 0; j < features[i].length; j++) {
    //        var feature = features[i][j];
    //        this.draw(feature, args);
    //    }
    //}

     for (var i = 0, leni = features.length; i < leni; i++) {

            var feature = features[i];
            this.draw(feature, args);

    }
};

VariantRenderer.prototype.draw = function (feature, args) {

    var _this = this;
    //get feature render configuration
    var color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
    var label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
    var height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
    var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
    var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
    var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

    //get feature genomic information
    var start = feature.start;
    var end = feature.end;
    var length = (end - start) + 1;

    //check genomic length
    length = (length < 0) ? Math.abs(length) : length;
    length = (length == 0) ? 1 : length;

    //transform to pixel position
    var width = length * args.pixelBase;

    var svgLabelWidth = _this.getLabelWidth(label, args);
    //calculate x to draw svg rect
    var x = _this.getFeatureX(start, args);
    debugger
    var maxWidth = Math.max(width, 2);
    var textHeight = 0;
    if (args.regionSize < args.maxLabelRegionSize) {
        textHeight = 9;
        maxWidth = Math.max(width, svgLabelWidth);
    }


    var rowY = 0;
    var textY = textHeight + height;
    var rowHeight = textHeight + height + 2;


//        azul osucuro: 0/0
//        negro: ./.
//        rojo: 1/1
//        naranja 0/1

    var d00 = '';
    var dDD = '';
    var d11 = '';
    var d01 = '';
    var xs = x; // x start
    var xe = x + width; // x end
    var ys = 1; // y
    var yi = 8; //y increment
    var yi2 = 10; //y increment

//    debugger
//    for (var i = 0, leni = feature.samples.length; i < leni; i++) {
    var samplesCount = 0;
//    var indices = [];
    for (var i in feature.studies) {
        for (var j in feature.studies[i].samplesData) {
//            indices.push(j);
            args.renderedArea[ys] = new FeatureBinarySearchTree();
            args.renderedArea[ys].add({start: xs, end: xe});
//            var genotype = Math.round(Math.random()) + "/" + Math.round(Math.random()); // FIXME put in real values

            var genotype = feature.studies[i].samplesData[j]["0"];
            switch (genotype) {
                case '0|0':
                case '0/0':
                    d00 += 'M' + xs + ',' + ys + ' L' + xe + ',' + ys + ' ';
                    d00 += 'L' + xe + ',' + (ys + yi) + ' L' + xs + ',' + (ys + yi) + ' z ';
                    break;
                case '.|.':
                case './.':
                    dDD += 'M' + xs + ',' + ys + ' L' + xe + ',' + ys + ' ';
                    dDD += 'L' + xe + ',' + (ys + yi) + ' L' + xs + ',' + (ys + yi) + ' z ';
                    break;
                case '1|1':
                case '1/1':
                    d11 += 'M' + xs + ',' + ys + ' L' + xe + ',' + ys + ' ';
                    d11 += 'L' + xe + ',' + (ys + yi) + ' L' + xs + ',' + (ys + yi) + ' z ';
                    break;
                case '0|1':
                case '0/1':
                case '1|0':
                case '1/0':
                    d01 += 'M' + xs + ',' + ys + ' L' + xe + ',' + ys + ' ';
                    d01 += 'L' + xe + ',' + (ys + yi) + ' L' + xs + ',' + (ys + yi) + ' z ';
                    break;
            }
            samplesCount++;
            ys += yi2;
        }
    }

    var featureGroup = SVG.addChild(args.svgCanvasFeatures, "g", {'feature_id': feature.id});
    var dummyRect = SVG.addChild(featureGroup, "rect", {
        'x': xs,
        'y': 1,
        'width': width,
        'height': ys,
        'fill': 'transparent',
        'cursor': 'pointer'
    });
    if (d00 != '') {
        var path = SVG.addChild(featureGroup, "path", {
            'd': d00,
            'fill': 'blue',
            'cursor': 'pointer'
        });
    }
    if (dDD != '') {
        var path = SVG.addChild(featureGroup, "path", {
            'd': dDD,
            'fill': 'black',
            'cursor': 'pointer'
        });
    }
    if (d11 != '') {
        var path = SVG.addChild(featureGroup, "path", {
            'd': d11,
            'fill': 'red',
            'cursor': 'pointer'
        });
    }
    if (d01 != '') {
        var path = SVG.addChild(featureGroup, "path", {
            'd': d01,
            'fill': 'orange',
            'cursor': 'pointer'
        });
    }

//debugger
    var lastSampleIndex = 0;
    $(featureGroup).qtip({
//        content: {text: tooltipText + '<br>' + feature.files[lastSampleIndex], title: tooltipTitle},
        content: {text: tooltipText + '<br>' + samplesCount + " samples", title: tooltipTitle},
//                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
        position: {target: "mouse", adjust: {x: 25, y: 15}},
        style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
        show: {delay: 300},
        hide: {delay: 300}
    });
    $(featureGroup).mousemove(function (event) {
        var sampleIndex = parseInt(event.offsetY / yi2);
        if (sampleIndex != lastSampleIndex) {
            console.log(sampleIndex);
            samplesCount = 0;
            var sampleName = "";
            var found = false;
            for (var i in feature.studies) {
                for (var j in feature.studies[i].samplesData) {   // better search it up than storing it? memory could be an issue.
                    if (sampleIndex == samplesCount) {
                        found = true;
                        sampleName = j;
                    }
                    samplesCount++;
                }
            }
            $(featureGroup).qtip('option', 'content.text', tooltipText + '<br>' + sampleName);
        }
        lastSampleIndex = sampleIndex;
    });
};
