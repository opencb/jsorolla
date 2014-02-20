/*
 * Copyright (c) 2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2013 Ignacio Medina (ICM-CIPF)
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
function CircularKaryotype(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("CircularKaryotype");

    //set default args
    this.species;
    this.chromosomes;
    this.angleSize;

    _.extend(this, args);

    this.colors = {gneg: "white", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "#4683ea"};

    //events attachments
    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}
CircularKaryotype.prototype = {
    render: function () {

        this.rendered = true;
    },
    draw: function (args) {
        var visibleChromosomes = [];
        for (var i = 0; i < this.chromosomes.length; i++) {
            var chr = this.chromosomes[i];
            if (chr.visible != false) {
                visibleChromosomes.push(chr)
            }
        }
        this._drawChromosomes(visibleChromosomes);
    },
    _drawChromosomes: function (chromosomes) {
        var _this = this;
        var separationPixels = 8;
        var separation = (separationPixels * 360) / (2 * Math.PI * this.radius);

        var totalSegmentsSize = this._calculateTotalSize(chromosomes);
        var segmentAngleOffset = 0;
        var angleCoeff = this.angleSize / totalSegmentsSize;
        var chr;
        var segment_d = []
        for (var i = 0; i < chromosomes.length; i++) {

            chr = chromosomes[i];
            chr.angleSize = (chr.size * angleCoeff) - separation;

            chr.angleStart = this.angleStart + segmentAngleOffset + (separation / 2);
            chr.angleEnd = chr.angleStart + chr.angleSize;
            segmentAngleOffset += chr.angleSize + separation;
            segment_d.push(SVG.describeArc(this.x, this.y, this.radius, (chr.angleStart - (separation / 5)), (chr.angleEnd + (separation / 5))) + ' ');
//            this.genomesData[genome.id]['segmentData'][segment.id] = segment;
        }

        /*
         *  Next code plots the choromosomes border
         */
        var color = '#428BCA';
        for (var i = 0; i < segment_d.length; i++) {
            var curve = SVG.addChild(this.targetId, "path", {
                "d": segment_d[i],
                "stroke": 'black',
//                "stroke": Utils.colorLuminance(color, i/5),
//                "stroke": Utils.randomColor(),
//                "stroke": 'slategray',
                "stroke-width": this.arcWidth - 37,
                "fill": "none"
            });

            $(curve).click(function () {
                console.log($(this))
            });

            chr = chromosomes[i];
            var angle = chr.angleStart + (chr.angleSize / 2);
            var coords = SVG._polarToCartesian(this.x, this.y, this.radius + 95, angle);
            var textAngle = angle - 90;
            if (angle > 180) {
                textAngle += 180;
            }
            var text = SVG.addChild(this.targetId, "text", {
                'x': coords.x,
                'y': coords.y,
                transform: 'rotate(' + textAngle + ' ' + coords.x + ',' + coords.y + ')',
                style: 'font-weight:bold',
                "fill": "slategray"
            });
            text.textContent = chr.name;
        }

        this.drawCytobands(chromosomes);

        for (var i = 0; i < segment_d.length; i++) {
            chr = chromosomes[i];
            var curve = SVG.addChild(this.targetId, "path", {
                "d": segment_d[i],
                "stroke": 'transparent',
                "stroke-width": this.arcWidth - 37,
                "fill": "none",
                id: chr.name,
                size: chr.size,
                anglesize: chr.angleSize,
                anglestart: chr.angleStart
            });
            var selectCurve;
            $(curve).mousedown(function (event) {
                event.stopPropagation();
                var downX = event.offsetX;
                var downY = event.offsetY;
                var cartesianX = downX - _this.x;
                var cartesianY = downY - _this.y;
                var angle = (Math.atan(cartesianY / cartesianX) + (Math.PI / 2) ) / (Math.PI / 180.0)
                if (cartesianX < 0) {
                    angle += 180.0;
                }

                $(selectCurve).remove();
                selectCurve = SVG.addChild(_this.targetId, "path", {
                    "d": SVG.describeArc(_this.x, _this.y, _this.radius, 10, 370) + ' ',
                    "stroke": 'CornflowerBlue',
                    "stroke-width": _this.arcWidth - 20,
                    "fill": "none",
                    id: chr.name,
                    size: chr.size,
                    opacity: 0.7,
                    anglesize: chr.angleSize,
                    anglestart: chr.angleStart
                });


                var angleStart = parseFloat($(this).attr('anglestart'));
                var size = parseFloat($(this).attr('size'));
                var angleSize = parseFloat($(this).attr('anglesize'));

                var anglePos = angle - angleStart;
                var pos = anglePos * (size / angleSize);
                var chromosome = $(this).attr('id');

                var newAngle = angle;
                var newAnglePos;
                var newPos;
                var newAngle = angle;
                $(_this.targetId).parent().mousemove(function (event) {
                    var newCartesianX = (event.offsetX - _this.x);
                    var newCartesianY = (event.offsetY - _this.y);
                    newAngle = (Math.atan(newCartesianY / newCartesianX) + (Math.PI / 2) ) / (Math.PI / 180.0);
                    if (newCartesianX < 0) {
                        newAngle += 180.0;
                    }
                    var startAngle = angle;
                    var endAngle = newAngle;
                    if ((newAngle - angle) < 0) {
                        startAngle = newAngle;
                        endAngle = angle;
                    }
                    newAnglePos = newAngle - angleStart;
                    newPos = newAnglePos * (size / angleSize);
                    selectCurve.setAttribute('d', SVG.describeArc(_this.x, _this.y, _this.radius, startAngle, endAngle) + ' ')
                });


                $(_this.targetId).parent().mouseup(function (event) {
                    _this.trigger('chromosome:click', {region: new Region({chromosome: chromosome, start: pos, end: newPos})})
                });

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
    drawCytobands: function (chromosomes) {
        var chr;
        var cytobands;
        var angleOffset = 0;
        var cytobandsByStain = {};
        for (var i = 0; i < chromosomes.length; i++) {
            chr = chromosomes[i];
            angleOffset = chr.angleStart;
            cytobands = chr.cytobands;
            var angleCoeff = chr.angleSize / chr.size;

            // loop over cytobands
            for (var j = 0; j < cytobands.length; j++) {
                var cytoband = cytobands[j];

                cytoband.angleStart = (cytoband.start * angleCoeff) + angleOffset;
                cytoband.angleEnd = (cytoband.end * angleCoeff) + angleOffset;

                if (typeof cytobandsByStain[cytoband.stain] == "undefined") cytobandsByStain[cytoband.stain] = [];
                cytobandsByStain[cytoband.stain].push(cytoband);

            }
            angleOffset += chr.angleSize;
        }
        for (var cytobandStain in cytobandsByStain) {
            var cytobands_d = '';
            for (var j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
                var cytoband = cytobandsByStain[cytobandStain][j];
                cytobands_d += SVG.describeArc(this.x, this.y, this.radius, cytoband.angleStart, cytoband.angleEnd) + ' ';
            }
            var curve = SVG.addChild(this.targetId, "path", {
                "d": cytobands_d,
                "stroke": this.colors[cytobandStain],
                "stroke-width": this.arcWidth - 40,
                "fill": "none"
            });
        }
    }
}
