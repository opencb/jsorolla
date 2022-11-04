import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";
import UtilsNew from "../utils-new.js";

export default {
    CONSEQUENCE_TYPES: [
        "frameshift_variant",
        "incomplete_terminal_codon_variant",
        "start_lost",
        "stop_gained",
        "stop_lost",
        "splice_acceptor_variant",
        "splice_donor_variant",
        "feature_truncation",
        "transcript_ablation",
        "inframe_deletion",
        "inframe_insertion",
        "missense_variant",
    ],
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
            padding: 10,
            showProteinScale: true,
            showProteinStructure: true,
            showProteinLollipops: true,
            showLegend: true,
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

    generateLegendField(parent, title, content) {
        const field = UtilsNew.renderHTML(`
            <div style="font-size:0.8em;color:#6c757d;">
                <strong>${title.toUpperCase()}</strong>
            </div>
            <div style="display:flex;">
                ${content}
            </div>
        `);
        parent.appendChild(field);
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
                <div style="display:${config.showLegend ? "block" : "none"};margin-top:1em;">
                    <div style="font-size:0.8em;border-bottom:1px solid #adb5bd;margin-bottom:1em;">
                        <strong style="color:#6c757d;">Legend</strong>
                    </div>
                    <div id="${prefix}Legends" style="display:grid;grid-template-columns:120px 1fr;row-gap:1em;"></div>
                </div>
            </div>
        `;
        const parent = UtilsNew.renderHTML(template).querySelector(`div#${prefix}`);
        const legendsParent = parent.querySelector(`div#${prefix}Legends`);

        // Append HTML content into target element (if provided)
        if (target) {
            target.appendChild(parent);
        }

        // Initialize SVG for reindering protein tracks
        const svg = SVG.init(parent, {width: "100%"}, 0);
        const width = svg.clientWidth - 2 * config.padding;
        let offset = 0;

        // Get protein length
        const chainFeature = protein.feature?.find(feature => feature.type === "chain");
        if (!chainFeature || !chainFeature?.location?.end?.position) {
            throw new Error("No 'chain' feature found in protein");
        }
        const proteinLength = chainFeature.location.end.position;

        // Tiny utility to calculate the position in px from the given protein coordinate
        const getPixelPosition = p => p * width / proteinLength;

        if (config.showProteinScale) {
            offset = offset + 25;
            const group = SVG.addChild(svg, "g", {
                "transform": `translate(${config.padding},${offset})`,
            });

            // Append scale ticks
            for (let i = 0; i * 200 < proteinLength; i++) {
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

        // Show protein lollipops track
        if (config.showProteinLollipops) {
            const group = SVG.addChild(svg, "g", {});
            const variantsCounts = {};
            let maxHeight = 0; // Track maximum height

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

                    // Variant text
                    const text = SVG.addChildText(group, info.variantId, {
                        "fill": color,
                        "text-anchor": "start",
                        "dominant-baseline": "middle",
                        "style": `transform:rotate(-90deg) translate(85px,${x1}px);font-size:0.8em;font-weight:bold;`,
                    });

                    // Update track max height, using the size of the variant ID
                    maxHeight = Math.max(maxHeight, text.getBBox().width);

                    // Add the consequence type of this variant to the legend
                    if (typeof variantsCounts[consequenceType] !== "number") {
                        variantsCounts[consequenceType] = 0;
                    }
                    variantsCounts[consequenceType]++;
                });

            // Generate variants legend
            const variantsLegend = Object.keys(variantsCounts).map(id => {
                const color = this.CONSEQUENCE_TYPES_COLORS[id] || this.CONSEQUENCE_TYPES_COLORS.other;
                const count = variantsCounts[id];
                return `
                    <div style="display:flex;align-items:center;font-size:0.8em;margin-right:1em;">
                        <div style="background-color:${color};border-radius:1em;padding:0.5em;"></div>
                        <div style="margin-left:0.5em;">
                            <strong style="color:${color};">${id.toUpperCase()}</strong> (${count})
                        </div>
                    </div>
                `;
            });

            this.generateLegendField(legendsParent, "Variant", variantsLegend.join(""));

            // Update the lollipop track position
            offset = offset + 100 + maxHeight;
            group.setAttribute("transform", `translate(${config.padding}, ${offset})`);
        }

        // Show protein structure
        if (config.showProteinStructure) {
            offset = offset + 50;

            const featuresCounts = {};
            const defaultColor = this.PROTEIN_FEATURES_COLORS.other;
            const group = SVG.addChild(svg, "g", {
                "transform": `translate(${config.padding}, ${offset})`,
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
                        // "stroke": "#212529",
                        // "stroke-width": "1px",
                        "width": (featureEnd - featureStart),
                        "x": featureStart,
                        "y": -41,
                        "title": feature.description,
                    });

                    // Register this feature for the legend
                    if (typeof featuresCounts[feature.type] !== "number") {
                        featuresCounts[feature.type] = 0;
                    }
                    featuresCounts[feature.type]++;
                });

            // Generate protein features legend
            const featuresLegend = Object.keys(featuresCounts).map(id => {
                const color = this.PROTEIN_FEATURES_COLORS[id] || defaultColor;
                return `
                    <div style="display:flex;align-items:center;font-size:0.8em;margin-right:1em;">
                        <div style="background-color:${color};border-radius:0.5em;padding:0.6em 1em;"></div>
                        <div style="margin-left:0.5em;">
                            <strong style="color:${color};">${id.toUpperCase()}</strong>
                        </div>
                    </div>
                `;
            });

            this.generateLegendField(legendsParent, "Protein", featuresLegend.join(""));
        }

        // Update SVG size
        svg.setAttribute("height", `${offset}px`);

        return svg;
    },
};
