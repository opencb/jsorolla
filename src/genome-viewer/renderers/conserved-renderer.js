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

function ConservedRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};

ConservedRenderer.prototype.render = function (chunks, args) {
    for (var i = 0; i < chunks.length; i++) {
        this._paintChunk(chunks[i], args);
    }
};

ConservedRenderer.prototype._paintChunk = function (chunk, args) {
    var middle = args.width / 2;
    var multiplier = 15;
    var histogramHeight = 75;
    var points = '';
    var width = args.pixelBase;

    var x = args.pixelPosition + middle - ((args.position - parseInt(chunk.start)) * args.pixelBase);

    for (var i = 0, len = chunk.values.length; i < len; i++) {
        var value = chunk.values[i];
        var height = value * multiplier;
        var s = chunk.start + i;
        var x = args.pixelPosition + middle - ((args.position - s) * args.pixelBase);
        points += (x) + "," + 0 + " ";
        points += (x) + "," + (histogramHeight - height) + " ";
        points += (x + width) + "," + (histogramHeight - height) + " ";
        points += (x + width) + "," + 0 + " ";
    }

    var pol = SVG.addChild(args.svgCanvasFeatures, "polyline", {
        "points": points,
        "stroke": "#000000",
        "stroke-width": 0.2,
        "fill": 'salmon',
        "cursor": "pointer"
    });


};

