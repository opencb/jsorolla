/**
 * Created with IntelliJ IDEA.
 * User: fsalavert
 * Date: 5/30/13
 * Time: 4:17 PM
 * To change this template use File | Settings | File Templates.
 */

//any item with chromosome start end
SequenceRenderer.prototype = new Renderer({});

function SequenceRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};


SequenceRenderer.prototype.render = function(features, args) {


    console.time("Sequence render "+features.items.sequence.length);
    var chromeFontSize = "16";
    if(this.zoom == 95){
        chromeFontSize = "10";
    }

    var middle = args.width/2;

    var start = features.items.start;
    var seqStart = features.items.start;
    var seqString = features.items.sequence;

    for ( var i = 0; i < seqString.length; i++) {
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);
        start++;

//        var height = /*histogramHeight * */ v();
//        var width = this.pixelBase;
//        points += (x+(width/2))+","+(50 - height)+' ';

        var text = SVG.addChild(args.svgCanvasFeatures,"text",{
            "x":x+1,
            "y":12,
            "font-size":chromeFontSize,
            "font-family": "Ubuntu Mono",
            "fill":SEQUENCE_COLORS[seqString.charAt(i)]
        });
        text.textContent = seqString.charAt(i);
        $(text).qtip({
            content:seqString.charAt(i)+" "+(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")/*+'<br>'+phastCons[i]+'<br>'+phylop[i]*/,
            position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
            style: { width:true, classes: 'qtip-light qtip-shadow'}
        });
    }

    console.timeEnd("Sequence render "+features.items.sequence.length);
//    this.trackSvgLayout.setNucleotidPosition(this.position);

};
