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
    this.shaft = 'line';
    this.bidirectional = 'false';
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
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            if (args[prop] != null) {
                this[prop] = args[prop];
            }
        }
    }

    this.size = parseFloat(this.size);
    this.strokeSize = parseFloat(this.strokeSize);
    this.opacity = parseFloat(this.opacity);
    this.labelSize = parseFloat(this.labelSize);

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
                this.size = parseInt(this.size);
                this.edgeEl.setAttribute('stroke-width', this._getStrokeWidth());
                this.updateShape();
                break;
            case "bidirectional":
            case "shape":
                this.updateShape();
                break;
            case "shaft":
                this.updateShaft();
                break;
            case "labelSize":
                this.labelEl.setAttribute('font-size', this.labelSize);
                this.setLabelContent(this.labelText);
                break;
            case "opacity":
                this.edgeEl.setAttribute('opacity', this.opacity);
                break;
            default:
                this.update();
        }
    },
    _getStrokeWidth: function () {
        return 1 + (this.size / 2);
    },
    //setConfig: function (args) {
    //    if (args.size) {
    //        args.size = parseInt(args.size);
    //    }
    //    if (args.opacity) {
    //        args.opacity = parseFloat(args.opacity);
    //    }
    //    if (args.labelSize) {
    //        args.labelSize = parseInt(args.labelSize);
    //    }
    //    if (args.labelPositionX) {
    //        args.labelPositionX = parseInt(args.labelPositionX);
    //    }
    //    if (args.labelPositionY) {
    //        args.labelPositionY = parseInt(args.labelPositionY);
    //    }
    //    _.extend(this, args);
    //    this.edgeEl.setAttribute('opacity', this.opacity);
    //},
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
        this.edgeEl.setAttribute('stroke-width', this._getStrokeWidth());
        this.labelEl.setAttribute('font-size', this.labelSize);
        this.updateShaft();
        this.updateShape();
    },
    updateShape: function () {
        if (!this.edgeEl) {
            debugger
        }
        if (this.shape === 'undirected') {
            this.edgeEl.removeAttribute('marker-end');
            this.edgeEl.removeAttribute('marker-start');
        } else {
            if (this.bidirectional == 'true') {
                this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId("end") + ")");
                this.edgeEl.setAttribute('marker-start', "url(" + this._getMarkerArrowId("start") + ")");
            } else {
                this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId("end") + ")");
                this.edgeEl.removeAttribute('marker-start');
            }
        }

        this.move();
    },
    updateShaft: function () {
        if (!this.edgeEl) {
            debugger
        }
        if (this.selected) {
            this._renderSelect();
        }
        if (!this.selected) {
            this._removeSelect();
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
    setLabelContent: function (text) {
        if (text == null) {
            text = '';
        }
        this.labelText = text;
        this.labelEl.textContent = text;
        //var splitted = text.split("\\n");
        //var line, lineEl;
        //for (var i = 0; i < splitted.length; i++) {
        //    line = splitted[i];
        //    lineEl = SVG.addChild(this.labelEl, "tspan", {
        //        "dy": this.labelSize,
        //        "x": this.labelEl.getAttribute("x")
        //    });
        //    lineEl.textContent = line;
        //}
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

            d = ['M', this.sourceCoords.x - rSize, this.sourceCoords.y,
                'L', this.sourceCoords.x - length1, this.sourceCoords.y,
                'C', this.sourceCoords.x - length2, this.sourceCoords.y, this.sourceCoords.x, this.sourceCoords.y - length2,
                this.sourceCoords.x, this.sourceCoords.y - length1,
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
        // Calculate source and target points of the perimeter
        var sign = this.targetCoords.x >= this.sourceCoords.x ? 1 : -1;
        var srHalfSize = this.sourceRenderer.getSize() / 2;

        //var offset = 0;
        //if (this.shape !== 'undirected') {
        //    offset = this.size * 2;
        //}
        //var trHalfSize = offset + (this.targetRenderer.getSize() / 2);
        var trHalfSize = this.targetRenderer.getSize() / 2;

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
        if (this.sourceRenderer.complex == true) {
            sx = this.sourceCoords.x + (sign * cosAngle * srHalfSize);
            sy = this.sourceCoords.y + (sign * sinAngle * srHalfSize);
        } else {
            switch (this.sourceRenderer.shape) {
                case 'square':
                    magnitudeCos = srHalfSize / absCosAngle;
                    magnitudeSin = srHalfSize / absSinAngle;
                    magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                    sx = this.sourceCoords.x + (sign * cosAngle * magnitude);
                    sy = this.sourceCoords.y + (sign * sinAngle * magnitude);
                    break;
                case 'rectangle':
                    magnitudeCos = srHalfSize * 1.5 / absCosAngle;
                    magnitudeSin = srHalfSize / absSinAngle;
                    magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                    sx = this.sourceCoords.x + (sign * cosAngle * magnitude);
                    sy = this.sourceCoords.y + (sign * sinAngle * magnitude);
                    break;
                case 'ellipse':
                    sx = this.sourceCoords.x + (sign * cosAngle * srHalfSize * 1.5);
                    sy = this.sourceCoords.y + (sign * sinAngle * srHalfSize);
                    break;
                case 'circle':
                default:
                    sx = this.sourceCoords.x + (sign * cosAngle * srHalfSize);
                    sy = this.sourceCoords.y + (sign * sinAngle * srHalfSize);
            }
        }
        //Target
        if (this.targetRenderer.complex == true) {
            tx = this.targetCoords.x - (sign * cosAngle * trHalfSize);
            ty = this.targetCoords.y - (sign * sinAngle * trHalfSize);
        } else {
            switch (this.targetRenderer.shape) {
                case 'square':
                    magnitudeCos = trHalfSize / absCosAngle;
                    magnitudeSin = trHalfSize / absSinAngle;
                    magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                    tx = this.targetCoords.x - (sign * cosAngle * magnitude);
                    ty = this.targetCoords.y - (sign * sinAngle * magnitude);
                    break;
                case 'rectangle':
                    magnitudeCos = trHalfSize * 1.5 / absCosAngle;
                    magnitudeSin = trHalfSize / absSinAngle;
                    magnitude = (magnitudeCos <= magnitudeSin) ? magnitudeCos : magnitudeSin;
                    tx = this.targetCoords.x - (sign * cosAngle * magnitude);
                    ty = this.targetCoords.y - (sign * sinAngle * magnitude);
                    break;
                case 'ellipse':
                    tx = this.targetCoords.x - (sign * cosAngle * trHalfSize * 1.5);
                    ty = this.targetCoords.y - (sign * sinAngle * trHalfSize);
                    break;
                case 'circle':
                default:
                    tx = this.targetCoords.x - (sign * cosAngle * trHalfSize);
                    ty = this.targetCoords.y - (sign * sinAngle * trHalfSize);
            }
        }
        return {sx: sx, sy: sy, tx: tx, ty: ty};
    },
    /* Private */
    _render: function () {
        this.el = SVG.create('g', {
            "cursor": "pointer",
            "id": this.edge.id,
            opacity: this.opacity,
            'network-type': 'edge-g'
        });

        var val = this._calculateEdgePath();

        this.edgeEl = SVG.addChild(this.el, "path", {
            "d": val.d,
            opacity: this.opacity,
            "stroke": this.color,
            "stroke-width": this._getStrokeWidth(),
            //"stroke-linecap": "round",
            //"stroke-linejoin": "miter",
            "cursor": "pointer",
            fill: 'none',
            'network-type': 'edge'
        },1);

        if (this.shape === 'undirected') {
            this.edgeEl.removeAttribute('marker-end');
            this.edgeEl.removeAttribute('marker-start');
        } else {
            if (this.bidirectional == 'true') {
                this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId("end") + ")");
                this.edgeEl.setAttribute('marker-start', "url(" + this._getMarkerArrowId("start") + ")");
            } else {
                this.edgeEl.setAttribute('marker-end', "url(" + this._getMarkerArrowId("end") + ")");
                this.edgeEl.removeAttribute('marker-start');
            }
        }

        this.labelEl = SVG.addChild(this.el, "text", {
            "x": val.xl,
            "y": val.yl,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'edge-label'
        });
        this.setLabelContent(this.edge.id);

        SVG._insert(this.targetEl, this.el, 1);

        if (this.selected) {
            this._renderSelect();
        }
        if (!this.selected) {
            this._removeSelect();
        }
    },

    _renderSelect: function () {
        this.edgeEl.setAttribute('stroke-dasharray', '10, 5');

        this.selected = true;
    },
    _removeSelect: function () {
        if (this.shaft !== 'dashed') {
            this.edgeEl.removeAttribute('stroke-dasharray');
        } else {
            this.edgeEl.setAttribute('stroke-dasharray', '3, 2');
        }
        this.selected = false;
    },
    /**/
    _getMarkerArrowId: function (markerLocation) {
        var offset = (this.size * -2) - 1;
        // if not exists this marker, add new one to defs
        var markerArrowId = "arrow-" + this.shape + "-" + offset.toString().replace(".", "_") + '-' + this.size.toString().replace(".", "_") + '-' + this.color.replace('#', '') + markerLocation;
        var markerArrowIdSel = '#' + markerArrowId;
        if (!this.targetEl.querySelector(markerArrowIdSel)) {
            this._addArrowShape(this.shape, offset, this.color, this.size, this.targetEl, markerArrowId, markerLocation);
        }
        return markerArrowIdSel;
    },
    _addArrowShape: function (type, offset, color, edgeSize, targetSvg, markerArrowId, markerLocation) {
        var defsEl = targetSvg.querySelector('defs');
        if (!defsEl) {
            defsEl = SVG.addChild(targetSvg, "defs", {}, 0);
        }
        if (typeof color === 'undefined') {
            color = '#000000';
        }
        var sign = 1;
        if (markerLocation == "start") {
            sign = -1;
        }
        var sw = this._getStrokeWidth();
        var swh = sw / 2;
        var w = 8 + edgeSize;
        var h = 3 + edgeSize;
        var marker = SVG.addChild(defsEl, "marker", {
            "id": markerArrowId,
            "orient": "auto",
            "refX": (w) * sign,
            "refY": h,
            'markerUnits': "userSpaceOnUse",
            "style": "overflow:visible;"
        });
        switch (type) {
            case "directed":
                var d = ['M0,0', 'L', 1 * sign, h, 'L', 0, h * 2, 'L', w * sign, h + swh, 'L', w * sign, h - swh, 'Z'].join(' ')//"M0,0 V10 L5,5 Z"
                //var d = ['M0,0', 'L', 1 * sign, h, 'L', 0, h * 2, 'L', w * sign, h, 'Z'].join(' ')//"M0,0 V10 L5,5 Z"
                var arrow = SVG.addChild(marker, "path", {
                    "fill": color,
                    "d": d
                });
                break;
            case "inhibited":
                var x = w / 2;
                var y = h + swh;
                var x2 = w;
                var y2 = h * 3 + swh;
                var arrow = SVG.addChild(marker, "path", {
                    "fill": color,
                    "d": ['M', sign * x, -y, 'L', sign * x, y2, 'L', sign * x2, y2, 'L', sign * x2, -y, 'Z'].join(' ')
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
                    "fill": color,
                    "cx": sign * w / 2,
                    "cy": h,
                    "r": w / 2
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
                    "fill": color,
                    "cx": sign * w / 2,
                    "cy": h,
                    "r": w / 2
                });
                var arrow = SVG.addChild(marker, "circle", {
                    "fill": 'white',
                    "cx": sign * w / 2,
                    "cy": h,
                    "r": (w / 2) - sw
                });
                break;
        }
    },
    toJSON: function () {
        return {
            shape: this.shape,
            shaft: this.shaft,
            bidirectional: this.bidirectional,
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