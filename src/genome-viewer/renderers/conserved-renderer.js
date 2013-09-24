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

ConservedRenderer.prototype = new Renderer({});

function ConservedRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};


ConservedRenderer.prototype.render = function(features, args) {
    var middle = args.width/2;
    var multiplier = 20;
    var histogramHeight = 75;
    var points = '';
    var width = args.pixelBase;

    var firstFeature = features[0];
    var x = args.pixelPosition+middle-((args.position-parseInt(firstFeature.start))*args.pixelBase);
    points = (x+(width/2))+','+histogramHeight+' ';

    for ( var i = 0, len = features.length; i < len; i++) {
        var feature = features[i];
        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);

        for ( var j = 0, len = feature.values; j < len; j++) {
            var value = feature.values[j];
            var height = value*multiplier;
            var s = start+j;
            var x = args.pixelPosition+middle-((args.position-s)*args.pixelBase);
            points += (x+(width/2))+","+(histogramHeight - height)+" ";
        }
    }
    points += (x+(width/2))+","+(histogramHeight)+" ";

    var pol = SVG.addChild(args.svgCanvasFeatures,"polyline",{
        "points":points,
        "stroke": "#000000",
        "stroke-width": 0.2,
        "fill": 'salmon',
        "cursor": "pointer"
    });


};
