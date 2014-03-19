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
    _.extend(this, Backbone.Events);

    //defaults
    this.shape = 'circle';
    this.size = 30;
    this.color = '#9fc6e7';
    this.strokeSize = 1;
    this.strokeColor = '#9fc6e7';
    this.opacity = 0.8;
    this.labelSize = 12;
    this.labelColor = '#111111';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;
    this.labelText = '';

    this.pieSlices = [
        {radius: this.size, area: 1, color: this.color}
    ];
    this.donutSlices = [
        {radius: this.strokeSize, area: 1, color: this.strokeColor}
    ];

    this.el;
    this.vertexEl;
    this.targetEl;
    this.selectEl;
    this.groupEl;
    this.vertex;
    this.selected = false;

    //set instantiation args, must be last
    _.extend(this, args);

}


CircosVertexRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value) {
        this[attr] = value;

        switch (attr) {
            case 'pieSlices':
            case 'donutSlices':
                break;
            default:
                this.pieSlices = [
                    {radius: this.size, area: 1, color: this.color}
                ];
                this.donutSlices = [
                    {radius: this.strokeSize, area: 1, color: this.strokeColor}
                ];
        }
        this.update();
        if (this.selected) {
            this._drawSelectCircleShape();
        }

        console.log('update')
    },
    setConfig: function (args) {
        _.extend(this, args);
    },
    render: function (args) {
        this.targetEl = args.target;
        this.vertex = args.vertex;
        this.coords = args.coords;
        this._render();
    },
    remove: function () {
        $(this.el).remove();
    },
    update: function () {
        this.remove();
        this._render();
    },
    select: function () {
        if (!this.selected) {
            this._drawSelectCircleShape();
        }
        this.selected = true;
    },
    deselect: function () {
        if (this.selected) {
            this._removeSelect();
        }
        this.selected = false;
    },
    move: function (dispX, dispY) {
        var currentX = parseFloat(this.el.getAttribute('x'));
        var currentY = parseFloat(this.el.getAttribute('y'));
        this.el.setAttribute('x', currentX + dispX);
        this.el.setAttribute('y', currentY + dispY);
    },
    setLabelContent: function (text) {
        if (typeof this.labelEl !== 'undefined') {
            if ($.type(text) === 'string' && text.length > 0) {
                this.labelText = text;
                this.labelEl.textContent = text;
            }
            this._calculateLabelX();
        }
    },
    getSize: function () {
        var o = this._calculateOffset();
        return o.size;
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
            labelText: this.labelText,
            pieSlices: this.pieSlices,
            donutSlices: this.donutSlices
        };
    },


    _calculateOffset: function () {
        var findMax = function (items) {
            var max = 0;
            for (var i = 0; i < items.length; i++) {
                max = max < items[i].radius ? items[i].radius : max;
            }
            return max;
        }

        var maxPieRadius = findMax(this.pieSlices);
        var maxDonutRadius = findMax(this.donutSlices);

        var size = maxPieRadius + maxDonutRadius;
        var size = size + (size * 0.3);
        var midOffset = size / 2;
        return {size: size, midOffset: midOffset, maxPieRadius: maxPieRadius, maxDonutRadius: maxDonutRadius};
    },

    /* Private methods */
    _drawSelectCircleShape: function () {
        var attr = this._calculateOffset();
        this.selectEl = SVG.addChild(this.el, "circle", {
            r: attr.midOffset,
            cx: attr.midOffset,
            cy: attr.midOffset,
            opacity: '0.5',
            fill: '#777777',
            'network-type': 'select-vertex'
        }, 0);
    },
    _removeSelect: function () {
        $(this.el).find('[network-type="select-vertex"]').remove();
    },
    _calculateLabelX: function (o) {
        if (typeof o === 'undefined') {
            o = this._calculateOffset();
        }
        var x = o.midOffset - (this.labelEl.textContent.length * this.labelSize / 4);
        x = (x < 0) ? 0 : x;

        var y = o.midOffset + this.labelSize / 3;

        this.labelEl.setAttribute('x', x);
        this.labelEl.setAttribute('y', y);
    },
    _render: function () {
        var o = this._calculateOffset();

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - o.midOffset,
            y: this.coords.y - o.midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
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
            var slice_d = SVG.describeArc(o.midOffset, o.midOffset, slice.radius / 4, angleStart, angleEnd);
            var curve = SVG.addChild(groupSvg, "path", {
                "d": slice_d,
                "stroke": slice.color,
                "stroke-width": slice.radius / 2,
                "fill": "none",
                'network-type': 'vertex'
            });
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
            var slice_d = SVG.describeArc(o.midOffset, o.midOffset, (o.maxPieRadius / 2) + (slice.radius / 2) - 0.2, angleStart, angleEnd);
            var curve = SVG.addChild(groupSvg, "path", {
                "d": slice_d,
                "stroke": slice.color,
                "stroke-width": slice.radius,
                "fill": "none",
                'network-type': 'vertex'
            });
        }

        /*Label*/
        this.labelEl = SVG.addChild(vertexSvg, "text", {
//                "x": 5,
//                "y": this.labelSize + o.size,
            "x": o.midOffset,
            "y": o.midOffset,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        var label = this.vertex.id;
        if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
            label = this.labelText;
        }
        this.labelEl.textContent = label;
        this._calculateLabelX(o);

        this.el = vertexSvg;
        this.targetEl.appendChild(vertexSvg);
    },
    _sumAreas: function (items) {
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            total += item.area;
        }
        return total;
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
        d += [ 'Q', coords.x, coords.y, coordsEnd1.x, coordsEnd1.y, ' '].join(' ');

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