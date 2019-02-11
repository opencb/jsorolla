/*
 * Copyright 2015-2019 OpenCB
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

/**
 * Created by pfurio on 11/02/19.
 */
class ExonViewer {

    constructor(div, exons, tracks, config) {
        if (typeof div === "string") {
            this.div = document.getElementById(div);
        } else {
            this.div = div;
        }
        this.exons = exons;
        this.tracks = tracks;
        this.config = config;
    }

    render(config) {
        return this._render(config);
    }

    _render(config) {
        // If no config is provided we use the one passed in the constructor
        if (typeof config === "undefined" || config === null) {
            config = this.config;
        }

        // We merge user's config with default config
        config = Object.assign(this.getDefaultConfig(), config, this.config);

        let svg = SVG.create("svg", {
            width: config.width,
            height: config.height,
            viewBox: "0 0 " + config.width + " " + config.height,
            style: "fill: white",
            xmlns: "http://www.w3.org/2000/svg"
        });

        if (config.border) {
            SVG.addChild(svg, "rect", {width: config.width, height: config.height, style: "fill: white;stroke: black"});
        }

        let scaleFactor = this._calculateScaleFactor(config);
        let height = config.tracks.height;

        console.log("Number of exons: " + this.exons.length);

        this._renderTranscript(scaleFactor, height, config.display.compact, svg);

        for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].type === "feature") {
                this._renderFeatures(this.tracks[i], scaleFactor, height + 15, height, config.display.compact, svg);
            }
        }


        return svg;
    }

    _calculateScaleFactor(config) {
        let length = 0;
        let width = config.width;

        if (config.display.compact) {
            for (let i = 0; i < this.exons.length; i++) {
                length += this.exons[i].end - this.exons[i].start + 1;
            }

            // We substract 5px for every intron we have to the width
            if (this.exons.length > 1) {
                width -= (this.exons.length - 1) * 5;
            }

            console.log("Total exon length: " + length);
        } else {
            length = this.exons[this.exons.length - 1].end - this.exons[0].start + 1;

            console.log("Total transcript length: " + length);
        }


        return width / length;
    }

    _renderTranscript(scaleFactor, height, compact, svg) {
        let medium = height/2;

        // Draw the exons
        let path = [];

        let start = 0;
        for (let i = 0; i < this.exons.length; i++) {
            let exonWidth = this.exons[i].end - this.exons[i].start + 1;

            // Move to the right
            path.push(`M ${start} 0 H ${start + (exonWidth * scaleFactor)} V ${height} H ${(start)} V 0`);

            // Move the start point
            start += (exonWidth * scaleFactor);

            if (this.exons.length > (i + 1)) {

                let intronWidth = 5;
                if (!compact) {
                    intronWidth = (this.exons[i + 1].start - this.exons[i].end + 1) * scaleFactor;
                }
                // There is an intron we need to draw
                path.push(`M ${start} ${medium} H ${start + intronWidth}`);

                // Increase the start point
                start += intronWidth;
            }
        }
        path.push("Z");

        SVG.addChild(svg, "path", {
            d: path.join(" "),
            stroke: "black",
            "stroke-width": 0.5,
            fill: "grey",
            "fill-opacity": 0.5,
        });
    }

    _renderFeatures(track, pixelBase, yAxisBase, trackHeight, compact, svg) {
        // Draw the features
        let path = [];

        let heightInc = 10;
        let renderedArea = {};

        for (let i = 0; i < track.data.length; i++) {
            let feature = track.data[i];
            let currentHeight = 0;
            let featureFitted = false;

            do {
                if (UtilsNew.isUndefinedOrNull(renderedArea[currentHeight])) {
                    renderedArea[currentHeight] = new FeatureBinarySearchTree();
                }

                let enc = renderedArea[currentHeight].add({ start: feature.start, end: feature.end });
                if (enc) {
                    featureFitted = true;

                    let [start, end] = this._calculatePixelPositions(feature, pixelBase, compact);
                    path.push(`M ${start} ${currentHeight} H ${end} V ${currentHeight + trackHeight} H ${start} V ${currentHeight}`);
                }

                currentHeight += heightInc + trackHeight;
            } while (!featureFitted);

        }
        path.push("Z");

        SVG.addChild(svg, "path", {
            d: path.join(" "),
            stroke: "black",
            "stroke-width": 0.5,
            fill: "grey",
            "fill-opacity": 0.5,
        });
    }

    _calculatePixelPositions(feature, pixelBase, compact) {
        if (!compact) {
            let exonStart = this.exons[0].start;
            return [(feature.start - exonStart) * pixelBase, (feature.end- exonStart) * pixelBase];
        }
    }

    // // This function create the different color Patterns in a SVG 'defs' section
    // _createSvgDefs(family, config) {
    //     let svgDefs = SVG.create("defs");
    //
    //     // Default color pattern when no disease exist
    //     let pattern = SVG.create("pattern", {id: "PatternWhite", x: 0, y: 0, width: 1, height: 1});
    //     let rect = SVG.create("rect", {
    //         x: 0,                   y: 0,
    //         width: config.box,    height: config.box,
    //         fill: "white"});
    //     pattern.appendChild(rect);
    //     svgDefs.appendChild(pattern);
    //
    //     // We create all possible combination (incrementally with no reptition, eg. 0, 01, 02, 1, 12, ...)
    //     for (let i = 0; i < family.phenotypes.length; i++) {
    //         // Add the single disease color, eg. 0, 1, 2
    //         let pattern = SVG.create("pattern", {id: "Pattern_" + i, x: 0, y: 0, width: 1, height: 1});
    //         let rect = SVG.create("rect", {
    //             x: 0,                   y: 0,
    //             width: config.box,    height: config.box,
    //             fill: config.colors[i]});
    //         pattern.appendChild(rect);
    //         svgDefs.appendChild(pattern);
    //
    //         // Add the double disease color, eg. 01, 02, 12, ...
    //         for (let j = i + 1; j < family.phenotypes.length; j++) {
    //             let pattern = SVG.create("pattern", {id: "Pattern_" + i + j, x: 0, y: 0, width: 1, height: 1});
    //             let rect1 = SVG.create("rect", {
    //                 x: 0,                       y: 0,
    //                 width: config.box / 2,    height: config.box,
    //                 fill: config.colors[i]});
    //             let rect2 = SVG.create("rect", {
    //                 x: config.box / 2,        y: 0,
    //                 width: config.box / 2,    height: config.box,
    //                 fill: config.colors[j]});
    //             pattern.appendChild(rect1);
    //             pattern.appendChild(rect2);
    //             svgDefs.appendChild(pattern);
    //         }
    //     }
    //
    //     return svgDefs;
    // }
    //
    // _isOrphan(member) {
    //     return (member.father === undefined || member.father=== null) && (member.mother === undefined || member.mother.id === null)
    // }

    getDefaultConfig() {
        return {
            width: 1500,
            height: 100,
            tracks: {
                height: 20
            },
            display: {
                compact: false
            },
            colors: {
                
            },
            border: true
        };
    }

}
