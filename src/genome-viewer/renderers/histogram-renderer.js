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

function HistogramRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    this.histogramHeight = 75;
//    this.multiplier = 7;

    this.maxValue = 10;
    this.updateScale(args);
    //set instantiation args
    _.extend(this, args);

};

HistogramRenderer.prototype._checkFeatureValue = function (feature) {
    if (feature.features_count == null) {
//            var height = Math.log(features[i].absolute);
        if (feature.absolute != 0 && feature.absolute > 0) {
            // take care of feature.absolute==1 counts and set scaled value to 0.2 as log(2) ~= 0.3
            feature.features_count = Math.max(0.2,Math.log(feature.absolute));
        } else {
            feature.features_count = 0;
        }
    }

//        var height = features[i].features_count;
//        if (height == null) {
//            height = features[i].value;
//            height = this.histogramHeight * height;
//        } else {
//        }
}

/**
 * updates "this.multiplier" using "histogramMaxFreqValue" and "height"
 * @param args
 */
HistogramRenderer.prototype.updateScale = function(args) {
    if (args != null) {
        if (args.height != null) {
            this.histogramHeight = args.height * 0.95;
        }
        if (args.histogramMaxFreqValue != null) {
            this.maxValue = args.histogramMaxFreqValue;
        }
    }
    //this.multiplier = 7;
    this.multiplier = this.histogramHeight / this.maxValue;
};

HistogramRenderer.prototype.render = function (features, args) {
    var middle = args.width / 2;
    console.log(middle);
    var points = '';

    this.updateScale(args);

    if (features.length > 0) {
        var firstFeature = features[0].value;
        var width = (firstFeature.end - firstFeature.start + 1) * args.pixelBase;
        var x = args.pixelPosition + middle - ((args.position - parseInt(firstFeature.start)) * args.pixelBase);

        this._checkFeatureValue(firstFeature);
        var height = firstFeature.features_count * this.multiplier;

        points = (x - (width / 2)) + ',' + this.histogramHeight + ' ';
        points += (x - (width / 2)) + ',' + (this.histogramHeight - height) + ' ';
    }
    for (var i = 0, len = features.length; i < len; i++) {
        var feature = features[i].value;
        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);
        var width = (feature.end - feature.start + 1) * args.pixelBase;
        var x = args.pixelPosition + middle - ((args.position - feature.start) * args.pixelBase);

        this._checkFeatureValue(feature);
        var height = feature.features_count * this.multiplier;

        points += (x + (width / 2)) + "," + (this.histogramHeight - height) + " ";

    }
    if (features.length > 0) {
        var lastFeature = features[features.length - 1].value;
        var width = (lastFeature.end - lastFeature.start + 1) * args.pixelBase;
        var x = args.pixelPosition + middle - ((args.position - parseInt(lastFeature.start)) * args.pixelBase);

        this._checkFeatureValue(lastFeature);
        var height = lastFeature.features_count * this.multiplier;

        points += (x + (width)) + ',' + (this.histogramHeight - height) + ' ';
        points += (x + (width)) + ',' + this.histogramHeight + ' ';
    }

    if (points !== '') {
        SVG.addChild(args.svgCanvasFeatures, "polyline", {
            "points": points,
            //        "stroke": "#000000",
            //        "stroke-width": 0.2,
            "fill": '#428bca',
            "cursor": "pointer"
        });

    }
};
