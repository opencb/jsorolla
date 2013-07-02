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

    //set default args

    //set instantiation args
    _.extend(this, args);

    if ('at' in this) {
        for (eventName in this.at) {
            this.on(eventName, this.at[eventName]);
        }
    }

    this.fontFamily = 'Source Sans Pro';
};


GeneRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration
        var settings = _this.featureConfig[feature.featureType];
        var color = settings.getColor(feature);

        //get feature genomic information
        var start = feature.start;
        var end = feature.end;
        var length = (end - start) + 1;

        //transform to pixel position
        var width = length * args.pixelBase;

        //calculate x to draw svg rect
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.zoom > args.labelZoom) {
            textHeight = 9;
            maxWidth = Math.max(width, settings.getLabel(feature).length * 8);
        }

        var rowY = 0;
        var textY = textHeight + settings.height + 1;
        var rowHeight = textHeight + settings.height + 5;

        while (true) {
            if (!(rowY in args.renderedArea)) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            var foundArea;//if true, i can paint

            //check if gene transcripts can be painted
            var checkRowY = rowY;
            if (feature.transcripts != null) {
                for (var i = 0, leni = feature.transcripts.length + 1; i < leni; i++) {
                    if (!(checkRowY in args.renderedArea)) {
                        args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                    }
                    foundArea = !args.renderedArea[checkRowY].contains({start: x, end: x + maxWidth - 1});
                    if (foundArea == false) {
                        break;
                    }
                    checkRowY += rowHeight;
                }
            } else {
                foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
            }

            if (foundArea) {//paint genes
                var rect = SVG.addChild(args.svgCanvasFeatures, 'rect', {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': settings.height,
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
                    'font-size': 12,
                    'font-family': _this.fontFamily,
                    'fill': 'black',
                    'cursor': 'pointer'
                });
                text.textContent = settings.getLabel(feature);

                $([rect, text]).qtip({
                    content: {text: settings.getTipText(feature), title: settings.getTipTitle(feature)},
                    position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    style: { width: true, classes: 'font-lato ui-tooltip ui-tooltip-shadow'}
                });

                $([rect, text]).click(function (event) {
                    var settings = _this.featureConfig[feature.featureType];
                    _this.trigger('feature:click', {query: feature[settings.infoWidgetId], feature: feature, featureType: feature.featureType});
                });


                //paint transcripts
                var checkRowY = rowY + rowHeight;
                var checkTextY = textY + rowHeight;
                if (feature.transcripts != null) {
                    for (var i = 0, leni = feature.transcripts.length; i < leni; i++) { /*Loop over transcripts*/
                        if (!(checkRowY in args.renderedArea)) {
                            args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                        }
                        var transcript = feature.transcripts[i];
                        var transcriptX = _this.getFeatureX(transcript, args);
                        var transcriptWidth = (transcript.end - transcript.start + 1) * ( args.pixelBase);

                        //get type settings object
                        var settings = _this.featureConfig[transcript.featureType];
                        var color = settings.getColor(transcript);

                        //se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
                        var maxWidth = Math.max(width, width - ((feature.end - transcript.start) * ( args.pixelBase)) + settings.getLabel(transcript).length * 7);


                        //add to the tree the transcripts size
                        args.renderedArea[checkRowY].add({start: x, end: x + maxWidth - 1});


                        var transcriptGroup = SVG.addChild(args.svgCanvasFeatures, 'g', {
                            "widgetId": transcript[settings.infoWidgetId]
                        });


                        var rect = SVG.addChild(transcriptGroup, 'rect', {//this rect its like a line
                            'x': transcriptX,
                            'y': checkRowY + 1,
                            'width': transcriptWidth,
                            'height': settings.height,
                            'fill': 'gray',
                            'cursor': 'pointer',
                            'feature_id': transcript.id
                        });
                        var text = SVG.addChild(transcriptGroup, 'text', {
                            'x': transcriptX,
                            'y': checkTextY,
                            'font-size': 12,
                            'font-family': _this.fontFamily,
                            'opacity': null,
                            'fill': 'black',
                            'cursor': 'pointer'
                        });
                        text.textContent = settings.getLabel(transcript);


                        $(transcriptGroup).qtip({
                            content: {text: settings.getTipText(transcript), title: settings.getTipTitle(transcript)},
                            position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                            style: { width: true, classes: 'font-lato ui-tooltip ui-tooltip-shadow'}
                        });
                        $(transcriptGroup).click(function (event) {
                            var query = this.getAttribute("widgetId");
                            _this.trigger('feature:click', {query: query, feature: transcript, featureType: transcript.featureType});
                        });

                        //paint exons
                        for (var e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++) {/* loop over exons*/
                            var exon = feature.transcripts[i].exons[e];
                            var exonSettings = _this.featureConfig[exon.featureType];
                            var exonStart = parseInt(exon.start);
                            var exonEnd = parseInt(exon.end);
                            var middle = args.width / 2;

                            var exonX = args.pixelPosition + middle - ((args.position - exonStart) * args.pixelBase);
                            var exonWidth = (exonEnd - exonStart + 1) * ( args.pixelBase);

                            var exonGroup = SVG.addChild(args.svgCanvasFeatures, "g");

                            $(exonGroup).qtip({
                                content: {text: exonSettings.getTipText(exon, transcript), title: exonSettings.getTipTitle(exon)},
                                position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                                style: { width: true, classes: 'font-lato ui-tooltip ui-tooltip-shadow'}
                            });

                            var eRect = SVG.addChild(exonGroup, "rect", {//paint exons in white without coding region
                                "i": i,
                                "x": exonX,
                                "y": checkRowY - 1,
                                "width": exonWidth,
                                "height": exonSettings.height,
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
                                    "height": exonSettings.height,
                                    "stroke": color,
                                    "stroke-width": 1,
                                    "fill": color,
                                    "cursor": "pointer"
                                });
                                //XXX draw phase only at zoom 100, where this.pixelBase=10
                                for (var p = 0, lenp = 3 - exon.phase; p < lenp && Math.round(args.pixelBase) == 10 && exon.phase != -1; p++) {//==10 for max zoom only
                                    SVG.addChild(exonGroup, "rect", {
                                        "i": i,
                                        "x": codingX + (p * 10),
                                        "y": checkRowY - 1,
                                        "width": args.pixelBase,
                                        "height": exonSettings.height,
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

GeneRenderer.prototype.featureConfig = {
    gene: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            var str = "";
            str += (f.strand < 0 || f.strand == '-') ? "<" : "";
            str += " " + name + " ";
            str += (f.strand > 0 || f.strand == '+') ? ">" : "";
            if (f.biotype != null && f.biotype != '') {
                str += " [" + f.biotype + "]";
            }
            return str;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return FEATURE_TYPES.formatTitle(f.featureType) +
                ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (f) {
            var color = GENE_BIOTYPE_COLORS[f.biotype];
            return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                FEATURE_TYPES.getTipCommons(f) +
                'source:&nbsp;<span class="ssel">' + f.source + '</span><br><br>' +
                'description:&nbsp;<span class="emph">' + f.description + '</span><br>';
        },
        getColor: function (f) {
            return GENE_BIOTYPE_COLORS[f.biotype];
        },
        infoWidgetId: "id",
        height: 4,
        histogramColor: "lightblue"
    },
    transcript: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            var str = "";
            str += (f.strand < 0) ? "<" : "";
            str += " " + name + " ";
            str += (f.strand > 0) ? ">" : "";
            if (f.biotype != null && f.biotype != '') {
                str += " [" + f.biotype + "]";
            }
            return str;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return FEATURE_TYPES.formatTitle(f.featureType) +
                ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (f) {
            var color = GENE_BIOTYPE_COLORS[f.biotype];
            return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                'description:&nbsp;<span class="emph">' + f.description + '</span><br>' +
                FEATURE_TYPES.getTipCommons(f);
        },
        getColor: function (f) {
            return GENE_BIOTYPE_COLORS[f.biotype];
        },
        infoWidgetId: "id",
        height: 1,
        histogramColor: "lightblue"
    },
    exon: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return name;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            if (name == null) {
                name = ''
            }
            return FEATURE_TYPES.formatTitle(f.featureType) + ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (e, t) {
            var ename = (e.name != null) ? e.name : e.id;
            var tname = (t.name != null) ? t.name : t.id;
            var color = GENE_BIOTYPE_COLORS[t.biotype];
            return    'transcript name:&nbsp;<span class="ssel">' + t.name + '</span><br>' +
                'transcript Ensembl&nbsp;ID:&nbsp;<span class="ssel">' + t.id + '</span><br>' +
                'transcript biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + t.biotype + '</span><br>' +
                'transcript description:&nbsp;<span class="emph">' + t.description + '</span><br>' +
                'transcript start-end:&nbsp;<span class="emph">' + t.start + '-' + t.end + '</span><br>' +
                'exon start-end:&nbsp;<span class="emph">' + e.start + '-' + e.end + '</span><br>' +
                'strand:&nbsp;<span class="emph">' + t.strand + '</span><br>' +
                'length:&nbsp;<span class="info">' + (e.end - e.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span><br>';
        },
        getColor: function (f) {
            return "black";
        },
        infoWidgetId: "id",
        height: 5,
        histogramColor: "lightblue"
    },
};