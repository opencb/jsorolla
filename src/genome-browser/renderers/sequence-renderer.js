/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class SequenceRenderer extends Renderer {

    render(chunks, options) {
        const middle = options.width / 2;

        (chunks || []).forEach(chunk => {
            let start = chunk.start;
            const seqStart = chunk.start;
            const seqString = chunk.sequence;

            for (let i = 0; i < seqString.length; i++) {
                const x = options.pixelPosition + middle - ((options.position - start) * options.pixelBase);
                const text = SVG.addChild(options.svgCanvasFeatures, "text", {
                    "x": x + 1,
                    "y": 12,
                    "fill": GenomeBrowserConstants.SEQUENCE_COLORS[seqString.charAt(i)],
                    "data-pos": start,
                    "class": this.config.fontClass,
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
                        classes: this.config.toolTipfontClass + " qtip-light qtip-shadow",
                    },
                    show: {
                        delay: 300,
                    },
                    hide: {
                        delay: 300,
                    },
                });
            }
        });
    }

}
