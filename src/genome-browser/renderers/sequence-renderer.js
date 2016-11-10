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

SequenceRenderer.prototype = new Renderer({});

function SequenceRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-ubuntumono ocb-font-size-16';
    this.toolTipfontClass = 'ocb-tooltip-font';

    _.extend(this, args);

};


SequenceRenderer.prototype.render = function (chunks, args) {
    for (var i = 0; i < chunks.length; i++) {
        this._paintSequenceChunk(chunks[i], args);
    }
};


SequenceRenderer.prototype._paintSequenceChunk = function (chunk, args) {
    /* Time */
    var timeId = new Region(chunk).toString();
    console.time("Sequence render " + timeId);
    /**/

    var middle = args.width / 2;

    var start = chunk.start;
    var seqStart = chunk.start;
    var seqString = chunk.sequence;

    for (var i = 0; i < seqString.length; i++) {
        var x = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
        var text = SVG.addChild(args.svgCanvasFeatures, "text", {
            'x': x + 1,
            'y': 12,
            'fill': SEQUENCE_COLORS[seqString.charAt(i)],
            'data-pos': start,
            'class': this.fontClass
        });
        start++;
        text.textContent = seqString.charAt(i);
        $(text).qtip({
            content: seqString.charAt(i) + " " + (seqStart + i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")/*+'<br>'+phastCons[i]+'<br>'+phylop[i]*/,
            position: {target: "mouse", adjust: {x: 25, y: 15}},
            style: {width: true, classes: this.toolTipfontClass + ' qtip-light qtip-shadow'},
            show: {delay: 300},
            hide: {delay: 300}
        });
    }

//    this.trackSvgLayout.setNucleotidPosition(this.position);

    /* Time */
    console.timeEnd("Sequence render " + timeId);
    /**/

};
