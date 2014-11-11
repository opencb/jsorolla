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
    setConfig: function (args) {
        _.extend(this, args);
    },
    render: function (args) {
        //this.edge = args.edge;
        this.targetEl = args.target;
        this.sourceCoords = this.edge.source.position;
        this.targetCoords = this.edge.target.position;
        this.sourceRenderer = this.edge.source.renderer;
        this.targetRenderer = this.edge.target.renderer;
        this._render();
    },
    remove: function () {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    },
    update: function () {
        this.edgeEl.setAttribute('stroke', this.color);
        this.edgeEl.setAttribute('stroke-width', this.size);
        this.labelEl.setAttribute('font-size', this.labelSize);
        this.updateShape();
    },
    updateShape: function () {
        if(!this.edgeEl){
            debugger
        }
        if (this.shape === 'undirected') {
            this.edgeEl.removeAttribute('marker-end');
        } else {
            this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId() + ")");
        }
        this.move();
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
    setLabelContent: function (text) {
        this.labelText = text;
        var textSvg = this.el.querySelector('text[network-type="edge-label"]');
        var label = '';
        if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
            label = this.labelText;
        }
        textSvg.textContent = label;
    },
//    moveSourceOff: function (coords) {
//        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
//        linkLine.setAttribute('x1', coords.x);
//        linkLine.setAttribute('y1', coords.y);
//
//        var x1 = parseFloat(linkLine.getAttribute('x1'));
//        var y1 = parseFloat(linkLine.getAttribute('y1'));
//        var x2 = parseFloat(linkLine.getAttribute('x2'));
//        var y2 = parseFloat(linkLine.getAttribute('y2'));
//
//        var x = (x1 + x2) / 2;
//        var y = (y1 + y2) / 2;
//
//        var text = $(this.el).find('text[network-type="edge-label"]')[0];
//        text.setAttribute('x', x);
//        text.setAttribute('y', y);
//    },
//    moveTargetOff: function (coords) {
//        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
//        linkLine.setAttribute('x2', coords.x);
//        linkLine.setAttribute('y2', coords.y);
//
//        var x1 = parseFloat(linkLine.getAttribute('x1'));
//        var y1 = parseFloat(linkLine.getAttribute('y1'));
//        var x2 = parseFloat(linkLine.getAttribute('x2'));
//        var y2 = parseFloat(linkLine.getAttribute('y2'));
//
//        var x = (x1 + x2) / 2;
//        var y = (y1 + y2) / 2;
//
//        var text = $(this.el).find('text[network-type="edge-label"]')[0];
//        text.setAttribute('x', x);
//        text.setAttribute('y', y);
//
//    },
    move: function () {
        var val = this._calculateEdgePath();
        this.edgeEl.setAttribute('d', val.d);
        this.labelEl.setAttribute('x', val.xl);
        this.labelEl.setAttribute('y', val.yl);

    },
    _calculateEdgePath: function () {
        var d, labelX, labelY;
        if (this.edge.source === this.edge.target) {
            //calculate self edge
            var length1 = this.sourceRenderer.getSize() * 0.6;
            var length2 = this.sourceRenderer.getSize() * 1.8;
            labelX = this.sourceCoords.x - this.sourceRenderer.getSize();
            labelY = this.sourceCoords.y - this.sourceRenderer.getSize();


            var rSize = this.sourceRenderer.getSize() / 2;

            d = ['M', this.sourceCoords.x - rSize, this.sourceCoords.y ,
                'L', this.sourceCoords.x - length1, this.sourceCoords.y,
                'C', this.sourceCoords.x - length2, this.sourceCoords.y, this.sourceCoords.x, this.sourceCoords.y - length2,
                this.sourceCoords.x , this.sourceCoords.y - length1,
                'L', this.targetCoords.x, this.targetCoords.y - rSize].join(' ');
        } else {
            //calculate bezier line
            var deltaX = this.targetCoords.x - this.sourceCoords.x;
            var deltaY = this.targetCoords.y - this.sourceCoords.y;
            var angle = Math.atan(deltaY / deltaX);
            if (isNaN(angle)) {
                angle = 0;
            }


            var midX = (this.sourceCoords.x + this.targetCoords.x) / 2;
            var midY = (this.sourceCoords.y + this.targetCoords.y) / 2;
            var controlPath = '';
            if (this.edge.overlapCount === 0) {
                labelX = midX - (Math.sin(angle));
                labelY = midY + (Math.cos(angle));
            } else {
                var separation = 15;
                var remainder = this.edge.overlapCount % 2;
                var sum = 1;
                var sign = 1;
                if (remainder === 0) {
                    sum = 0;
                    sign = -1
                }
                var controlPointOffset = (this.edge.overlapCount + sum) / 2 * separation * (sign);
                var controlPointOffsetLabel = controlPointOffset / 1.33;
                var controlX = midX - (Math.sin(angle) * controlPointOffset);
                var controlY = midY + (Math.cos(angle) * controlPointOffset);
                labelX = midX - (Math.sin(angle) * controlPointOffsetLabel);
                labelY = midY + (Math.cos(angle) * controlPointOffsetLabel);
                controlPath = ['C', controlX, controlY, controlX, controlY].join(' ');
            }
            var pp = this._getPerimeterPositions(angle);

//            d = ['M', this.sourceCoords.x, this.sourceCoords.y, 'C', controlX, controlY, controlX, controlY, this.targetCoords.x, this.targetCoords.y].join(' ');
            d = ['M', pp.sx, pp.sy, controlPath, pp.tx, pp.ty].join(' ');
        }
        return {d: d, xl: labelX, yl: labelY};
    },
    _getPerimeterPositions: function (angle) {
        // Calculate source and target points of the perimeter - TODO ellipse, square, rectangle
        var sign = this.targetCoords.x > this.sourceCoords.x ? 1 : -1;
        var srHalfSize = this.sourceRenderer.getSize() / 2;

        var offset = 0;
        if (this.shape !== 'undirected') {
            offset = this.size * 2;
        }
        var trHalfSize = offset + (this.targetRenderer.getSize() / 2);

        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var absCosAngle = Math.abs(cosAngle);
        var absSinAngle = Math.abs(sinAngle);
        var sx, sy, tx, ty, magnitudeCos, magnitudeSin, magnitude;

        //circle
        // x = cx + r * cos(a)
        // y = cy + r * sin(a)

        //Square
        // center + (cos(angle), sin(angle))*magnitude

        //Source
        switch (this.sourceRenderer.shape) {
            case 'square':
                magnitudeCos = srHalfSize / absCosAngle;
                magnitudeSin = srHalfSize / absSinAngle;
                magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                sx = this.sourceCoords.x + (sign * cosAngle * magnitude);
                sy = this.sourceCoords.y + (sign * sinAngle * magnitude);
                break;
            case 'rectangle':
                magnitudeCos = srHalfSize * 1.4 / absCosAngle;
                magnitudeSin = srHalfSize / absSinAngle;
                magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                sx = this.sourceCoords.x + (sign * cosAngle * magnitude);
                sy = this.sourceCoords.y + (sign * sinAngle * magnitude);
                break;
            case 'ellipse':
                sx = this.sourceCoords.x + (sign * cosAngle * srHalfSize * 1.4);
                sy = this.sourceCoords.y + (sign * sinAngle * srHalfSize);
                break;
            case 'circle':
            default:
                sx = this.sourceCoords.x + (sign * cosAngle * srHalfSize);
                sy = this.sourceCoords.y + (sign * sinAngle * srHalfSize);
        }
        //Target
        switch (this.targetRenderer.shape) {
            case 'square':
                magnitudeCos = trHalfSize / absCosAngle;
                magnitudeSin = trHalfSize / absSinAngle;
                magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                tx = this.targetCoords.x - (sign * cosAngle * magnitude);
                ty = this.targetCoords.y - (sign * sinAngle * magnitude);
                break;
            case 'rectangle':
                magnitudeCos = trHalfSize * 1.4 / absCosAngle;
                magnitudeSin = trHalfSize / absSinAngle;
                magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                tx = this.targetCoords.x - (sign * cosAngle * magnitude);
                ty = this.targetCoords.y - (sign * sinAngle * magnitude);
                break;
            case 'ellipse':
                tx = this.targetCoords.x - (sign * cosAngle * trHalfSize * 1.4);
                ty = this.targetCoords.y - (sign * sinAngle * trHalfSize);
                break;
            case 'circle':
            default:
                tx = this.targetCoords.x - (sign * cosAngle * trHalfSize);
                ty = this.targetCoords.y - (sign * sinAngle * trHalfSize);
        }
        return {sx: sx, sy: sy, tx: tx, ty: ty};
    },
    /* Private */
    _render: function () {
        var groupSvg = SVG.create('g', {
            "cursor": "pointer",
            "id": this.edge.id,
            opacity: this.opacity,
            'network-type': 'edge-g'
        });

        var val = this._calculateEdgePath();

        var linkSvg = SVG.addChild(groupSvg, "path", {
            "d": val.d,
            opacity: this.opacity,
            "stroke": this.color,
            "stroke-width": this.size,
            "cursor": "pointer",
            fill: 'none',
            'network-type': 'edge'
        }, 0);
        if (this.shape !== 'undirected') {
            linkSvg.setAttribute('marker-end', "url(" + this._getMarkerArrowId() + ")");
        }

        var textOffset = this.sourceRenderer.getSize();
        var text = SVG.addChild(groupSvg, "text", {
            "x": val.xl,
            "y": val.yl,
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
        this.edgeEl.setAttribute('stroke-dasharray', '5, 2');
//        this.edgeEl.setAttribute('stroke-width', this.size + 1);

        this.selected = true;
    },
    _removeSelect: function () {
        this.edgeEl.removeAttribute('stroke-dasharray');
//        this.edgeEl.removeAttribute('stroke-width', this.size);

        this.selected = false;
    },
    /**/
    _getMarkerArrowId: function () {
        var offset = (this.size * -2) - 1;
        // if not exists this marker, add new one to defs
        var markerArrowId = "arrow-" + this.shape + "-" + offset.toString().replace(".", "_") + '-' + this.size.toString().replace(".", "_") + '-' + this.color.replace('#', '');
        var markerArrowIdSel = '#' + markerArrowId;
        if ($(markerArrowIdSel).length == 0) {
            this._addArrowShape(this.shape, offset, this.color, this.size, this.targetEl, markerArrowId);
        }
        return markerArrowIdSel;
    },
    _addArrowShape: function (type, offset, color, edgeSize, targetSvg, markerArrowId) {
        if (edgeSize === 0) {
            var scale = 0;
        } else {
            var scale = 1 / edgeSize;
        }

        var mult = scale * (1 + edgeSize / 2);

        var headWidth = 4 * mult;
        var headHeight = 5 * mult;
        var headRadius = 3 * mult;

        offset = scale * offset;

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
            "refX": offset + headHeight,
            "refY": headWidth / 2,
            "angle": 10,
            "style": "overflow:visible;"
        });

        switch (type) {
            case "directed":
                var arrow = SVG.addChild(marker, "path", {
//                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "d": ['M0,0', 'V', headWidth, 'L', headHeight, headWidth / 2, 'Z'].join(' ')//"M0,0 V10 L5,5 Z"
//                    "points": [-offset, -halfSize, -offset - headHeight, -headWidth, -offset - headHeight, headWidth, -offset, halfSize].join(' ')
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
                var arrow = SVG.addChild(marker, "path", {
//                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "d": ['M', headHeight , 0, 'V', headHeight, 'L', headHeight / 2, headHeight, 'L', headHeight / 2, 0, 'Z'].join(' ')
//                    "x":0,
//                    "y": 0,
//                    "width": headWidth,
//                    "height": headWidth * 2
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
//                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "cx": headWidth / 2,
                    "cy": headHeight / 2,
                    "r": headRadius
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
//                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "cx": headWidth / 2,
                    "cy": headHeight / 2,
                    "r": headRadius
                });
                var arrow = SVG.addChild(marker, "circle", {
//                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": 'white',
                    "cx": headWidth / 2,
                    "cy": headHeight / 2,
                    "r": headRadius - 2
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