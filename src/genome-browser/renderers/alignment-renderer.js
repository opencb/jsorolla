
class AlignmentRenderer extends Renderer {

    constructor(args) {
        super(args);
        // Extend and add Backbone Events
        Object.assign(this, Backbone.Events);

        this.fontClass = "ocb-font-roboto ocb-font-size-11";
        this.toolTipfontClass = "ocb-tooltip-font";

        if (_.isObject(args)) {
            Object.assign(this, args);
        }
        Object.assign(this, this.getDefaultConfig(), this.config);

        this.on(this.handlers);
    }

    render(response, args) {
        if (UtilsNew.isUndefined(response.params)) {
            response.params = {};
        }

        // CHECK VISUALIZATON MODE
        let viewAsPairs = false;
        if (UtilsNew.isNotUndefinedOrNull(response.params.view_as_pairs)) {
            viewAsPairs = true;
        }
        console.log(`viewAsPairs ${viewAsPairs}`);
        if (UtilsNew.isNotUndefinedOrNull(response.params.insert_size_interval)) {
            this.insertSizeMin = response.params.insert_size_interval.split(",")[0];
            this.insertSizeMax = response.params.insert_size_interval.split(",")[1];
        }
        console.log(`insertSizeMin: ${this.insertSizeMin}, insertSizeMax: ${this.insertSizeMax}`);
        // console.log(`insertSizeMax ${insertSizeMax}`);

        // Prevent browser context menu
        $(args.svgCanvasFeatures).contextmenu((e) => {
            console.log("right click");
        });

        // Define the height of the coverage track
        if (response.dataType === "features") {
            args.covHeight = 50;
        } else {
            args.covHeight  = args.svgCanvasFeatures.parentElement.clientHeight;
        }

        console.time(`BamRender ${response.params.resource}`);

        const chunkList = response.items;

        const bamCoverGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
            class: "bamCoverage",
            cursor: "pointer",
        });

        // This other object will contain the strings needed to build the whole polyline to draw the different rows of reads
        const polyDrawing = {};

        // process features
        if (chunkList.length > 0) {
            for (let i = 0, li = chunkList.length; i < li; i++) {
                this._drawCoverage(bamCoverGroup, chunkList[i], args);
                this._addChunks(chunkList[i], polyDrawing, args);
            }
        }

        if (response.dataType === "features") {
            // Remove old SVGs
            if (args.svgCanvasFeatures.childElementCount > 2) {
                args.svgCanvasFeatures.removeChild(args.svgCanvasFeatures.firstChild);
                args.svgCanvasFeatures.removeChild(args.svgCanvasFeatures.firstChild);
            }

            const bamReadGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
                class: "bamReads",
                cursor: "pointer",
            });

            const keys = Object.keys(polyDrawing);
            for (let i = 0; i < keys.length; i++) {
                const features = args.renderedArea[keys[i]];

                this._renderReadsAndToolTips(bamReadGroup, polyDrawing[keys[i]].reads, 1, features, args);
                this._renderReadsAndToolTips(bamReadGroup, polyDrawing[keys[i]].lowQualityReads, this.lowQualityOpacity, features, args);

                // Render differences
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.A, "#009900");
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.T, "#aa0000");
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.C, "#0000ff");
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.G, "#857a00");
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.N, "#888");
                this._addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.D, "#000");
                if (polyDrawing[keys[i]].differences.I.length > 0) {
                    const text = SVG.addChild(bamReadGroup, "text", {
                        y: parseInt(keys[i]) + polyDrawing[keys[i]].config.height,
                        class: "ocb-font-ubuntumono ocb-font-size-15",
                    });
                    for (let j = 0; j < polyDrawing[keys[i]].differences.I.length; j++) {
                        const diff = polyDrawing[keys[i]].differences.I[j];
                        const t = SVG.addChild(text, "tspan", {
                            x: diff.pos - (diff.size / 2),
                            // "font-weight": 'bold',
                            textLength: diff.size,
                        });
                        t.textContent = "|";
                        $(t).qtip({
                            content: {text: diff.seq, title: "Insertion"},
                            position: {target: "mouse", adjust: {x: 25, y: 15}},
                            style: {classes: `${this.toolTipfontClass} qtip-dark qtip-shadow`},
                        });
                    }
                }
            }
        }

        console.timeEnd(`BamRender ${response.params.resource}`);
    }


    getDefaultConfig() {
        return {
            asPairs: true,
            minMapQ: 20, // Reads with a mapping quality under 20 will have a transparency
            lowQualityOpacity: 0.5,
            readColor: "darkgrey",
            infoWidgetId: "id",
            height: 10,
            histogramColor: "grey",
            insertSizeMin: 0,
            insertSizeMax: 0,
            explainFlags(f) {
                var summary = "<div style=\"background:#FFEF93;font-weight:bold;margin:0 15px 0 0;\">flags </div>";
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
            label(f) {
                return "Alignment  " + f.fragmentName + ":" + f.alignment.position.position + "-"
                    + (f.alignment.position.position + f.alignedSequence.length - 1);
            },
            tooltipTitle(f) {
                return "Alignment" + " - <span class=\"ok\">" + f.id + "</span>";
            },
            tooltipText(f) {
                f.strand = this.strand(f);

                var strand = (f.strand != null) ? f.strand : "NA";
                const region = `start-end:&nbsp;<span style="font-weight: bold">${f.start}-${f.end} (${strand})</span><br>`
                    +
                    // `strand:&nbsp;<span style="font-weight: bold">${strand}</span><br>` +
                    `length:&nbsp;<span style="font-weight: bold; color:#005fdb">${(f.end - f.start + 1).toString()
                        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span><br>`;
                var one =
                    "cigar:&nbsp;<span class=\"ssel\">" + f.cigar + "</span><br>" +
                    "insert size:&nbsp;<span class=\"ssel\">" + f.fragmentLength + "</span><br>" +
                    region + "<br>" +
                    // this.explainFlags(f.flags);
                    this.explainFlags(f);

                var three = "<div style=\"background:#FFEF93;font-weight:bold;\">attributes</div>";
                let keys = Object.keys(f.info);
                for (let i in keys) {
                    three += keys[i] + " : " + f.info[keys[i]][0] + " : " + f.info[keys[i]][1] + "<br>";
                }
                // delete f.attributes["BQ"];//for now because is too long
                // for (var key in f.attributes) {
                //     three += key + ":" + f.attributes[key] + "<br>";
                // }
                var style = "background:#FFEF93;font-weight:bold;";
                return "<div style=\"float:left\">" + one + "</div>" +
                    "<div style=\"float:right\">" + three + "</div>";
            },
            color(f, chr) {
                if (f.nextMatePosition.referenceName != chr) {
                    return "DarkGray";
                }
                return f.alignment.position.strand === "POS_STRAND" ? "DarkGray" : "LightGray";
                /**/
            },
            strokeColor(f) {
                if (this.mateUnmappedFlag(f)) {
                    return "tomato"
                }
                return f.alignment.position.strand === "POS_STRAND" ? "LightGray" : "DarkGray";
            },
            strand(f) {
                return f.alignment.position.strand === "POS_STRAND" ? "Forward" : "Reverse";
            },
            readPairedFlag(f) {
                return (parseInt(f.flags) & (0x1)) == 0 ? false : true;
            },
            firstOfPairFlag(f) {
                return (parseInt(f.flags) & (0x40)) == 0 ? false : true;
            },
            mateUnmappedFlag(f) {
                return f.nextMatePosition === undefined;
            }
        };
    }

    _addChunks(chunk, polyDrawing, args) {
        if (typeof chunk.alignments === "undefined" || chunk.alignments.length === 0) {
            return;
        }

        const alignments = chunk.alignments;
        if (this.asPairs) {
            const alignmentHash = this._pairReads(alignments);
            const ids = Object.keys(alignmentHash);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                if (alignmentHash[id].length === 2) {
                    this._addPairedReads(alignmentHash[id], polyDrawing, args);
                } else {
                    this._addSingleRead(alignmentHash[id][0], polyDrawing, args);
                }
            }
        } else {
            for (let i = 0; i < alignments.length; i++) {
                this._addSingleRead(alignments[i], polyDrawing, args);
            }
        }
    }

    _drawCoverage(svgGroup, chunk, args) {
        if (typeof chunk.coverage === "undefined") {
            return;
        }

        let coverageList = chunk.coverage.value;
        let windowSize = chunk.coverage.windowSize;

        const start = parseInt(chunk.region.start);
        const end = parseInt(chunk.region.end);
        const pixelWidth = (end - start + 1) * args.pixelBase;

        const middle = args.width / 2;

        const covHeight = args.covHeight;

        const histogram = [];
        const length = end - start;
        const maximumValue = Math.max.apply(null, coverageList);
        let points = "";

        if (maximumValue > 0) {
            const maxValueRatio = covHeight / maximumValue;
            let previousCoverage = -1;
            let previousPosition = -1;

            const startPoint = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
            histogram.push(`${startPoint},${covHeight}`);
            // eslint-disable-next-line no-plusplus
            for (let i in coverageList) {
                let pos = i * windowSize;

                if (coverageList[i] !== previousCoverage) {
                    previousCoverage = coverageList[i];
                    if (previousPosition + 1 < i) {
                        // We need to add the previous position as well to make a flat line between positions with equal coverage
                        const x = args.pixelPosition + middle - ((args.position - (start + (pos - 1))) * args.pixelBase);
                        const y = covHeight - (coverageList[i - 1] * maxValueRatio);

                        histogram.push(`${x},${y}`);
                    }
                    previousPosition = i;

                    const x = args.pixelPosition + middle - ((args.position - (start + pos)) * args.pixelBase);
                    const y = covHeight - (coverageList[i] * maxValueRatio);
                    histogram.push(`${x},${y}`);
                }
            }

            const x = args.pixelPosition + middle - ((args.position - (start + length + 1)) * args.pixelBase);
            const y = covHeight - (coverageList[coverageList.length - 1] * maxValueRatio);
            histogram.push(`${x},${y}`);
            histogram.push(`${x},${covHeight}`);
            points = histogram.join(" ");
        } else {
            const x1 = args.pixelPosition + middle - ((args.position - (start)) * args.pixelBase);
            const x2 = args.pixelPosition + middle - ((args.position - (start + length)) * args.pixelBase);
            points = `${x1},${covHeight} ${x2},${covHeight}`;
        }

        const dummyRect = SVG.addChild(svgGroup, "polyline", {
            points,
            stroke: "lightgrey",
            fill: "lightgrey",
            width: pixelWidth,
            height: covHeight,
            cursor: "pointer",
        });

        $(dummyRect).qtip({
            content: " ",
            position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
            style: { width: true, classes: `${this.toolTipfontClass} ui-tooltip-shadow` },
            show: { delay: 300 },
            hide: { delay: 300 },
        });


        args.trackListPanel.on("mousePosition:change", (e) => {
            const pos = Math.floor((e.mousePos - parseInt(start)) / windowSize);
            if (pos < 0 || pos >= coverageList.length) {
                return;
            }

            const str = `depth: <span class="ssel">${coverageList[pos]}</span><br>`;
            $(dummyRect).qtip("option", "content.text", str);

        });
    }

    _analyseRead(feature, args) {
        let differences = [];

        let start = feature.alignment.position.position;

        let cigar = "";
        let relativePosition = 0;
        const insertions = [];

        let myLength;
        for (const i in feature.alignment.cigar) {
            cigar += feature.alignment.cigar[i].operationLength;
            switch (feature.alignment.cigar[i].operation) {
            case "CLIP_SOFT":
                cigar += "S";
                break;
            case "ALIGNMENT_MATCH":
                cigar += "M";
                relativePosition += parseInt(feature.alignment.cigar[i].operationLength);
                break;
            case "INSERT":
                cigar += "I";
                myLength = parseInt(feature.alignment.cigar[i].operationLength);

                // We put this here because it will be read to calculate the position of the mismatches
                insertions.push({
                    pos: relativePosition,
                    length: myLength,
                });

                differences.push({
                    pos: relativePosition,
                    seq: feature.alignedSequence.slice(relativePosition, relativePosition + myLength),
                    op: "I",
                    length: myLength,
                });
                break;
            case "DELETE":
                cigar += "D";
                myLength = parseInt(feature.alignment.cigar[i].operationLength);
                differences.push({
                    pos: relativePosition,
                    op: "D",
                    length: myLength,
                });
                relativePosition += myLength;
                break;
            case "SKIP":
                cigar += "N";
                relativePosition += parseInt(feature.alignment.cigar[i].operationLength);
                break;
            default:
            }
        }
        feature.cigar = cigar;

        const end = start + relativePosition - 1;

        feature.start = start;
        feature.end = end;

        if (feature.info.hasOwnProperty("MD")) {
            const md = feature.info.MD[1];
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
                            console.log("Something strange happened. The mismatch matches the nucleotide of the reference genome?")
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

        // get feature render configuration
        let color = _.isFunction(this.color) ? this.color(feature, args.region.chromosome) : this.color;
        const mateUnmappedFlag = _.isFunction(this.mateUnmappedFlag) ? this.mateUnmappedFlag(feature) : this.mateUnmappedFlag;

        if (this.insertSizeMin != 0 && this.insertSizeMax != 0 && !mateUnmappedFlag) {
            if (Math.abs(feature.inferredInsertSize) > this.insertSizeMax) {
                color = "maroon";
            }
            if (Math.abs(feature.inferredInsertSize) < this.insertSizeMin) {
                color = "navy";
            }
        }

        return [differences, relativePosition];
    }

    _processDifferencesInRead(differences, polyDrawing, start, height, rowY, args) {
        if (typeof differences === "undefined" || differences.length === 0) {
            return;
        }

        for (let i = 0; i < differences.length; i++) {
            let diff = differences[i];
            let tmpStart = this.getFeatureX(diff.pos + start, args);
            let tmpEnd = tmpStart + args.pixelBase;

            if (diff.op === "M") {
                const rectangle = `M${tmpStart} ${rowY} V${rowY + height} H${tmpEnd} V${rowY} H${tmpStart}`;
                polyDrawing[rowY].differences[diff.seq].push(rectangle);
            } else if (diff.op === "I") {
                diff.pos = tmpStart;
                diff.size = args.pixelBase;
                polyDrawing[rowY].differences[diff.op].push(diff);
            } else if (diff.op === "D") {
                tmpEnd = tmpStart + args.pixelBase * diff.length;
                // Deletion as a line or as a cross
                // Line
                const line = `M${tmpStart} ${rowY + (height / 2)} H${tmpEnd} H${tmpStart}`;
                // Cross
                polyDrawing[rowY].differences[diff.op].push(line);
            } else {
                console.log(`Unexpected difference found: ${diff.op}`);
            }
        }
    }

    _addPairedReads(features, polyDrawing, args) {
        // Initialise the differences object to contain the differences of each read
        let differences = [];
        let myLengths = [];

        for (let i = 0; i < features.length; i++) {
            let [myDifferences, length] = this._analyseRead(features[i], args);
            differences.push(myDifferences);
            myLengths.push(length);
        }

        // transform to pixel position
        let width = myLengths[0] * args.pixelBase;
        let widthPair = myLengths[1] * args.pixelBase;
        // calculate x to draw svg rect
        let x = this.getFeatureX(features[0].alignment.position.position, args);
        let xPair = this.getFeatureX(features[1].alignment.position.position, args);

        // We write additionally the coordinates used by each read to be able to easily select the tooltip to be shown in each case
        features[0]._coordinates = [x, x + width];
        features[1]._coordinates = [xPair, xPair + widthPair];

        let height = _.isFunction(this.height) ? this.height(features[0]) : this.height;

        let rowHeight = 15;
        let rowY = 70;
        // var textY = 12+settings.height;
        let readFitted = false;
        do {
            if (UtilsNew.isUndefinedOrNull(args.renderedArea[rowY])) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            if (UtilsNew.isUndefinedOrNull(polyDrawing[rowY])) {
                polyDrawing[rowY] = {
                    reads: [],
                    lowQualityReads: [],
                    differences: {
                        A: [],
                        T: [],
                        C: [],
                        G: [],
                        N: [],
                        I: [],
                        D: [],
                    },
                    config: {
                        height,
                    },
                };
            }

            let enc = args.renderedArea[rowY].add({ start: x, end: xPair + widthPair - 1, features });
            if (enc) {
                const points = {
                    Reverse: `M${x} ${rowY + (height / 2)} L${x + 5} ${rowY} H${x + width} V${rowY + height} H${x + 5} 
                            L${x} ${rowY + (height / 2)} `,
                    Forward: `M${x} ${rowY} H${x + width - 5} L${x + width} ${rowY + (height / 2)} L${x + width - 5} ${rowY + height} 
                            H${x} V${rowY} `,
                };

                const paired_points = {
                    Reverse: `M${xPair} ${rowY + (height / 2)} L${xPair + 5} ${rowY} H${xPair + widthPair} V${rowY + height} H${xPair + 5} 
                            L${xPair} ${rowY + (height / 2)} `,
                    Forward: `M${xPair} ${rowY} H${xPair + widthPair - 5} L${xPair + widthPair} ${rowY + (height / 2)} 
                            L${xPair + widthPair - 5} ${rowY + height} H${xPair} V${rowY} `,
                };

                let strand = _.isFunction(this.strand) ? this.strand(features[0]) : this.strand;
                if (features[0].alignment.mappingQuality > this.minMapQ) {
                    polyDrawing[rowY].reads.push(points[strand]);
                } else {
                    polyDrawing[rowY].lowQualityReads.push(points[strand]);
                }

                // TODO: Draw the line connecting the reads
                polyDrawing[rowY].reads.push(`M${x + width} ${rowY + (height / 2)} H${xPair} H${x + width}`);

                strand = _.isFunction(this.strand) ? this.strand(features[1]) : this.strand;
                if (features[1].alignment.mappingQuality > this.minMapQ) {
                    polyDrawing[rowY].reads.push(paired_points[strand]);
                } else {
                    polyDrawing[rowY].lowQualityReads.push(paired_points[strand]);
                }

                // PROCESS differences
                if (args.regionSize < 1000) {
                    this._processDifferencesInRead(differences[0], polyDrawing, features[0].alignment.position.position, height, rowY,
                        args);
                    this._processDifferencesInRead(differences[1], polyDrawing, features[1].alignment.position.position, height, rowY,
                        args);
                }
                readFitted = true;
            }
            rowY += rowHeight;
        } while (!readFitted)
    }


    _addSingleRead(feature, polyDrawing, args) {

        let [differences, length] = this._analyseRead(feature, args);
        let start = feature.alignment.position.position;
        let height = _.isFunction(this.height) ? this.height(feature) : this.height;
        let strand = _.isFunction(this.strand) ? this.strand(feature) : this.strand;

        // transform to pixel position
        const width = length * args.pixelBase;
        // calculate x to draw svg rect
        const x = this.getFeatureX(start, args);

        const maxWidth = width;

        const rowHeight = 15;
        let rowY = 70;
        // var textY = 12+settings.height;
        let readFitted = false;
        do {
            if (UtilsNew.isUndefinedOrNull(args.renderedArea[rowY])) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            if (UtilsNew.isUndefinedOrNull(polyDrawing[rowY])) {
                polyDrawing[rowY] = {
                    reads: [],
                    lowQualityReads: [],
                    differences: {
                        A: [],
                        T: [],
                        C: [],
                        G: [],
                        N: [],
                        I: [],
                        D: [],
                    },
                    config: {
                        height,
                    },
                };
            }

            let features = [feature];
            const enc = args.renderedArea[rowY].add({ start: x, end: x + maxWidth - 1, features });
            if (enc) {
                const points = {
                    Reverse: `M${x} ${rowY + (height / 2)} L${x + 5} ${rowY} H${x + width} V${rowY + height} H${x + 5} 
                            L${x} ${rowY + (height / 2)} `,
                    Forward: `M${x} ${rowY} H${x + width - 5} L${x + width} ${rowY + (height / 2)} L${x + width - 5} ${rowY + height} 
                            H${x} V${rowY} `,
                };

                if (feature.alignment.mappingQuality > this.minMapQ) {
                    polyDrawing[rowY].reads.push(points[strand]);
                } else {
                    polyDrawing[rowY].lowQualityReads.push(points[strand]);
                }

                // PROCESS differences
                if (args.regionSize < 1000) {
                    this._processDifferencesInRead(differences, polyDrawing, start, height, rowY, args);
                }
                readFitted = true;
            }
            rowY += rowHeight;
        } while (!readFitted)
    }

    /**
     * Taking an array of alignments as an input that can have any possible order, it will return an object of the form
     * {
         *  alignmentId: [read, mate] (or just [read] where no mate was found)
         * }
     * @param alignments
     */
    _pairReads(alignments) {
        const alignmentHash = {};
        // We build a temporal structure for faster retrieval of alignments
        for (let i = 0; i < alignments.length; i++) {
            const id = alignments[i].id;
            if (typeof alignmentHash[id] === "undefined") {
                alignmentHash[id] = [alignments[i]];
            } else {
                let pos_new_alignment = alignments[i].alignment.position.position;
                let pos_stored_alignment = alignmentHash[id][0].alignment.position.position;

                if (pos_stored_alignment === pos_new_alignment) {
                    // FIXME: For some reason, the webservice is some times returning the exactly same read more than once.
                    continue;
                }
                // Order the alignments to be rendered properly
                if (pos_new_alignment > pos_stored_alignment) {
                    alignmentHash[id].push(alignments[i]);
                } else {
                    alignmentHash[id].unshift(alignments[i]);
                }
            }
        }

        return alignmentHash;
    }

    _addDifferencesSVG(svgBase, array, color) {
        if (array === null || array.length === 0) {
            return;
        }
        SVG.addChild(svgBase, "path", {
            d: array.join(" "),
            stroke: color,
            "stroke-width": 0.7,
            fill: color,
            "fill-opacity": 0.5,
        });
    }

    _renderReadsAndToolTips(svgGroup, reads, opacity, features, args) {
        if (reads.length === 0) {
            return;
        }

        const svgChild = SVG.addChild(svgGroup, "path", {
            d: reads.join(" "),
            stroke: "black",
            "stroke-width": 0.5,
            fill: this.readColor,
            "fill-opacity": opacity,
            cursor: "pointer",
        });

        $(svgChild).qtip({
            content: {
                title: "",
                text: "",
            },
            position: { target: "mouse", adjust: { x: 25, y: 15 } },
            style: { width: 300, classes: `${this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
            hide: {
                event: "mousedown mouseup mouseleave",
                delay: 30,
                fixed: true,
            },
        });

        let _this = this;
        svgChild.onmouseover = function () {
            let position = _this.getFeatureX(args.trackListPanel.mousePosition, args);
            let reads = features.get({ start: position, end: position }).value.features;
            if (reads.length === 1) {
                $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[0]));
                $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[0]));
            } else {
                if (position < reads[0]._coordinates[1]) {
                    $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[0]));
                    $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[0]));
                } else if (position > reads[1]._coordinates[0]) {
                    $(svgChild).qtip("option", "content.text", _this.tooltipText(reads[1]));
                    $(svgChild).qtip("option", "content.title", _this.tooltipTitle(reads[1]));
                }
            }
        };

    }

}