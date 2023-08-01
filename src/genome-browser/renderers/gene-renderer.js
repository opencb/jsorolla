import Renderer from "./renderer.js";
import {SVG} from "../../core/svg.js";
import FeatureBinarySearchTree from "../feature-binary-search-tree.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";


export default class GeneRenderer extends Renderer {

    render(features, options) {
        (features || []).forEach((feature, index) => {

            // Prevent rendering a feature twice
            if (options.renderedFeatures) {
                if (options.renderedFeatures.has(feature.id)) {
                    return;
                }
                options.renderedFeatures.add(feature.id);
            }

            const geneColor = this.getValueFromConfig("geneColor", [feature]);
            const geneLabel = this.getValueFromConfig("geneLabel", [feature]);
            const geneHeight = this.getValueFromConfig("geneHeight", [feature]);
            const geneTooltipTitle = this.getValueFromConfig("geneTooltipTitle", [feature]);
            const geneTooltipText = this.getValueFromConfig("geneTooltipText", [feature]);

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);
            const width = length * options.pixelBase;

            // var svgLabelWidth = _this.getLabelWidth(label, args);
            const svgLabelWidth = geneLabel.length * 6.4;

            // calculate x to draw svg rect
            const x = GenomeBrowserUtils.getFeatureX(start, options);

            let maxWidth = Math.max(width, 2);
            let textHeight = 0;
            if (options.labelMaxRegionSize > options.regionSize) {
                textHeight = 9;
                maxWidth = Math.max(width, svgLabelWidth);
            }

            let rowY = 0;
            let textY = textHeight + geneHeight + 1;
            const rowHeight = textHeight + geneHeight + 5;
            let foundArea = false;

            while (!foundArea) {
                if (!options.renderedArea[rowY]) {
                    // eslint-disable-next-line no-param-reassign
                    options.renderedArea[rowY] = new FeatureBinarySearchTree();
                }

                // check if gene transcripts can be painted
                let checkRowY = rowY;
                let foundTranscriptsArea = true;

                if (Array.isArray(feature.transcripts) && feature.transcripts.length > 0) {
                    for (let i = 0; i < feature.transcripts.length; i++) {
                        if (!options.renderedArea[checkRowY]) {
                            // eslint-disable-next-line no-param-reassign
                            options.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                        }
                        if (options.renderedArea[checkRowY].contains({start: x, end: x + maxWidth - 1})) {
                            foundTranscriptsArea = false;
                            break;
                        }
                        checkRowY += rowHeight;
                    }
                    if (foundTranscriptsArea === true) {
                        foundArea = options.renderedArea[rowY].add({
                            start: x,
                            end: x + maxWidth - 1,
                        });
                    }
                } else {
                    foundArea = options.renderedArea[rowY].add({
                        start: x,
                        end: x + maxWidth - 1,
                    });
                }

                // paint genes
                if (foundArea) {
                    const geneGroup = SVG.addChild(options.svgCanvasFeatures, "g", {
                        "data-cy": "gb-feature-gene",
                        "data-type": "gene",
                        "data-id": feature.id,
                        "data-index": index,
                    });

                    // Render gene rectangle
                    SVG.addChild(geneGroup, "rect", {
                        "data-cy": "gb-feature-gene-rect",
                        "x": x,
                        "y": rowY,
                        "width": width,
                        "height": geneHeight,
                        "stroke": "#3B0B0B",
                        "stroke-width": 0.5,
                        "fill": geneColor,
                        "cursor": "pointer"
                    });

                    // Render gene label
                    if (options.labelMaxRegionSize > options.regionSize) {
                        const geneLabelElement = SVG.addChild(geneGroup, "text", {
                            "data-cy": "gb-feature-gene-label",
                            "i": index,
                            "x": x,
                            "y": textY,
                            "fill": "black",
                            "cursor": "pointer",
                            "class": this.config.fontClass
                        });
                        geneLabelElement.textContent = geneLabel;
                    }

                    // Create geoup tooltip
                    $(geneGroup).qtip({
                        content: {
                            text: geneTooltipText,
                            title: geneTooltipTitle,
                        },
                        position: {
                            target: "mouse",
                            adjust: {x: 25, y: 15},
                        },
                        style: {
                            width: true,
                            classes: this.config.toolTipfontClass + " ui-tooltip ui-tooltip-shadow",
                        },
                        show: {delay: 300},
                        hide: {delay: 300}
                    });

                    geneGroup.addEventListener("click", event => {
                        this.trigger("feature:click", {
                            query: feature[this.config.infoWidgetId],
                            feature: feature,
                            featureType: "gene",
                            clickEvent: event,
                        });
                    });

                    // paint transcripts
                    let checkRowY = rowY + rowHeight;
                    let checkTextY = textY + rowHeight;
                    if (Array.isArray(feature.transcripts) && feature.transcripts.length > 0) {
                        // warning not change var i
                        // for (var i = 0, leni = feature.transcripts.length; i < leni; i++) {
                        feature.transcripts.forEach((transcript, transcriptIndex) => {
                            if (!options.renderedArea[checkRowY]) {
                                // eslint-disable-next-line no-param-reassign
                                options.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                            }

                            const transcriptX = GenomeBrowserUtils.getFeatureX(transcript.start, options);
                            const transcriptWidth = (transcript.end - transcript.start + 1) * options.pixelBase;

                            const transcriptColor = this.getValueFromConfig("transcriptColor", [transcript]);
                            const transcriptLabel = this.getValueFromConfig("transcriptLabel", [transcript]);
                            const transcriptHeight = this.getValueFromConfig("transcriptHeight", [transcript]);
                            const transcriptTooltipTitle = this.getValueFromConfig("transcriptTooltipTitle", [transcript]);
                            const transcriptTooltipText = this.getValueFromConfig("transcriptTooltipText", [transcript]);

                            // the length of the end of the gene is subtracted to the beginning of the transcript and is added the text of the transcript
                            // const transcriptLabelWidth = transcriptLabel.length * 6.4;
                            // const transcriptMaxWidth = Math.max(
                            //     transcriptWidth,
                            //     transcriptWidth - ((feature.end - transcript.start) * options.pixelBase) + transcriptLabelWidth
                            // );

                            // add to the tree the transcripts size
                            options.renderedArea[checkRowY].add({
                                start: x,
                                end: x + maxWidth - 1,
                            });

                            const transcriptGroup = SVG.addChild(options.svgCanvasFeatures, "g", {
                                "data-cy": "gb-feature-transcript",
                                "data-type": "transcript",
                                "data-id": transcript[this.config.infoWidgetId],
                                "data-index": transcriptIndex,
                                "data-biotype": transcript?.biotype || "-",
                            });

                            // Transcript line
                            SVG.addChild(transcriptGroup, "rect", {
                                "data-cy": "gb-feature-transcript-rect",
                                "x": transcriptX,
                                "y": checkRowY + 1,
                                "width": transcriptWidth,
                                "height": transcriptHeight,
                                "fill": "gray",
                                "cursor": "pointer",
                            });

                            // Transcript label element
                            const transcriptLabelElement = SVG.addChild(transcriptGroup, "text", {
                                "data-cy": "gb-feature-transcript-label",
                                "x": transcriptX,
                                "y": checkTextY,
                                "fill": "black",
                                "cursor": "pointer",
                                "class": this.config.fontClass,
                            });
                            transcriptLabelElement.textContent = transcriptLabel;

                            // Transcript tooltip
                            $(transcriptGroup).qtip({
                                content: {
                                    text: transcriptTooltipText,
                                    title: transcriptTooltipTitle,
                                },
                                position: {
                                    target: "mouse",
                                    adjust: {x: 25, y: 15},
                                },
                                style: {
                                    width: true,
                                    classes: this.config.toolTipfontClass + " ui-tooltip ui-tooltip-shadow",
                                },
                                show: {delay: 300},
                                hide: {delay: 300}
                            });

                            // paint exons
                            // for (let e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++) {
                            (transcript.exons || []).forEach((exon, exonIndex) => {
                                const exonStart = parseInt(exon.start);
                                const exonEnd = parseInt(exon.end);
                                const middle = options.width / 2;

                                const exonX = options.pixelPosition + middle - ((options.position - exonStart) * options.pixelBase);
                                const exonWidth = (exonEnd - exonStart + 1) * options.pixelBase;

                                const exonColor = this.getValueFromConfig("exonColor", [exon, transcript]);
                                // const exonLabel = this.getValueFromConfig("exonLabel", [exon, transcript]);
                                const exonHeight = this.getValueFromConfig("exonHeight", [exon, transcript]);
                                const exonTooltipTitle = this.getValueFromConfig("exonTooltipTitle", [exon, transcript]);
                                const exonTooltipText = this.getValueFromConfig("exonTooltipText", [exon, transcript]);

                                const exonGroup = SVG.addChild(options.svgCanvasFeatures, "g", {
                                    "data-cy": "gb-feature-exon",
                                    "data-id": exon.id,
                                    "data-type": "exon",
                                    "data-index": exonIndex,
                                    "data-transcript-id": transcript?.id || "-",
                                    "data-transcript-biotype": transcript?.biotype || "-",
                                });

                                $(exonGroup).qtip({
                                    content: {
                                        text: exonTooltipText,
                                        title: exonTooltipTitle,
                                    },
                                    position: {
                                        target: "mouse",
                                        adjust: {x: 25, y: 15},
                                    },
                                    style: {
                                        width: true,
                                        classes: this.config.toolTipfontClass + " ui-tooltip ui-tooltip-shadow",
                                    },
                                    show: {delay: 300},
                                    hide: {delay: 300}
                                });

                                // Paint exons in white without coding region
                                SVG.addChild(exonGroup, "rect", {
                                    "data-cy": "gb-feature-exon-rect",
                                    "i": transcriptIndex,
                                    "x": exonX,
                                    "y": checkRowY - 1,
                                    "width": exonWidth,
                                    "height": exonHeight,
                                    "stroke": "gray",
                                    "stroke-width": 1,
                                    "fill": exonColor,
                                    "cursor": "pointer",
                                });

                                const codingLength = exon.genomicCodingEnd - exon.genomicCodingStart;
                                const codingX = options.pixelPosition + middle - ((options.position - exon.genomicCodingStart) * options.pixelBase);
                                const codingReverseX = options.pixelPosition + middle - ((options.position - exon.genomicCodingEnd) * options.pixelBase);
                                const codingWidth = (codingLength + 1) * (options.pixelBase);

                                if (codingLength > 0) {
                                    SVG.addChild(exonGroup, "rect", {
                                        "data-cy": "gb-feature-exon-coding",
                                        "i": transcriptIndex,
                                        "x": codingX,
                                        "y": checkRowY - 1,
                                        "width": codingWidth,
                                        "height": exonHeight,
                                        "stroke": transcriptColor,
                                        "stroke-width": 1,
                                        "fill": transcriptColor,
                                        "cursor": "pointer",
                                    });

                                    if (options.pixelBase > 9.5 && transcript.proteinSequence && exon.phase) {
                                        // FIXME This fixes a Cellbase bug, phase=0 are not returned, we have to remove this when fixed
                                        // const exonPhase = exon.phase || 0;

                                        let proteinString = "";
                                        let proteinPhaseOffset, sign;

                                        if (exon.strand === "+" || exon.strand > 0) {
                                            proteinString = transcript.proteinSequence.substring(Math.floor(exon.cdsStart / 3), Math.floor(exon.cdsEnd / 3));
                                            proteinPhaseOffset = codingX - (((3 - exon.phase) % 3) * options.pixelBase);
                                            sign = 1;

                                        // } else if (exon.strand === "-") {
                                        } else {
                                            proteinString = transcript.proteinSequence.substring(Math.floor(exon.cdsStart / 3), Math.ceil(exon.cdsEnd / 3));
                                            proteinPhaseOffset = codingReverseX - (options.pixelBase * 2) - (exon.phase * options.pixelBase);
                                            sign = - 1;
                                        }

                                        // Render protein sequence
                                        for (let j = 0; j < proteinString.length; j++) {
                                            const codon = proteinString.charAt(j);
                                            const codonConfig = GenomeBrowserConstants.CODON_CONFIG[codon];

                                            SVG.addChild(exonGroup, "rect", {
                                                "x": proteinPhaseOffset + (sign * options.pixelBase * 3 * j),
                                                "y": checkRowY - 1,
                                                "width": options.pixelBase * 3,
                                                "height": exonHeight,
                                                "stroke": "#3B0B0B",
                                                "stroke-width": 0.5,
                                                "fill": codonConfig.color,
                                                "class": "ocb-codon"
                                            });

                                            // Codon text
                                            const codonText = SVG.addChild(exonGroup, "text", {
                                                "x": proteinPhaseOffset + (sign * options.pixelBase * j * 3) + options.pixelBase / 3,
                                                "y": checkRowY - 3,
                                                "width": options.pixelBase * 3,
                                                "class": "ocb-font-ubuntumono ocb-font-size-16 ocb-codon",
                                            });
                                            codonText.textContent = codonConfig.text;
                                        }
                                    }

                                    // Draw phase only at zoom 100, where this.pixelBase < 11
                                    // if (args.pixelBase < 11 && exon.phase != null && exon.phase != -1) {
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
                                    // }
                                }
                            });

                            checkRowY += rowHeight;
                            checkTextY += rowHeight;
                        });
                    }

                    break;
                }

                rowY += rowHeight;
                textY += rowHeight;
            }
        });
    }

    getDefaultConfig() {
        return {
            // Global configuration
            infoWidgetId: "id",
            histogramColor: "lightblue",

            // Gene configuration
            geneLabel: GenomeBrowserUtils.geneLabelFormatter,
            geneTooltipTitle: GenomeBrowserUtils.geneTooltipTitleFormatter,
            geneTooltipText: GenomeBrowserUtils.geneTooltipTextFormatter,
            geneColor: GenomeBrowserUtils.geneColorFormatter,
            geneHeight: 4,

            // Transcript configuration
            transcriptLabel: GenomeBrowserUtils.geneLabelFormatter,
            transcriptTooltipTitle: GenomeBrowserUtils.transcriptTooltipTitleFormatter,
            transcriptTooltipText: GenomeBrowserUtils.geneTooltipTextFormatter,
            transcriptColor: GenomeBrowserUtils.geneColorFormatter,
            transcriptHeight: 1,

            // Exon configuration
            exonLabel: GenomeBrowserUtils.exonLabelFormatter,
            exonTooltipTitle: GenomeBrowserUtils.exonTooltipTitleFormatter,
            exonTooltipText: GenomeBrowserUtils.exonTooltipTextFormatter,
            exonColor: "#ffffff",
            exonHeight: 7,
        };
    }

}
