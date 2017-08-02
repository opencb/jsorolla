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

        this.on(this.handlers);
    }

    render(response, args) {
        const _this = this;

        // const sequenceDataAdapter = args.trackListPanel.getSequenceTrack().dataAdapter;

        // CHECK VISUALIZATON MODE
        if (_.isUndefined(response.params)) {
            response.params = {};
        }

        let viewAsPairs = false;
        if (UtilsNew.isNotUndefinedOrNull(response.params.view_as_pairs)) {
            viewAsPairs = true;
        }
        console.log(`viewAsPairs ${viewAsPairs}`);
        let insertSizeMin = 0;
        let insertSizeMax = 0;
        const variantColor = "orangered";
        if (UtilsNew.isNotUndefinedOrNull(response.params.insert_size_interval)) {
            insertSizeMin = response.params.insert_size_interval.split(",")[0];
            insertSizeMax = response.params.insert_size_interval.split(",")[1];
        }
        console.log(`insertSizeMin ${insertSizeMin}`);
        console.log(`insertSizeMin ${insertSizeMax}`);

        // Prevent browser context menu
        $(args.svgCanvasFeatures).contextmenu((e) => {
            console.log("right click");
            // e.preventDefault();
        });

        console.time(`BamRender ${response.params.resource}`);

        const chunkList = response.items;

        //    var middle = this.width / 2;

        const bamCoverGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
            class: "bamCoverage",
            cursor: "pointer",
        });
        const bamReadGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
            class: "bamReads",
            cursor: "pointer",
        });

        const drawCoverage = function (chunk) {
            // var coverageList = chunk.coverage.all;
            const coverageList = chunk.coverage.value;
            // var coverageListA = chunk.coverage.a;
            // var coverageListC = chunk.coverage.c;
            // var coverageListG = chunk.coverage.g;
            // var coverageListT = chunk.coverage.t;
            const start = parseInt(chunk.region.start);
            const end = parseInt(chunk.region.end);
            const pixelWidth = (end - start + 1) * args.pixelBase;

            const middle = args.width / 2;
            // const baseMid = (args.pixelBase / 2) - 0.5; // 4.5 cuando pixelBase = 10

            // var x, y, p = parseInt(chunk.start);
            // var lineA = "", lineC = "", lineG = "", lineT = "";
            // const coverageNorm = 200;
            const covHeight = 50;

            const histogram = [];
            const length = coverageList.length;
            const maximumValue = Math.max.apply(null, coverageList);
            let points = "";

            if (maximumValue > 0) {
                const maxValueRatio = covHeight / maximumValue;
                let previousCoverage = -1;
                let previousPosition = -1;

                const startPoint = args.pixelPosition + middle - ((args.position - start) * args.pixelBase);
                histogram.push(`${startPoint},${covHeight}`);
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < length; i++) {
                    if (coverageList[i] !== previousCoverage) {
                        previousCoverage = coverageList[i];
                        if (previousPosition + 1 < i) {
                            // We need to add the previous position as well to make a flat line between positions with equal coverage
                            const x = args.pixelPosition + middle - ((args.position - (start + (i - 1))) * args.pixelBase);
                            const y = covHeight - (coverageList[i - 1] * maxValueRatio);
                            if (y < 0 || y > covHeight) {
                                // debugger
                            }
                            histogram.push(`${x},${y}`);
                        }
                        previousPosition = i;

                        const x = args.pixelPosition + middle - ((args.position - (start + i)) * args.pixelBase);
                        const y = covHeight - (coverageList[i] * maxValueRatio);
                        histogram.push(`${x},${y}`);
                    }
                }

                const x = args.pixelPosition + middle - ((args.position - (start + length)) * args.pixelBase);
                const y = covHeight - (coverageList[length - 1] * maxValueRatio);
                histogram.push(`${x},${y}`);
                histogram.push(`${x},${covHeight}`);
                points = histogram.join(" ");
            } else {
                const x1 = args.pixelPosition + middle - ((args.position - (start)) * args.pixelBase);
                const x2 = args.pixelPosition + middle - ((args.position - (start + length)) * args.pixelBase);
                points = `${x1},${covHeight} ${x2},${covHeight}`;
            }

            const dummyRect = SVG.addChild(bamCoverGroup, "polyline", {
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
                style: { width: true, classes: `${_this.toolTipfontClass} ui-tooltip-shadow` },
                show: { delay: 300 },
                hide: { delay: 300 },
            });


            args.trackListPanel.on("mousePosition:change", (e) => {
                const pos = e.mousePos - parseInt(start);
                if (pos < 0 || pos >= coverageList.length) {
                    return;
                }
                /*
                 if(coverageList[pos]!=null){
                 var str = 'depth: <span class="ssel">' + coverageList[pos] + '</span><br>' +
                 '<span style="color:green">A</span>: <span class="ssel">' + chunk.coverage.a[pos] + '</span><br>' +
                 '<span style="color:blue">C</span>: <span class="ssel">' + chunk.coverage.c[pos] + '</span><br>' +
                 '<span style="color:darkgoldenrod">G</span>: <span class="ssel">' + chunk.coverage.g[pos] + '</span><br>' +
                 '<span style="color:red">T</span>: <span class="ssel">' + chunk.coverage.t[pos] + '</span><br>';
                 */
                const str = `depth: <span class="ssel">${coverageList[pos]}</span><br>`;
                $(dummyRect).qtip("option", "content.text", str);
                /* } */
            });
        };

        const addSingleRead = function (feature, polyDrawing) {
            /*
             var start = feature.start;
             var end = feature.end;
             */
            const differences = [];
            const start = feature.alignment.position.position;
            // let length = 0;
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
                    // length += parseInt(feature.alignment.cigar[i].operationLength);
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
                        // seq: feature.alignedSequence.slice(relativePosition, relativePosition + myLength),
                        op: "D",
                        length: myLength,
                    });
                    relativePosition += myLength;
                    // length += myLength;
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
            const length = relativePosition;

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
            let color = _.isFunction(_this.color) ? _this.color(feature, args.region.chromosome) : _this.color;
            const strokeColor = _.isFunction(_this.strokeColor) ? _this.strokeColor(feature, args.region.chromosome) : _this.strokeColor;
            const label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
            const height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
            const tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
            const tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
            const strand = _.isFunction(_this.strand) ? _this.strand(feature) : _this.strand;
            const mateUnmappedFlag = _.isFunction(_this.mateUnmappedFlag) ? _this.mateUnmappedFlag(feature) : _this.mateUnmappedFlag;
            const infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

            if (insertSizeMin != 0 && insertSizeMax != 0 && !mateUnmappedFlag) {
                if (Math.abs(feature.inferredInsertSize) > insertSizeMax) {
                    color = "maroon";
                }
                if (Math.abs(feature.inferredInsertSize) < insertSizeMin) {
                    color = "navy";
                }
            }

            // transform to pixel position
            const width = length * args.pixelBase;
            // calculate x to draw svg rect
            const x = _this.getFeatureX(start, args);

            const maxWidth = width;

            const rowHeight = 15;
            let rowY = 70;
            //		var textY = 12+settings.height;
            while (true) {
                if (args.renderedArea[rowY] == null) {
                    args.renderedArea[rowY] = new FeatureBinarySearchTree();
                }
                if (polyDrawing[rowY] == null) {
                    polyDrawing[rowY] = {
                        reads: [],
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

                const enc = args.renderedArea[rowY].add({ start: x, end: x + maxWidth - 1, feature });
                if (enc) {
                    const points = {
                        Reverse: `M${x} ${rowY + (height / 2)} L${x + 5} ${rowY} H${x + width} V${rowY + height} H${x + 5} L${x} ${rowY + (height / 2)} `,
                        Forward: `M${x} ${rowY} H${x + width - 5} L${x + width} ${rowY + (height / 2)} L${x + width - 5} ${rowY + height} H${x} V${rowY} `,
                    };

                    polyDrawing[rowY].reads.push(points[strand]);

                    // PROCESS differences
                    if (differences.length > 0 && args.regionSize < 1000) {
                        for (let i = 0; i < differences.length; i++) {
                            const diff = differences[i];
                            const tmpStart = _this.getFeatureX(diff.pos + start, args);
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
                                // let line = `M${tmpStart} ${rowY + height} L${tmpEnd} ${rowY} L${tmpStart} ${rowY + height}
                                //             M${tmpStart} ${rowY} L${tmpEnd} ${rowY + height} L${tmpStart} ${rowY}`;
                                polyDrawing[rowY].differences[diff.op].push(line);
                            } else {
                                console.log(`Unexpected difference found: ${diff.op}`);
                            }
                        }
                    }
                    break;
                }
                rowY += rowHeight;
            }
        };

        const drawSingleRead = function (feature) {
            // var start = feature.start;
            // var end = feature.end;
            const differences = [];
            const start = feature.alignment.position.position;
            // let length = 0;
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
                    // length += parseInt(feature.alignment.cigar[i].operationLength);
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
                        seq: feature.alignedSequence.slice(relativePosition, myLength),
                        op: "I",
                        length: myLength,
                    });
                    break;
                case "DELETE":
                    cigar += "D";
                    myLength = parseInt(feature.alignment.cigar[i].operationLength);
                    differences.push({
                        pos: relativePosition,
                        seq: feature.alignedSequence.slice(relativePosition, myLength),
                        op: "D",
                        length: myLength,
                    });
                    relativePosition += myLength;
                    // length += myLength;
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
            const length = relativePosition;

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
            let color = _.isFunction(_this.color) ? _this.color(feature, args.region.chromosome) : _this.color;
            const strokeColor = _.isFunction(_this.strokeColor) ? _this.strokeColor(feature, args.region.chromosome) : _this.strokeColor;
            const label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
            const height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
            const tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
            const tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
            const strand = _.isFunction(_this.strand) ? _this.strand(feature) : _this.strand;
            const mateUnmappedFlag = _.isFunction(_this.mateUnmappedFlag) ? _this.mateUnmappedFlag(feature) : _this.mateUnmappedFlag;
            const infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

            if (insertSizeMin != 0 && insertSizeMax != 0 && !mateUnmappedFlag) {
                if (Math.abs(feature.inferredInsertSize) > insertSizeMax) {
                    color = "maroon";
                }
                if (Math.abs(feature.inferredInsertSize) < insertSizeMin) {
                    color = "navy";
                }
            }

            // transform to pixel position
            const width = length * args.pixelBase;
            // calculate x to draw svg rect
            const x = _this.getFeatureX(start, args);
            //		try{
            //			var maxWidth = Math.max(width, /*settings.getLabel(feature).length*8*/0); //XXX cuidado : text.getComputedTextLength()
            //		}catch(e){
            //			var maxWidth = 72;
            //		}
            const maxWidth = width;
            // if(length <0){
            //    debugger
            // }
            // console.log(length + ' in px: ' + width);


            const rowHeight = 16;
            let rowY = 70;
            //		var textY = 12+settings.height;
            while (true) {
                if (args.renderedArea[rowY] === null) {
                    args.renderedArea[rowY] = new FeatureBinarySearchTree();
                }
                const enc = args.renderedArea[rowY].add({ start: x, end: x + maxWidth - 1 });
                if (enc) {
                    const featureGroup = SVG.addChild(bamReadGroup, "g", { feature_id: feature.name });
                    const points = {
                        Reverse: `${x},${rowY + (height / 2)} ${x + 5},${rowY} ${x + width},${rowY} ${x + width},${rowY + height} ${x + 5},${rowY + height}`,
                        Forward: `${x - 1},${rowY} ${x + width - 5},${rowY} ${x + width},${rowY + (height / 2)} ${x + width - 5},${rowY + height} ${x - 1},${rowY + height}`,
                    };
                    const poly = SVG.addChild(featureGroup, "polygon", {
                        points: points[strand],
                        stroke: color,
                        "stroke-width": 1,
                        fill: color,
                        cursor: "pointer",
                    });

                    $(featureGroup).qtip({
                        content: { text: tooltipText, title: tooltipTitle },
                        // position: {target: "mouse", adjust: {x: 25, y: 15}},
                        style: { width: 300, classes: `${_this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                        show: {
                            event: "click",
                            solo: true,
                        },
                        // hide: {
                        //     event: 'mousedown mouseup mouseleave',
                        //     delay: 300,
                        //     fixed: true
                        // }
                        hide: "unfocus",
                    });

                    featureGroup.addEventListener("click", (event) => {
                        console.log(feature);
                        _this.trigger("feature:click", {
                            query: feature[infoWidgetId],
                            feature,
                            featureType: feature.featureType,
                            clickEvent: event,
                        });
                    });

                    // var rect = SVG.addChild(featureGroup,"rect",{
                    // "x":x+offset[strand],
                    // "y":rowY,
                    // "width":width-4,
                    // "height":settings.height,
                    // "stroke": "white",
                    // "stroke-width":1,
                    // "fill": color,
                    // "clip-path":"url(#"+_this.id+"cp)",
                    // "fill": 'url(#'+_this.id+'bamStrand'+strand+')',
                    // });
                    // readEls.push(rect);

                    // PROCESS differences
                    // if (differences !== null && args.regionSize < 400) {
                    if (args.regionSize < 400) {
                        featureGroup.appendChild(AlignmentRenderer.drawBamDifferences(differences,
                            args.pixelBase, x, rowY + height));
                        // var region = new Region({chromosome: args.region.chromosome, start: start, end: end});
                        // sequenceDataAdapter.getData({
                        //     region: region,
                        //     done: function (event) {
                        //         debugger;
                        //         var referenceString = AlignmentRenderer._getReferenceString(event.items, region);
                        //         featureGroup.appendChild(AlignmentRenderer.drawBamDifferences(referenceString, differences, args.pixelBase, x, rowY + height));
                        //     }
                        // });
                    }

                    break;
                }
                rowY += rowHeight;
                //			textY += rowHeight;
            }
        };

        const drawPairedReads = function (read, mate) {
            const middle = args.width / 2;
            // var readStart = read.unclippedStart;
            // var readEnd = read.unclippedEnd;
            // var mateStart = mate.unclippedStart;
            // var mateEnd = mate.unclippedEnd;
            // TODO: Change taking into account clipped sequences
            const readStart = read.alignment.position.position;
            const readEnd = readStart + read.alignedQuality.length;
            const mateStart = mate.alignment.position.position;
            const mateEnd = mateStart + mate.alignedQuality.length;
            const readDiff = read.diff;
            const mateDiff = mate.diff;
            /* get type settings object */
            const readSettings = FEATURE_TYPES.alignment;
            const mateSettings = FEATURE_TYPES.alignment;
            let readColor = readSettings.color(read, read.alignment.position.referenceName);
            let mateColor = mateSettings.color(mate, mate.alignment.position.referenceName);
            const readStrand = read.alignment.position.strand === "POS_STRAND" ? "Forward" : "Reverse";
            const mateStrand = mate.alignment.position.strand === "POS_STRAND" ? "Forward" : "Reverse";
            // var readStrand = readSettings.getStrand(read);
            // var matestrand = mateSettings.getStrand(mate);

            if (insertSizeMin != 0 && insertSizeMax != 0) {
                if (Math.abs(read.fragmentLength) > insertSizeMax) {
                    readColor = "maroon";
                    mateColor = "maroon";
                }
                if (Math.abs(read.fragmentLength) < insertSizeMin) {
                    readColor = "navy";
                    mateColor = "navy";
                }
            }

            let pairStart = readStart;
            let pairEnd = mateEnd;
            if (mateStart <= readStart) {
                pairStart = mateStart;
            }
            if (readEnd >= mateEnd) {
                pairEnd = readEnd;
            }

            /* transform to pixel position */
            const pairWidth = ((pairEnd - pairStart) + 1) * args.pixelBase;
            const pairX = args.pixelPosition + middle - ((args.position - pairStart) * args.pixelBase);

            const readWidth = ((readEnd - readStart) + 1) * args.pixelBase;
            const readX = args.pixelPosition + middle - ((args.position - readStart) * args.pixelBase);

            const mateWidth = ((mateEnd - mateStart) + 1) * args.pixelBase;
            const mateX = args.pixelPosition + middle - ((args.position - mateStart) * args.pixelBase);

            const rowHeight = 12;
            let rowY = 70;
            //		var textY = 12+settings.height;

            while (true) {
                if (args.renderedArea[rowY] === null) {
                    args.renderedArea[rowY] = new FeatureBinarySearchTree();
                }
                const enc = args.renderedArea[rowY].add({ start: pairX, end: pairX + pairWidth - 1 });
                if (enc) {
                    const readEls = [];
                    const mateEls = [];
                    const readPoints = {
                        Reverse: `${readX},${rowY + (readSettings.height / 2)} ${readX + 5},${rowY} ${readX + readWidth - 5},${rowY} ${readX + readWidth - 5},${rowY + readSettings.height} ${readX + 5},${rowY + readSettings.height}`,
                        Forward: `${readX},${rowY} ${readX + readWidth - 5},${rowY} ${readX + readWidth},${rowY + (readSettings.height / 2)} ${readX + readWidth - 5},${rowY + readSettings.height} ${readX},${rowY + readSettings.height}`,
                    };
                    const readPoly = SVG.addChild(bamReadGroup, "polygon", {
                        points: readPoints[readStrand],
                        stroke: readSettings.strokeColor(read),
                        "stroke-width": 1,
                        fill: readColor,
                        cursor: "pointer",
                    });
                    readEls.push(readPoly);
                    const matePoints = {
                        Reverse: `${mateX},${rowY + (mateSettings.height / 2)} ${mateX + 5},${rowY} ${mateX + mateWidth - 5},${rowY} ${mateX + mateWidth - 5},${rowY + mateSettings.height} ${mateX + 5},${rowY + mateSettings.height}`,
                        Forward: `${mateX},${rowY} ${mateX + mateWidth - 5},${rowY} ${mateX + mateWidth},${rowY + (mateSettings.height / 2)} ${mateX + mateWidth - 5},${rowY + mateSettings.height} ${mateX},${rowY + mateSettings.height}`,
                    };
                    const matePoly = SVG.addChild(bamReadGroup, "polygon", {
                        points: matePoints[mateStrand],
                        stroke: mateSettings.strokeColor(mate),
                        "stroke-width": 1,
                        fill: mateColor,
                        cursor: "pointer",
                    });
                    mateEls.push(matePoly);

                    const line = SVG.addChild(bamReadGroup, "line", {
                        x1: (readX + readWidth),
                        y1: (rowY + (readSettings.height / 2)),
                        x2: mateX,
                        y2: (rowY + (readSettings.height / 2)),
                        "stroke-width": "1",
                        stroke: "gray",
                        // "stroke-color": "black",
                        cursor: "pointer",
                    });

                    if (args.regionSize < 400) {
                        if (readDiff !== null) {
                            const readPath = SVG.addChild(bamReadGroup, "path", {
                                d: Utils.genBamVariants(readDiff, args.pixelBase, readX, rowY),
                                fill: variantColor,
                            });
                            readEls.push(readPath);
                        }
                        if (mateDiff !== null) {
                            const matePath = SVG.addChild(bamReadGroup, "path", {
                                d: Utils.genBamVariants(mateDiff, args.pixelBase, mateX, rowY),
                                fill: variantColor,
                            });
                            mateEls.push(matePath);
                        }
                    }

                    $(readEls).qtip({
                        content: { text: readSettings.tooltipText(read), title: readSettings.tooltipTitle(read) },
                        position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
                        style: { width: 280, classes: `${_this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                        show: "click",
                        hide: "click mouseleave",
                    });
                    $(readEls).click((event) => {
                        console.log(read);
                        _this.showInfoWidget({
                            query: read[readSettings.infoWidgetId],
                            feature: read,
                            featureType: read.featureType,
                            adapter: _this.trackData.adapter,
                        });
                    });
                    $(mateEls).qtip({
                        content: { text: mateSettings.tooltipText(mate), title: mateSettings.tooltipTitle(mate) },
                        position: { target: "mouse", adjust: { x: 15, y: 0 }, viewport: $(window), effect: false },
                        style: { width: 280, classes: `${_this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                        show: "click",
                        hide: "click mouseleave",
                    });
                    $(mateEls).click((event) => {
                        console.log(mate);
                        _this.showInfoWidget({
                            query: mate[mateSettings.infoWidgetId],
                            feature: mate,
                            featureType: mate.featureType,
                            adapter: _this.trackData.adapter,
                        });
                    });
                    break;
                }
                rowY += rowHeight;
                //			textY += rowHeight;
            }
        };

        /**
         * Taking an array of alignments as an input that can have any possible order, it will return an object of the form
         * {
         *  alignmentId: [read, mate] (or just [read] where no mate was found)
         * }
         * @param alignments
         */
        const pairReads = function (alignments) {
            const alignmentHash = {};
            // We build a temporal structure for faster retrieval of alignments
            for (let i = 0; i < alignments.length; i++) {
                const id = alignments[i].id;
                if (typeof alignmentHash[id] === "undefined") {
                    alignmentHash[id] = [];
                }
                alignmentHash[id].push(alignments[i]);
            }

            return alignmentHash;
        };

        const drawChunk = function (chunk) {
            drawCoverage(chunk);

            const alignments = chunk.alignments;
            if (viewAsPairs) {
                const alignmentHash = pairReads(alignments);
                const ids = Object.keys(alignmentHash);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    if (alignmentHash[id].length === 2) {
                        drawPairedReads(alignmentHash[id][0], alignmentHash[id][1]);
                    } else {
                        drawSingleRead(alignmentHash[id][0]);
                    }
                }
            } else {
                for (let i = 0; i < alignments.length; i++) {
                    drawSingleRead(alignments[i]);
                }
            }
        };

        const addChunks = function (chunk, polyDrawing) {
            drawCoverage(chunk);

            const alignments = chunk.alignments;
            if (viewAsPairs) {
                const alignmentHash = pairReads(alignments);
                const ids = Object.keys(alignmentHash);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    if (alignmentHash[id].length === 2) {
                        drawPairedReads(alignmentHash[id][0], alignmentHash[id][1]);
                    } else {
                        drawSingleRead(alignmentHash[id][0]);
                    }
                }
            } else {
                for (let i = 0; i < alignments.length; i++) {
                    addSingleRead(alignments[i], polyDrawing);
                }
            }
        };

        // This other object will contain the strings needed to build the whole polyline to draw the different rows of reads
        const polyDrawing = {};

        // process features
        if (chunkList.length > 0) {
            for (let i = 0, li = chunkList.length; i < li; i++) {
                addChunks(chunkList[i], polyDrawing);
                // drawChunk(chunkList[i]);
            }
        }

        // Remove old SVGs
        if (args.svgCanvasFeatures.childElementCount > 2) {
            args.svgCanvasFeatures.removeChild(args.svgCanvasFeatures.firstChild);
            args.svgCanvasFeatures.removeChild(args.svgCanvasFeatures.firstChild);
        }

        const addDifferencesSVG = function (svgBase, array, color) {
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
        };

        const keys = Object.keys(polyDrawing);
        for (let i = 0; i < keys.length; i++) {
            const features = args.renderedArea[keys[i]];

            const svgChild = SVG.addChild(bamReadGroup, "path", {
                d: polyDrawing[keys[i]].reads.join(" "),
                stroke: "black",
                "stroke-width": 0.5,
                fill: "lightgrey",
                cursor: "pointer",
            });

            $(svgChild).qtip({
                content: {
                    title: "",
                    text: "",
                },
                position: { target: "mouse", adjust: { x: 25, y: 15 } },
                style: { width: 300, classes: `${_this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                hide: {
                    event: "mousedown mouseup mouseleave",
                    delay: 30,
                    fixed: true,
                },
            });

            svgChild.onmouseover = function () {
                const position = _this.getFeatureX(args.trackListPanel.mousePosition, args);
                const read = features.get({ start: position, end: position }).value.feature;
                $(svgChild).qtip("option", "content.text", _this.tooltipText(read));
                $(svgChild).qtip("option", "content.title", _this.tooltipTitle(read));
            };

            // Render differences
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.A, "#009900");
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.T, "#aa0000");
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.C, "#0000ff");
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.G, "#857a00");
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.N, "#888");
            addDifferencesSVG(bamReadGroup, polyDrawing[keys[i]].differences.D, "#000");
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
                        content: { text: diff.seq, title: "Insertion" },
                        position: { target: "mouse", adjust: { x: 25, y: 15 } },
                        style: { classes: `${this.toolTipfontClass} qtip-dark qtip-shadow` },
                    });
                }
            }
        }

        console.timeEnd(`BamRender ${response.params.resource}`);
    }

    /**
     * @Deprecated
     * * */

    genBamVariants(differences, size, mainX, y) {
        const s = size / 6;
        let d = "";
        for (let i = 0; i < differences.length; i++) {
            const difference = differences[i];

            switch (difference.op) {
            case "S" :
                let x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const char = difference.seq[j];
                    switch (char) {
                    case "A" :
                        d += `M${(2.5 * s) + x},${y
                        }l-${2.5 * s},${6 * s
                        }l${s},0` +
                                    `l${0.875 * s},-${2 * s
                                    }l${2.250 * s},0` +
                                    `l${0.875 * s},${2 * s
                                    }l${s},0` +
                                    `l-${2.5 * s},-${6 * s
                                    }l-${0.5 * s},0` +
                                    `l0,${s
                                    }l${0.75 * s},${2 * s
                                    }l-${1.5 * s},0` +
                                    `l${0.75 * s},-${2 * s
                                    }l0,-${s
                                    } `;
                        break;
                    case "T" :
                        d += `M${(0.5 * s) + x},${y
                        }l0,${s
                        }l${2 * s},0` +
                                    `l0,${5 * s
                                    }l${s},0` +
                                    `l0,-${5 * s
                                    }l${2 * s},0` +
                                    `l0,-${s
                                    } `;
                        break;
                    case "C" :
                        d += `M${(5 * s) + x},${(0 * s) + y
                        }l-${2 * s},0` +
                                    `l-${1.5 * s},${0.5 * s
                                    }l-${0.5 * s},${1.5 * s
                                    }l0,${2 * s
                                    }l${0.5 * s},${1.5 * s
                                    }l${1.5 * s},${0.5 * s
                                    }l${2 * s},0` +
                                    `l0,-${s
                                    }l-${2 * s},0` +
                                    `l-${0.75 * s},-${0.25 * s
                                    }l-${0.25 * s},-${0.75 * s
                                    }l0,-${2 * s
                                    }l${0.25 * s},-${0.75 * s
                                    }l${0.75 * s},-${0.25 * s
                                    }l${2 * s},0` +
                                    " ";
                        break;
                    case "G" :
                        d += `M${(5 * s) + x},${(0 * s) + y
                        }l-${2 * s},0` +
                                    `l-${1.5 * s},${0.5 * s
                                    }l-${0.5 * s},${1.5 * s
                                    }l0,${2 * s
                                    }l${0.5 * s},${1.5 * s
                                    }l${1.5 * s},${0.5 * s
                                    }l${2 * s},0` +
                                    `l0,-${3 * s
                                    }l-${s},0` +
                                    `l0,${2 * s
                                    }l-${s},0` +
                                    `l-${0.75 * s},-${0.25 * s
                                    }l-${0.25 * s},-${0.75 * s
                                    }l0,-${2 * s
                                    }l${0.25 * s},-${0.75 * s
                                    }l${0.75 * s},-${0.25 * s
                                    }l${2 * s},0` +
                                    " ";
                        //                d += "M" + ((5 * s) + x) + "," + ((0 * s) + y) +
                        //                    "l-" + (2 * s) + ",0" +
                        //                    "l-" + (2 * s) + "," + (2 * s) +
                        //                    "l0," + (2 * s) +
                        //                    "l" + (2 * s) + "," + (2 * s) +
                        //                    "l" + (2 * s) + ",0" +
                        //                    "l0,-" + (3 * s) +
                        //                    "l-" + (1 * s) + ",0" +
                        //                    "l0," + (2 * s) +
                        //                    "l-" + (0.5 * s) + ",0" +
                        //                    "l-" + (1.5 * s) + ",-" + (1.5 * s) +
                        //                    "l0,-" + (1 * s) +
                        //                    "l" + (1.5 * s) + ",-" + (1.5 * s) +
                        //                    "l" + (1.5 * s) + ",0" +
                        //                    " ";
                        break;
                    case "N" :
                        d += `M${(0.5 * s) + x},${(0 * s) + y
                        }l0,${6 * s
                        }l${s},0` +
                                    `l0,-${4.5 * s
                                    }l${3 * s},${4.5 * s
                                    }l${s},0` +
                                    `l0,-${6 * s
                                    }l-${s},0` +
                                    `l0,${4.5 * s
                                    }l-${3 * s},-${4.5 * s
                                    } `;
                        break;
                    case "d" :
                        d += `M${(0 * s) + x},${(2.5 * s) + y
                        }l${6 * s},0` +
                                    `l0,${s
                                    }l-${6 * s},0` +
                                    `l0,-${s
                                    } `;
                        break;
                    default:
                        d += "M0,0";
                        break;
                    }
                    x += size;
                }
                break;
            }
        }

        return d;
    }

    drawBamDifferences(differences, size, mainX, y) {
        const text = SVG.create("text", {
            x: mainX,
            y,
            class: "ocb-font-ubuntumono ocb-font-size-15",
        });
        for (let i = 0; i < differences.length; i++) {
            const difference = differences[i];

            let x;
            switch (difference.op) {
            // M 0 alignment match (can be a sequence match or mismatch)
            // I 1 insertion to the reference
            // D 2 deletion from the reference
            // N 3 skipped region from the reference
            // S 4 soft clipping (clipped sequences present in SEQ)
            // H 5 hard clipping (clipped sequences NOT present in SEQ)
            // P 6 padding (silent deletion from padded reference)
            //= 7 sequence match
            // X 8 sequence mismatch

            case "I" :
                x = mainX + (size * difference.pos) - size / 2;
                const t = SVG.addChild(text, "tspan", {
                    x,
                    "font-weight": "bold",
                    textLength: size,
                });
                t.textContent = "·";
                $(t).qtip({
                    content: { text: difference.seq, title: "Insertion" },
                    position: { target: "mouse", adjust: { x: 25, y: 15 } },
                    style: { classes: `${this.toolTipfontClass} qtip-dark qtip-shadow` },
                });
                break;
            case "D" :
                x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const t = SVG.addChild(text, "tspan", {
                        x,
                        "font-weight": "bold",
                        textLength: size,
                    });
                    t.textContent = "—";
                    x += size;
                }
                break;
            case "N" :
                x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const t = SVG.addChild(text, "tspan", {
                        x,
                        fill: "#888",
                        textLength: size,
                    });
                    t.textContent = "—";
                    x += size;
                }
                break;
            case "S" :
                x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const char = difference.seq[j];
                    const t = SVG.addChild(text, "tspan", {
                        x,
                        fill: "#aaa",
                        textLength: size,
                    });
                    t.textContent = char;
                    x += size;
                }
                break;
            case "H" :
                x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const t = SVG.addChild(text, "tspan", {
                        x,
                        fill: "#aaa",
                        textLength: size,
                    });
                    t.textContent = "H";
                    x += size;
                }
                break;
            case "X" :
            case "M" :
                x = mainX + (size * difference.pos);
                for (let j = 0; j < difference.length; j++) {
                    const char = difference.seq[j];
                    const refPos = difference.pos + j;
                    // console.log("ref:"+ refString.charAt(refPos)+" - "+"seq:"+char);

                    const t = SVG.addChild(text, "tspan", {
                        x,
                        fill: SEQUENCE_COLORS[char],
                        textLength: size,
                    });
                    t.textContent = char;

                    x += size;
                }
                break;
            }
        }

        return text;
    }

    // AlignmentRenderer.drawBamDifferences = function (refString, differences, size, mainX, y) {
    //     let text = SVG.create("text", {
    //         "x": mainX,
    //         "y": y - 2,
    //         "class": 'ocb-font-ubuntumono ocb-font-size-15'
    //     });
    //     for (var i = 0; i < differences.length; i++) {
    //         var difference = differences[i];
    //
    //         switch (difference.op) {
    //             // M 0 alignment match (can be a sequence match or mismatch)
    //             // I 1 insertion to the reference
    //             // D 2 deletion from the reference
    //             // N 3 skipped region from the reference
    //             // S 4 soft clipping (clipped sequences present in SEQ)
    //             // H 5 hard clipping (clipped sequences NOT present in SEQ)
    //             //P 6 padding (silent deletion from padded reference)
    //             //= 7 sequence match
    //             // X 8 sequence mismatch
    //
    //             case "I" :
    //                 var x = mainX + (size * difference.pos) - size / 2;
    //                 var t = SVG.addChild(text, "tspan", {
    //                     "x": x,
    //                     "font-weight": 'bold',
    //                     "textLength": size
    //                 });
    //                 t.textContent = '·';
    //                 $(t).qtip({
    //                     content: {text: difference.seq, title: 'Insertion'},
    //                     position: {target: "mouse", adjust: {x: 25, y: 15}},
    //                     style: {classes: this.toolTipfontClass + ' qtip-dark qtip-shadow'}
    //                 });
    //                 break;
    //             case "D" :
    //                 var x = mainX + (size * difference.pos);
    //                 for (var j = 0; j < difference.length; j++) {
    //                     var t = SVG.addChild(text, "tspan", {
    //                         "x": x,
    //                         "font-weight": 'bold',
    //                         "textLength": size
    //                     });
    //                     t.textContent = '—';
    //                     x += size;
    //                 }
    //                 break;
    //             case "N" :
    //                 var x = mainX + (size * difference.pos);
    //                 for (var j = 0; j < difference.length; j++) {
    //                     var t = SVG.addChild(text, "tspan", {
    //                         "x": x,
    //                         "fill": "#888",
    //                         "textLength": size
    //                     });
    //                     t.textContent = '—';
    //                     x += size;
    //                 }
    //                 break;
    //             case "S" :
    //                 var x = mainX + (size * difference.pos);
    //                 for (var j = 0; j < difference.length; j++) {
    //                     var char = difference.seq[j];
    //                     var t = SVG.addChild(text, "tspan", {
    //                         "x": x,
    //                         "fill": "#aaa",
    //                         "textLength": size
    //                     });
    //                     t.textContent = char;
    //                     x += size;
    //                 }
    //                 break;
    //             case "H" :
    //                 var x = mainX + (size * difference.pos);
    //                 for (var j = 0; j < difference.length; j++) {
    //                     var t = SVG.addChild(text, "tspan", {
    //                         "x": x,
    //                         "fill": "#aaa",
    //                         "textLength": size
    //                     });
    //                     t.textContent = 'H';
    //                     x += size;
    //                 }
    //                 break;
    //             case "X" :
    //             case "M" :
    //                 var x = mainX + (size * difference.pos);
    //                 for (var j = 0; j < difference.length; j++) {
    //                     var char = difference.seq[j];
    //                     var refPos = difference.pos + j;
    //                     // console.log("ref:"+ refString.charAt(refPos)+" - "+"seq:"+char);
    //                     if (char != refString.charAt(refPos)) {
    //                         var t = SVG.addChild(text, "tspan", {
    //                             "x": x,
    //                             "fill": SEQUENCE_COLORS[char],
    //                             "textLength": size
    //                         });
    //                         t.textContent = char;
    //                     }
    //                     x += size;
    //                 }
    //                 break;
    //         }
    //
    //     }
    //
    //     return text;
    // };

    _getReferenceString(chunks, region) {
        const sequenceItems = [];
        let chunk;
        for (let i = 0; i < chunks.length; i++) {
            chunk = chunks[i];
            for (let j = 0; j < chunk.value.length; j++) {
                sequenceItems.push(chunk.value[j]);
            }
        }
        sequenceItems.sort((a, b) => a.start - b.start);
        const aux = [];
        const s = sequenceItems[0].start;
        const e = sequenceItems[sequenceItems.length - 1].end;
        for (let i = 0; i < sequenceItems.length; i++) {
            aux.push(sequenceItems[i].sequence);
        }
        const str = aux.join("");
        const i1 = region.start - s;
        const i2 = i1 + region.length();
        const substr = str.substring(i1, i2);

        return substr;
    }
}
