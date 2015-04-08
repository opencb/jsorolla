/*
 * Copyright (c) 2014 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2014 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2014 Ignacio Medina (ICM-CIPF)
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
    this.profile = false;
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-roboto ocb-font-size-11';
    this.toolTipfontClass = 'ocb-tooltip-font';

    if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
    this.viewAsPairs = false;
    this.insertSizeMin = 100;
    this.insertSizeMax = 250;
    this.variantColor = 'orangered';
    this.samples = [];
};


AlignmentRenderer.prototype.init = function (svgGroup, sample) {

    this.samples.push(sample);
    //Prevent browser context menu
    $(svgGroup).contextmenu(function (e) {
        console.log("right click");
        e.preventDefault();
    });

    SVG.addChild(svgGroup, "g", {
        "class": "aligCoverage-" + sample,
        "cursor": "pointer"
    });
    SVG.addChild(svgGroup, "g", {
        "class": "aligReads-" + sample,
        "cursor": "pointer"
    });
};

AlignmentRenderer.prototype.render = function (features, args) {
    var _this = this;

    var sample = args.sample;
    var numAlignments = 0;
    for (var i = 0; i < features.length; i++) {
        numAlignments += features[i].alignments.length;
    }
    if (this.profile) {
        var timeId = "AligRender " + features.length + " features with " + numAlignments + " alignments";
        console.time(timeId);
    }
    // all above is time measurement

    /* this code uses the old signature of AlignmentRenderer.render(response, args)
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


     var chunkList = response.items;
     */

    var chunkList = features;
    this.middle = args.width /2;
    args.aligCoverGroup = args.svgCanvasFeatures.children[0];   // FIXME can this fail?
    args.aligReadGroup = args.svgCanvasFeatures.children[1];


    //process features
    if (chunkList.length > 0) {
        for (var i = 0, li = chunkList.length; i < li; i++) {
            this._drawChunk(chunkList[i], args);
        }
//        var newHeight = Object.keys(this.renderedArea).length * 24;
//        if (newHeight > 0) {
//            this.setHeight(newHeight + /*margen entre tracks*/10 + 70);
//        }
        //TEST
//        this.setHeight(200);
    }
    if (this.profile) {
        console.timeEnd(timeId);
    }
};


AlignmentRenderer.prototype._drawChunk = function (chunk, args) {
    args.region = chunk.region;
    this._drawCoverage(chunk, args);
    var readList = chunk.alignments;

    if (this.profile) {
        var timeIdReads = "alig render reads " + readList.length;
        console.time(timeIdReads);
    }
    for (var i = 0, li = readList.length; i < li; i++) {
        var read = readList[i];
        if (this.viewAsPairs) {
            var nextRead = readList[i + 1];
            if (nextRead != null) {
                if (read.name == nextRead.name) {
                    this._drawPairedReads(read, nextRead, args);
                    i++;
                } else {
                    this._drawSingleRead(read, args);
                }
            }
        } else {
            this._drawSingleRead(read, args);
        }
    }

    if (this.profile) {
        console.timeEnd(timeIdReads);
    }
};

AlignmentRenderer.prototype._drawCoverage = function (chunk, args) {
    var _this = this;
    if (this.profile) {
        var timeIdCov = "alig render: coverage " + chunk.coverage.all.length;
        console.time(timeIdCov);
    }
    var coverageList = chunk.coverage.all;
    var coverageListA = chunk.coverage.a;
    var coverageListC = chunk.coverage.c;
    var coverageListG = chunk.coverage.g;
    var coverageListT = chunk.coverage.t;
    var start = parseInt(chunk.coverage.start);
    var end = parseInt(chunk.coverage.end);
    var pixelWidth = (end - start + 1) * args.pixelBase;

    var points = "", pointsA = "", pointsC = "", pointsG = "", pointsT = "";
    var baseMid = (args.pixelBase / 2) - 0.5;//4.5 cuando pixelBase = 10

    var x, y, p = parseInt(start);
    var lineAll = "";
    var lineA = "", lineC = "", lineG = "", lineT = "";
    var coverageNorm = 200, covHeight = 50;

    var logToPixel = covHeight / (Math.log(coverageNorm) + 1);

    for (var i = 0; i < coverageList.length; i++) {
        //x = _this.pixelPosition+this.middle-((_this.position-p)*_this.pixelBase)+baseMid;
        x = args.pixelPosition + this.middle - ((args.position - p) * args.pixelBase);
        xx = args.pixelPosition + this.middle - ((args.position - p) * args.pixelBase) + args.pixelBase;
/*
        lineAll += x + "," + coverageList[i] / coverageNorm * covHeight + " ";
        lineAll += xx + "," + coverageList[i] / coverageNorm * covHeight + " ";
        lineA += x + "," + coverageListA[i] / coverageNorm * covHeight + " ";
        lineA += xx + "," + coverageListA[i] / coverageNorm * covHeight + " ";
        lineC += x + "," + (coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
        lineC += xx + "," + (coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
        lineG += x + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
        lineG += xx + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
        lineT += x + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
        lineT += xx + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) / coverageNorm * covHeight + " ";
*/

        var coverageLogarithm;
        var combinedCoveragePixels;
        var coverageToPixels;
        if (coverageList[i] != 0) {
            coverageLogarithm = Math.log(coverageList[i])+1;
            combinedCoveragePixels = coverageLogarithm * logToPixel;
            coverageToPixels = combinedCoveragePixels / coverageList[i];
        } else {
            coverageToPixels = 0;
        }
        lineAll += x + "," + combinedCoveragePixels + " ";
        lineAll += xx + "," + combinedCoveragePixels + " ";
        lineA += x + "," + coverageListA[i] * coverageToPixels + " ";
        lineA += xx + "," + coverageListA[i] * coverageToPixels + " ";
        lineC += x + "," + (coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        lineC += xx + "," + (coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        lineG += x + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        lineG += xx + "," + (coverageListG[i] + coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        lineT += x + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        lineT += xx + "," + (coverageListT[i] + coverageListG[i] + coverageListC[i] + coverageListA[i]) * coverageToPixels + " ";
        p++;
    }

    //reverse to draw the polylines(polygons) for each nucleotid
    var rlineC = lineC.split(" ").reverse().join(" ").trim();
    var rlineG = lineG.split(" ").reverse().join(" ").trim();
    var rlineT = lineT.split(" ").reverse().join(" ").trim();

    var firstPoint = args.pixelPosition + this.middle - ((args.position - parseInt(start)) * args.pixelBase) + baseMid;
    var lastPoint = args.pixelPosition + this.middle - ((args.position - parseInt(end)) * args.pixelBase) + baseMid;

    var polA = SVG.addChild(args.aligCoverGroup, "polyline", {
        "points": firstPoint + ",0 " + lineA + lastPoint + ",0",
        //"opacity":"1",
        //"stroke-width":"1",
        //"stroke":"gray",
        "fill": "green"
    });
    var polC = SVG.addChild(args.aligCoverGroup, "polyline", {
        "points": lineA + " " + rlineC,
        //"opacity":"1",
        //"stroke-width":"1",
        //"stroke":"black",
        "fill": "blue"
    });
    var polG = SVG.addChild(args.aligCoverGroup, "polyline", {
        "points": lineC + " " + rlineG,
        //"opacity":"1",
        //"stroke-width":"1",
        //"stroke":"black",
        "fill": "gold"
    });
    var polT = SVG.addChild(args.aligCoverGroup, "polyline", {
        "points": lineG + " " + rlineT,
        //"opacity":"1",
        //"stroke-width":"1",
        //"stroke":"black",
        "fill": "red"
    });

    /*
     var polAll = SVG.addChild(aligCoverGroup, "polyline", {
     "points": firstPoint + ",0 " + lineAll + lastPoint + ",0",
     //"opacity":"1",
     //"stroke-width":"1",
     //"stroke":"gray",
     "fill": "green"
     });
     */
    var dummyRect = SVG.addChild(args.aligCoverGroup, "rect", {
        "x": args.pixelPosition + this.middle - ((args.position - start) * args.pixelBase),
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
        style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip-shadow'},
        show: {delay: 300},
        hide: {delay: 300}
    });


    if (this.profile) {
        console.timeEnd(timeIdCov);
    }
//        args.trackSvgLayout.onMousePosition.addEventListener(function (sender, obj) {
//            var pos = obj.mousePos - parseInt(chunk.start);
//            //if(coverageList[pos]!=null){
//            var str = 'depth: <span class="ssel">' + coverageList[pos] + '</span><br>' +
//                '<span style="color:green">A</span>: <span class="ssel">' + chunk.coverage.a[pos] + '</span><br>' +
//                '<span style="color:blue">C</span>: <span class="ssel">' + chunk.coverage.c[pos] + '</span><br>' +
//                '<span style="color:darkgoldenrod">G</span>: <span class="ssel">' + chunk.coverage.g[pos] + '</span><br>' +
//                '<span style="color:red">T</span>: <span class="ssel">' + chunk.coverage.t[pos] + '</span><br>';
//            $(dummyRect).qtip('option', 'content.text', str);
//            //}
//        });
};

AlignmentRenderer.prototype._drawSingleRead = function (feature, args) {
    var _this = this;
    //var start = feature.start;
    //var end = feature.end;
    var start = feature.unclippedStart;
    var end = feature.unclippedEnd;
    var length = (end - start) + 1;
    if (end == 0 || Math.abs(length) > 2000) { // TODO better if flag&4 == true; i.e. read unmapped
//        console.log("code smell: AlignmentRenderer.draw: alignment ends in position 0?", feature);
        length = feature.length;
    }
    var diff = feature.diff;

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
//    var unmappedFlag

    if (this.insertSizeMin != 0 && this.insertSizeMax != 0 && !mateUnmappedFlag) {
        if (Math.abs(feature.inferredInsertSize) > this.insertSizeMax) {
            color = 'maroon';
        }
        if (Math.abs(feature.inferredInsertSize) < this.insertSizeMin) {
            color = 'navy';
        }
    }

    //transform to pixel position
    var width = length * args.pixelBase;
    //calculate x to draw svg rect
    var x = _this.getFeatureX(feature, args);
//		try{
//			var maxWidth = Math.max(width, /*settings.getLabel(feature).length*8*/0); //XXX cuidado : text.getComputedTextLength()
//		}catch(e){
//			var maxWidth = 72;
//		}
    var maxWidth = width;

//    console.log(args.svgCanvasFeatures);
//    debugger
    var rowHeight = 12;
    var rowY = 50;
//		var textY = 12+settings.height;
    while (true) {
        if (args.renderedArea[rowY] == null) {
            args.renderedArea[rowY] = new FeatureBinarySearchTree();
        }
        var enc = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
        if (enc) {

            var featureGroup = SVG.addChild(args.aligReadGroup, "g", {'feature_id': feature.name});
            var borderWidth = 5;
            var points = {
                "Reverse": x + "," + (rowY + (height / 2)) + " " + (x + borderWidth) + "," + rowY + " " + (x + width - borderWidth) + "," + rowY + " " + (x + width - borderWidth) + "," + (rowY + height) + " " + (x + borderWidth) + "," + (rowY + height),
                "Forward": x + "," + rowY + " " + (x + width - borderWidth) + "," + rowY + " " + (x + width) + "," + (rowY + (height / 2)) + " " + (x + width - borderWidth) + "," + (rowY + height) + " " + x + "," + (rowY + height)
            };
            var poly = SVG.addChild(featureGroup, "polygon", {
                "points": points[strand],
                "stroke": strokeColor,
                "stroke-width": 1,
                "fill": color,
                "cursor": "pointer"
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

            if (diff != null && args.regionSize < 400) {    // TODO
                //var	t = SVG.addChild(featureGroup,"text",{
                //"x":x+1,
                //"y":rowY+settings.height-1,
                //"fill":"darkred",
                //"textLength":width,
                //"cursor": "pointer"
                //});
                //t.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
                //t.textContent = diff;
                //readEls.push(t);
                var path = SVG.addChild(featureGroup, "path", {
                    "d": Utils.genBamVariants(diff, args.pixelBase, x, rowY),
                    "fill": this.variantColor
                });
            }
            $(featureGroup).qtip({
                content: {text: tooltipText, title: tooltipTitle},
                position: {target: "mouse", adjust: {x: 25, y: 15}},
                style: { width: 300, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                show: 'click',
                hide: 'click mouseleave'
            });


                $(featureGroup).click(function (event) {
                    console.log(feature);
//                    _this.trigger('feature:click', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType, clickEvent: event})
//                    _this.showInfoWidget({query: feature[settings.infoWidgetId], feature: feature, featureType: feature.featureType, adapter: _this.trackData.adapter});
                });
            break;
        }
        rowY += rowHeight;
//			textY += rowHeight;
    }
};


AlignmentRenderer.prototype._drawPairedReads = function (read, mate, args) {
    var _this = this;
    var readStart = read.unclippedStart;
    var readEnd = read.unclippedEnd;
    var mateStart = mate.unclippedStart;
    var mateEnd = mate.unclippedEnd;
    var readDiff = read.diff;
    var mateDiff = mate.diff;
    /*get type settings object*/
    var readSettings = _this.types[read.featureType];
    var mateSettings = _this.types[mate.featureType];
    var readColor = readSettings.getColor(read, args.region.chromosome);
    var mateColor = mateSettings.getColor(mate, args.region.chromosome);
    var readStrand = readSettings.getStrand(read);
    var mateStrand = mateSettings.getStrand(mate);

    if (this.insertSizeMin != 0 && this.insertSizeMax != 0) {
        if (Math.abs(read.inferredInsertSize) > this.insertSizeMax) {
            readColor = 'maroon';
            mateColor = 'maroon';
        }
        if (Math.abs(read.inferredInsertSize) < this.insertSizeMin) {
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
    var pairX = _this.pixelPosition + this.middle - ((_this.position - pairStart) * _this.pixelBase);

    var readWidth = ((readEnd - readStart) + 1) * _this.pixelBase;
    var readX = _this.pixelPosition + this.middle - ((_this.position - readStart) * _this.pixelBase);

    var mateWidth = ((mateEnd - mateStart) + 1) * _this.pixelBase;
    var mateX = _this.pixelPosition + this.middle - ((_this.position - mateStart) * _this.pixelBase);

    var rowHeight = 12;
    var rowY = 50;
//		var textY = 12+settings.height;

    while (true) {
        if (args.renderedArea[rowY] == null) {
            args.renderedArea[rowY] = new FeatureBinarySearchTree();
        }
        var enc = args.renderedArea[rowY].add({start: pairX, end: pairX + pairWidth - 1});
        if (enc) {
            var readEls = [];
            var mateEls = [];
            var borderWidth = 5;
            var readPoints = {
                "Reverse": readX + "," + (rowY + (readSettings.height / 2)) + " " + (readX + borderWidth) + "," + rowY + " " + (readX + readWidth - borderWidth) + "," + rowY + " " + (readX + readWidth - borderWidth) + "," + (rowY + readSettings.height) + " " + (readX + borderWidth) + "," + (rowY + readSettings.height),
                "Forward": readX + "," + rowY + " " + (readX + readWidth - borderWidth) + "," + rowY + " " + (readX + readWidth) + "," + (rowY + (readSettings.height / 2)) + " " + (readX + readWidth - borderWidth) + "," + (rowY + readSettings.height) + " " + readX + "," + (rowY + readSettings.height)
            };
            var readPoly = SVG.addChild(args.aligReadGroup, "polygon", {
                "points": readPoints[readStrand],
                "stroke": readSettings.getStrokeColor(read),
                "stroke-width": 1,
                "fill": readColor,
                "cursor": "pointer"
            });
            readEls.push(readPoly);
            var matePoints = {
                "Reverse": mateX + "," + (rowY + (mateSettings.height / 2)) + " " + (mateX + borderWidth) + "," + rowY + " " + (mateX + mateWidth - borderWidth) + "," + rowY + " " + (mateX + mateWidth - borderWidth) + "," + (rowY + mateSettings.height) + " " + (mateX + borderWidth) + "," + (rowY + mateSettings.height),
                "Forward": mateX + "," + rowY + " " + (mateX + mateWidth - borderWidth) + "," + rowY + " " + (mateX + mateWidth) + "," + (rowY + (mateSettings.height / 2)) + " " + (mateX + mateWidth - borderWidth) + "," + (rowY + mateSettings.height) + " " + mateX + "," + (rowY + mateSettings.height)
            };
            var matePoly = SVG.addChild(args.aligReadGroup, "polygon", {
                "points": matePoints[mateStrand],
                "stroke": mateSettings.getStrokeColor(mate),
                "stroke-width": 1,
                "fill": mateColor,
                "cursor": "pointer"
            });
            mateEls.push(matePoly);

            var line = SVG.addChild(args.aligReadGroup, "line", {
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
                    var readPath = SVG.addChild(args.aligReadGroup, "path", {
                        "d": Utils.genBamVariants(readDiff, _this.pixelBase, readX, rowY),
                        "fill": this.variantColor
                    });
                    readEls.push(readPath);
                }
                if (mateDiff != null) {
                    var matePath = SVG.addChild(args.aligReadGroup, "path", {
                        "d": Utils.genBamVariants(mateDiff, _this.pixelBase, mateX, rowY),
                        "fill": this.variantColor
                    });
                    mateEls.push(matePath);
                }
            }

            $(readEls).qtip({
                content: {text: readSettings.getTipText(read), title: readSettings.getTipTitle(read)},
                position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                style: { width: 280, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                show: 'click',
                hide: 'click mouseleave'
            });
            $(readEls).click(function (event) {
                console.log(read);
                _this.showInfoWidget({query: read[readSettings.infoWidgetId], feature: read, featureType: read.featureType, adapter: _this.trackData.adapter});
            });
            $(mateEls).qtip({
                content: {text: mateSettings.getTipText(mate), title: mateSettings.getTipTitle(mate)},
                position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                style: { width: 280, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                show: 'click',
                hide: 'click mouseleave'
            });
            $(mateEls).click(function (event) {
                console.log(mate);
                _this.showInfoWidget({query: mate[mateSettings.infoWidgetId], feature: mate, featureType: mate.featureType, adapter: _this.trackData.adapter});
            });
            break;
        }
        rowY += rowHeight;
//			textY += rowHeight;
    }
};
