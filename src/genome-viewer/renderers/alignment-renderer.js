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
AlignmentRenderer.prototype = new Renderer({});

function AlignmentRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-roboto ocb-font-size-11';
    this.toolTipfontClass = 'ocb-tooltip-font';

    if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
};


AlignmentRenderer.prototype.render = function (response, args) {
    var _this = this;

    var sequenceDataAdapter = args.trackListPanel.getSequenceTrack().dataAdapter;

    //CHECK VISUALIZATON MODE
    if (_.isUndefined(response.params)) {
        response.params = {};
    }

    var viewAsPairs = false;
    if (response.params["view_as_pairs"] != null) {
        viewAsPairs = true;
    }
    console.log("viewAsPairs " + viewAsPairs);
    var insertSizeMin = 0;
    var insertSizeMax = 0;
    var variantColor = "orangered";
    if (response.params["insert_size_interval"] != null) {
        insertSizeMin = response.params["insert_size_interval"].split(",")[0];
        insertSizeMax = response.params["insert_size_interval"].split(",")[1];
    }
    console.log("insertSizeMin " + insertSizeMin);
    console.log("insertSizeMin " + insertSizeMax);

    //Prevent browser context menu
    $(args.svgCanvasFeatures).contextmenu(function (e) {
        console.log("click derecho")
        //e.preventDefault();
    });

    console.time("BamRender " + response.params.resource);

    var chunkList = response.items;

//    var middle = this.width / 2;

    var bamCoverGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
        "class": "bamCoverage",
        "cursor": "pointer"
    });
    var bamReadGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
        "class": "bamReads",
        "cursor": "pointer"
    });

    var drawCoverage = function (chunk) {
        //var coverageList = chunk.coverage.all;
        var coverageList = chunk.coverage.all;
        var coverageListA = chunk.coverage.a;
        var coverageListC = chunk.coverage.c;
        var coverageListG = chunk.coverage.g;
        var coverageListT = chunk.coverage.t;
        var start = parseInt(chunk.start);
        var end = parseInt(chunk.end);
        var pixelWidth = (end - start + 1) * args.pixelBase;

        var middle = args.width / 2;
        var points = "", pointsA = "", pointsC = "", pointsG = "", pointsT = "";
        var baseMid = (args.pixelBase / 2) - 0.5;//4.5 cuando pixelBase = 10

        var x, y, p = parseInt(chunk.start);
        var lineA = "", lineC = "", lineG = "", lineT = "";
        var coverageNorm = 200, covHeight = 50;
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

        //reverse to draw the polylines(polygons) for each nucleotid
        var rlineC = lineC.split(" ").reverse().join(" ").trim();
        var rlineG = lineG.split(" ").reverse().join(" ").trim();
        var rlineT = lineT.split(" ").reverse().join(" ").trim();

        var firstPoint = args.pixelPosition + middle - ((args.position - parseInt(chunk.start)) * args.pixelBase) + baseMid;
        var lastPoint = args.pixelPosition + middle - ((args.position - parseInt(chunk.end)) * args.pixelBase) + baseMid;

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
            "x": args.pixelPosition + middle - ((args.position - start) * args.pixelBase),
            "y": 0,
            "width": pixelWidth,
            "height": covHeight,
            "opacity": "0.5",
            "fill": "lightgray",
            "cursor": "pointer"
        });


        $(dummyRect).qtip({
            content: " ",
            position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
            style: {width: true, classes: _this.toolTipfontClass + ' ui-tooltip-shadow'},
            show: {delay: 300},
            hide: {delay: 300}
        });


        args.trackListPanel.on('mousePosition:change', function (e) {
            var pos = e.mousePos - parseInt(chunk.start);
            //if(coverageList[pos]!=null){
            var str = 'depth: <span class="ssel">' + coverageList[pos] + '</span><br>' +
                '<span style="color:green">A</span>: <span class="ssel">' + chunk.coverage.a[pos] + '</span><br>' +
                '<span style="color:blue">C</span>: <span class="ssel">' + chunk.coverage.c[pos] + '</span><br>' +
                '<span style="color:darkgoldenrod">G</span>: <span class="ssel">' + chunk.coverage.g[pos] + '</span><br>' +
                '<span style="color:red">T</span>: <span class="ssel">' + chunk.coverage.t[pos] + '</span><br>';
            $(dummyRect).qtip('option', 'content.text', str);
            //}
        });
    };

    var drawSingleRead = function (feature) {
        //var start = feature.start;
        //var end = feature.end;
        var start = feature.unclippedStart;
        var end = feature.unclippedEnd;
        if (feature.end == 0) {
            end = start + feature.length - 1;
        }
        var length = (end - start) + 1;
        var differences = feature.differences;

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

        if (insertSizeMin != 0 && insertSizeMax != 0 && !mateUnmappedFlag) {
            if (Math.abs(feature.inferredInsertSize) > insertSizeMax) {
                color = 'maroon';
            }
            if (Math.abs(feature.inferredInsertSize) < insertSizeMin) {
                color = 'navy';
            }
        }

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
        console.log(length + ' in px: ' + width);


        var rowHeight = 16;
        var rowY = 70;
//		var textY = 12+settings.height;
        while (true) {
            if (args.renderedArea[rowY] == null) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var enc = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
            if (enc) {
                var featureGroup = SVG.addChild(bamReadGroup, "g", {'feature_id': feature.name});
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
                    content: {text: tooltipText, title: tooltipTitle},
                    position: {target: "mouse", adjust: {x: 25, y: 15}},
                    style: {width: 300, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
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
                if (differences != null && args.regionSize < 400) {
                    var region = new Region({chromosome: args.region.chromosome, start: start, end: end});
                    sequenceDataAdapter.getData({
                        region: region,
                        done: function (event) {
                            var referenceString = AlignmentRenderer._getReferenceString(event.items, region);
                            featureGroup.appendChild(AlignmentRenderer.drawBamDifferences(referenceString, differences, args.pixelBase, x, rowY + height));
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
            var enc = args.renderedArea[rowY].add({start: pairX, end: pairX + pairWidth - 1});
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
                    content: {text: readSettings.getTipText(read), title: readSettings.getTipTitle(read)},
                    position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    style: {width: 280, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
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
                    content: {text: mateSettings.getTipText(mate), title: mateSettings.getTipTitle(mate)},
                    position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    style: {width: 280, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
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
        drawCoverage(chunk.value);
        var alignments = chunk.value.alignments;
        for (var i = 0, li = alignments.length; i < li; i++) {
            var alignment = alignments[i];
            if (viewAsPairs) {
                var nextRead = alignments[i + 1];
                if (nextRead != null) {
                    if (alignment.name == nextRead.name) {
                        drawPairedReads(alignment, nextRead);
                        i++;
                    } else {
                        drawSingleRead(alignment);
                    }
                }
            } else {
                drawSingleRead(alignment);
            }
        }
    };

    //process features
    if (chunkList.length > 0) {
        for (var i = 0, li = chunkList.length; i < li; i++) {
            drawChunk(chunkList[i]);
        }
//        var newHeight = Object.keys(this.renderedArea).length * 24;
//        if (newHeight > 0) {
//            this.setHeight(newHeight + /*margen entre tracks*/10 + 70);
//        }
        //TEST
//        this.setHeight(200);
    }
    console.timeEnd("BamRender " + response.params.resource);
};

/**
 * @Deprecated
 * **/
AlignmentRenderer.genBamVariants = function (differences, size, mainX, y) {

    var s = size / 6;
    var d = "";
    for (var i = 0; i < differences.length; i++) {
        var difference = differences[i];

        switch (difference.op) {
            case "S" :
                var x = mainX + (size * difference.pos);
                for (var j = 0; j < difference.length; j++) {
                    var char = difference.seq[j];
                    switch (char) {
                        case "A" :
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
                        case "T" :
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
                        case "C" :
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
                        case "G" :
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
                        case "N" :
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
                        case "d" :
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

AlignmentRenderer.drawBamDifferences = function (refString, differences, size, mainX, y) {
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

            case "I" :
                var x = mainX + (size * difference.pos) - size / 2;
                var t = SVG.addChild(text, "tspan", {
                    "x": x,
                    "font-weight": 'bold',
                    "textLength": size
                });
                t.textContent = '·';
                $(t).qtip({
                    content: {text: difference.seq, title: 'Insertion'},
                    position: {target: "mouse", adjust: {x: 25, y: 15}},
                    style: {classes: this.toolTipfontClass + ' qtip-dark qtip-shadow'}
                });
                break;
            case "D" :
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
            case "N" :
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
            case "S" :
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
            case "H" :
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
            case "X" :
            case "M" :
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

AlignmentRenderer._getReferenceString = function (chunks, region) {
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
