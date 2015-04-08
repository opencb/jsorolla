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

function CircosVertexRenderer(args) {
    var _this = this;

    //defaults
    this.shape = 'circle';
    this.size = 30;
    this.color = '#FAFAFA';
    this.strokeSize = 2;
    this.strokeColor = '#888888';
    this.opacity = 0.8;
    this.labelSize = 12;
    this.labelColor = '#111111';
    this.labelPositionX = 0;
    this.labelPositionY = 0;
    this.labelText = '';
    this.area = 1;
    this.strokeArea = 1;
    this.xAttribute = 'x';
    this.yAttribute = 'y';


    this.pieSlices = [
//        {size: this.size, area: this.sliceArea, color: this.color, labelSize: this.labelSize, labelOffset: 0}
    ];
    this.donutSlices = [
//        {size: this.strokeSize, area: this.sliceArea, color: this.strokeColor, labelSize: this.labelSize, labelOffset: 0}
    ];

    this.shapeEl;
    this.vertexEl;
    this.targetEl;
    this.selectEl;
    this.groupEl;
    this.vertex;
    this.selected = false;


    //draw parameters
    this.mid;
    this.figureSize;
    this.maxPieSize;
    this.maxDonutSize;
    this.labelX = 0;
    this.labelY = 0;

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
    this.labelPositionX = parseFloat(this.labelPositionX);
    this.labelPositionY = parseFloat(this.labelPositionY);
    this.area = parseFloat(this.area);
    this.strokeArea = parseFloat(this.strokeArea);

}


CircosVertexRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value, update) {
        this[attr] = value;

        if (this._checkListProperties()) {
            this.complex = true;
            this.update();
        } else {
            this.complex = false;
            switch (attr) {
                case 'opacity':
                    this.opacity = parseFloat(this.opacity);
                    this.groupEl.setAttribute('opacity', this.opacity);
                    break;
                case "labelSize":
                case "labelPositionY":
                case "labelPositionX":
                    this.labelPositionX = parseInt(this.labelPositionX);
                    this.labelPositionY = parseInt(this.labelPositionY);
                    this.labelSize = parseInt(this.labelSize);
                    this.labelEl.setAttribute('font-size', this.labelSize);
                    this._updateLabelElPosition();
                    this.labelEl.setAttribute('x', this.labelX);
                    this.labelEl.setAttribute('y', this.labelY);
                    break;
                case "shape":
                case 'color':
                case 'strokeSize':
                case 'size':
                case 'strokeColor':
                case 'area':
                case 'strokeArea':
                default:
                    this.size = parseInt(this.size);
                    this.strokeSize = parseInt(this.strokeSize);
                    this.area = parseInt(this.area);
                    this.strokeArea = parseInt(this.strokeArea);
                    if (update !== false) {
                        this.update();
                    }
            }
        }

    },
    _checkListProperties: function () {
        /** Detect array values **/
        var minPieLength = 0;
        var minDonutLength = 0;
        if (Array.isArray(this.color)) {
            if (minPieLength == 0) {
                minPieLength = this.color.length;
            }
        }
        if (Array.isArray(this.size)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.size.length;
            }
            if (this.size.length != 1 && this.size.length < minPieLength) {
                minPieLength = this.size.length;
            }
        }
        if (Array.isArray(this.area)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.area.length;
            }
            if (this.area.length != 1 && this.area.length < minPieLength) {
                minPieLength = this.area.length;
            }
        }
        if (Array.isArray(this.strokeColor)) {
            if (minDonutLength == 0) {
                minDonutLength = this.strokeColor.length;
            }
        }
        if (Array.isArray(this.strokeSize)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.strokeSize.length;
            }
            if (this.strokeSize.length != 1 && this.strokeSize.length < minPieLength) {
                minPieLength = this.strokeSize.length;
            }
        }
        if (Array.isArray(this.strokeArea)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.strokeArea.length;
            }
            if (this.strokeArea.length != 1 && this.strokeArea.length < minPieLength) {
                minPieLength = this.strokeArea.length;
            }
        }
        this.pieSlices = [];
        var slice;
        if (minPieLength > 0) {
            for (var i = 0; i < minPieLength; i++) {
                slice = {};
                if (Array.isArray(this.color)) {
                    if (this.color.length == 1) {
                        slice.color = this.color[0];
                    } else {
                        slice.color = this.color[i];
                    }
                } else {
                    slice.color = this.color;
                }
                if (Array.isArray(this.size)) {
                    if (this.size.length == 1) {
                        slice.size = this.size[0];
                    } else {
                        slice.size = this.size[i];
                    }
                } else {
                    slice.size = this.size;
                }
                if (Array.isArray(this.area)) {
                    if (this.area.length == 1) {
                        slice.area = this.area[0];
                    } else {
                        slice.area = this.area[i];
                    }
                } else {
                    slice.area = this.area;
                }
                slice.labelSize = this.labelSize;
                slice.labelOffset = 0;
                this.pieSlices.push(slice);
            }
        }
        this.donutSlices = [];
        if (minDonutLength > 0) {
            for (var i = 0; i < minDonutLength; i++) {
                slice = {};
                if (Array.isArray(this.strokeColor)) {
                    if (this.strokeColor.length == 1) {
                        slice.color = this.strokeColor[0];
                    } else {
                        slice.color = this.strokeColor[i];
                    }
                } else {
                    slice.color = this.strokeColor;
                }
                if (Array.isArray(this.strokeSize)) {
                    if (this.strokeSize.length == 1) {
                        slice.size = this.strokeSize[0];
                    } else {
                        slice.size = this.strokeSize[i];
                    }
                } else {
                    slice.size = this.strokeSize;
                }
                if (Array.isArray(this.strokeArea)) {
                    if (this.strokeArea.length == 1) {
                        slice.size = this.strokeArea[0];
                    } else {
                        slice.area = this.strokeArea[i];
                    }
                } else {
                    slice.area = this.strokeArea;
                }
                slice.labelSize = this.labelSize;
                slice.labelOffset = 0;
                this.donutSlices.push(slice);
            }
        }
        if (this.pieSlices.length != 0 || this.donutSlices.length != 0) {
            if (this.pieSlices.length == 0) {
                this.pieSlices.push({
                    color: this.color,
                    size: this.size,
                    area: this.area,
                    labelSize: this.labelSize,
                    labelOffset: 0
                });
            }
            if (this.donutSlices.length == 0) {
                this.donutSlices.push({
                    color: this.strokeColor,
                    size: this.strokeSize,
                    area: this.strokeArea,
                    labelSize: this.labelSize,
                    labelOffset: 0
                });
            }
            return true;
        } else {
            return false;
        }
        /** **/
    },
    render: function (args) {

        this.targetEl = args.target;
        //this.vertex = args.vertex;
        //this.coords = args.coords;
        this.labelText = this.vertex.id;

        if (this._checkListProperties()) {
            this.complex = true;
            this._render();
        } else {
            this._render();
        }

    },
    remove: function () {
        if (this.groupEl && this.groupEl.parentNode) {
            this.groupEl.parentNode.removeChild(this.groupEl);
        }
    },
    update: function () {
        this.remove();
        this._render();
        console.log("update")
    },
    select: function (color) {
        if (color) {
            this.selectEl.setAttribute('fill', color);
        }
        this.groupEl.insertBefore(this.selectEl, this.groupEl.firstChild);
        if (this.groupEl && this.groupEl.parentNode) {
            this.groupEl.parentNode.appendChild(this.groupEl);
        }
        this.selected = true;
    },
    deselect: function () {
        this._removeSelect();
        this.selected = false;
    },
    move: function () {
        this.groupEl.setAttribute('transform', "translate(" + [this.coords.x - this.mid, this.coords.y - this.mid].join(',') + ")");
    },
    setLabelContent: function (text) {
        if (text == null) {
            text = '';
        }
        this.labelText = text;
        if (this.labelEl) {
            this._updateLabelElPosition();
            this.labelEl.setAttribute('x', this.labelX);
            this.labelEl.setAttribute('y', this.labelY);
            this.labelEl.textContent = this.labelText;
        }
    },
    getSize: function () {
        if (this.complex) {
            this._updateComplexDrawParameters();
        } else {
            this._updateDrawParameters();
        }
        return this.figureSize;
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
            labelPositionX: this.labelPositionX,
            labelPositionY: this.labelPositionY,
            labelText: this.labelText,
            area: this.area,
            strokeArea: this.strokeArea,
            pieSlices: this.pieSlices,
            donutSlices: this.donutSlices
        };
    },

    /* Private methods */
    _updateDrawParameters: function () {
        var midSize = (this.size + (this.strokeSize));
        this.mid = midSize / 2;
        this.figureSize = (this.size + (this.strokeSize * 2));
        this._updateLabelElPosition();
    },
    _updateComplexDrawParameters: function () {
        //var midSize = (this.size + (this.strokeSize));
        //this.mid = midSize / 2;
        this.maxPieSize = this._slicesMax(this.pieSlices);
        this.maxDonutSize = this._slicesMax(this.donutSlices);
        this.figureSize = (this.maxPieSize + (this.maxDonutSize * 2));
        this.mid = this.figureSize / 2;
        this._updateLabelElPosition();
    },
    _updateLabelElPosition: function () {
        var labelSize = this._textWidthBySize(this.labelText, this.labelSize);
        this.labelX = this.labelPositionX + this.mid - (labelSize / 2);
        this.labelY = this.labelPositionY + this.mid + this.labelSize / 3;
    },
    _textWidthBySize: function (text, pixelFontSize) {
        return ((text.length * pixelFontSize / 2) + 0.5) | 0;//round up
    },

    _drawSelectShape: function () {
        if (this.complex === true) {
            this._drawSelectCircleShape();
        } else {
            switch (this.shape) {
                case "circle":
                    this._drawSelectCircleShape();
                    break;
                case "ellipse":
                    this._drawSelectEllipseShape();
                    break;
                case "square":
                    this._drawSelectSquareShape();
                    break;
                case "rectangle":
                    this._drawSelectRectangleShape();
                    break;
            }
        }
    },
    _drawSelectCircleShape: function () {
        this.selectEl = SVG.create("circle", {
            r: this.figureSize / 2 * 1.30,
            cx: this.mid,
            cy: this.mid,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectEllipseShape: function () {
        this.selectEl = SVG.create("ellipse", {
            cx: this.mid,
            cy: this.mid,
            rx: this.figureSize,
            ry: this.figureSize * 0.65,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectSquareShape: function () {
        this.selectEl = SVG.create("rect", {
            x: -this.mid * 0.3,
            y: -this.mid * 0.3,
            width: this.mid * 2.6,
            height: this.mid * 2.6,
            stroke: '#999999',
            'stroke-width': this.strokeSize,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectRectangleShape: function () {
        this.selectEl = SVG.create("rect", {
            x: -this.mid * 0.8,
            y: -this.mid * 0.3,
            width: this.mid * 3.60,
            height: this.mid * 2.6,
            stroke: '#999999',
            'stroke-width': this.strokeSize,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _removeSelect: function () {
        if (this.selectEl && this.selectEl.parentNode) {
            this.selectEl.parentNode.removeChild(this.selectEl);
        }
    },
    _render: function () {
        if (this.complex === true) {
            this._renderSlices();
            this._drawSelectShape();
        } else {
            this._updateDrawParameters();
            this._drawSelectShape();
            this.groupEl = SVG.create('g', {
                "id": this.vertex.id,
                "transform": "translate(" + [this.coords.x - this.mid, this.coords.y - this.mid].join(',') + ")",
                "cursor": "pointer",
                opacity: this.opacity,
                'network-type': 'vertex-svg'
            });
            switch (this.shape) {
                case "circle":
                    var circle = SVG.addChild(this.groupEl, 'circle', {
                        r: this.mid,
                        cx: this.mid,
                        cy: this.mid,
                        stroke: this.strokeColor,
                        'stroke-width': this.strokeSize,
                        fill: this.color,
                        'network-type': 'vertex'
                    });
                    break;
                case "ellipse":
                    var ellipse = SVG.addChild(this.groupEl, "ellipse", {
                        cx: this.mid,
                        cy: this.mid,
                        rx: this.mid * 1.5,
                        ry: this.mid,
                        stroke: this.strokeColor,
                        'stroke-width': this.strokeSize,
                        fill: this.color,
                        'network-type': 'vertex'
                    });
                    break;
                case "square":
                    var square = SVG.addChild(this.groupEl, "rect", {
                        x: 0,
                        y: 0,
                        width: this.mid * 2,
                        height: this.mid * 2,
                        stroke: this.strokeColor,
                        'stroke-width': this.strokeSize,
                        fill: this.color,
                        'network-type': 'vertex'
                    });
                    break;
                case "rectangle":
                    var rectangle = SVG.addChild(this.groupEl, "rect", {
                        x: -this.mid * 0.5,
                        y: 0,
                        width: this.mid * 3,
                        height: this.mid * 2,
                        stroke: this.strokeColor,
                        'stroke-width': this.strokeSize,
                        fill: this.color,
                        'network-type': 'vertex'
                    });
                    break;
            }
        }
        this.labelEl = SVG.addChild(this.groupEl, "text", {
            "x": this.labelX,
            "y": this.labelY,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        this.labelEl.textContent = this.labelText;
        this.targetEl.appendChild(this.groupEl);
        if (this.selected) {
            this.select();
        }
    },
    _renderSlices: function () {
        this._updateComplexDrawParameters();
        this.groupEl = SVG.create('g', {
            "id": this.vertex.id,
            "transform": "translate(" + [this.coords.x - this.mid, this.coords.y - this.mid].join(',') + ")",
            "cursor": "pointer",
            opacity: this.opacity,
            'network-type': 'vertex-svg'
        });

        var totalAreas = this._sumAreas(this.pieSlices);
        var c = 359.999 / totalAreas;
        var angleOffset = 0;
        for (var i = 0; i < this.pieSlices.length; i++) {
            var slice = this.pieSlices[i];

            var angleSize = slice.area * c;
            var angleStart = angleOffset;
            var angleEnd = angleStart + angleSize;
            angleOffset += angleSize;
            var slice_d = SVG.describeArc(this.mid, this.mid, slice.size / 2 + 0.2, angleStart, angleEnd);
            var curve = SVG.addChild(this.groupEl, "path", {
                "d": slice_d + ['L', this.mid, this.mid].join(' '),
                "fill": slice.color,
                'network-type': 'vertex'
            });
            if (typeof slice.text !== 'undefined') {
                var angle = angleStart + angleSize / 2;
                var l1 = SVG._polarToCartesian(this.mid, this.mid, this.maxPieSize / 2, angle);
                var l2 = SVG._polarToCartesian(this.mid, this.mid, this.mid + slice.labelOffset, angle);
                var labelWidth = this._textWidthBySize(slice.text, slice.labelSize);
                var textX, textY;
                if (l2.x > l1.x) {
                    if (l1.y > l2.y) {
                        //Quadrant I
                        textX = l2.x;
                        textY = l2.y;
                    } else {
                        //Quadrant IV
                        textX = l2.x;
                        textY = l2.y + slice.labelSize * 0.7;
                    }
                } else {
                    if (l1.y > l2.y) {
                        //Quadrant II
                        textX = l2.x - labelWidth - 1;
                        textY = l2.y;
                    } else {
                        //Quadrant III
                        textX = l2.x - labelWidth - 1;
                        textY = l2.y + slice.labelSize * 0.7;
                    }
                }
                if (slice.labelOffset >= 0) {
                    var line = SVG.addChild(this.groupEl, "line", {
                        "x1": l1.x,
                        "y1": l1.y,
                        "x2": l2.x,
                        "y2": l2.y,
                        'stroke': '#999999',
                        'stroke-width': '0.7',
                        'network-type': 'vertex-label'
                    });
                }
                var label = SVG.addChild(this.groupEl, "text", {
                    "x": textX,
                    "y": textY,
                    "font-size": slice.labelSize,
                    "fill": this.labelColor,
                    'network-type': 'vertex-label'
                });
                label.textContent = slice.text;
            }
        }

        var totalAreas = this._sumAreas(this.donutSlices);
        var c = 359.9999 / totalAreas;
        var angleOffset = 0;
        for (var i = 0; i < this.donutSlices.length; i++) {
            var slice = this.donutSlices[i];

            var angleSize = slice.area * c;
            var angleStart = angleOffset;
            var angleEnd = angleStart + angleSize;
            angleOffset += angleSize;
            var slice_d = SVG.describeArc(this.mid, this.mid, (this.maxPieSize / 2) + (slice.size / 2), angleStart, angleEnd);
            var curve = SVG.addChild(this.groupEl, "path", {
                "d": slice_d,
                "stroke": slice.color,
                "stroke-width": slice.size,
                "fill": "none",
                'network-type': 'vertex'
            }, 0);
            if (typeof slice.text !== 'undefined') {
                var angle = angleStart + angleSize / 2;
                var l1 = SVG._polarToCartesian(this.mid, this.mid, this.mid + slice.labelOffset, angle);
                var l2 = SVG._polarToCartesian(this.mid, this.mid, this.mid + slice.labelOffset, angle);
                var labelWidth = this._textWidthBySize(slice.text, slice.labelSize);
                var textX, textY;
                if (l2.x > l1.x) {
                    if (l1.y > l2.y) {
                        //Quadrant I
                        textX = l2.x;
                        textY = l2.y;
                    } else {
                        //Quadrant IV
                        textX = l2.x;
                        textY = l2.y + slice.labelSize / 2;
                    }
                } else {
                    if (l1.y > l2.y) {
                        //Quadrant II
                        textX = l2.x - labelWidth - 3;
                        textY = l2.y;
                    } else {
                        //Quadrant III
                        textX = l2.x - labelWidth - 3;
                        textY = l2.y + slice.labelSize / 2;
                    }
                }
                if (slice.labelOffset >= 0) {
                    var line = SVG.addChild(this.groupEl, "line", {
                        "x1": l1.x,
                        "y1": l1.y,
                        "x2": l2.x,
                        "y2": l2.y,
                        'stroke': '#999999',
                        'stroke-width': '0.7',
                        'network-type': 'vertex-label'
                    });
                }
                var label = SVG.addChild(this.groupEl, "text", {
                    "x": textX,
                    "y": textY,
                    "font-size": slice.labelSize,
                    "fill": this.labelColor,
                    'network-type': 'vertex-label'
                });
                label.textContent = slice.text;
            }
        }
    },
    _sumAreas: function (items) {
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            total += parseFloat(item.area);
        }
        return total;
    },
    _slicesMax: function (items) {
        var max = 0;
        for (var i = 0; i < items.length; i++) {
            max = Math.max(max, parseFloat(items[i].size));
        }
        return max;
    },
    /*********/
    /*********/
    /*********/
    /*********/
    drawLink: function (args) {
//        var angleStart1 = args.angleStart1;
//        var angleEnd1 = args.angleEnd1;
//        var angleStart2 = args.angleStart2;
//        var angleEnd2 = args.angleEnd2;

        var angleStart1 = 30;
        var angleEnd1 = 60;
        var angleStart2 = 270;
        var angleEnd2 = 290;

        var coords = args.coords;
        var targetSvg = args.target;

        var d = '';

        var r = this.radius - 10;

        var coordsStart1 = SVG._polarToCartesian(coords.x, coords.y, r, angleStart1);
        var coordsEnd1 = SVG._polarToCartesian(coords.x, coords.y, r, angleEnd1);

        var coordsStart2 = SVG._polarToCartesian(coords.x, coords.y, r, angleStart2);
        var coordsEnd2 = SVG._polarToCartesian(coords.x, coords.y, r, angleEnd2);


        d += SVG.describeArc(coords.x, coords.y, r, angleStart1, angleEnd1) + ' ';
        d += ['Q', coords.x, coords.y, coordsEnd2.x, coordsEnd2.y, ' '].join(' ');
        d += SVG.describeArc(coords.x, coords.y, r, angleStart2, angleEnd2) + ' ';
        d += ['Q', coords.x, coords.y, coordsEnd1.x, coordsEnd1.y, ' '].join(' ');

        var curve = SVG.addChild(targetSvg, 'path', {
            d: d,
            'stroke': 'red',
            'stroke-width': 2,
            'opacity': 1,
            'fill': 'crimson',
            'visibility': 'visible',
            'opacity': 0.7,
            'z-index': 10,
            'network-type': 'vertex'
        });

    },
    drawSectors: function (args) {
        var coords = args.coords;
        var color = args.color;
        var targetSvg = args.target;

        var separationPixels = 4;
        var separation = (separationPixels * 360) / (2 * Math.PI * this.radius);

        var totalSize = this._calculateTotalSize(this.sectors);
        var c = 360 / totalSize;
        var angleOffset = 0;
        var genome_d = [];
        var sector;
        for (var i = 0; i < this.sectors.length; i++) {
            sector = this.sectors[i];
            sector.angleSize = (sector.size * c) - separation;
            sector.angleStart = angleOffset + (separation / 2);
            sector.angleEnd = sector.angleStart + sector.angleSize;
            angleOffset += sector.angleSize + separation;

            genome_d.push(SVG.describeArc(coords.x, coords.y, this.radius, sector.angleStart, sector.angleEnd) + ' ');
        }

        for (var i = 0; i < genome_d.length; i++) {
            var curve = SVG.addChild(targetSvg, "path", {
                "d": genome_d[i],
//                "stroke": 'lightblue',
//                "stroke": Utils.colorLuminance(color, i/5),
                "stroke": this.sectors[i].color,
                "stroke-width": 10,
                "fill": "none",
                'network-type': 'vertex'
            });
        }
    }
}