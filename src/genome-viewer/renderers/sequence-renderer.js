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

function SequenceRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-ubuntumono ocb-font-size-16';
    this.toolTipfontClass = 'ocb-font-default';

    //set default args
    //set instantiation args
    _.extend(this, args);

};


SequenceRenderer.prototype.render = function(features, args) {

    console.time("Sequence render "+features.items.sequence.length);
    var middle = args.width/2;

    var start = features.items.start;
    var seqStart = features.items.start;
    var seqString = features.items.sequence;

//    var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);
//    var d = Utils.genBamVariants(seqString, args.pixelBase, x, 12);
//    var path = SVG.addChild(args.svgCanvasFeatures, "path", {
//        "d": d ,
//        "fill": 'black'
//    });

    for ( var i = 0; i < seqString.length; i++) {
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);
        start++;

        var text = SVG.addChild(args.svgCanvasFeatures,"text",{
            'x':x+1,
            'y':12,
            'fill':SEQUENCE_COLORS[seqString.charAt(i)],
            'class': this.fontClass
        });
        text.textContent = seqString.charAt(i);
        $(text).qtip({
            content:seqString.charAt(i)+" "+(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")/*+'<br>'+phastCons[i]+'<br>'+phylop[i]*/,
            position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
            style: { width:true, classes: this.toolTipfontClass+' qtip-light qtip-shadow'}
        });
    }

    console.timeEnd("Sequence render "+features.items.sequence.length);
//    this.trackSvgLayout.setNucleotidPosition(this.position);

};
