class SequenceRenderer extends Renderer {

    constructor(args) {
        super(args);
        //Extend and add Backbone Events
        Object.assign(this, Backbone.Events);
        this.fontClass = "ocb-font-ubuntumono ocb-font-size-16";
        this.toolTipfontClass = "ocb-tooltip-font";

        Object.assign(this, args);
    }

    render(chunks, args) {
        for (let i = 0; i < chunks.length; i++) {
            this._paintSequenceChunk(chunks[i], args);
        }
    }

    _paintSequenceChunk(chunk, args) {
        /* Time */
        let timeId = new Region(chunk).toString();
        console.time("Sequence render " + timeId);
        /**/

        let middle = args.width / 2;

        let start = chunk.start;
        let seqStart = chunk.start;
        let seqString = chunk.sequence;

        for (let i = 0; i < seqString.length; i++) {
            let x = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
            let text = SVG.addChild(args.svgCanvasFeatures, "text", {
                "x": x + 1,
                "y": 12,
                "fill": SEQUENCE_COLORS[seqString.charAt(i)],
                "data-pos": start,
                "class": this.fontClass
            });
            start++;
            text.textContent = seqString.charAt(i);
            $(text).qtip({
                content: seqString.charAt(i) + " " + (seqStart + i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")/*+'<br>'+phastCons[i]+'<br>'+phylop[i]*/,
                position: {target: "mouse", adjust: {x: 25, y: 15}},
                style: {width: true, classes: this.toolTipfontClass + " qtip-light qtip-shadow"},
                show: {delay: 300},
                hide: {delay: 300}
            });
        }

        //    this.trackSvgLayout.setNucleotidPosition(this.position);

        /* Time */
        console.timeEnd("Sequence render " + timeId);
        /**/

    }
}
