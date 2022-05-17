import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";
import FeatureBinarySearchTree from "../feature-binary-search-tree.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class AlignmentRenderer extends Renderer {

    render(data, options) {
        // Get data to render
        const coverage = data[0] || []; // Coverage data is in the first position
        const alignments = data[1] || null; // Alignments data is in the second position (if provided)

        // Define the height of the coverage track
        // const covHeight = options.dataType === "features" ? 50 : options.svgCanvasFeatures.parentElement.clientHeight;
        const coverageHeight = 50;

        const coverageParent = SVG.addChild(options.svgCanvasFeatures, "g", {});
        const alignmentsParent = SVG.addChild(options.svgCanvasFeatures, "g", {});

        // Render coverage data
        coverage.forEach(item => {
            this.#renderCoverage(coverageParent, item, coverageHeight, options);
        });

        // Group and render alignments
        this.#groupAlignments(alignments || [], options).forEach(group => {
            this.#renderAlignments(alignmentsParent, group, coverageHeight, options);
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

    #renderDifferences(parent, differences, readStart, readHeight, rowY, options) {
        (differences || []).forEach(diff => {
            const start = GenomeBrowserUtils.getFeatureX(diff.pos + readStart, options);

            if (diff.op === "M") {
                const end = start + options.pixelBase;
                const color = GenomeBrowserConstants.SEQUENCE_COLORS[diff.seq];
                SVG.addChild(parent, "path", {
                    "d": `M${start} ${rowY} V${rowY + readHeight} H${end} V${rowY} H${start}`,
                    "stroke": color,
                    "stroke-width": 0.7,
                    "fill": color,
                    "fill-opacity": 0.5,
                });
            } else if (diff.op === "I") {
                const text = SVG.addChild(parent, "text", {
                    y: rowY + readHeight,
                    x: start - (options.pixelBase / 2),
                    class: "ocb-font-ubuntumono ocb-font-size-15",
                    // textLength: diff.size,
                });
                text.textContent = "|";
                // $(t).qtip({
                //     content: {text: diff.seq, title: "Insertion"},
                //     position: {target: "mouse", adjust: {x: 25, y: 15}},
                //     style: {classes: `${this.toolTipfontClass} qtip-dark qtip-shadow`},
                // });
            } else if (diff.op === "D") {
                const end = start + options.pixelBase * diff.length;
                SVG.addChild(parent, "path", {
                    "d": `M${start} ${rowY + (readHeight / 2)} H${end} H${start}`,
                    "stroke": "#000",
                    "stroke-width": 0.7,
                    "fill": "#000",
                    "fill-opacity": 0.5,
                });
            }
        });
    }

    #renderAlignments(parent, alignments, startHeight, options) {
        const differences = [];
        const starts = [];
        const ends = [];

        alignments.forEach(read => {
            const [diffs, length] = this.#analyseRead(read, options);
            differences.push(diffs);
            starts.push(read.alignment.position.position);
            ends.push(read.alignment.position.position + length - 1);
        });

        // transform to pixel position
        const alignmentStart = GenomeBrowserUtils.getFeatureX(Math.min.apply(null, starts), options);
        const alignmentEnd = GenomeBrowserUtils.getFeatureX(Math.max.apply(null, ends), options);

        const height = this.getValueFromConfig("height", [alignments]);
        const rowHeight = height + 5;
        let rowY = startHeight;
        let fitted = false;

        while (!fitted) {
            if (!options.renderedArea[rowY]) {
                // eslint-disable-next-line no-param-reassign
                options.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            const foundRow = options.renderedArea[rowY].add({
                start: alignmentStart,
                end: alignmentEnd,
            });

            if (foundRow) {
                let prevAlignmentEnd = null;
                const connectorsPoints = [];

                alignments.forEach((read, index) => {
                    const strand = this.getValueFromConfig("strand", [read]) || "FORWARD";
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

                    // Get read attributes
                    const readColor = this.getValueFromConfig("color", [read, this.config.minMappingQuality]);
                    const readOpacity = this.getValueFromConfig("opacity", [read, this.minMappingQuality]);

                    // Render this read
                    const readElement = SVG.addChild(parent, "path", {
                        "d": points.join(" "),
                        "stroke": "black",
                        "stroke-width": 0.5,
                        "fill": readColor,
                        "fill-opacity": readOpacity,
                        "cursor": "pointer",
                    });

                    // Render differences
                    if (options.regionSize < 1000) {
                        this.#renderDifferences(parent, differences[index], starts[index], height, rowY, options);
                    }

                    // Check for rendering a line connecting reads
                    if (prevAlignmentEnd && prevAlignmentEnd < start) {
                        connectorsPoints.push(`M${prevAlignmentEnd} ${rowY + (height / 2)} H${start}`);
                    }
                    prevAlignmentEnd = end;
                });

                // Check for rendering connectors points
                if (connectorsPoints.length > 0) {
                    SVG.addChild(parent, "path", {
                        "d": connectorsPoints.join(" "),
                        "stroke": "black",
                        "stroke-width": 0.5,
                        "fill": "transparent",
                    });
                }

                // Read fittend
                fitted = true;
            }
            rowY = rowY + rowHeight;
        }
    }

    #groupAlignments(reads, options) {
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

    getDefaultConfig() {
        return {
            minMappingQuality: 20, // Reads with a mapping quality under 20 will have a transparency
            // Displayed reads style
            color: "darkgrey",
            opacity: (read, minMappingQuality) => {
                return read.alignment.mappingQuality > minMappingQuality ? 1 : 0.5;
            },
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
