import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";
import UtilsNew from "../utils-new.js";

export default {

    CONSEQUENCE_TYPES_COLORS: {
        "missense_variant": "#cc9a06",
        "frameshift_variant": "#dc3545",
        "stop_gained": "#6f42c1",
        "splice_region_variant": "#0d6efd",
        "other": "#6c757d",
    },
    PROTEIN_FEATURES_COLORS: {
        "domain": "#fd9843",
        "region of interest": "#3d8bfd",
        "other": "#adb5bd",
    },

    getDefaultConfig() {
        return {
            showProteinScale: true,
            showProteinStructure: true,
            showProteinLollipops: true,
            showLegend: true,
            labelsWidth: 200,
            proteinFeatures: [
                "domain",
                "region of interest",
            ],
        };
    },

    // This is a terrible hack to find the correct protein ID and the transcript ID
    getProteinInfoFromGene(client, geneName) {
        let protein = null;
        return client.getProteinClient(null, "search", {gene: geneName})
            .then(response => {
                protein = response.responses[0].results[0];
                // const gene = protein?.gene[0]?.name?.find(item => item.type === "primary");
                return client.getGeneClient(geneName, "transcript", {});
            })
            .then(response => {
                const transcript = response.responses[0]?.results?.find(item => {
                    return item.proteinSequence === protein.sequence.value;
                });
                if (transcript) {
                    protein.proteinId = transcript.proteinId;
                    protein.transcriptId = transcript.id;
                }
                return protein;
            });
    },

    // Draw protein visualization
    draw(target, protein, variants, customConfig) {
        const prefix = UtilsNew.randomString(8);
        const config = {
            ...this.getDefaultConfig(),
            ...customConfig,
        };

        // Initialize template
        const template = `
            <div id="${prefix}" class="" style="user-select:none;font-size:16px;">
            </div>
        `;
        const parent = UtilsNew.renderHTML(template).querySelector(`div#${prefix}`);

        // Append HTML content into target element (if provided)
        if (target) {
            target.appendChild(parent);
        }

        // Initialize SVG for reindering protein tracks
        const svg = SVG.init(parent, {width: "100%"}, 0);
        const width = svg.clientWidth;
        let offset = 0;

        // Get protein length
        const chainFeature = protein.feature?.find(feature => feature.type === "chain");
        if (!chainFeature || !chainFeature?.location?.end?.position) {
            throw new Error("No 'chain' feature found in protein");
        }
        const proteinLength = chainFeature.location.end.position;

        // Tiny utility to calculate the positin in px from the given protein coordinate
        const getPixelPosition = p => p * width / proteinLength;

        if (config.showProteinScale) {
            offset = offset + 25;
            const group = SVG.addChild(svg, "g", {
                "transform": `translate(0,${offset})`,
            });

            // Append scale ticks
            for (let i = 1; i * 200 < proteinLength; i++) {
                const tickValue = i * 200;
                const tickPosition = getPixelPosition(tickValue) - 0.5;
                SVG.addChild(group, "path", {
                    "d": `M${tickPosition}-6V0.5`,
                    "fill": "none",
                    "stroke": "black",
                    "stroke-width": "1px",
                });
                SVG.addChildText(group, tickValue.toString(), {
                    "fill": "black",
                    "font-family": "Arial",
                    "font-size": "10px",
                    "style": "cursor:default;",
                    "text-anchor": "middle",
                    "x": tickPosition,
                    "y": -8,
                });
            }

            // Append scale line
            SVG.addChild(group, "path", {
                "d": `M0.5,-6V0.5H${(width - 0.5)}V-6`,
                "fill": "none",
                "stroke": "black",
                "stroke-width": "1px",
            });
        }

        // Show protein lollipops
        if (config.showProteinLollipops) {
            offset = offset + 200;
            const group = SVG.addChild(svg, "g", {
                "transform": `translate(0, ${offset})`,
            });

            const lollipopsVariants = (variants || [])
                .map(variant => {
                    let info = null;
                    const ct = variant?.annotation?.consequenceTypes?.find(item => {
                        return item.transcriptId === protein.transcriptId && item?.proteinVariantAnnotation?.proteinId === protein.proteinId;
                    });

                    if (ct && ct.proteinVariantAnnotation?.position) {
                        info = {
                            variantId: variant.id,
                            position: ct.proteinVariantAnnotation.position,
                            sequenceOntologyTerms: ct.sequenceOntologyTerms,
                        };
                    }
                    return info;
                })
                .filter(item => !!item)
                .sort((a, b) => a.position < b.position ? -1 : +1);

            // Render lollipops
            LollipopLayout
                .layout(lollipopsVariants.map(item => getPixelPosition(item.position)), 20)
                .forEach((x1, index) => {
                    const info = lollipopsVariants[index];
                    const x0 = getPixelPosition(info.position);
                    const consequenceType = info.sequenceOntologyTerms?.[0]?.name || "other";
                    const color = this.CONSEQUENCE_TYPES_COLORS[consequenceType] || this.CONSEQUENCE_TYPES_COLORS.other;

                    // Lollipop line
                    SVG.addChild(group, "path", {
                        "d": `M${x0 - 0.5},0V-30L${x1 - 0.5},-50V-70`,
                        "fill": "none",
                        "stroke": color,
                        "stroke-width": "1px",
                    });

                    // Lollipop circle
                    SVG.addChild(group, "circle", {
                        "cx": x1 - 0.5,
                        "cy": -70,
                        "r": 8,
                        "fill": color,
                        "stroke": "#fff",
                        "stroke-width": "2px",
                    });

                    // Variant ID
                    SVG.addChildText(group, info.variantId, {
                        // "x": x1,
                        // "y": -80,
                        "fill": color,
                        "text-anchor": "start",
                        "dominant-baseline": "middle",
                        // "transform": "rotate(-90)",
                        "style": `transform:rotate(-90deg) translate(85px,${x1}px);font-size:0.8em;font-weight:bold;`,
                    });
                });
        }

        // Show protein structure
        if (config.showProteinStructure) {
            offset = offset + 50;

            const defaultColor = this.PROTEIN_FEATURES_COLORS.other;
            const group = SVG.addChild(svg, "g", {
                "transform": `translate(0, ${offset})`,
            });

            // Append structure line
            SVG.addChild(group, "path", {
                "d": `M0.5,-20.5H${(width - 0.5)}`,
                "fill": "none",
                "stroke": "#212529",
                "stroke-width": "2px",
            });

            // Append protein domains
            protein.feature
                .filter(feature => config.proteinFeatures.includes(feature.type))
                .forEach(feature => {
                    const featureStart = getPixelPosition(feature.location.begin.position);
                    const featureEnd = getPixelPosition(feature.location.end.position);

                    SVG.addChild(group, "rect", {
                        "fill": this.PROTEIN_FEATURES_COLORS[feature.type] || defaultColor,
                        "height": 40,
                        "stroke": "#212529",
                        "stroke-width": "2px",
                        "width": (featureEnd - featureStart),
                        "x": featureStart,
                        "y": -41,
                        "title": feature.description,
                    });
                });
        }

        // Update SVG size
        svg.setAttribute("height", `${offset}px`);

        return svg;
    },
};
