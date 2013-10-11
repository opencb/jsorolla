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

//any item with chromosome start end
VcfMultisampleRenderer.prototype = new Renderer({});

function VcfMultisampleRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-sourcesanspro ocb-font-size-12';
    this.toolTipfontClass = 'ocb-font-default';

    //set default args
    if (_.isString(args)) {
        var config = this.getDefaultConfig(args);
        _.extend(this, config);
    }
    //set instantiation args
    else if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
};


VcfMultisampleRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration
        var color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
        var label = _.isFunction(_this.label) ? _this.label(feature, args.zoom) : _this.label;
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
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.zoom > args.labelZoom) {
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
        var yi = 6; //y increment
        var yi2 = 10; //y increment
        for (var i = 0, leni = feature.samples.length; i < leni; i++) {
            args.renderedArea[ys] = new FeatureBinarySearchTree();
            args.renderedArea[ys].add({start: xs, end: xe});
            var genotype = feature.samples[i].split(':')[0];
            switch(genotype){
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
            ys += yi2;
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
        var path = SVG.addChild(featureGroup, "path", {
            'd': d00,
            'fill': 'blue',
            'cursor': 'pointer'
        });
        var path = SVG.addChild(featureGroup, "path", {
            'd': dDD,
            'fill': 'black',
            'cursor': 'pointer'
        });
        var path = SVG.addChild(featureGroup, "path", {
            'd': d11,
            'fill': 'red',
            'cursor': 'pointer'
        });
        var path = SVG.addChild(featureGroup, "path", {
            'd': d01,
            'fill': 'orange',
            'cursor': 'pointer'
        });


        var lastSampleIndex = 0;
        $(featureGroup).qtip({
            content: {text: tooltipText+'<br>'+feature.samples[lastSampleIndex], title: tooltipTitle},
//                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
            position: {target: "mouse", adjust: {x: 25, y: 15}},
            style: { width: true, classes: _this.toolTipfontClass+' ui-tooltip ui-tooltip-shadow'}
        });
        $(featureGroup).mousemove(function (event) {
            var sampleIndex =  parseInt(event.offsetY / yi2);
            if(sampleIndex != lastSampleIndex){
                console.log(sampleIndex);
                $(featureGroup).qtip('option', 'content.text', tooltipText+'<br>'+feature.samples[sampleIndex]);
            }
            lastSampleIndex = sampleIndex;
        });
    };

    //process features
    for (var i = 0, leni = features.length; i < leni; i++) {
        console.log('(>··)>')
        var feature = features[i];
        draw(feature);
    }
};
