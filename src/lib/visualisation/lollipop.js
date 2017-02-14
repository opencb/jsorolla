/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by imedina on 10/02/17.
 */

class Lollipop {

    constructor(settings) {
        this.settings = settings;
    }

    createSvg(protein, variants, settings) {

        // If no settings is provided we use the one passed in the constructor
        if (typeof settings === "undefined" || settings == null) {
            settings = this.settings;
        }

        // We merge user's setting with default settings, by doing this users do not have to write al possible settings
        settings = Object.assign(this._getDefaultSetting(), settings);
        if (typeof settings.length === "undefined") {
            settings.length = protein.sequence.length;
        }

        let ratio = settings.length / settings.width;
        let svgSWidth = settings.width * ratio;
        let svgHeight = settings.height;
        settings.ratio = ratio;

        let svg = SVG.create('svg', {
            width: svgSWidth,
            height: svgHeight,
            viewBox: "0 0 " + svgSWidth + " " + svgHeight,
            style: "fill: white"
        });
        SVG.addChild(svg, 'rect', {width: svgSWidth, height: svgHeight, style: "fill: white;stroke: black"});

        let center = (svgHeight - 20) / 2;
        SVG.addChild(svg, 'rect', {
            x: 20 * ratio,
            y: center + 5,
            rx: 2 * ratio,
            ry: 2,
            width: svgSWidth,
            height: 15,
            style: "fill: lightgrey"
        });

        // Lollipop
        let variantPositions = new Set();
        let verticalOffset = 0;
        let gVariants = SVG.create('g', {});
        for (let i = 0; i < variants.length; i++) {
            for (let j = 0; j < variants[i].annotation.consequenceTypes.length; j++) {

                if (variants[i].annotation.consequenceTypes[j].biotype == "protein_coding"
                    // && variants[i].annotation.consequenceTypes[j].geneName == this.gene
                    && typeof variants[i].annotation.consequenceTypes[j].proteinVariantAnnotation != "undefined") {

                    let proteinVariantAnnotation = variants[i].annotation.consequenceTypes[j].proteinVariantAnnotation;
                    for (let z = -(settings.proteinPositioningInterval); z <= settings.proteinPositioningInterval; z++) {
                        if (variantPositions.has(proteinVariantAnnotation.position + z)) {
                            verticalOffset = -15;
                            break;
                        }
                    }
                    SVG.addChild(gVariants, 'line', {
                        x1: (20 + proteinVariantAnnotation.position) * ratio,
                        y1: center - 20 + verticalOffset,
                        x2: (20 + proteinVariantAnnotation.position) * ratio,
                        y2: center + 5,
                        width: svgSWidth, height: 25, style: "stroke: grey;stroke-width: 2"
                    });

                    let stats = variants[i].studies[0].stats["ALL"];
                    let variant = SVG.addChild(gVariants, 'circle', {
                        cx: (20 + proteinVariantAnnotation.position) * ratio,
                        cy: center - 20 - 5 + verticalOffset,
                        r: 5 + stats.altAlleleFreq * (8 - 5),
//                                style: "fill: red"});
                        style: "fill: " + settings.color[variants[i].annotation.consequenceTypes[j].sequenceOntologyTerms[0].name]
                    });

                    $(variant).qtip({
                        content: {
                            title: variants[i].id,
                            text: this._getMutationTooltip(variants[i], variants[i].annotation.consequenceTypes[j])
                        },
                        position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
                        style: {width: true, classes: ' ui-tooltip ui-tooltip-shadow'},
                        show: {delay: 250},
                        hide: {delay: 200}
                    });
                    variantPositions.add(proteinVariantAnnotation.position);
                    verticalOffset = 0;
                }
            }
        }
        svg.appendChild(gVariants);

        // Features
        let gFeatures = SVG.create('g', {});
        for (let i = 0; i < protein.feature.length; i++) {
            if (typeof protein.feature[i].ref != "undefined" && typeof protein.feature[i].location.end !== "undefined") {
                if (protein.feature[i].ref.indexOf("PF") == 0) {
                    let width = protein.feature[i].location.end.position - protein.feature[i].location.begin.position;
                    let rect = SVG.addChild(gFeatures, 'rect', {
                        x: (20 + protein.feature[i].location.begin.position) * ratio,
                        y: center,
                        rx: 5 * ratio,
                        ry: 5,
                        width: width * ratio,
                        height: 25,
                        style: "fill: #00DD00"
                    });

                    let text = SVG.addChild(gFeatures, 'text', {
                        x: (20 + protein.feature[i].location.begin.position + 5) * ratio,
                        y: center + 15,
                        style: "fill: white;font-size=4px;font-weight:10"
                    });
                    text.textContent = protein.feature[i].description.substring(0, 10);

                    $(rect).qtip({
                        content: {text: protein.feature[i].description, title: protein.feature[i].ref},
                        position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
                        style: {width: true, classes: ' ui-tooltip ui-tooltip-shadow'},
                        show: {delay: 250},
                        hide: {delay: 200}
                    });

                }
            }
        }
        svg.appendChild(gFeatures);

        let ruleSVG = this._createSvgRuleBar(settings.length, settings);
        svg.appendChild(ruleSVG);

        return svg;
    }

    _createSvgRuleBar(length, settings) {
        Object.assign(settings, {
            height: 20,
            startX: 20,
            startY: 90,
        });

        let g = SVG.create('g', {});

        let line = SVG.addChild(g, 'line', {
            x1: settings.startX * settings.ratio,
            y1: settings.startY,
            x2: (settings.startX + length) * settings.ratio,
            y2: settings.startY,
            style: "stroke: grey"
        });

        // Render small ticks
        for (let i = 0; i < length; i += 10) {
            SVG.addChild(g, 'line', {
                x1: (settings.startX + i) * settings.ratio,
                y1: settings.startY,
                x2: (settings.startX + i) * settings.ratio,
                y2: settings.startY + 5,
                style: "stroke: grey"
            });
        }

        // Render big ticks
        for (let i = 0; i <= length; i += 50) {
            SVG.addChild(g, 'line', {
                x1: (settings.startX + i) * settings.ratio,
                y1: settings.startY,
                x2: (settings.startX + i) * settings.ratio,
                y2: settings.startY + 10,
                style: "stroke: grey"
            });
            let text = SVG.addChild(g, 'text', {
                x: (settings.startX + i - 8) * settings.ratio,
                y: settings.startY + 25,
                style: "fill: black;font-size=4px;font-weight:10"
            });
            text.textContent = i;
        }

        // Render last tick
        SVG.addChild(g, 'line', {
            x1: (settings.startX + length) * settings.ratio,
            y1: settings.startY,
            x2: (settings.startX + length) * settings.ratio,
            y2: settings.startY + 10,
            style: "stroke: grey"
        });
        let text = SVG.addChild(g, 'text', {
            x: (settings.startX + length - 8) * settings.ratio,
            y: settings.startY + 25,
            style: "fill: black;font-size=4px;font-weight:10"
        });
        text.textContent = length;

        return g;
    }

    _getDefaultSetting() {
        let config = {
            width: 1000,
            height: 140,
            proteinPositioningInterval: 3
        };
        return config;
    }

    _getMutationTooltip(variant, consequenceType) {
        let mutation = "-";
        let codon = consequenceType.codon || '-';
        let score = [];
        let cadd = "-";
        let conservation = [];
        if (typeof consequenceType.proteinVariantAnnotation !== "undefined") {
            let proteinVariantAnnotation = consequenceType.proteinVariantAnnotation;
            mutation = proteinVariantAnnotation.reference + "/" + proteinVariantAnnotation.alternate;
            if (typeof proteinVariantAnnotation.substitutionScores !== "undefined" && proteinVariantAnnotation.substitutionScores.length > 0) {
                for (let i = 0; i < proteinVariantAnnotation.substitutionScores.length; i++) {
                    score.push("<b>" + proteinVariantAnnotation.substitutionScores[i].source.charAt(0).toUpperCase()
                        + proteinVariantAnnotation.substitutionScores[i].source.slice(1) + "</b>: " + proteinVariantAnnotation.substitutionScores[0].score);
                }
            }
        }
        if (typeof variant.annotation !== "undefined") {
            if (typeof variant.annotation.functionalScore !== "undefined") {
                for (let i = 0; i < variant.annotation.functionalScore.length; i++) {
                    if (variant.annotation.functionalScore[i].source == "cadd_scaled") {
                        cadd = Number(variant.annotation.functionalScore[i].score).toFixed(2);
                        break;
                    }
                }
            }

            if (typeof variant.annotation.conservation !== "undefined") {
                for (let j = 0; j < variant.annotation.conservation.length; j++) {
                    conservation.push("<b>" + variant.annotation.conservation[j].source.charAt(0).toUpperCase()
                        + variant.annotation.conservation[j].source.slice(1) + "</b>: " + Number(variant.annotation.conservation[j].score).toFixed(3));
                }
            }
        }

        let tooltip = "<b>ID</b>: " + variant.id + "<br>"
            + "<b>Mutation</b>: " + mutation + "<br>"
            + "<b>Codon</b>: " + codon + "<br>";
        if (score.length > 0) {
            tooltip += score.join("<br>") + "<br>";
        }
        tooltip += "<b>CADD</b>: " + cadd + "<br>";
        if (conservation.length > 0) {
            tooltip += conservation.join("<br>");
        }
        return tooltip;
    }
}