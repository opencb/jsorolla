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
GeneRenderer.prototype = new Renderer({});

function GeneRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.fontClass = 'ocb-font-sourcesanspro ocb-font-size-12';
    this.toolTipfontClass = 'ocb-font-default';

    //set default args
    if (_.isString(args)) {
        _.extend(this, this.getDefaultConfig(args));
    }
    //set instantiation args
    else if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
};

GeneRenderer.prototype.setFeatureConfig = function (type) {
    _.extend(this, this.getDefaultConfig(type));
};

GeneRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration

        //get feature render configuration
        _this.setFeatureConfig('gene');
        var color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
        var label = _.isFunction(_this.label) ? _this.label(feature, args.zoom) : _this.label;
        var height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
        var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
        var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
        var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;


        //get feature genomic information
        var start = feature.start;
        var end = feature.end;
        var length = (end - start) + 1;

        //transform to pixel position
        var width = length * args.pixelBase;

        var svgLabelWidth = _this.getLabelWidth(label, args);

        //calculate x to draw svg rect
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.zoom > args.labelZoom) {
            textHeight = 9;
            maxWidth = Math.max(width, svgLabelWidth);
        }

        var rowY = 0;
        var textY = textHeight + height + 1;
        var rowHeight = textHeight + height + 5;

        while (true) {
            if (!(rowY in args.renderedArea)) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            var foundArea;//if true, i can paint

            //check if gene transcripts can be painted
            var checkRowY = rowY;
            var foundTranscriptsArea = true;
            if (!_.isEmpty(feature.transcripts)) {
                for (var i = 0, leni = feature.transcripts.length + 1; i < leni; i++) {
                    if (!(checkRowY in args.renderedArea)) {
                        args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                    }
                    if (args.renderedArea[checkRowY].contains({start: x, end: x + maxWidth - 1})) {
                        foundTranscriptsArea = false;
                        break;
                    }
                    checkRowY += rowHeight;
                }
                if(foundTranscriptsArea == true){
                    foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
                }
            } else {
                foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
            }

            //paint genes
            if (foundArea) {
                var rect = SVG.addChild(args.svgCanvasFeatures, 'rect', {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 0.5,
                    'fill': color,
                    'cursor': 'pointer',
                    'feature_id': feature.id
                });

                var text = SVG.addChild(args.svgCanvasFeatures, 'text', {
                    'i': i,
                    'x': x,
                    'y': textY,
                    'fill': 'black',
                    'cursor': 'pointer',
                    'class': _this.fontClass
                });
                text.textContent = label;

                $([rect, text]).qtip({
                    content: {text: tooltipText, title: tooltipTitle},
//                    position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    position: {target: "mouse", adjust: {x: 25, y: 15}},
                    style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
                });

                $([rect, text]).click(function (event) {
                    _this.trigger('feature:click', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType, clickEvent: event});
                });


                //paint transcripts
                var checkRowY = rowY + rowHeight;
                var checkTextY = textY + rowHeight;
                if (!_.isEmpty(feature.transcripts)) {
                    for (var i = 0, leni = feature.transcripts.length; i < leni; i++) { /*Loop over transcripts*/
                        if (!(checkRowY in args.renderedArea)) {
                            args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                        }
                        var transcript = feature.transcripts[i];
                        var transcriptX = _this.getFeatureX(transcript, args);
                        var transcriptWidth = (transcript.end - transcript.start + 1) * ( args.pixelBase);

                        //get type settings object
                        _this.setFeatureConfig('transcript');
                        var transcriptColor = _.isFunction(_this.color) ? _this.color(transcript) : _this.color;
                        var label = _.isFunction(_this.label) ? _this.label(transcript) : _this.label;
                        var height = _.isFunction(_this.height) ? _this.height(transcript) : _this.height;
                        var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(transcript) : _this.tooltipTitle;
                        var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(transcript) : _this.tooltipText;
                        var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(transcript) : _this.infoWidgetId;

                        //se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
                        var svgLabelWidth = _this.getLabelWidth(label, args);
                        var maxWidth = Math.max(width, width - ((feature.end - transcript.start) * ( args.pixelBase)) + svgLabelWidth);


                        //add to the tree the transcripts size
                        args.renderedArea[checkRowY].add({start: x, end: x + maxWidth - 1});


                        var transcriptGroup = SVG.addChild(args.svgCanvasFeatures, 'g', {
                            "widgetId": transcript[infoWidgetId]
                        });


                        var rect = SVG.addChild(transcriptGroup, 'rect', {//this rect its like a line
                            'x': transcriptX,
                            'y': checkRowY + 1,
                            'width': transcriptWidth,
                            'height': height,
                            'fill': 'gray',
                            'cursor': 'pointer',
                            'feature_id': transcript.id
                        });
                        var text = SVG.addChild(transcriptGroup, 'text', {
                            'x': transcriptX,
                            'y': checkTextY,
                            'opacity': null,
                            'fill': 'black',
                            'cursor': 'pointer',
                            'class': _this.fontClass
                        });
                        text.textContent = label;


                        $(transcriptGroup).qtip({
                            content: {text: tooltipText, title: tooltipTitle},
//                            position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                            position: {target: "mouse", adjust: {x: 25, y: 15}},
                            style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
                        });
                        $(transcriptGroup).click(function (event) {
                            var query = this.getAttribute("widgetId");
                            _this.trigger('feature:click', {query: query, feature: transcript, featureType: transcript.featureType, clickEvent: event});
                        });

                        //paint exons
                        for (var e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++) {/* loop over exons*/
                            var exon = feature.transcripts[i].exons[e];
                            var exonStart = parseInt(exon.start);
                            var exonEnd = parseInt(exon.end);
                            var middle = args.width / 2;

                            var exonX = args.pixelPosition + middle - ((args.position - exonStart) * args.pixelBase);
                            var exonWidth = (exonEnd - exonStart + 1) * ( args.pixelBase);


                            _this.setFeatureConfig('exon');
                            var color = _.isFunction(_this.color) ? _this.color(exon) : _this.color;
                            var label = _.isFunction(_this.label) ? _this.label(exon) : _this.label;
                            var height = _.isFunction(_this.height) ? _this.height(exon) : _this.height;
                            var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(exon) : _this.tooltipTitle;
                            var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(exon, transcript) : _this.tooltipText;
                            var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(exon) : _this.infoWidgetId;

                            var exonGroup = SVG.addChild(args.svgCanvasFeatures, "g");

                            $(exonGroup).qtip({
                                content: {text: tooltipText, title: tooltipTitle},
//                                position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                                position: {target: "mouse", adjust: {x: 25, y: 15}},
                                style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
                            });

                            var eRect = SVG.addChild(exonGroup, "rect", {//paint exons in white without coding region
                                "i": i,
                                "x": exonX,
                                "y": checkRowY - 1,
                                "width": exonWidth,
                                "height": height,
                                "stroke": "gray",
                                "stroke-width": 1,
                                "fill": "white",
                                "cursor": "pointer"
                            });
                            //XXX now paint coding region
                            var codingStart = 0;
                            var codingEnd = 0;
                            // 5'-UTR
                            if (transcript.genomicCodingStart > exonStart && transcript.genomicCodingStart < exonEnd) {
                                codingStart = parseInt(transcript.genomicCodingStart);
                                codingEnd = exonEnd;
                            } else {
                                // 3'-UTR
                                if (transcript.genomicCodingEnd > exonStart && transcript.genomicCodingEnd < exonEnd) {
                                    codingStart = exonStart;
                                    codingEnd = parseInt(transcript.genomicCodingEnd);
                                } else
                                // all exon is transcribed
                                if (transcript.genomicCodingStart < exonStart && transcript.genomicCodingEnd > exonEnd) {
                                    codingStart = exonStart;
                                    codingEnd = exonEnd;
                                }
//									else{
//										if(exonEnd < transcript.genomicCodingStart){
//
//									}
                            }
                            var coding = codingEnd - codingStart;
                            var codingX = args.pixelPosition + middle - ((args.position - codingStart) * args.pixelBase);
                            var codingWidth = (coding + 1) * ( args.pixelBase);

                            if (coding > 0) {
                                var cRect = SVG.addChild(exonGroup, "rect", {
                                    "i": i,
                                    "x": codingX,
                                    "y": checkRowY - 1,
                                    "width": codingWidth,
                                    "height": height,
                                    "stroke": transcriptColor,
                                    "stroke-width": 1,
                                    "fill": transcriptColor,
                                    "cursor": "pointer"
                                });
                                //XXX draw phase only at zoom 100, where this.pixelBase=10
                                for (var p = 0, lenp = 3 - exon.phase; p < lenp && Math.round(args.pixelBase) == 10 && exon.phase != -1 && exon.phase != null; p++) {//==10 for max zoom only
                                    SVG.addChild(exonGroup, "rect", {
                                        "i": i,
                                        "x": codingX + (p * 10),
                                        "y": checkRowY - 1,
                                        "width": args.pixelBase,
                                        "height": height,
                                        "stroke": color,
                                        "stroke-width": 1,
                                        "fill": 'white',
                                        "cursor": "pointer"
                                    });
                                }
                            }


                        }

                        checkRowY += rowHeight;
                        checkTextY += rowHeight;
                    }
                }// if transcrips != null
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };

    //process features
    for (var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i]);
    }
};