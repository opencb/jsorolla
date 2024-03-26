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

import UtilsNew from "../utils-new.js";
import {SVG} from "../svg.js";

const config = {
    //width: 100,
    trackHeight: 100,
    lineHeight: 20,
    exonHeight: 5,
    board: {
        //width: 0,
        height: 0, // height is dynamic on the number of tracks
        originX: 0,
        originY: 0,
        padding: 20
    }

};
export default class TranscriptView {
    constructor(id, transcript, tracks = []) {
        //console.log(config.lineHeight * (tracks.length ?? 1))

        this.div = document.getElementById(id);
        this.width = this.div.clientWidth;

        this.transcript = tracks.find( track => track.name === "Exons").data;
        this.lowCoverage = tracks.find( track => track.name === "Low coverage").data;

        this.height = config.trackHeight * (tracks.length ?? 1);
        this.svg = SVG.create("svg", {
            width: this.width,
            height: this.height,
            viewBox: "0 0 " + this.width + " " + this.height,
            style: "fill: white",
            xmlns: "http://www.w3.org/2000/svg"
        });
        console.log("transcript", this.transcript);

        this.exons = this.transcript.exons;
        this.tracks = tracks;

        this.min = +Infinity;
        this.max = -Infinity;
        console.log(this.min, this.max);

        for (let exon of this.exons) {
            const {start, end} = exon;
            this.min = start < this.min ? start : this.min;
            this.max = end > this.max ? end : this.max;
        }


    }

    init() {
    }

    renderExon(exon) {
        console.log(exon);
    }

    renderTrack(track) {
        console.log(track);
    }

    render() {
        //this.div.appendChild(this.svg);
        SVG.addChild(this.svg, "rect", {width: this.width, height: this.height, style: "fill: white;stroke: black"});
        //SVG.addChild(this.svg, "line", {x1: 0, x2: 3, y1: 40, y2: 4, stroke: "grey"});

        /*for (let track of this.tracks) {
            SVG.addChild(this.svg, "line", {x1: 0, x2: this.width, y1: config.trackHeight / 2, y2: config.trackHeight / 2, stroke: "grey"});
            this.renderTrack(track)
        }*/
        const {start, end} = this.transcript;
        const x1 = this.scale_linear(start, this.min, this.max, 0, this.width);
        const x2 = this.scale_linear(end, this.min, this.max, 0, this.width);
        const y = (config.lineHeight / 2);
        SVG.addChild(this.svg, "line", {x1: x1, x2: x2, y1: y, y2: y, stroke: "grey", "stroke-width": 0.5});

        for (let exon of this.transcript.exons) {
            const {start, end} = exon;
            const x1 = this.scale_linear(start, this.min, this.max, 0, this.width);
            const x2 = this.scale_linear(end, this.min, this.max, 0, this.width);
            SVG.addChild(this.svg, "rect", {x: x1, y: y - config.exonHeight/2, width: x2 - x1, height: config.exonHeight, fill: "grey"});
        }

        console.log("this.lowCoverage",this.lowCoverage.lowCoverageRegions)
        for (let region of this.lowCoverage.lowCoverageRegions) {
            const {start, end} = region;
            console.log(this.scale_linear(start, this.min, this.max, 0, this.width));
            const x1 = this.scale_linear(start, this.min, this.max, 0, this.width);
            const x2 = this.scale_linear(end, this.min, this.max, 0, this.width);

            SVG.addChild(this.svg, "rect", {x: x1, y: y - config.exonHeight/2, width: x2 - x1, height: config.exonHeight, fill: "red"});



        }
        this.div.appendChild(this.svg);
    }

    // min-max normalization
    scale_linear(pos, sourceMin, sourceMax, targetMin, targetMax) {
        const oldRange = sourceMax - sourceMin;
        const offset = config.board.padding;
        const newRange = targetMax - targetMin - config.board.padding * 2;
        const rescaled = Math.round(offset + ((pos - sourceMin) * newRange / oldRange));
        if (rescaled < 0) {
            console.error("Normalization error. val:", rescaled);
        }
        return rescaled;
    }
}
