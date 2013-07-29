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

HistogramRenderer.prototype = new Renderer({});

function HistogramRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};


HistogramRenderer.prototype.render = function(features, args) {
    var middle = args.width/2;
    var multiplier = 5;
    var histogramHeight = 75;
    var points = '';

    if(features.length>0) {//Force first point at histogramHeight
        var firstFeature = features[0];
        var width = (firstFeature.end-firstFeature.start)* args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-parseInt(firstFeature.start))*args.pixelBase);
        points = (x+(width/2))+','+histogramHeight+' ';
    }

    var maxValue = 0;

    for ( var i = 0, len = features.length; i < len; i++) {

        var feature = features[i];
        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);
        var width = (feature.end-feature.start);
        //get type settings object

        try{
            var settings = args.featureTypes[feature.featureType];
            var color = settings.histogramColor;
        }catch(e){
            var color = 'gray'
        }

        width = width * args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-feature.start)*args.pixelBase);


        var height = /*histogramHeight * */ features[i].features_count;
        if(height == null){
            height = features[i].value;
            height = histogramHeight * height;
        }else{
            height = height*multiplier;
        }

        points += (x+(width/2))+","+(histogramHeight - height)+" ";

    }
    if(features.length>0) {//force last point at histogramHeight
        var lastFeature = features[features.length-1];
        var width = (lastFeature.end-lastFeature.start)* args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-parseInt(lastFeature.start))*args.pixelBase);
        points += (x+(width/2))+','+histogramHeight+' ';

    }

    var pol = SVG.addChild(args.svgCanvasFeatures,"polyline",{
        "points":points,
        "stroke": "#000000",
        "stroke-width": 0.2,
        "fill": color,
        "cursor": "pointer"
    });


//    if(!this.axis){//Create axis values for histogram
//        this.axis = true;
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4,
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-0";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(10)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-10";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(100)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-100";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(1000)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-1000";
//    }
};
