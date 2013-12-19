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
    this.maxRaidus = 35;

    //set instantiation args, must be last
    _.extend(this, args);

}

CircosVertexRenderer.prototype = {
    render: function (args) {
        var vertex = args.vertex;
        var coords = args.coords;
        var targetSvg = args.target;

    },
    drawLink: function (args) {
        var angleStart1 = args.angleStart1;
        var angleEnd1 = args.angleEnd1;
        var angleStart2 = args.angleStart2;
        var angleEnd2 = args.angleEnd2;
        var coords = args.coords;

        var d = '';

        var coordsStart1 = SVG._polarToCartesian(coords.x, coords.y, radius - 20, angleStart1);
        var coordsEnd1 = SVG._polarToCartesian(coords.x, coords.y, coords.radius - 20, angleEnd1);

        var coordsStart2 = SVG._polarToCartesian(coords.x, coords.y, radius - 20, angleStart2);
        var coordsEnd2 = SVG._polarToCartesian(coords.x, coords.y, radius - 20, angleEnd2);


        d += SVG.describeArc(coords.x, coords.y, radius - 20, angleStart1, angleEnd1) + ' ';
        d += ['Q', coords.x, coords.y, coordsEnd2.x, coordsEnd2.y, ' '].join(' ');
        d += SVG.describeArc(coords.x, coords.y, radius - 20, angleStart2, angleEnd2) + ' ';
        d += [ 'Q', coords.x, coords.y, coordsEnd1.x, coordsEnd1.y, ' '].join(' ');

        var curve = SVG.addChild(this.group, 'path', {
            d: d,
            'stroke': 'red',
            'stroke-width': 2,
            'opacity': 1,
            'fill': 'crimson',
            'visibility': 'visible',
            'opacity': 0.7,
            'z-index': 10
        });

    }
}