import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class SequenceRenderer extends Renderer {

    render(chunks, args) {
        for (let i = 0; i < chunks.length; i++) {
            this.#paintSequenceChunk(chunks[i], args);
        }
    }

    #paintSequenceChunk(chunk, args) {
        const middle = args.width / 2;

        let start = chunk.start;
        const seqStart = chunk.start;
        const seqString = chunk.sequence;

        for (let i = 0; i < seqString.length; i++) {
            const x = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
            const text = SVG.addChild(args.svgCanvasFeatures, "text", {
                "x": x + 1,
                "y": 12,
                "fill": GenomeBrowserConstants.SEQUENCE_COLORS[seqString.charAt(i)],
                "data-pos": start,
                "class": this.fontClass,
            });
            start++;
            text.textContent = seqString.charAt(i);
            $(text).qtip({
                content: seqString.charAt(i) + " " + (seqStart + i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                position: {
                    target: "mouse",
                    adjust: {x: 25, y: 15},
                },
                style: {
                    width: true,
                    classes: this.toolTipfontClass + " qtip-light qtip-shadow",
                },
                show: {
                    delay: 300,
                },
                hide: {
                    delay: 300,
                },
            });
        }
    }

}
