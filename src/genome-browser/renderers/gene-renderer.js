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

    this.fontClass = 'ocb-font-roboto ocb-font-size-11';
    this.toolTipfontClass = 'ocb-tooltip-font';

    if (_.isObject(args)) {
        _.extend(this, args);
    }

    this.on(this.handlers);
};

GeneRenderer.prototype.setFeatureConfig = function (configObject) {
    _.extend(this, configObject);
};

GeneRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration

        //get feature render configuration
        _this.setFeatureConfig(FEATURE_TYPES.gene);
        var color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
        var label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
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


        // var svgLabelWidth = _this.getLabelWidth(label, args);
        var svgLabelWidth = label.length * 6.4;

        //calculate x to draw svg rect
        var x = _this.getFeatureX(start, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.maxLabelRegionSize > args.regionSize) {
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
                if (foundTranscriptsArea == true) {
                    foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
                }
            } else {
                foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
            }

            //paint genes
            if (foundArea) {
                var featureGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
                    'feature_id': feature.id
                });
                var rect = SVG.addChild(featureGroup, 'rect', {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 0.5,
                    'fill': color,
                    'cursor': 'pointer'
                });

                if (args.maxLabelRegionSize > args.regionSize) {
                    var text = SVG.addChild(featureGroup, 'text', {
                        'i': i,
                        'x': x,
                        'y': textY,
                        'fill': 'black',
                        'cursor': 'pointer',
                        'class': _this.fontClass
                    });
                    text.textContent = label;
                }

                $(featureGroup).qtip({
                    content: {text: tooltipText, title: tooltipTitle},
                    // position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    position: {target: "mouse", adjust: {x: 25, y: 15}},
                    style: {width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                    show: {delay: 300},
                    hide: {delay: 300}
                });


                featureGroup.addEventListener('click', function (e) {
                    _this.trigger('feature:click', {
                        query: feature[infoWidgetId],
                        feature: feature,
                        featureType: 'gene',
                        clickEvent: e
                    });
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
                        var transcriptX = _this.getFeatureX(transcript.start, args);
                        var transcriptWidth = (transcript.end - transcript.start + 1) * ( args.pixelBase);

                        //get type settings object
                        _this.setFeatureConfig(FEATURE_TYPES.transcript);
                        var transcriptColor = _.isFunction(_this.color) ? _this.color(transcript) : _this.color;
                        var label = _.isFunction(_this.label) ? _this.label(transcript) : _this.label;
                        var height = _.isFunction(_this.height) ? _this.height(transcript) : _this.height;
                        var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(transcript) : _this.tooltipTitle;
                        var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(transcript) : _this.tooltipText;
                        var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(transcript) : _this.infoWidgetId;

                        //  se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
                        // var svgLabelWidth = _this.getLabelWidth(label, args);
                        var svgLabelWidth = label.length * 6.4;
                        var maxWidth = Math.max(width, width - ((feature.end - transcript.start) * ( args.pixelBase)) + svgLabelWidth);


                        //add to the tree the transcripts size
                        args.renderedArea[checkRowY].add({start: x, end: x + maxWidth - 1});


                        var transcriptGroup = SVG.addChild(args.svgCanvasFeatures, 'g', {
                            "data-widget-id": transcript[infoWidgetId],
                            "data-transcript-idx": i
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
                            'fill': 'black',
                            'cursor': 'pointer',
                            'class': _this.fontClass
                        });
                        text.textContent = label;


                        $(transcriptGroup).qtip({
                            content: {text: tooltipText, title: tooltipTitle},
                            // position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                            position: {target: "mouse", adjust: {x: 25, y: 15}},
                            style: {width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                            show: {delay: 300},
                            hide: {delay: 300}
                        });
                        transcriptGroup.addEventListener('click', function (e) {
                            var query = this.getAttribute('data-widget-id');
                            var idx = this.getAttribute("data-transcript-idx");
                            _this.trigger('feature:click', {
                                query: query,
                                feature: feature.transcripts[idx],
                                featureType: 'transcript',
                                clickEvent: event
                            });
                        });


                        //paint exons
                        for (var e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++) {
                            var exon = feature.transcripts[i].exons[e];
                            var exonStart = parseInt(exon.start);
                            var exonEnd = parseInt(exon.end);
                            var middle = args.width / 2;

                            var exonX = args.pixelPosition + middle - ((args.position - exonStart) * args.pixelBase);
                            var exonWidth = (exonEnd - exonStart + 1) * ( args.pixelBase);


                            _this.setFeatureConfig(FEATURE_TYPES.exon);
                            var color = _.isFunction(_this.color) ? _this.color(exon) : _this.color;
                            var label = _.isFunction(_this.label) ? _this.label(exon) : _this.label;
                            var height = _.isFunction(_this.height) ? _this.height(exon) : _this.height;
                            var tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(exon) : _this.tooltipTitle;
                            var tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(exon, transcript) : _this.tooltipText;
                            var infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(exon) : _this.infoWidgetId;

                            var exonGroup = SVG.addChild(args.svgCanvasFeatures, "g", {
                                "class": "ocb-coding",
                                "data-id": exon.id
                            });

                            $(exonGroup).qtip({
                                content: {text: tooltipText, title: tooltipTitle},
                                // position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                                position: {target: "mouse", adjust: {x: 25, y: 15}},
                                style: {width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                                show: {delay: 300},
                                hide: {delay: 300}
                            });
                            exonGroup.addEventListener('click', function (e) {
                                // console.log(this.dataset.id);
                            });


                            // Paint exons in white without coding region
                            var eRect = SVG.addChild(exonGroup, "rect", {
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

                            var codingLength = exon.genomicCodingEnd - exon.genomicCodingStart;
                            var codingX = args.pixelPosition + middle - ((args.position - exon.genomicCodingStart) * args.pixelBase);
                            var codingReverseX = args.pixelPosition + middle - ((args.position - exon.genomicCodingEnd) * args.pixelBase);
                            var codingWidth = (codingLength + 1) * (args.pixelBase);
                            if (codingLength > 0) {
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
                                if (args.pixelBase > 9.5 && transcript.proteinSequence != null && exon.phase != null) {
                                    if (exon.strand == '+') {
                                        var proteinString = transcript.proteinSequence.substring(Math.floor(exon.cdsStart / 3), Math.floor(exon.cdsEnd / 3));
                                        var proteinPhaseOffset = codingX - (((3 - exon.phase) % 3) * args.pixelBase);
                                        var sign = 1;

                                    } else if (exon.strand == '-') {
                                        var proteinString = transcript.proteinSequence.substring(Math.floor(exon.cdsStart / 3), Math.ceil(exon.cdsEnd / 3));
                                        var proteinPhaseOffset = codingReverseX - (args.pixelBase * 2) - (exon.phase * args.pixelBase);
                                        var sign = -1;
                                    }
                                    for (var j = 0; j < proteinString.length; j++) {
                                        var codonRect = SVG.addChild(exonGroup, "rect", {
                                            "x": proteinPhaseOffset + (sign * args.pixelBase * 3 * j ),
                                            "y": checkRowY - 1,
                                            "width": (args.pixelBase * 3),
                                            "height": height,
                                            'stroke': '#3B0B0B',
                                            'stroke-width': 0.5,
                                            "fill": CODON_CONFIG[proteinString.charAt(j)].color,
                                            "class": 'ocb-codon'
                                        });
                                        var codonText = SVG.addChild(exonGroup, "text", {
                                            "x": proteinPhaseOffset + (sign * args.pixelBase * j * 3) + args.pixelBase / 3,
                                            "y": checkRowY - 3,
                                            "width": (args.pixelBase * 3),
                                            "class": 'ocb-font-ubuntumono ocb-font-size-16 ocb-codon'
                                        });
                                        codonText.textContent = CODON_CONFIG[proteinString.charAt(j)].text;
                                    }
                                }

                                // Draw phase only at zoom 100, where this.pixelBase < 11
                                //if (args.pixelBase < 11 && exon.phase != null && exon.phase != -1) {
                                //    for (var p = 0, lenp = 3 - exon.phase; p < lenp; p++) {
                                //        SVG.addChild(exonGroup, "rect", {
                                //            "i": i,
                                //            "x": codingX + (p * args.pixelBase),
                                //            "y": checkRowY - 1,
                                //            "width": args.pixelBase,
                                //            "height": height,
                                //            "stroke": color,
                                //            "stroke-width": 1,
                                //            "fill": 'white',
                                //            "cursor": "pointer"
                                //        });
                                //    }
                                //}
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
