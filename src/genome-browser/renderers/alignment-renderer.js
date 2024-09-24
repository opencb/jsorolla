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
        const regionSize = options.requestedRegion.end - options.requestedRegion.start + 1;
        const parentHeight = options.svgCanvasFeatures.parentElement.clientHeight;
        // const coverageHeight = regionSize < this.config.alignmentsMaxRegionSize ? 50 : parentHeight;
        const coverageHeight = 75;

        const coverageParent = SVG.addChild(options.svgCanvasFeatures, "g", {
            "data-cy": "gb-coverage",
        });
        const alignmentsParent = SVG.addChild(options.svgCanvasFeatures, "g", {
            "data-cy": "gb-alignments",
        });

        // Render coverage data
        coverage.forEach(item => {
            this.#renderCoverage(coverageParent, item, coverageHeight, options);
        });

        // Group and render alignments
        if (alignments && regionSize < this.config.alignmentsMaxRegionSize) {
            this.#groupAlignments(alignments, options).forEach(group => {
                this.#renderAlignments(alignmentsParent, group, coverageHeight, options);
            });
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
                            quality: feature.alignedQuality?.[position] || 0,
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
            const maxValueRatio = (height - 25) / maximumValue;
            let prevCoverage = -1;
            let prevPosition = -1;

            (coverage.values || []).forEach((value, index) => {
                const pos = index * coverage.windowSize;

                if (value !== prevCoverage || index === coverage.values.length - 1) {
                    if (prevCoverage > -1 && prevPosition + 1 < index) {
                        // We need to add the previous position as well to make a flat line between positions with equal coverage
                        const prevX = GenomeBrowserUtils.getFeatureX(start + prevPosition * coverage.windowSize, options);
                        const prevY = height - (prevCoverage * maxValueRatio);
                        points.push(`${prevX},${prevY}`);
                    }
                    prevCoverage = value;
                    prevPosition = index;

                    const x = GenomeBrowserUtils.getFeatureX(start + pos, options);
                    const y = height - (value * maxValueRatio);
                    points.push(`${x},${y}`);
                }
            });
        }

        // Last point
        points.push(`${endPoint},${height}`);

        SVG.addChild(group, "polyline", {
            points: points.join(" "),
            stroke: "lightgrey",
            fill: "lightgrey",
            width: pixelWidth,
            height: height,
            cursor: "pointer",
            style: "opacity:0.6;",
        });

        const coverageValueRect = SVG.addChild(group, "path", {
            "d": "M0 0L15 0C20 0 20 5 20 5L20 15C20 15 20 20 15 20L5 20L0 25L-5 20L-15 20C-20 20-20 15-20 15L-20 5C-20 5-20 0-15 0L0 0Z",
            "fill": "#000",
            "style": "display:none;transform:translateX(0px);",
            "data-cy": "gb-coverage-tooltip-tip",
        });
        const coverageValueText = SVG.addChild(group, "text", {
            "x": 0,
            "y": 10,
            "fill": "#fff",
            "dominant-baseline": "middle",
            "text-anchor": "middle",
            "style": "font-size:10px;font-weight:bold;",
            "data-cy": "gb-coverage-tooltip-text",
        });
        const coverageMask = SVG.addChild(group, "rect", {
            "x": startPoint,
            "y": 0,
            "width": Math.abs(endPoint - startPoint),
            "height": height,
            "fill": "transparent",
            "stroke": "none",
            "data-cy": "gb-coverage-tooltip-mask",
        });

        const visibleStart = parseInt(GenomeBrowserUtils.getFeatureX(options.region.start, options) - (options.pixelBase / 2));
        const initialCanvasStart = parseInt(options.svgCanvasFeatures.getAttribute("x"));

        coverageMask.addEventListener("mousemove", e => {
            const deltaCanvas = initialCanvasStart - parseInt(options.svgCanvasFeatures.getAttribute("x"));
            const position = visibleStart + deltaCanvas + e.offsetX;
            const index = Math.floor(((position - startPoint) / options.pixelBase) / coverage.windowSize);

            coverageValueRect.style.transform = `translateX(${position}px)`;
            coverageValueText.setAttribute("x", position + "px");
            coverageValueText.textContent = Math.ceil(coverage.values[index] || 0);
        });
        coverageMask.addEventListener("mouseleave", () => {
            coverageValueRect.style.display = "none";
            coverageValueText.style.display = "none";
        });
        coverageMask.addEventListener("mouseenter", () => {
            coverageValueRect.style.display = "";
            coverageValueText.style.display = "";
        });
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
                    "stroke-width": 1,
                    "fill": color,
                    "fill-opacity": diff.quality < this.config.minMappingQuality ? 0.2 : 0.8,
                });
            } else if (diff.op === "I") {
                const text = SVG.addChild(parent, "text", {
                    y: rowY + readHeight,
                    x: start - (options.pixelBase / 2),
                    class: "ocb-font-ubuntumono ocb-font-size-15",
                    // textLength: diff.size,
                });
                text.textContent = "|";
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

        // Generate alignments group
        const group = SVG.addChild(parent, "g", {
            "data-cy": "gb-alignment",
            "data-alignment-id": alignments[0].id,
            "data-alignment-start": Math.min.apply(null, starts),
            "data-alignment-end": Math.max.apply(null, ends),
        });

        // transform to pixel position
        const alignmentStart = GenomeBrowserUtils.getFeatureX(Math.min.apply(null, starts), options);
        const alignmentEnd = GenomeBrowserUtils.getFeatureX(Math.max.apply(null, ends), options);

        const height = this.getValueFromConfig("height", []);
        const rowHeight = height + 5;
        let rowY = startHeight + 10;
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
                    const strand = this.getValueFromConfig("strand", [read]) || "Forward";
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
                    const readColor = this.getValueFromConfig("color", [read, alignments, this.config.minMappingQuality]);
                    const readOpacity = this.getValueFromConfig("opacity", [read, alignments, this.config.minMappingQuality]);

                    // Render this read
                    const readElement = SVG.addChild(group, "path", {
                        "data-cy": "gb-alignment-read",
                        "data-read-index": index,
                        "data-read-start": starts[index],
                        "data-read-end": ends[index],
                        "d": points.join(" "),
                        "stroke": "black",
                        "stroke-width": 0.5,
                        "fill": readColor,
                        "fill-opacity": readOpacity,
                        "cursor": "pointer",
                    });

                    // Display read tooltip
                    $(readElement).qtip({
                        content: {
                            title: this.getValueFromConfig("tooltipTitle", [read]),
                            text: this.getValueFromConfig("tooltipText", [read]),
                        },
                        position: {
                            viewport: $(window),
                            target: "mouse",
                            adjust: {x: 10, y: 10},
                        },
                        style: {
                            width: true,
                            classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                        },
                    });

                    // Check for rendering a line connecting reads
                    // NOTE: the second condition is to avoud drawing the connector in overlapped reads
                    if (prevAlignmentEnd && prevAlignmentEnd < start) {
                        connectorsPoints.push(`M${prevAlignmentEnd} ${rowY + (height / 2)} H${start}`);
                    }
                    prevAlignmentEnd = end;
                });

                // Render differences
                if (options.regionSize < 1000) {
                    differences.forEach((diff, index) => {
                        this.#renderDifferences(parent, diff, starts[index], height, rowY, options);
                    });
                }

                // Check for rendering connectors points
                if (connectorsPoints.length > 0) {
                    SVG.addChild(group, "path", {
                        "data-cy": "gb-alignment-connector",
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

    getDefaultConfig() {
        return {
            alignmentsMaxRegionSize: 50000,
            minMappingQuality: 20, // Reads with a mapping quality under 20 will have a transparency
            height: 10,
            strand: GenomeBrowserUtils.alignmentStrandParser,
            color: GenomeBrowserUtils.alignmentColorFormatter,
            opacity: GenomeBrowserUtils.alignmentOpacityFormatter,
            tooltipTitle: GenomeBrowserUtils.alignmentTooltipTitleFormatter,
            tooltipText: GenomeBrowserUtils.alignmentTooltipTextFormatter,
        };
    }

}
