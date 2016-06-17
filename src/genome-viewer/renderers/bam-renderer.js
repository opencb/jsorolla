/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

//any item with chromosome start end
BamRenderer.prototype = new Renderer({});

function BamRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-roboto ocb-font-size-11';
    this.toolTipfontClass = 'ocb-tooltip-font';

    if (_.isObject(args)) {
        _.extend(this, args);
    } else {
        _.extend(this, FEATURE_TYPES.bam)
    }

    this.on(this.handlers);
};

BamRenderer.prototype.render = function (response, args) {
    var _this = this;

    var sequenceDataAdapter = args.trackListPanel.getSequenceTrack().dataAdapter;
    var variantColor = "orangered";
    var chunkList = args.cacheItems;
    var viewAsPairs = false;

    var bamCoverGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
        "class": "bamCoverage",
        "cursor": "pointer"
    });
    var bamReadGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
        "class": "bamReads",
        "cursor": "pointer"
    });

    var drawCoverage = function (chunk) {
        //TODO !!! INSERTIONS AND DELETIONS NOT CONTEMPLED
        var cs = chunk.region.start;
        var ce = chunk.region.end;
        var cl = new Region(chunk.region).length();
        var reads = chunk.value;

        var coverageListA = Array.apply(null, Array(cl)).map(Number.prototype.valueOf, 0);
        var coverageListC = Array.apply(null, Array(cl)).map(Number.prototype.valueOf, 0);
        var coverageListG = Array.apply(null, Array(cl)).map(Number.prototype.valueOf, 0);
        var coverageListT = Array.apply(null, Array(cl)).map(Number.prototype.valueOf, 0);
        var coverageList = Array.apply(null, Array(cl)).map(Number.prototype.valueOf, 0);
        for (var i = 0; i < reads.length; i++) {
            var read = reads[i];
            BamRenderer._processRead(read);
            for (var j = 0; j < read.SEQ.length; j++) {
                var seqPos = parseInt(read.POS) + j;
                if (seqPos >= cs && seqPos <= ce) {
                    coverageList[seqPos - cs]++;
                    switch (read.SEQ[j]) {
                    case "A":
                        coverageListA[seqPos - cs]++;
                        break;
                    case "C":
                        coverageListC[seqPos - cs]++;
                        break;
                    case "G":
                        coverageListG[seqPos - cs]++;
                        break;
                    case "T":
                        coverageListT[seqPos - cs]++;
                        break;
                    }
                }
            }
        }
        var pixelWidth = cl * args.pixelBase;

        var middle = args.width / 2;
        var points = "",
            pointsA = "",
            pointsC = "",
            pointsG = "",
            pointsT = "";
        var baseMid = (args.pixelBase / 2) - 0.5; //4.5 cuando pixelBase = 10

        var x, y, p = parseInt(cs);
        var lineA = "",
            lineC = "",
            lineG = "",
            lineT = "";
        var coverageNorm = 200,
            covHeight = 50;
        for (var i = 0; i < coverageList.length; i++) {
            //x = _this.pixelPosition+middle-((_this.position-p)*_this.pixelBase)+baseMid;
            x = args.pixelPosition + middle - ((args.position - p) * args.pixelBase);
            xx = args.pixelPosition + middle - ((args.position - p) * args.pixelBase) + args.pixelBase;

            lineA += x + "," + coverageListA[i] / coverageNorm * covHeight + " ";
            lineA += xx + "," + coverageListA[i] / coverageNorm * covHeight + " ";
            lineC += x + "," + (coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
            lineC += xx + "," + (coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
            lineG += x + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
            lineG += xx + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
            lineT += x + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
            lineT += xx + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";

            p++;
        }

        //Use reverse to draw the polylines(polygons) for each nucleotid
        var rlineC = lineC.split(" ").reverse().join(" ").trim();
        var rlineG = lineG.split(" ").reverse().join(" ").trim();
        var rlineT = lineT.split(" ").reverse().join(" ").trim();

        var firstPoint = args.pixelPosition + middle - ((args.position - parseInt(cs)) * args.pixelBase) + baseMid;
        var lastPoint = args.pixelPosition + middle - ((args.position - parseInt(ce)) * args.pixelBase) + baseMid;

        var polA = SVG.addChild(bamCoverGroup, "polyline", {
            "points": firstPoint + ",0 " + lineA + lastPoint + ",0",
            //"opacity":"1",
            //"stroke-width":"1",
            //"stroke":"gray",
            "fill": "green"
        });
        var polC = SVG.addChild(bamCoverGroup, "polyline", {
            "points": lineA + " " + rlineC,
            //"opacity":"1",
            //"stroke-width":"1",
            //"stroke":"black",
            "fill": "blue"
        });
        var polG = SVG.addChild(bamCoverGroup, "polyline", {
            "points": lineC + " " + rlineG,
            //"opacity":"1",
            //"stroke-width":"1",
            //"stroke":"black",
            "fill": "gold"
        });
        var polT = SVG.addChild(bamCoverGroup, "polyline", {
            "points": lineG + " " + rlineT,
            //"opacity":"1",
            //"stroke-width":"1",
            //"stroke":"black",
            "fill": "red"
        });

        var dummyRect = SVG.addChild(bamCoverGroup, "rect", {
            "x": args.pixelPosition + middle - ((args.position - cs) * args.pixelBase),
            "y": 0,
            "width": pixelWidth,
            "height": covHeight,
            "opacity": "0.5",
            "fill": "lightgray",
            "cursor": "pointer"
        });

        $(dummyRect).qtip({
            content: " ",
            position: {
                target: 'mouse',
                adjust: {
                    x: 15,
                    y: 0
                },
                viewport: $(window),
                effect: false
            },
            style: {
                width: true,
                classes: _this.toolTipfontClass + ' ui-tooltip-shadow'
            },
            show: {
                delay: 300
            },
            hide: {
                delay: 300
            }
        });

        args.trackListPanel.on('mousePosition:change', function (e) {
            var pos = e.mousePos - parseInt(cs);
            //if(coverageList[pos]!=null){
            var str = 'depth: <span class="ssel">' + coverageList[pos] + '</span><br>' +
                '<span style="color:green">A</span>: <span class="ssel">' + coverageListA[pos] + '</span><br>' +
                '<span style="color:blue">C</span>: <span class="ssel">' + coverageListC[pos] + '</span><br>' +
                '<span style="color:darkgoldenrod">G</span>: <span class="ssel">' + coverageListG[pos] + '</span><br>' +
                '<span style="color:red">T</span>: <span class="ssel">' + coverageListT[pos] + '</span><br>';
            $(dummyRect).qtip('option', 'content.text', str);
            //}
        });
    };

    var drawSingleRead = function (feature) {
        var start = feature.start;
        // var start = feature.unclippedStart;
        var end = feature.end;
        // var end = feature.unclippedEnd;
        // if (feature.end == 0) {
        //     end = start + feature.length - 1;
        // }
        var length = (end - start) + 1;

        //get feature render configuration
        var color = _.isFunction(_this.color) ? _this.color(feature, args.region.chromosome) : _this.color;
        var strokeColor = _.isFunction(_this.strokeColor) ? _this.strokeColor(feature, args.region.chromosome) : _this.strokeColor;
        var label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
        var height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
        var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
        var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
        var strand = _.isFunction(_this.strand) ? _this.strand(feature) : _this.strand;
        var mateUnmappedFlag = _.isFunction(_this.mateUnmappedFlag) ? _this.mateUnmappedFlag(feature) : _this.mateUnmappedFlag;
        var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

        // TODO CHECK
        // if (insertSizeMin != 0 && insertSizeMax != 0 && !mateUnmappedFlag) {
        //     if (Math.abs(feature.inferredInsertSize) > insertSizeMax) {
        //         color = 'maroon';
        //     }
        //     if (Math.abs(feature.inferredInsertSize) < insertSizeMin) {
        //         color = 'navy';
        //     }
        // }

        //transform to pixel position
        var width = length * args.pixelBase;
        //calculate x to draw svg rect
        var x = _this.getFeatureX(start, args);
        //		try{
        //			var maxWidth = Math.max(width, /*settings.getLabel(feature).length*8*/0); //XXX cuidado : text.getComputedTextLength()
        //		}catch(e){
        //			var maxWidth = 72;
        //		}
        maxWidth = width;
        //if(length <0){
        //    debugger
        //}
        // console.log(length + ' in px: ' + width);

        var rowHeight = 16;
        var rowY = 70;
        //		var textY = 12+settings.height;
        while (true) {
            if (args.renderedArea[rowY] == null) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var enc = args.renderedArea[rowY].add({
                start: x,
                end: x + maxWidth - 1
            });
            if (enc) {
                var featureGroup = SVG.addChild(bamReadGroup, "g", {
                    'feature_id': feature.QNAME
                });
                var points = {
                    "Reverse": x + "," + (rowY + (height / 2)) + " " + (x + 5) + "," + rowY + " " + (x + width) + "," + rowY + " " + (x + width) + "," + (rowY + height) + " " + (x + 5) + "," + (rowY + height),
                    "Forward": (x - 1) + "," + rowY + " " + (x + width - 5) + "," + rowY + " " + (x + width) + "," + (rowY + (height / 2)) + " " + (x + width - 5) + "," + (rowY + height) + " " + (x - 1) + "," + (rowY + height)
                }
                var poly = SVG.addChild(featureGroup, "polygon", {
                    "points": points[strand],
                    "stroke": color,
                    "stroke-width": 1,
                    "fill": color,
                    "cursor": "pointer"
                });

                $(featureGroup).qtip({
                    content: {
                        text: tooltipText,
                        title: tooltipTitle
                    },
                    position: {
                        target: "mouse",
                        viewport: $(window),
                        adjust: {
                            x: 25,
                            y: 15
                        }
                    },
                    style: {
                        width: 300,
                        classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'
                    },
                    show: 'mouseenter',
                    hide: 'mousedown mouseup mouseleave'
                });

                featureGroup.addEventListener('click', function (event) {
                    console.log(feature);
                    _this.trigger('feature:click', {
                        query: feature[infoWidgetId],
                        feature: feature,
                        featureType: feature.featureType,
                        clickEvent: event
                    })
                });

                //var rect = SVG.addChild(featureGroup,"rect",{
                //"x":x+offset[strand],
                //"y":rowY,
                //"width":width-4,
                //"height":settings.height,
                //"stroke": "white",
                //"stroke-width":1,
                //"fill": color,
                //"clip-path":"url(#"+_this.id+"cp)",
                //"fill": 'url(#'+_this.id+'bamStrand'+strand+')',
                //});
                //readEls.push(rect);

                //PROCESS differences
                if (feature.differences != null && args.regionSize < 400) {
                    var region = new Region({
                        chromosome: args.region.chromosome,
                        start: start,
                        end: end
                    });
                    sequenceDataAdapter.getData({
                        region: region,
                        done: function (event) {
                            var referenceString = BamRenderer._getReferenceString(event.items, region);
                            featureGroup.appendChild(BamRenderer.drawBamDifferences(referenceString, feature.differences, args.pixelBase, x, rowY + height));
                        }
                    });
                }
                break;
            }
            rowY += rowHeight;
            //			textY += rowHeight;
        }
    };

    var drawPairedReads = function (read, mate) {
        var readStart = read.unclippedStart;
        var readEnd = read.unclippedEnd;
        var mateStart = mate.unclippedStart;
        var mateEnd = mate.unclippedEnd;
        var readDiff = read.diff;
        var mateDiff = mate.diff;
        /*get type settings object*/
        var readSettings = _this.types[read.featureType];
        var mateSettings = _this.types[mate.featureType];
        var readColor = readSettings.getColor(read, _this.region.chromosome);
        var mateColor = mateSettings.getColor(mate, _this.region.chromosome);
        var readStrand = readSettings.getStrand(read);
        var matestrand = mateSettings.getStrand(mate);

        if (insertSizeMin != 0 && insertSizeMax != 0) {
            if (Math.abs(read.inferredInsertSize) > insertSizeMax) {
                readColor = 'maroon';
                mateColor = 'maroon';
            }
            if (Math.abs(read.inferredInsertSize) < insertSizeMin) {
                readColor = 'navy';
                mateColor = 'navy';
            }
        }

        var pairStart = readStart;
        var pairEnd = mateEnd;
        if (mateStart <= readStart) {
            pairStart = mateStart;
        }
        if (readEnd >= mateEnd) {
            pairEnd = readEnd;
        }

        /*transform to pixel position*/
        var pairWidth = ((pairEnd - pairStart) + 1) * _this.pixelBase;
        var pairX = _this.pixelPosition + middle - ((_this.position - pairStart) * _this.pixelBase);

        var readWidth = ((readEnd - readStart) + 1) * _this.pixelBase;
        var readX = _this.pixelPosition + middle - ((_this.position - readStart) * _this.pixelBase);

        var mateWidth = ((mateEnd - mateStart) + 1) * _this.pixelBase;
        var mateX = _this.pixelPosition + middle - ((_this.position - mateStart) * _this.pixelBase);

        var rowHeight = 12;
        var rowY = 70;
        //		var textY = 12+settings.height;

        while (true) {
            if (args.renderedArea[rowY] == null) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var enc = args.renderedArea[rowY].add({
                start: pairX,
                end: pairX + pairWidth - 1
            });
            if (enc) {
                var readEls = [];
                var mateEls = [];
                var readPoints = {
                    "Reverse": readX + "," + (rowY + (readSettings.height / 2)) + " " + (readX + 5) + "," + rowY + " " + (readX + readWidth - 5) + "," + rowY + " " + (readX + readWidth - 5) + "," + (rowY + readSettings.height) + " " + (readX + 5) + "," + (rowY + readSettings.height),
                    "Forward": readX + "," + rowY + " " + (readX + readWidth - 5) + "," + rowY + " " + (readX + readWidth) + "," + (rowY + (readSettings.height / 2)) + " " + (readX + readWidth - 5) + "," + (rowY + readSettings.height) + " " + readX + "," + (rowY + readSettings.height)
                }
                var readPoly = SVG.addChild(bamReadGroup, "polygon", {
                    "points": readPoints[readStrand],
                    "stroke": readSettings.getStrokeColor(read),
                    "stroke-width": 1,
                    "fill": readColor,
                    "cursor": "pointer"
                });
                readEls.push(readPoly);
                var matePoints = {
                    "Reverse": mateX + "," + (rowY + (mateSettings.height / 2)) + " " + (mateX + 5) + "," + rowY + " " + (mateX + mateWidth - 5) + "," + rowY + " " + (mateX + mateWidth - 5) + "," + (rowY + mateSettings.height) + " " + (mateX + 5) + "," + (rowY + mateSettings.height),
                    "Forward": mateX + "," + rowY + " " + (mateX + mateWidth - 5) + "," + rowY + " " + (mateX + mateWidth) + "," + (rowY + (mateSettings.height / 2)) + " " + (mateX + mateWidth - 5) + "," + (rowY + mateSettings.height) + " " + mateX + "," + (rowY + mateSettings.height)
                }
                var matePoly = SVG.addChild(bamReadGroup, "polygon", {
                    "points": matePoints[matestrand],
                    "stroke": mateSettings.getStrokeColor(mate),
                    "stroke-width": 1,
                    "fill": mateColor,
                    "cursor": "pointer"
                });
                mateEls.push(matePoly);

                var line = SVG.addChild(bamReadGroup, "line", {
                    "x1": (readX + readWidth),
                    "y1": (rowY + (readSettings.height / 2)),
                    "x2": mateX,
                    "y2": (rowY + (readSettings.height / 2)),
                    "stroke-width": "1",
                    "stroke": "gray",
                    //"stroke-color": "black",
                    "cursor": "pointer"
                });

                if (args.regionSize < 400) {
                    if (readDiff != null) {
                        var readPath = SVG.addChild(bamReadGroup, "path", {
                            "d": Utils.genBamVariants(readDiff, _this.pixelBase, readX, rowY),
                            "fill": variantColor
                        });
                        readEls.push(readPath);
                    }
                    if (mateDiff != null) {
                        var matePath = SVG.addChild(bamReadGroup, "path", {
                            "d": Utils.genBamVariants(mateDiff, _this.pixelBase, mateX, rowY),
                            "fill": variantColor
                        });
                        mateEls.push(matePath);
                    }
                }

                $(readEls).qtip({
                    content: {
                        text: readSettings.getTipText(read),
                        title: readSettings.getTipTitle(read)
                    },
                    position: {
                        target: "mouse",
                        adjust: {
                            x: 15,
                            y: 0
                        },
                        viewport: $(window),
                        effect: false
                    },
                    style: {
                        width: 280,
                        classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'
                    },
                    show: 'click',
                    hide: 'click mouseleave'
                });
                $(readEls).click(function (event) {
                    console.log(read);
                    _this.showInfoWidget({
                        query: read[readSettings.infoWidgetId],
                        feature: read,
                        featureType: read.featureType,
                        adapter: _this.trackData.adapter
                    });
                });
                $(mateEls).qtip({
                    content: {
                        text: mateSettings.getTipText(mate),
                        title: mateSettings.getTipTitle(mate)
                    },
                    position: {
                        target: "mouse",
                        adjust: {
                            x: 15,
                            y: 0
                        },
                        viewport: $(window),
                        effect: false
                    },
                    style: {
                        width: 280,
                        classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'
                    },
                    show: 'click',
                    hide: 'click mouseleave'
                });
                $(mateEls).click(function (event) {
                    console.log(mate);
                    _this.showInfoWidget({
                        query: mate[mateSettings.infoWidgetId],
                        feature: mate,
                        featureType: mate.featureType,
                        adapter: _this.trackData.adapter
                    });
                });
                break;
            }
            rowY += rowHeight;
            //			textY += rowHeight;
        }
    };

    var drawChunk = function (chunk) {
        drawCoverage(chunk);
        var reads = chunk.value;
        for (var i = 0, li = reads.length; i < li; i++) {
            var read = reads[i];
            if (viewAsPairs) {
                var nextRead = reads[i + 1];
                if (nextRead != null) {
                    if (read.QNAME == nextRead.QNAME) {
                        drawPairedReads(read, nextRead);
                        i++;
                    } else {
                        drawSingleRead(read);
                    }
                }
            } else {
                drawSingleRead(read);
            }
        }
    };

    //process features
    if (chunkList.length > 0) {
        for (var i = 0, li = chunkList.length; i < li; i++) {
            var chunk = chunkList[i];
            drawChunk(chunk);
        }
        //        var newHeight = Object.keys(this.renderedArea).length * 24;
        //        if (newHeight > 0) {
        //            this.setHeight(newHeight + /*margen entre tracks*/10 + 70);
        //        }
        //TEST
        //        this.setHeight(200);
    }
    // console.timeEnd("BamRender " + response.params.resource);
};

BamRenderer._processRead = function (read) {
    // Sum of lengths of the M/I/S/=/X operations shall equal the length of SEQ.

    var enableSoftClipping = true;

    var readPos = parseInt(read.POS);
    var start = readPos;
    var end = readPos;

    var cigarList = read.CIGAR.match(/[0-9]+[MIDNSHPX=]/g);
    var differences = [];
    if (cigarList != null) {
        var seqIndex = 0;
        var posIndex = 0;
        for (var i = 0; i < cigarList.length; i++) {
            var cigar = cigarList[i];
            var op = cigar.match(/[MIDNSHPX=]/)[0];
            var len = parseInt(cigar.replace(op, ''));
            var pos, seq;

            switch (op) {
            case "H":
                break;
            case "D":
            case "N":
                seq = "";
                pos = posIndex;
                posIndex += len;

                end += len;
                break;
            case "S":
                seq = read.SEQ.substr(seqIndex, len);
                seqIndex += len;
                if (i == (cigarList.length - 1)) {
                    pos = posIndex;
                } else {
                    pos = posIndex - len;
                }
                break;
            case "I":
                seq = read.SEQ.substr(seqIndex, len);
                seqIndex += len;
                pos = posIndex;

                end += len;
                break
            case "M":
            case "=":
            case "X":
                seq = read.SEQ.substr(seqIndex, len);
                pos = posIndex;
                posIndex += len;
                seqIndex += len;

                end += len;
                break;
            }
            differences.push({
                op: op,
                pos: pos,
                seq: seq,
                length: len
            });
        }
    }

    read.chromosome = read.RNAME;
    read.start = start;
    read.end = end - 1;
    read.differences = differences;
};

BamRenderer.drawBamDifferences = function (refString, differences, size, mainX, y) {
    var text = SVG.create("text", {
        "x": mainX,
        "y": y - 2,
        "class": 'ocb-font-ubuntumono ocb-font-size-15'
    });
    for (var i = 0; i < differences.length; i++) {
        var difference = differences[i];

        switch (difference.op) {
            // M 0 alignment match (can be a sequence match or mismatch)
            // I 1 insertion to the reference
            // D 2 deletion from the reference
            // N 3 skipped region from the reference
            // S 4 soft clipping (clipped sequences present in SEQ)
            // H 5 hard clipping (clipped sequences NOT present in SEQ)
            //P 6 padding (silent deletion from padded reference)
            //= 7 sequence match
            // X 8 sequence mismatch

        case "I":
            var x = mainX + (size * difference.pos) - size / 2;
            var t = SVG.addChild(text, "tspan", {
                "x": x,
                "font-weight": 'bold',
                "textLength": size
            });
            t.textContent = '· ';
            $(t).qtip({
                content: {
                    text: difference.seq,
                    title: 'Insertion'
                },
                position: {
                    target: "mouse",
                    viewport: $(window),
                    adjust: {
                        x: 25,
                        y: 15
                    }
                },
                style: {
                    classes: this.toolTipfontClass + ' qtip-dark qtip-shadow'
                }
            });
            break;
        case "D":
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var t = SVG.addChild(text, "tspan", {
                    "x": x,
                    "font-weight": 'bold',
                    "textLength": size
                });
                t.textContent = '—';
                x += size;
            }
            break;
        case "N":
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var t = SVG.addChild(text, "tspan", {
                    "x": x,
                    "fill": "#888",
                    "textLength": size
                });
                t.textContent = '—';
                x += size;
            }
            break;
        case "S":
            break; // clipping disabled
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var char = difference.seq[j];
                var t = SVG.addChild(text, "tspan", {
                    "x": x,
                    "fill": "#aaa",
                    "textLength": size
                });
                t.textContent = char;
                x += size;
            }
            break;
        case "H":
            break; // clipping disabled
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var t = SVG.addChild(text, "tspan", {
                    "x": x,
                    "fill": "#aaa",
                    "textLength": size
                });
                t.textContent = 'H';
                x += size;
            }
            break;
        case "X":
        case "=":
        case "M":
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var char = difference.seq[j];
                var refPos = difference.pos + j;
                // console.log("ref:"+ refString.charAt(refPos)+" - "+"seq:"+char);
                if (char != refString.charAt(refPos)) {
                    var t = SVG.addChild(text, "tspan", {
                        "x": x,
                        "fill": SEQUENCE_COLORS[char],
                        "textLength": size
                    });
                    t.textContent = char;
                }
                x += size;
            }
            break;
        }

    }

    return text;
};

BamRenderer._getReferenceString = function (chunks, region) {
    var sequenceItems = [];
    var chunk;
    for (var i = 0; i < chunks.length; i++) {
        chunk = chunks[i];
        for (var j = 0; j < chunk.value.length; j++) {
            sequenceItems.push(chunk.value[j]);
        }
    }
    sequenceItems.sort(function (a, b) {
        return a.start - b.start;
    });
    var aux = [];
    var s = sequenceItems[0].start;
    var e = sequenceItems[sequenceItems.length - 1].end;
    for (var i = 0; i < sequenceItems.length; i++) {
        aux.push(sequenceItems[i].sequence);
    }
    var str = aux.join("");
    var i1 = region.start - s;
    var i2 = i1 + region.length();
    var substr = str.substring(i1, i2);

    return substr;
};

/**
 * @Deprecated
 * **/
BamRenderer.genBamVariants = function (differences, size, mainX, y) {

    var s = size / 6;
    var d = "";
    for (var i = 0; i < differences.length; i++) {
        var difference = differences[i];

        switch (difference.op) {
        case "S":
            var x = mainX + (size * difference.pos);
            for (var j = 0; j < difference.length; j++) {
                var char = difference.seq[j];
                switch (char) {
                case "A":
                    d += "M" + ((2.5 * s) + x) + "," + (y) +
                        "l-" + (2.5 * s) + "," + (6 * s) +
                        "l" + s + ",0" +
                        "l" + (0.875 * s) + ",-" + (2 * s) +
                        "l" + (2.250 * s) + ",0" +
                        "l" + (0.875 * s) + "," + (2 * s) +
                        "l" + s + ",0" +
                        "l-" + (2.5 * s) + ",-" + (6 * s) +
                        "l-" + (0.5 * s) + ",0" +
                        "l0," + s +
                        "l" + (0.75 * s) + "," + (2 * s) +
                        "l-" + (1.5 * s) + ",0" +
                        "l" + (0.75 * s) + ",-" + (2 * s) +
                        "l0,-" + s +
                        " ";
                    break;
                case "T":
                    d += "M" + ((0.5 * s) + x) + "," + (y) +
                        "l0," + s +
                        "l" + (2 * s) + ",0" +
                        "l0," + (5 * s) +
                        "l" + s + ",0" +
                        "l0,-" + (5 * s) +
                        "l" + (2 * s) + ",0" +
                        "l0,-" + s +
                        " ";
                    break;
                case "C":
                    d += "M" + ((5 * s) + x) + "," + ((0 * s) + y) +
                        "l-" + (2 * s) + ",0" +
                        "l-" + (1.5 * s) + "," + (0.5 * s) +
                        "l-" + (0.5 * s) + "," + (1.5 * s) +
                        "l0," + (2 * s) +
                        "l" + (0.5 * s) + "," + (1.5 * s) +
                        "l" + (1.5 * s) + "," + (0.5 * s) +
                        "l" + (2 * s) + ",0" +
                        "l0,-" + s +
                        "l-" + (2 * s) + ",0" +
                        "l-" + (0.75 * s) + ",-" + (0.25 * s) +
                        "l-" + (0.25 * s) + ",-" + (0.75 * s) +
                        "l0,-" + (2 * s) +
                        "l" + (0.25 * s) + ",-" + (0.75 * s) +
                        "l" + (0.75 * s) + ",-" + (0.25 * s) +
                        "l" + (2 * s) + ",0" +
                        " ";
                    break;
                case "G":
                    d += "M" + ((5 * s) + x) + "," + ((0 * s) + y) +
                        "l-" + (2 * s) + ",0" +
                        "l-" + (1.5 * s) + "," + (0.5 * s) +
                        "l-" + (0.5 * s) + "," + (1.5 * s) +
                        "l0," + (2 * s) +
                        "l" + (0.5 * s) + "," + (1.5 * s) +
                        "l" + (1.5 * s) + "," + (0.5 * s) +
                        "l" + (2 * s) + ",0" +
                        "l0,-" + (3 * s) +
                        "l-" + (s) + ",0" +
                        "l0," + (2 * s) +
                        "l-" + (s) + ",0" +
                        "l-" + (0.75 * s) + ",-" + (0.25 * s) +
                        "l-" + (0.25 * s) + ",-" + (0.75 * s) +
                        "l0,-" + (2 * s) +
                        "l" + (0.25 * s) + ",-" + (0.75 * s) +
                        "l" + (0.75 * s) + ",-" + (0.25 * s) +
                        "l" + (2 * s) + ",0" +
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
                case "N":
                    d += "M" + ((0.5 * s) + x) + "," + ((0 * s) + y) +
                        "l0," + (6 * s) +
                        "l" + s + ",0" +
                        "l0,-" + (4.5 * s) +
                        "l" + (3 * s) + "," + (4.5 * s) +
                        "l" + s + ",0" +
                        "l0,-" + (6 * s) +
                        "l-" + s + ",0" +
                        "l0," + (4.5 * s) +
                        "l-" + (3 * s) + ",-" + (4.5 * s) +
                        " ";
                    break;
                case "d":
                    d += "M" + ((0 * s) + x) + "," + ((2.5 * s) + y) +
                        "l" + (6 * s) + ",0" +
                        "l0," + (s) +
                        "l-" + (6 * s) + ",0" +
                        "l0,-" + (s) +
                        " ";
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
};
