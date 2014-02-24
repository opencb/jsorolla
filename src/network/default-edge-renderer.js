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
    this.shape = 'undirected';
    this.size = 1;
    this.color = '#cccccc';
    this.strokeSize = 2;
    this.strokeColor = '#aaaaaa';
    this.opacity = 1;
    this.labelSize = 0;
    this.labelColor = '#111111';
    this.labelText = '';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;

    this.el;
    this.edgeEl;
    this.labelEl;
    this.targetEl;
    this.edge;
    this.selected = false;

    this.sourceCoords;
    this.targetCoords;
    this.sourceRenderer;
    this.targetRenderer;

    //set instantiation args, must be last
    _.extend(this, args);

}

DefaultEdgeRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value) {
        this[attr] = value;
        switch (attr) {
            case "color":
                this.edgeEl.setAttribute('stroke', this.color);
                this.updateShape();
                break;
            case "size":
                this.edgeEl.setAttribute('stroke-width', this.size);
                this.updateShape();
                break;
            case "shape":
                this.updateShape();
                break;
            case "labelSize":
                this.labelEl.setAttribute('font-size', this.labelSize);
                break;
            case "opacity":
                this.edgeEl.setAttribute('opacity', this.opacity);
                break;
            default:
                this.update();
        }
    },
    render: function (args) {
        this.edge = args.edge;
        this.targetEl = args.target;
        this.sourceCoords = args.sourceCoords;
        this.targetCoords = args.targetCoords;
        this.sourceRenderer = args.sourceRenderer;
        this.targetRenderer = args.targetRenderer;
        this._render();
    },
    remove: function () {
        $(this.el).remove();
    },
    update: function () {
        this.edgeEl.setAttribute('stroke', this.color);
        this.edgeEl.setAttribute('stroke-width', this.size);
        this.labelEl.setAttribute('font-size', this.labelSize);
        this.updateShape();
    },
    updateShape: function () {
        if (this.shape === 'undirected') {
            this.edgeEl.removeAttribute('marker-end');
        } else {
            this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId() + ")");
        }
    },
    select: function () {
        if (!this.selected) {
            this._renderSelect();
        }
    },
    deselect: function () {
        if (this.selected) {
            this._removeSelect();
        }
    },
    moveSourceOff: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('x1', coords.x);
        linkLine.setAttribute('y1', coords.y);

        var x1 = parseFloat(linkLine.getAttribute('x1'));
        var y1 = parseFloat(linkLine.getAttribute('y1'));
        var x2 = parseFloat(linkLine.getAttribute('x2'));
        var y2 = parseFloat(linkLine.getAttribute('y2'));

        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;

        var text = $(this.el).find('text[network-type="edge-label"]')[0];
        text.setAttribute('x', x);
        text.setAttribute('y', y);
    },
    moveTargetOff: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('x2', coords.x);
        linkLine.setAttribute('y2', coords.y);

        var x1 = parseFloat(linkLine.getAttribute('x1'));
        var y1 = parseFloat(linkLine.getAttribute('y1'));
        var x2 = parseFloat(linkLine.getAttribute('x2'));
        var y2 = parseFloat(linkLine.getAttribute('y2'));

        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;

        var text = $(this.el).find('text[network-type="edge-label"]')[0];
        text.setAttribute('x', x);
        text.setAttribute('y', y);

    },
    moveSource: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        var x = (this.sourceCoords.x + this.targetCoords.x) / 2;
        var y = (this.sourceCoords.y + this.targetCoords.y) / 2;

        var d = ['M', this.sourceCoords.x, this.sourceCoords.y, 'Q', x, y - 50, this.targetCoords.x, this.targetCoords.y].join(' ');


    },
    moveTarget: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('x2', coords.x);
        linkLine.setAttribute('y2', coords.y);

        var x1 = parseFloat(linkLine.getAttribute('x1'));
        var y1 = parseFloat(linkLine.getAttribute('y1'));
        var x2 = parseFloat(linkLine.getAttribute('x2'));
        var y2 = parseFloat(linkLine.getAttribute('y2'));

        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;

        var text = $(this.el).find('text[network-type="edge-label"]')[0];
        text.setAttribute('x', x);
        text.setAttribute('y', y);

    },
    setLabelContent: function (text) {
        this.labelText = text;
        var textSvg = $(this.el).find('text[network-type="edge-label"]')[0];
        var label = '';
        if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
            label = this.labelText;
        }
        textSvg.textContent = label;
    },
    /* Private */
    _renderOff: function () {
        var groupSvg = SVG.create('g', {
            "cursor": "pointer",
            "id": this.edge.id,
            opacity: this.opacity,
            'network-type': 'edge-g'
        });

        var linkSvg = SVG.addChild(groupSvg, "line", {
            "x1": this.sourceCoords.x,
            "y1": this.sourceCoords.y,
            "x2": this.targetCoords.x,
            "y2": this.targetCoords.y,
            opacity: this.opacity,
            "stroke": this.color,
            "stroke-width": this.size,
            "cursor": "pointer",
            "marker-end": "url(" + this._getMarkerArrowId() + ")",
            'network-type': 'edge'
        }, 0);

        var x = (this.sourceCoords.x + this.targetCoords.x) / 2;
        var y = (this.sourceCoords.y + this.targetCoords.y) / 2;

        var textOffset = this.sourceRenderer.getSize();
        var text = SVG.addChild(groupSvg, "text", {
            "x": x,
            "y": y,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'edge-label'
        });
        text.textContent = this.edge.id;

        this.el = groupSvg;
        this.edgeEl = linkSvg;
        this.labelEl = text;
        SVG._insert(this.targetEl, groupSvg, 0);

        if (this.selected) {
            this._renderSelect();
        }
    },
    _render: function () {
        var groupSvg = SVG.create('g', {
            "cursor": "pointer",
            "id": this.edge.id,
            opacity: this.opacity,
            'network-type': 'edge-g'
        });

        var x = (this.sourceCoords.x + this.targetCoords.x) / 2;
        var y = (this.sourceCoords.y + this.targetCoords.y) / 2;

        var d = ['M', this.sourceCoords.x, this.sourceCoords.y, 'Q', x, y - 50, this.targetCoords.x, this.targetCoords.y].join(' ');
        var linkSvg = SVG.addChild(groupSvg, "path", {
            "d": d,
            opacity: this.opacity,
            "stroke": this.color,
            "stroke-width": this.size,
            "cursor": "pointer",
            fill:'none',
            "marker-end": "url(" + this._getMarkerArrowId() + ")",
            'network-type': 'edge'
        }, 0);

        var textOffset = this.sourceRenderer.getSize();
        var text = SVG.addChild(groupSvg, "text", {
            "x": x,
            "y": y,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'edge-label'
        });
        text.textContent = this.edge.id;

        this.el = groupSvg;
        this.edgeEl = linkSvg;
        this.labelEl = text;
        SVG._insert(this.targetEl, groupSvg, 0);

        if (this.selected) {
            this._renderSelect();
        }
    },

    _renderSelect: function () {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('stroke-dasharray', '5, 2');

        this.selected = true;
    },
    _removeSelect: function () {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.removeAttribute('stroke-dasharray');

        this.selected = false;
    },
    /**/
    _getMarkerArrowId: function () {
        var offset = this.targetRenderer.getSize() / 2;
        // if not exists this marker, add new one to defs
        var markerArrowId = "arrow-" + this.shape + "-" + offset.toString().replace(".", "_") + '-' + this.size.toString().replace(".", "_") + '-' + this.color.replace('#', '');
        var markerArrowIdSel = '#' + markerArrowId;
        if ($(markerArrowIdSel).length == 0) {
            this._addArrowShape(this.shape, offset, this.color, this.size, this.targetEl, markerArrowId);
        }
        return markerArrowIdSel;
    },
    _addArrowShape: function (type, offset, color, edgeSize, targetSvg, markerArrowId) {
        var scale = 1 / edgeSize;

        var headWidth = edgeSize * 3;
        var headHeight = edgeSize * 6;
        var headRadius = edgeSize + Math.sqrt(edgeSize * 6);

        var halfSize = edgeSize / 2;

        var defs = $(targetSvg).find('defs');
        var defsEl = defs[0]
        if (defs.length == 0) {
            defsEl = SVG.addChild(targetSvg, "defs", {}, 0);
        }

        if (typeof color === 'undefined') {
            color = '#000000';
        }
        var marker = SVG.addChild(defsEl, "marker", {
            "id": markerArrowId,
            "orient": "auto",
            "style": "overflow:visible;"
        });

        switch (type) {
            case "directed":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "points": "-" + offset + ",-" + halfSize + " " + (-offset - headHeight) + ",-" + headWidth + " " + (-offset - headHeight) + "," + headWidth + " -" + offset + "," + halfSize
                });
                break;
//            case "odirected":
//                var arrow = SVG.addChild(marker, "polyline", {
//                    "transform": "scale(0.5) rotate(0) translate(0,0)",
//                    "fill": color,
//                    "points": "-" + offset + ",0 " + (-offset - 18) + ",-8 " + (-offset - 18) + ",8 -" + offset + ",0"
//                });
//                offset += 6;
//                var arrow = SVG.addChild(marker, "polyline", {
//                    "transform": "scale(0.5) rotate(0) translate(0,0)",
//                    "fill": 'white',
//                    "opacity": "1",
//                    "points": "-" + offset + ",0 " + (-offset - 9) + ",-4 " + (-offset - 9) + ",4 -" + offset + ",0"
//                });
//                break;
            case "inhibited":
                var arrow = SVG.addChild(marker, "rect", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "x": -offset - headRadius,
                    "y": -headRadius,
                    "width": headRadius,
                    "height": headRadius * 2
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "cx": -offset - headRadius + 1,
                    "cy": 0,
                    "r": headRadius
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "cx": -offset - headRadius + 1,
                    "cy": 0,
                    "r": headRadius
                });
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": 'white',
                    "cx": -offset - headRadius + 1,
                    "cy": 0,
                    "r": headRadius - Math.sqrt(edgeSize * 4)
                });
                break;
        }
    },
    toJSON: function () {
        return {
            shape: this.shape,
            size: this.size,
            color: this.color,
            strokeSize: this.strokeSize,
            strokeColor: this.strokeColor,
            opacity: this.opacity,
            labelSize: this.labelSize,
            labelColor: this.labelColor,
            labelText: this.labelText
        };
    }

}