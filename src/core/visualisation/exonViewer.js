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

        let features = this._parseExons(config);
        let scaleFactor = this._calculateScaleFactor(features, config);
        let height = config.tracks.height;

        console.log("Number of features: " + exons.length);

        this._renderTranscript(features, scaleFactor, height, config.display.compact, svg);

        for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].type === "feature") {
                let groupHeight = this._renderFeatures(this.tracks[i], features, scaleFactor, height, config.display.compact, svg);
                svg.lastChild.setAttribute("transform", `translate(0 ${height + 10}) scale (1 ${height / groupHeight})`);
            }
        }

        return svg;
    }

    _parseExons(config) {
        // We transform the list of exons and extend it to a list of features containing 5`UTR regions, exons, introns..
        let features = [];
        let virtualStart = 0;

        let UTR_bps = 200;
        let pixelsOfIntronsInCompactMode = 5;
        let scaleFactor = 1;

        if (config.display.compact) {
            // We will need to calculate first the scale factor to be able to convert the number of pixels we want to represent introns with
            // to bps

            // The number of pixels we will have available to represent the whole exon structure will be:
            // width - (n_introns * pixels_of_intron)
            let effectiveWidth = config.width - ((this.exons.length - 1) * pixelsOfIntronsInCompactMode);

            // Now we calculate the total bp area without taking into account the introns
            let area = UTR_bps * 2;
            for (let i = 0; i < this.exons.length; i++) {
                area += this.exons[i].end - this.exons[i].start + 1;
            }

            scaleFactor = effectiveWidth / area;
        }

        features.push({
            start: this.exons[0].start - UTR_bps - 1,
            end: this.exons[0].start - 1,
            vStart: virtualStart,
            vEnd: virtualStart + UTR_bps,
            type: "UTR"
        });

        virtualStart += UTR_bps;

        for (let i = 0; i < this.exons.length; i++) {
            features.push(Object.assign(this.exons[i], {
                start: this.exons[i].start,
                end: this.exons[i].end,
                vStart: virtualStart,
                vEnd: virtualStart + this.exons[i].end - this.exons[i].start + 1,
                type: "EXON"
            }));

            virtualStart += this.exons[i].end - this.exons[i].start + 1;

            if (this.exons.length > (i + 1)) {
                // We must represent an intron
                let intronStart = 0;
                let intronEnd = 0;
                if (config.display.compact) {
                    intronStart = this.exons[i].end;
                    intronEnd = intronStart + (pixelsOfIntronsInCompactMode / scaleFactor);
                } else {
                    intronStart = this.exons[i].end;
                    intronEnd = this.exons[i + 1].start;
                }
                features.push({
                    start: this.exons[i].end,
                    end: this.exons[i + 1].start,
                    vStart: virtualStart,
                    vEnd: virtualStart + intronEnd - intronStart + 1,
                    type: "INTRON"
                });

                virtualStart += intronEnd - intronStart + 1;
            }
        }

        features.push({
            start: this.exons[this.exons.length - 1].end,
            end: this.exons[this.exons.length - 1].end + UTR_bps,
            vStart: virtualStart,
            vEnd: virtualStart + UTR_bps,
            type: "UTR"
        });

        return features;
    }

    _calculateScaleFactor(exons, config) {
        let length = exons[exons.length - 1].vEnd - exons[0].vStart + 1;
        let width = config.width;

        return width / length;

        // if (config.display.compact) {
        //     for (let i = 0; i < this.exons.length; i++) {
        //         length += this.exons[i].end - this.exons[i].start + 1;
        //     }
        //
        //     // We substract 5px for every intron we have to the width
        //     if (this.exons.length > 1) {
        //         width -= (this.exons.length - 1) * 5;
        //     }
        //
        //     console.log("Total exon length: " + length);
        // } else {
        //     length = this.exons[this.exons.length - 1].end - this.exons[0].start + 1;
        //
        //     console.log("Total transcript length: " + length);
        // }


        // return width / length;
    }

    _renderTranscript(features, scaleFactor, height, compact, svg) {
        let quarterHeight = height/4;
        let medium = height/2;

        // Draw the exons
        let path = [];

        let start = 0;
        for (let i = 0; i < features.length; i++) {
            let featureWidth = features[i].vEnd - features[i].vStart + 1;

            if (features[i].type === "EXON") {
                // Move to the right
                path.push(`M ${start} 0 H ${start + (featureWidth * scaleFactor)} V ${height} H ${(start)} V 0`);
            } else if (features[i].type === "INTRON") {
                // There is an intron we need to draw
                path.push(`M ${start} ${medium} H ${start + (featureWidth * scaleFactor)}`);
            } else if (features[i].type === "UTR") {
                // There is UTR we need to draw
                path.push(`M ${start} ${quarterHeight + medium} H ${start + (featureWidth * scaleFactor)} V ${quarterHeight} H ${(start)} 
                           V 0`);
            }

            // Move the start point
            start += (featureWidth * scaleFactor);
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

    _renderFeatures(track, globalFeatures, scaleFactor, trackHeight, compact, svg) {
        // Draw the features
        let path = [];

        let maxHeight = 0;
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
                    if (maxHeight < currentHeight) {
                        maxHeight = currentHeight;
                    }

                    featureFitted = true;

                    let start = this._calculatePixelPosition(feature.start, globalFeatures, scaleFactor, compact);
                    let end = this._calculatePixelPosition(feature.end, globalFeatures, scaleFactor, compact);
                    path.push(`M ${start} ${currentHeight} H ${end} V ${currentHeight + trackHeight} H ${start} V ${currentHeight}`);
                }

                currentHeight += heightInc + trackHeight;
            } while (!featureFitted);

        }
        path.push("Z");

        let group = SVG.addChild(svg, "g", {
        });

        SVG.addChild(group, "path", {
            d: path.join(" "),
            stroke: "red",
            "stroke-width": 0.5,
            fill: "orange",
            "fill-opacity": 0.5,
        });

        return maxHeight;
    }

    _calculatePixelPosition(position, globalFeatures, scaleFactor) {
        if (position < globalFeatures[0].start) {
            return globalFeatures[0].vStart * scaleFactor;
        } else if (position > globalFeatures[globalFeatures.length - 1].end) {
            return globalFeatures[globalFeatures.length - 1].vEnd * scaleFactor;
        }

        // Find the pixel
        for (let i = 0; i < globalFeatures.length; i++) {
            if (position > globalFeatures[i].start && position <= globalFeatures[i].end) {
                let featureLength = globalFeatures[i].end - globalFeatures[i].start + 1;
                let pctgRegion = (position - globalFeatures[i].start) / featureLength;

                // We calculate the region within the virtual start/end
                let positionVirtualRegion = globalFeatures[i].vStart + ((globalFeatures[i].vEnd - globalFeatures[i].vStart + 1)
                    * pctgRegion);
                return positionVirtualRegion * scaleFactor;
            }
        }
    }


    getDefaultConfig() {
        return {
            width: 1500,
            height: 100,
            tracks: {
                height: 30
            },
            display: {
                compact: true
            },
            colors: {

            },
            border: true
        };
    }

}
