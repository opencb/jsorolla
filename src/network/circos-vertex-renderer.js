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
    this.radius = 45;
    this.sectors = [
        {
            color:'#9fc6e7',
            size: 1
        },
        {
            color:'#ff7537',
            size: 1
        },
        {
            color:'#b3dc6c',
            size: 1
        }
    ];
    //set instantiation args, must be last
    _.extend(this, args);

}

CircosVertexRenderer.prototype = {
    render: function (args) {
        var vertex = args.vertex;
        var coords = args.coords;
        var targetSvg = args.target;

        var size = this.radius+55;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var vertexSvg = SVG.create("svg", {
            "id": vertex.id,
            "cursor": "pointer",
            x: coords.x - midOffset,
            y: coords.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g');

        args.target = groupSvg;
        args.coords = {x:midOffset,y:midOffset};
        this.drawLink(args);
        this.drawSectors(args);

        targetSvg.appendChild(vertexSvg);

    },
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
    },
    _calculateTotalSize: function (items) {
        var totalSize = 0;
        for (var i = 0; i < items.length; i++) {
            totalSize += items[i].size;
        }
        return totalSize;
    },
    getSize:function(){
        return this.radius+55;
    }
}