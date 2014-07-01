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

FeatureClusterRenderer.prototype = new Renderer({});

function FeatureClusterRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    this.histogramHeight = 75;
    this.multiplier = 7;



//    this.maxValue = 100;
//    if (args != null) {
//        if (args.height != null) {
//            this.histogramHeight = args.height * 0.95;
//        }
//        if (args.histogramMaxFreqValue != null) {
//            this.maxValue = args.histogramMaxFreqValue;
//        }
//    }
//    this.multiplier = this.histogramHeight / this.maxValue;

    this.fontClass = 'ocb-font-sourcesanspro ocb-font-size-12';
    this.toolTipfontClass = 'ocb-tooltip-font';

    //set instantiation args
    _.extend(this, args);

};


FeatureClusterRenderer.prototype.render = function (features, args) {
    var _this = this;
    var middle = args.width / 2;
    var maxValue = 0;

    var drawFeature = function (feature) {
        var d = '';

        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);
        var width = (feature.end - feature.start);

        width = width * args.pixelBase;
        var x = _this.getFeatureX(feature, args);

        if (feature.features_count == null) {
//            var height = Math.log(features[i].absolute);
            if (feature.absolute != 0) {
                feature.features_count = Math.log(features[i].absolute);
            } else {
                feature.features_count = 0;
            }
        }

        var height = feature.features_count * _this.multiplier;

        var rect = SVG.addChild(args.svgCanvasFeatures, "rect", {
            'x': x + 1,
            'y': 0,
            'width': width - 1,
            'height': height,
            'stroke': 'smokewhite',
            'stroke-width': 1,
            'fill': '#9493b1',
            'cursor': 'pointer'
        });

        var getInfo = function (feature) {
            var resp = '';
            return resp += Math.round(Math.exp(feature.features_count));
        };


        var url = CellBaseManager.url({
            species: args.species,
            category: 'genomic',
            subCategory: 'region',
            query: new Region(feature).toString(),
            resource: args.resource,
            params: {
                include: 'chromosome,start,end,id',
                limit: 20
            },
            async: false
//            success:function(data){
//                str+=data.response[0].result.length+' cb';
//            }
        });

        $(rect).qtip({
            content: {
                text: 'Loading...', // The text to use whilst the AJAX request is loading
                ajax: {
                    url: url, // URL to the local file
                    type: 'GET', // POST or GET
                    success: function (data, status) {
                        var items = data.response[0].result;
                        var ids = '';
                        for (var i = 0; i < items.length; i++) {
                            var f = items[i];
                            var r = new Region(f);
                            ids += '<span class="emph">' + f.id + '</span> <span class="info">' + r.toString() + '</span><br>';
                        }
                        var fc = Math.round(Math.exp(feature.features_count));
                        if (fc <= 20) {
                            this.set('content.title', 'Count: ' + items.length);
                            this.set('content.text', ids);
                        } else {
                            this.set('content.title', 'Count: ' + fc);
                            this.set('content.text', ids + '...');
                        }
                    }
                }
            },
            position: {target: 'mouse', adjust: {x: 25, y: 15}},
            style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
        });

//        $(rect).qtip({
//            content: {text: getInfo(feature), title: 'Count'},
//
//        });

//        $(rect).mouseenter(function(){
//            var str = '';
////            $(rect).qtip({
////                content: {text: str, title: 'Info'},
//////                position: {target: "mouse", adjust: {x: 25, y: 15}},
////                style: { width: true, classes: 'ui-tooltip ui-tooltip-shadow'}
////            });
//        });

    };

    for (var i = 0, len = features.length; i < len; i++) {
        drawFeature(features[i].value);
    }
};
