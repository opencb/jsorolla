import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";
import FeatureBinarySearchTree from "../feature-binary-search-tree.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class AlignmentRenderer extends Renderer {

    render(data, options) {
        // Get data to render
        const coverage = data[0] || []; // Coverage data is in the first position
        const features = data[1] || null; // Alignments data is in the second position (if provided)

        // Define the height of the coverage track
        // const covHeight = options.dataType === "features" ? 50 : options.svgCanvasFeatures.parentElement.clientHeight;
        const coverageHeight = 50;

        const coverageGroup = SVG.addChild(options.svgCanvasFeatures, "g", {});
        const readsGroup = SVG.addChild(options.svgCanvasFeatures, "g", {});

        // Render coverage data
        coverage.forEach(coverageItem => {
            this.#renderCoverage(coverageGroup, coverageItem, coverageHeight, options);
        });

        // Get reads styles
        const readColor = this.getValueFromConfig("readColor", [features]);
        const readOpacity = this.getValueFromConfig("readOpacity", [features]);
        const lowQualityReadColor = this.getValueFromConfig("lowQualityReadColor", [features]);
        const lowQualityReadOpacity = this.getValueFromConfig("lowQualityReadOpacity", [features]);

        // Group and render alignments
        this.#groupReads(features || [], options).forEach(group => {
            const items = this.#processReads(group, options);

            // Render reads
            this.#renderReads(readsGroup, items.lowQualityReads, lowQualityReadColor, lowQualityReadOpacity, options);
            this.#renderReads(readsGroup, items.reads, readColor, readOpacity, options);

            // Render reads connectors
            if (items.connectors.length > 0) {
                SVG.addChild(readsGroup, "path", {
                    "d": items.connectors.join(" "),
                    "stroke": "black",
                    "stroke-width": 0.5,
                    "fill": "transparent",
                });
            }

            // Render differences
            this.#renderDifferences(readsGroup, items.differences.A, GenomeBrowserConstants.SEQUENCE_COLORS.A);
            this.#renderDifferences(readsGroup, items.differences.T, GenomeBrowserConstants.SEQUENCE_COLORS.T);
            this.#renderDifferences(readsGroup, items.differences.C, GenomeBrowserConstants.SEQUENCE_COLORS.C);
            this.#renderDifferences(readsGroup, items.differences.G, GenomeBrowserConstants.SEQUENCE_COLORS.G);
            this.#renderDifferences(readsGroup, items.differences.N, GenomeBrowserConstants.SEQUENCE_COLORS.N);
            this.#renderDifferences(readsGroup, items.differences.D, "#000");

            // Render insertions
            items.differences.I.forEach(diff => {
                const text = SVG.addChild(readsGroup, "text", {
                    y: parseInt(items.position) + items.height,
                    x: diff.pos - (diff.size / 2),
                    class: "ocb-font-ubuntumono ocb-font-size-15",
                    // textLength: diff.size,
                });
                text.textContent = "|";
                // $(t).qtip({
                //     content: {text: diff.seq, title: "Insertion"},
                //     position: {target: "mouse", adjust: {x: 25, y: 15}},
                //     style: {classes: `${this.toolTipfontClass} qtip-dark qtip-shadow`},
                // });
            });
        });
    }

    // _drawCoverage(svgGroup, chunk, args) {
    #renderCoverage(group, coverage, height, options) {
        const start = parseInt(coverage.start);
        const end = parseInt(coverage.end);
        const pixelWidth = (end - start + 1) * options.pixelBase;
        const maximumValue = coverage.stats.max; // Math.max.apply(null, coverageList);
        const points = [];

        const startPoint = GenomeBrowserUtils.getFeatureX(start, options);
        const endPoint = GenomeBrowserUtils.getFeatureX(end, options);

        // First starting point
        points.push(`${startPoint},${height}`);

        if (maximumValue > 0) {
            const maxValueRatio = height / maximumValue;
            // let previousCoverage = -1;
            // let previousPosition = -1;

            // const startPoint = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);

            (coverage.values || []).forEach((value, index) => {
                const pos = index * coverage.windowSize;

                // if (value !== previousCoverage) {
                //     if (previousPosition + 1 < index && previousCoverage !== -1) {
                //         // We need to add the previous position as well to make a flat line between positions with equal coverage
                //         // const x = args.pixelPosition + middle - ((args.position - (start + (pos - 1))) * args.pixelBase);
                //         const x = GenomeBrowserUtils.getFeatureX(start + pos - 1, options);
                //         const y = height - (previousCoverage * maxValueRatio);

                //         points.push(`${x},${y}`);
                //     }
                //     previousCoverage = value;
                //     previousPosition = index;

                // }
                const x = GenomeBrowserUtils.getFeatureX(start + pos, options);
                const y = height - (value * maxValueRatio);
                points.push(`${x},${y}`);
            });

            // const x = args.pixelPosition + middle - ((args.position - (start + length + 1)) * args.pixelBase);
            // const y = covHeight - (coverageList[coverageList.length - 1] * maxValueRatio);
            // points.push(`${x},${y}`);
        }
        // } else {
        //     points.push(`${GenomeBrowserUtils.getFeatureX(start, options)},${height}`);
        //     points.push(`${GenomeBrowserUtils.getFeatureX(end, options)},${height}`);
        // }

        // Last point
        points.push(`${endPoint},${height}`);

        SVG.addChild(group, "polyline", {
            points: points.join(" "),
            stroke: "lightgrey",
            fill: "lightgrey",
            width: pixelWidth,
            height: height,
            cursor: "pointer",
        });

        // $(dummyRect).qtip({
        //     content: " ",
        //     position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
        //     style: { width: true, classes: `${this.toolTipfontClass} ui-tooltip-shadow` },
        //     show: { delay: 300 },
        //     hide: { delay: 300 },
        // });


        // args.trackListPanel.on("mousePosition:change", (e) => {
        //     const pos = Math.floor((e.mousePos - parseInt(start)) / windowSize);
        //     if (pos < 0 || pos >= coverageList.length) {
        //         return;
        //     }

        //     const str = `depth: <span class="ssel">${coverageList[pos]}</span><br>`;
        //     $(dummyRect).qtip("option", "content.text", str);

        // });
    }

    #analyseRead(feature) {
        const differences = [];
        const start = feature.alignment.position.position;

        const cigar = [];
        let relativePosition = 0;
        const insertions = [];

        (feature.alignment.cigar || []).forEach(item => {
            cigar.push(item.operationLength);
            const length = parseInt(item.operationLength);
            switch (item.operation) {
                case "CLIP_SOFT":
                    cigar.push("S");
                    break;
                case "ALIGNMENT_MATCH":
                    cigar.push("M");
                    relativePosition = relativePosition + length;
                    break;
                case "INSERT":
                    cigar.push("I");

                    // We put this here because it will be read to calculate the position of the mismatches
                    insertions.push({
                        pos: relativePosition,
                        length: length,
                    });
                    differences.push({
                        pos: relativePosition,
                        seq: feature.alignedSequence.slice(relativePosition, relativePosition + length),
                        op: "I",
                        length: length,
                    });
                    break;
                case "DELETE":
                    cigar.push("D");
                    differences.push({
                        pos: relativePosition,
                        op: "D",
                        length: length,
                    });
                    relativePosition = relativePosition + length;
                    break;
                case "SKIP":
                    cigar.push("N");
                    relativePosition = relativePosition + length;
                    break;
                default:
            }
        });

        // Assign feature information (cigar, start and end positions)
        Object.assign(feature, {
            cigar: cigar.join(""),
            start: start,
            end: start + relativePosition - 1,
        });

        if (feature.info?.["MD"]) {
            const md = feature.info["MD"][1];
            const matches = md.match(/([0-9]+)|([^0-9]+)/g);
            let position = 0;

            if (feature.alignment.cigar[0].operation === "CLIP_SOFT") {
                position = parseInt(feature.alignment.cigar[0].operationLength);
            }

            // This variable will contain the offset between the insertion and the position where the mismatch is
            // Imagine we have this sequence ACTGCT, and we have an insertion in position 3 and a mismatch in position 5
            // The mismatch will be in position 5 of the sequence, but located in position 4 when showed relative to the
            // reference genome.
            let offset = position;
            for (let i = 0; i < matches.length; i++) {
                if (i % 2 === 0) {
                    // Number
                    position += parseInt(matches[i]);
                } else {
                    if (insertions.length > 0) {
                        for (let j = 0; j < insertions.length; j++) {
                            if (insertions[j].pos < position) {
                                position += insertions[j].length;
                                offset += insertions[j].length;
                                insertions[j].pos = Infinity;
                            } else {
                                break;
                            }
                        }
                    }

                    // Not deletion
                    if (matches[i][0] !== "^") {
                        // Reference nucleotide
                        if (matches[i] === feature.alignedSequence[position]) {
                            console.error("Something strange happened. The mismatch matches the nucleotide of the reference genome?");
                        }

                        differences.push({
                            pos: position - offset,
                            seq: feature.alignedSequence[position],
                            op: "M",
                            length: 1,
                        });

                        position += 1;
                    } else {
                        // -1 because we should not count the ^
                        offset -= matches[i].length - 1;
                    }
                }
            }
        }

        return [differences, relativePosition];
    }

    #processDifferencesInRead(differences, info, start, height, rowY, options) {
        (differences || []).forEach(diff => {
            const tmpStart = GenomeBrowserUtils.getFeatureX(diff.pos + start, options);
            let tmpEnd = 0;

            switch (diff.op) {
                case "M":
                    tmpEnd = tmpStart + options.pixelBase;
                    const rectangle = `M${tmpStart} ${rowY} V${rowY + height} H${tmpEnd} V${rowY} H${tmpStart}`;
                    info.differences[diff.seq].push(rectangle);
                    break;
                case "I":
                    info.differences[diff.op].push({
                        ...diff,
                        pos: tmpStart,
                        size: options.pixelBase,
                    });
                    break;
                case "D":
                    tmpEnd = tmpStart + options.pixelBase * diff.length;
                    const line = `M${tmpStart} ${rowY + (height / 2)} H${tmpEnd} H${tmpStart}`;
                    info.differences[diff.op].push(line);
                    break;
                default:
                    console.error(`Unexpected difference found: '${diff.op}'`);
            }
        });
    }

    #processReads(features, options) {
        const differences = [];
        const starts = [];
        const ends = [];

        features.forEach(feature => {
            const [diffs, length] = this.#analyseRead(feature, options);
            differences.push(diffs);
            starts.push(feature.alignment.position.position);
            ends.push(feature.alignment.position.position + length - 1);
        });

        // transform to pixel position
        const featuresStart = GenomeBrowserUtils.getFeatureX(Math.min.apply(null, starts), options);
        const featuresEnd = GenomeBrowserUtils.getFeatureX(Math.max.apply(null, ends), options);

        const height = this.getValueFromConfig("height", [features]);
        const rowHeight = 15;
        let rowY = 70;
        let fitted = false;
        let info = null; // Stored reads info

        while (!fitted) {
            if (!options.renderedArea[rowY]) {
                // eslint-disable-next-line no-param-reassign
                options.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            const foundRow = options.renderedArea[rowY].add({
                start: featuresStart,
                end: featuresEnd,
                // features: features,
            });

            if (foundRow) {
                info = {
                    position: rowY,
                    height: height,
                    reads: [],
                    lowQualityReads: [],
                    connectors: [],
                    differences: Object.fromEntries(["A", "T", "C", "G", "N", "I", "D"].map(v => [v, []])),
                };

                let lastFeatureEnd = null;

                features.forEach((feature, index) => {
                    const strand = this.getValueFromConfig("strand", [feature]) || "FORWARD";
                    const start = GenomeBrowserUtils.getFeatureX(starts[index], options);
                    const end = GenomeBrowserUtils.getFeatureX(ends[index], options);
                    let points = []; // To save read points

                    if (strand.toUpperCase() === "REVERSE") {
                        points = [
                            `M${start},${rowY + (height / 2)}`,
                            `L${start + 5},${rowY}`,
                            `H${end}`,
                            `V${rowY + height}`,
                            `H${start + 5}`,
                            "Z",
                        ];
                    } else {
                        points = [
                            `M${start},${rowY}`,
                            `H${end - 5}`,
                            `L${end},${rowY + (height / 2)}`,
                            `L${end - 5},${rowY + height}`,
                            `H${start}`,
                            "Z",
                        ];
                    }

                    if (features[0].alignment.mappingQuality > this.config.minMappingQuality) {
                        info.reads.push(points.join(" "));
                    } else {
                        info.lowQualityReads.push(points.join(" "));
                    }

                    // PROCESS differences
                    if (options.regionSize < 1000) {
                        this.#processDifferencesInRead(differences[index], info, starts[index], height, rowY, options);
                    }

                    // Check for rendering a line connecting reads
                    if (lastFeatureEnd && lastFeatureEnd < start) {
                        info.connectors.push(`M${lastFeatureEnd} ${rowY + (height / 2)} H${start}`);
                    }
                    lastFeatureEnd = end;
                });

                // Read fittend
                fitted = true;
            }
            rowY = rowY + rowHeight;
        }

        return info;
    }

    #groupReads(reads, options) {
        const groups = {};

        // Filter reads to avoid duplications
        const nonDuplicatedReads = reads.filter(read => {
            return !options.renderedFeatures.has(read.id);
        });

        // Group only non duplicated reads
        nonDuplicatedReads.forEach(read => {
            const id = read.id;
            if (!groups[id]) {
                groups[id] = [read];
            } else {
                const newReadPosition = read.alignment.position.position;
                const storedReadPosition = groups[id][0].alignment.position.position;

                // FIXME: For some reason, the webservice is some times returning the exactly same read more than once.
                if (newReadPosition !== storedReadPosition) {
                    // Order the alignments to be rendered properly
                    if (newReadPosition > storedReadPosition) {
                        groups[id].push(read);
                    } else {
                        groups[id].unshift(read);
                    }
                }
            }

            // Mark this read as rendered
            options.renderedFeatures.add(read.id);
        });

        return Object.values(groups);
    }

    #renderDifferences(group, differences, color) {
        if (differences && differences.length > 0) {
            SVG.addChild(group, "path", {
                "d": differences.join(" "),
                "stroke": color,
                "stroke-width": 0.7,
                "fill": color,
                "fill-opacity": 0.5,
            });
        }
    }

    #renderReads(group, paths, color, opacity) {
        if (paths && paths.length > 0) {
            SVG.addChild(group, "path", {
                "d": paths.join(" "),
                "stroke": "black",
                "stroke-width": 0.5,
                "fill": color,
                "fill-opacity": opacity,
                "cursor": "pointer",
            });
        }

        // $(svgChild).qtip({
        //     content: {
        //         title: "",
        //         text: "",
        //     },
        //     position: { target: "mouse", adjust: { x: 25, y: 15 } },
        //     style: { width: 300, classes: `${this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
        //     hide: {
        //         event: "mousedown mouseup mouseleave",
        //         delay: 30,
        //         fixed: true,
        //     },
        // });

        // let _this = this;
        // svgChild.onmouseover = function () {
        //     let position = _this.getFeatureX(args.trackListPanel.mousePosition, args);
        //     let reads = features.get({ start: position, end: position }).value.features;
        //     if (reads.length === 1) {
        //         $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[0]));
        //         $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[0]));
        //     } else {
        //         if (position < reads[0]._coordinates[1]) {
        //             $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[0]));
        //             $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[0]));
        //         } else if (position > reads[1]._coordinates[0]) {
        //             $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[1]));
        //             $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[1]));
        //         }
        //     }
        // };

    }

    getDefaultConfig() {
        return {
            minMappingQuality: 20, // Reads with a mapping quality under 20 will have a transparency
            // Displayed reads style
            lowQualityReadColor: "darkgrey",
            lowQualityReadOpacity: 0.5,
            readColor: "darkgrey",
            readOpacity: 1,
            height: 10,
            insertSizeMin: 0,
            insertSizeMax: 0,
            explainFlags: f => {
                let summary = "<div style=\"background:#FFEF93;font-weight:bold;margin:0 15px 0 0;\">flags </div>";
                if (f.numberReads > 1) {
                    summary += "read paired<br>";
                }
                if (!f.improperPlacement) {
                    summary += "read mapped in proper pair<br>";
                }
                if (typeof f.nextMatePosition === "undefined") {
                    summary += "mate unmapped<br>";
                }
                if (f.readNumber === 0) {
                    summary += "first in pair<br>";
                }
                if (f.readNumber === (f.numberReads - 1)) {
                    summary += "second in pair<br>";
                }
                if (f.secondaryAlignment) {
                    summary += "not primary alignment<br>";
                }
                if (f.failedVendorQualityChecks) {
                    summary += "read fails platform/vendor quality checks<br>";
                }
                if (f.duplicateFragment) {
                    summary += "read is PCR or optical duplicate<br>";
                }
                return summary;
            },
            label: f => {
                return "Alignment  " + f.fragmentName + ":" + f.alignment.position.position + "-" + (f.alignment.position.position + f.alignedSequence.length - 1);
            },
            tooltipTitle: f => {
                return "Alignment" + " - <span class=\"ok\">" + f.id + "</span>";
            },
            tooltipText: f => {
                f.strand = this.strand(f);

                const strand = (f.strand != null) ? f.strand : "NA";
                const region = `
                    start-end:&nbsp;<span style="font-weight: bold">${f.start}-${f.end} (${strand})</span><br>
                    length:&nbsp;
                        <span style="font-weight: bold; color:#005fdb">
                            ${(f.end - f.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}
                        </span>
                    <br>
                `;
                const one =
                    "cigar:&nbsp;<span class=\"ssel\">" + f.cigar + "</span><br>" +
                    "insert size:&nbsp;<span class=\"ssel\">" + f.fragmentLength + "</span><br>" +
                    region + "<br>" +
                    // this.explainFlags(f.flags);
                    this.explainFlags(f);

                let three = "<div style=\"background:#FFEF93;font-weight:bold;\">attributes</div>";
                Object.keys(f.info || {}).forEach(key => {
                    three += key + " : " + f.info[key][0] + " : " + f.info[key][1] + "<br>";
                });
                // delete f.attributes["BQ"];//for now because is too long
                // for (var key in f.attributes) {
                //     three += key + ":" + f.attributes[key] + "<br>";
                // }
                // var style = "background:#FFEF93;font-weight:bold;";
                return "<div style=\"float:left\">" + one + "</div>" +
                    "<div style=\"float:right\">" + three + "</div>";
            },
            color: (f, chr) => {
                if (f.nextMatePosition.referenceName != chr) {
                    return "DarkGray";
                }
                return f.alignment.position.strand === "POS_STRAND" ? "DarkGray" : "LightGray";
                /**/
            },
            strokeColor: f => {
                if (this.mateUnmappedFlag(f)) {
                    return "tomato";
                }
                return f.alignment.position.strand === "POS_STRAND" ? "LightGray" : "DarkGray";
            },
            strand: f => {
                return f.alignment.position.strand === "POS_STRAND" ? "Forward" : "Reverse";
            },
            readPairedFlag: f => {
                return (parseInt(f.flags) & (0x1)) == 0 ? false : true;
            },
            firstOfPairFlag: f => {
                return (parseInt(f.flags) & (0x40)) == 0 ? false : true;
            },
            mateUnmappedFlag: f => {
                return f.nextMatePosition === undefined;
            },
        };
    }

}
