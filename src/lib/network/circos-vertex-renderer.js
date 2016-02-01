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
    this.labelAdjust;

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
    this.labelX = 0;
    this.labelY = 0;

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            if (args[prop] != null) {
                if (!isNaN(args[prop])) {
                    this[prop] = parseFloat(args[prop]);
                } else {
                    this[prop] = args[prop];
                }
            }
        }
    }
}

CircosVertexRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value, update) {
        if (!isNaN(value)) {
            value = parseFloat(value);
        }
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
                this.labelPositionX = parseFloat(this.labelPositionX);
                this.labelPositionY = parseFloat(this.labelPositionY);
                this.labelSize = parseFloat(this.labelSize);
                this._renderLabelEl();
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
            if (minDonutLength == 0 || minDonutLength == 1) {
                minDonutLength = this.strokeSize.length;
            }
            if (this.strokeSize.length != 1 && this.strokeSize.length < minDonutLength) {
                minDonutLength = this.strokeSize.length;
            }
        }
        if (Array.isArray(this.strokeArea)) {
            if (minDonutLength == 0 || minDonutLength == 1) {
                minDonutLength = this.strokeArea.length;
            }
            if (this.strokeArea.length != 1 && this.strokeArea.length < minDonutLength) {
                minDonutLength = this.strokeArea.length;
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
        this._setLabelText(this.vertex.id);

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
        var mid = this._getMidSize();
        this.groupEl.setAttribute('transform', "translate(" + [this.coords.x - mid, this.coords.y - mid].join(',') + ")");
    },
    setLabelContent: function (text) {
        if (text == null) {
            text = '';
        }
        this._setLabelText(text);
        if (this.labelEl) {
            this.update();
            // this._renderLabelEl();
        }
    },
    getSize: function () {
        return this._getFigureSize();
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
    _setLabelText: function (text) {
        this.labelText = text.toString();
        this.labelLines = this.labelText.split(/\\n/);
        this.labelLinesLength = this.labelLines.length;
        var maxLabelWidth = 0;
        for (var i = 0; i < this.labelLinesLength; i++) {
            var line = this.labelLines[i];
            var textWidth = this._textWidthBySize(line, this.labelSize);
            if (textWidth > maxLabelWidth) {
                maxLabelWidth = textWidth;
            }
        }
        this._textWidth = maxLabelWidth * 1.2;
        this._textHeight = this.labelLinesLength * this.labelSize * 1.2;
    },
    _getMidSize: function () {
        var size = (Array.isArray(this.size)) ? this._slicesMax(this.pieSlices) : this.size;
        var strokeSize = (Array.isArray(this.strokeSize)) ? this._slicesMax(this.donutSlices) : this.strokeSize;
        if (this.size < 0) {
            var size = Math.max(this._textWidth, this._textHeight);
            return (size + strokeSize) / 2;
        } else {
            return (this.size + strokeSize) / 2;
        }
    },
    _getFigureSize: function () {
        var size = (Array.isArray(this.size)) ? this._slicesMax(this.pieSlices) : this.size;
        var strokeSize = (Array.isArray(this.strokeSize)) ? this._slicesMax(this.donutSlices) : this.strokeSize;
        if (this.size < 0) {
            var size = Math.max(this._textWidth, this._textHeight);
            return size + (strokeSize * 2);
        } else {
            return this.size + (strokeSize * 2);
        }
    },
    _textWidthBySize: function (text, pixelFontSize) {
        return ((text.length * pixelFontSize / 2) + (text.length * pixelFontSize / 10)); //round up
    },
    _renderLabelEl: function () {
        var mid = this._getMidSize();
        if (this.labelEl == null) {
            this.labelEl = SVG.create("text", {
                'network-type': 'vertex-label'
            });
        } else if (this.groupEl.contains(this.labelEl)) {
            this.groupEl.removeChild(this.labelEl);
        }
        this.labelEl.setAttribute('font-size', this.labelSize);
        this.labelEl.setAttribute('fill', this.labelColor);

        this.labelEl.textContent = "";
        var linesCount = this.labelLines.length;
        var yStart = this.labelPositionY + mid + (this.labelSize / 3) - ((linesCount - 1) * this.labelSize / 2);
        for (var i = 0; i < linesCount; i++) {
            var line = this.labelLines[i];
            var textWidth = this._textWidthBySize(line, this.labelSize);
            var tspan = SVG.addChild(this.labelEl, "tspan", {
                'network-type': 'vertex-label',
                x: this.labelPositionX + mid - (textWidth / 2),
                y: yStart + (i * this.labelSize)
            });
            tspan.textContent = line;
        }

        this.groupEl.appendChild(this.labelEl);
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
            case "textfit":
                this._drawSelectRectangleShape();
                break;
            }
        }
    },
    _drawSelectCircleShape: function () {
        var mid = this._getMidSize();
        var figureSize = this._getFigureSize();
        this.selectEl = SVG.create("circle", {
            r: figureSize / 2 * 1.30,
            cx: mid,
            cy: mid,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectEllipseShape: function () {
        var mid = this._getMidSize();
        var figureSize = this._getFigureSize();
        var rx = figureSize;
        var ry = figureSize * 0.65;
        if (this.size < 0) {
            rx = this._textWidth + this.strokeSize;
            ry = this._textHeight + this.strokeSize;
        }
        this.selectEl = SVG.create("ellipse", {
            cx: mid,
            cy: mid,
            rx: rx,
            ry: ry,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectSquareShape: function () {
        var mid = this._getMidSize();
        var figureSize = this._getFigureSize();
        this.selectEl = SVG.create("rect", {
            x: mid - (mid * 2.6 / 2),
            y: mid - (mid * 2.6 / 2),
            width: mid * 2.6,
            height: mid * 2.6,
            opacity: '0.5',
            fill: '#999999',
            'network-type': 'select-vertex'
        });
    },
    _drawSelectRectangleShape: function () {
        var mid = this._getMidSize();
        var w = mid * 3 * 1.3;
        var h = mid * 2 * 1.3;
        if (this.size < 0) {
            w = (this._textWidth + this.strokeSize) * 1.2 * 1.3;
            h = (this._textHeight + this.strokeSize) * 1.2 * 1.3;
        }
        this.selectEl = SVG.create("rect", {
            x: mid - (w / 2),
            y: mid - (h / 2),
            width: w,
            height: h,
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
            this._renderLabelEl();
        } else {
            var mid = this._getMidSize();
            var figureSize = this._getFigureSize();
            this._drawSelectShape();
            this.groupEl = SVG.create('g', {
                "id": this.vertex.id,
                "transform": "translate(" + [this.coords.x - mid, this.coords.y - mid].join(',') + ")",
                "cursor": "pointer",
                opacity: this.opacity,
                'network-type': 'vertex-g'
            });
            this._renderLabelEl();
            // var textAdjustWidth = rr.maxTextWidth * 1.2;
            // var textAdjustHeight = rr.linesCount * this.labelSize * 1.2;
            // if (this.size < 0) {
            //     figure = SVG.create("rect", {
            //         x: this.mid - (w / 2),
            //         y: this.mid - (h / 2),
            //         width: w,
            //         height: h,
            //         stroke: this.strokeColor,
            //         'stroke-width': this.strokeSize,
            //         fill: this.color,
            //         'network-type': 'vertex'
            //     });
            // }
            var figure;
            switch (this.shape) {
            case "circle":
                figure = SVG.create('circle', {
                    r: mid,
                    cx: mid,
                    cy: mid,
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeSize,
                    fill: this.color,
                    'network-type': 'vertex'
                });
                break;
            case "ellipse":
                var rx = mid * 1.5;
                var ry = mid;
                if (this.size < 0) {
                    rx = this._textWidth * 0.7;
                    ry = this._textHeight * 0.7;
                }
                figure = SVG.create("ellipse", {
                    cx: mid,
                    cy: mid,
                    rx: rx,
                    ry: ry,
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeSize,
                    fill: this.color,
                    'network-type': 'vertex'
                });
                break;
            case "square":
                figure = SVG.create("rect", {
                    x: 0,
                    y: 0,
                    width: mid * 2,
                    height: mid * 2,
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeSize,
                    fill: this.color,
                    'network-type': 'vertex'
                });
                break;
            case "rectangle":
                var w = mid * 3;
                var h = mid * 2;
                if (this.size < 0) {
                    w = this._textWidth * 1.2;
                    h = this._textHeight * 1.2;
                }
                figure = SVG.create("rect", {
                    x: mid - (w / 2),
                    y: mid - (h / 2),
                    width: w,
                    height: h,
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeSize,
                    fill: this.color,
                    'network-type': 'vertex'
                });
                break;
            }
            this.groupEl.insertBefore(figure, this.labelEl);
        }
        this.targetEl.appendChild(this.groupEl);
        if (this.selected) {
            this.select();
        }
    },
    _renderSlices: function () {
        maxPieSize = this._slicesMax(this.pieSlices);
        if(maxPieSize < 0){
            maxPieSize = Math.max(this._textWidth, this._textHeight);
        }
        maxDonutSize = this._slicesMax(this.donutSlices);
        var figureSize = (maxPieSize + (maxDonutSize));
        var mid = figureSize / 2;

        this.groupEl = SVG.create('g', {
            "id": this.vertex.id,
            "transform": "translate(" + [this.coords.x - mid, this.coords.y - mid].join(',') + ")",
            "cursor": "pointer",
            opacity: this.opacity,
            'network-type': 'vertex-g'
        });

        var totalAreas = this._sumAreas(this.pieSlices);
        var c = 359.999 / totalAreas;
        var angleOffset = 0;
        for (var i = 0; i < this.pieSlices.length; i++) {
            var slice = this.pieSlices[i];
            var sliceSize = slice.size;
            if (slice.size < 0) {
                sliceSize = maxPieSize;
            }
            var angleSize = slice.area * c;
            var angleStart = angleOffset;
            var angleEnd = angleStart + angleSize;
            angleOffset += angleSize;
            var slice_d = SVG.describeArc(mid, mid, sliceSize / 2 + 0.2, angleStart, angleEnd);
            var curve = SVG.addChild(this.groupEl, "path", {
                "d": slice_d + ['L', mid, mid].join(' '),
                "fill": slice.color,
                'network-type': 'vertex'
            });
            if (typeof slice.text !== 'undefined') {
                var angle = angleStart + angleSize / 2;
                var l1 = SVG._polarToCartesian(mid, mid, maxPieSize / 2, angle);
                var l2 = SVG._polarToCartesian(mid, mid, mid + slice.labelOffset, angle);
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
            var slice_d = SVG.describeArc(mid, mid, (maxPieSize / 2) + (slice.size / 2), angleStart, angleEnd);
            var curve = SVG.addChild(this.groupEl, "path", {
                "d": slice_d,
                "stroke": slice.color,
                "stroke-width": slice.size,
                "fill": "none",
                'network-type': 'vertex'
            }, 0);
            if (typeof slice.text !== 'undefined') {
                var angle = angleStart + angleSize / 2;
                var l1 = SVG._polarToCartesian(mid, mid, mid + slice.labelOffset, angle);
                var l2 = SVG._polarToCartesian(mid, mid, mid + slice.labelOffset, angle);
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
        var max = -1;
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
