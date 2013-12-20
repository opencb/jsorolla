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

function DefaultEdgeRenderer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    //defaults
    this.shape = 'directed';
    this.size = 2;
    this.color = '#cccccc';
    this.strokeSize = 2;
    this.strokeColor = '#888888';
    this.opacity = 1;
    this.labelSize = 12;
    this.labelColor = '#111111';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;


    //set instantiation args, must be last
    _.extend(this, args);

}

DefaultEdgeRenderer.prototype = {
    render: function (args) {
        var edge = args.edge;
        var sourceCoords = args.sourceCoords;
        var targetCoords = args.targetCoords;
        var sourceRenderer = args.sourceRenderer;
        var targetRenderer = args.targetRenderer;
        var targetSvg = args.target;


//        var sourceLayout = this.network.getVertexLayout(args.edge.source);
//        var targetLayout = this.network.getVertexLayout(args.edge.target);
//        var targetDisplay = this.network.getVertexDisplay(args.edge.target);

        var offset = targetRenderer.getSize() / 2;
        // if not exists this marker, add new one to defs
        var markerArrowId = "#arrow-" + this.shape + "-" + offset + '-' + this.color;
        if ($(markerArrowId).length == 0) {
            this.addArrowShape(this.shape, offset, this.color, this.size,targetSvg);
        }



        var linkSvg = SVG.addChild(targetSvg, "line", {
            "id": edge.id,
            "x1": sourceCoords.x,
            "y1": sourceCoords.y,
            "x2": targetCoords.x,
            "y2": targetCoords.y,
            "stroke": this.color,
            "stroke-width": this.size,
            "cursor": "pointer",
            "marker-end": "url(" + markerArrowId + ")",
            'network-type': 'edge'
        }, 0);
    },
    /**/
    addArrowShape: function (type, offset, color, edgeSize,targetSvg) {
        var scale = 1 / edgeSize;

        if (typeof color === 'undefined') {
            color = '#000000';
        }
        var id = "arrow-" + type + '-' + offset + '-' + color;
        var marker = SVG.addChild(targetSvg, "marker", {
            "id": id,
            "orient": "auto",
            "style": "overflow:visible;"
        });

        switch (type) {
            case "directed":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": color,
                    "stroke-width": edgeSize,
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "odirected":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
//			"points":"-14,0 -28,-6 -28,6 -14,0"
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "inhibited":
                var arrow = SVG.addChild(marker, "rect", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "x": -offset - 6,
                    "y": -6,
                    "width": 6,
                    "height": 12
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
        }
    }

}