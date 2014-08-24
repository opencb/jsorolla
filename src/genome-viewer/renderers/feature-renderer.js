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
FeatureRenderer.prototype = new Renderer({});

function FeatureRenderer(args) {
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


FeatureRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature, svgGroup) {

        if (typeof feature.featureType === 'undefined') {
            feature.featureType = args.featureType;
        }
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

//        var svgLabelWidth = _this.getLabelWidth(label, args);
        var svgLabelWidth = label.length * 6.4;

        //calculate x to draw svg rect
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.maxLabelRegionSize > args.regionSize) {
            textHeight = 9;
            maxWidth = Math.max(width, svgLabelWidth);
        }


        var rowY = 0;
        var textY = textHeight + height;
        var rowHeight = textHeight + height + 2;

        while (true) {
            if (!(rowY in args.renderedArea)) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});

            if (foundArea) {
                var featureGroup = SVG.addChild(svgGroup, "g", {'feature_id': feature.id});
                var rect = SVG.addChild(featureGroup, "rect", {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 1,
                    'stroke-opacity': 0.7,
                    'fill': color,
                    'cursor': 'pointer'
                });
                if (args.maxLabelRegionSize > args.regionSize) {
                    var text = SVG.addChild(featureGroup, "text", {
                        'i': i,
                        'x': x,
                        'y': textY,
                        'font-weight': 400,
                        'opacity': null,
                        'fill': 'black',
                        'cursor': 'pointer',
                        'class': _this.fontClass
                    });
                    text.textContent = label;
                }

                if ('tooltipText' in _this) {
                    $(featureGroup).qtip({
                        content: {text: tooltipText, title: tooltipTitle},
//                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                        position: {target: "mouse", adjust: {x: 25, y: 15}},
                        style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
                    });
                }

                $(featureGroup).mouseover(function (event) {
                    _this.trigger('feature:mouseover', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType, mouseoverEvent: event})
                });

                $(featureGroup).click(function (event) {
                    _this.trigger('feature:click', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType, clickEvent: event})
                });
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };


    /****/
    var timeId = "write dom " + Utils.randomString(4);
    console.time(timeId);
    console.log(features.length);
    /****/


    var svgGroup = SVG.create('g');
    for (var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i], svgGroup);
    }
    args.svgCanvasFeatures.appendChild(svgGroup);


    /****/
    console.timeEnd(timeId);
    /****/
};
