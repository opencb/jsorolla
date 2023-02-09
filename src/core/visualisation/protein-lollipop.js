import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";
import UtilsNew from "../utils-new.js";
import VizUtils from "./viz-utils.js";

export default {
    COLORS: {
        GRAY: "#6c757d",
    },
    TRACK_TYPES: {
        MAIN_SCALE: "main:scale",
        MAIN_VARIANTS: "main:variants",
        MAIN_PROTEIN: "main:protein",
        VARIANTS: "variants",
        OPENCGA_VARIANTS: "opencga-variants",
        CELLBASE_VARIANTS: "cellbase-variants",
        CANCERHOTSPOTS: "cancerhotspots",
    },
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
        // "coding_sequence_variant": "#198754",
        // "feature_elongation": "#198754",
        // "inframe_variant": "#0d63fd",
        // "initiator_codon_variant": "#fd7e14",
        // "NMD_transcript_variant": "#198754",
        // "protein_altering_variant": "#fd7e14",
        // "synonymous_variant": "#0d63fd",
        // "stop_retained_variant": "#0d63fd",
        // "terminator_codon_variant": "#0d63fd",
        "feature_truncation": "#198754",
        "frameshift_variant": "#dc3545",
        "incomplete_terminal_codon_variant": "#0d63fd",
        "inframe_deletion": "#dc3545",
        "inframe_insertion": "#dc3545",
        "missense_variant": "#fd7e14",
        "start_lost": "#dc3545",
        "stop_gained": "#dc3545",
        "stop_lost": "#dc3545",
        "other": "#909294",
    },
    PROTEIN_FEATURES_COLORS: {
        "domain": "#fd9843",
        "region of interest": "#3d8bfd",
        "other": "#adb5bd",
    },

    // Tiny utility to check if the track type is variants
    isVariantsTrack(track) {
        return (
            track?.type === this.TRACK_TYPES.VARIANTS ||
            track?.type === this.TRACK_TYPES.OPENCGA_VARIANTS ||
            track?.type === this.TRACK_TYPES.CELLBASE_VARIANTS
        );
    },

    generateTrackInfo(parent, config) {
        const group = SVG.addChild(parent, "g", {});
        let offset = 0;

        // Add track title
        if (config?.title) {
            SVG.addChildText(group, config.title.toUpperCase(), {
                "x": 0,
                "y": 0,
                "fill": "#000",
                "text-anchor": "end",
                "dominant-baseline": "hanging",
                "style": "font-size:0.875em;font-weight:bold;",
            });
            offset = offset + 16;
        }

        // Add track additional lines
        (config?.additionalLines || []).forEach(line => {
            SVG.addChildText(group, line, {
                "x": 0,
                "y": offset,
                "fill": "#000",
                "text-anchor": "end",
                "dominant-baseline": "hanging",
                "style": "font-size:0.625em;",
            });
            offset = offset + 16;
        });

        // Move info group
        group.setAttribute("transform", `translate(${config.translateX} ${config.translateY})`);

        return group;
    },

    generateTrackLegend(parent, config) {
        const legendParent = SVG.addChild(parent, "foreignObject", {
            x: config.x ?? 0,
            y: config.y ?? 0,
            width: config.width,
            height: config.height,
        });

        const template = UtilsNew.renderHTML(`
            <div style="display:flex;flex-direction:row-reverse;padding-top:0.4em;">
                ${(config.items || []).map((item, index) => `
                    <div data-index="${index}" style="display:flex;align-items:center;font-size:8px;margin-left:1em;cursor:pointer;">
                        <div style="background-color:${item.color};border-radius:1em;padding:0.5em;"></div>
                        <div style="margin-left:0.5em;line-height:1.5;">
                            <strong style="color:${item.color};">
                                ${item.title.toUpperCase()} ${item.count ? `(${item.count})` : ""}
                            </strong>
                        </div>
                    </div>
                `).join("")}
            </div>
        `);

        // Register events listeners
        if (config.onEnable && config.onDisable) {
            let activeItem = -1;
            const allElements = Array.from(template.querySelectorAll("div[data-index]"));
            allElements.forEach(element => {
                const index = parseInt(element.dataset.index);
                element.addEventListener("click", () => {
                    if (activeItem === index) {
                        config.onDisable?.(config.items[index], index);
                        activeItem = -1;
                        // We need to reset the opacity of all labels
                        allElements.forEach(el => {
                            // eslint-disable-next-line no-param-reassign
                            el.style.opacity = 1;
                        });
                    } else {
                        config.onEnable?.(config.items[index], index);
                        activeItem = index;
                        // Add a little transparency to all legend labels, excluding the clicked label
                        allElements.forEach(el => {
                            // eslint-disable-next-line no-param-reassign
                            el.style.opacity = el.dataset.index === element.dataset.index ? 1 : 0.5;
                        });
                    }
                });
            });
        }

        // Append template to legend parent element
        legendParent.appendChild(template);
    },

    generateTrackEmptyMessage(parent, config) {
        const group = SVG.addChild(parent, "g", {});
        SVG.addChild(group, "rect", {
            "x": 0,
            "y": (-1) * config.height,
            "width": config.width,
            "height": config.height,
            "fill": "#e9ecef",
            "stroke": "none",
        });
        SVG.addChildText(group, "No variants to display", {
            "x": config.width / 2,
            "y": (-1) * config.height / 2,
            "fill": "#212529",
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "style": "font-size:0.8em;font-weight:bold;",
        });
    },

    parseVariantsList(data, transcript, protein, type) {
        switch (type) {
            case this.TRACK_TYPES.VARIANTS:
            case this.TRACK_TYPES.OPENCGA_VARIANTS:
            case this.TRACK_TYPES.CELLBASE_VARIANTS:
                return data
                    .map(variant => {
                        let info = null;
                        const ct = variant?.annotation?.consequenceTypes?.find(item => {
                            return item.transcriptId === transcript.id && item?.proteinVariantAnnotation?.proteinId === transcript.proteinId;
                        });

                        if (ct && ct.proteinVariantAnnotation?.position) {
                            const annotation = ct.proteinVariantAnnotation;
                            info = {
                                id: variant.id,
                                position: ct.proteinVariantAnnotation.position,
                                title: `${(annotation.reference || "-")}${annotation.position}${(annotation.alternate || "-")}`,
                                // type: ct.sequenceOntologyTerms?.[0]?.name || "other",
                                type: variant?.annotation?.displayConsequenceType || "other",
                                variant: variant,
                                consequenceType: ct,
                            };
                        }
                        return info;
                    })
                    .filter(item => !!item)
                    .sort((a, b) => a.position < b.position ? -1 : +1);
            case this.TRACK_TYPES.CANCERHOTSPOTS:
                const parsedItems = data
                    .filter(item => {
                        return protein.sequence?.value?.[item.aminoacidPosition - 1] === item.aminoacidReference;
                    })
                    .map((item, index) => {
                        return {
                            id: index,
                            position: item.aminoacidPosition,
                            cancerHotspot: item,
                        };
                    });

                return parsedItems;
                // return (parsedItems.length >= data.length * 0.75) ? parsedItems : [];
            default:
                return [];
        }
    },

    variantsTooltipFormatter(variant, consequenceType) {
        const protein = consequenceType.proteinVariantAnnotation;
        const cohort = variant.studies?.[0]?.stats?.find(item => item.cohortId?.toUpperCase() === "ALL");

        return `
            ${consequenceType.hgvs?.length > 0 ? `
                <div style="margin-top:4px;">
                    <b>HGVS</b>
                </div>
                <ul style="padding-left:16px;margin-bottom:0px;">
                    ${consequenceType.hgvs.map(item => `<li>${item}</li>`).join("")}
                </ul>
            ` : ""}
            <div style="margin-top:8px;margin-bottom:4px;border-bottom:1px solid #ffffff50;">
                <b>PROTEIN ${protein.proteinId || "-"}</b>
            </div>
            <div><b>ID</b>: ${(protein.reference || "-")}${protein.position}${(protein.alternate || "-")}</div>
            ${protein.substitutionScores?.length > 0 ? `
                <div><b>Substitution Scores</b>:</div>
                <ul style="padding-left:16px;margin-bottom:0px;">
                    ${protein.substitutionScores.map(s => `<li><b>${s.source}</b>: ${s.score}</li>`).join("")}
                </ul>
            ` : ""}
            ${cohort ? `
                <div style="margin-top:8px;margin-bottom:4px;border-bottom:1px solid #ffffff50;">
                    <b>COHORT STATS</b>
                </div>
                <div><b>Num Samples</b>: ${cohort.sampleCount ?? "-"}</div>
                <div><b>Allele frequencies</b></div>
                <ul style="padding-left:16px;margin-bottom:0px;">
                    <li><b>${variant.reference || "-"} (ref)</b>: ${cohort.refAlleleFreq}</li>
                    <li><b>${variant.alternate || "-"} (alt)</b>: ${cohort.altAlleleFreq}</li>
                </ul>
                <div><b>Genotype frequencies</b></div>
                <ul style="padding-left:16px;margin-bottom:0px;">
                    <li><b>${variant.reference}${variant.reference} (0/0)</b>: ${cohort.genotypeFreq["0/0"] ?? "-"}</li>
                    <li><b>${variant.reference}${variant.alternate} (0/1)</b>: ${cohort.genotypeFreq["0/1"] ?? "-"}</li>
                    <li><b>${variant.alternate}${variant.alternate} (1/1)</b>: ${cohort.genotypeFreq["1/1"] ?? "-"}</li>
                </ul>
            `: ""}
        `;
    },

    cosmicTooltipFormatter(variant) {
        return (variant.annotation?.traitAssociation || [])
            .map(traitAssociation => {
                const somaticInformation = traitAssociation?.somaticInformation || null;
                const additionalProperties = traitAssociation.additionalProperties || [];

                return `
                    <div><b>ID</b>: ${traitAssociation.id || "-"}</div>
                    ${somaticInformation ? `
                        <div style="margin-top:2px;">
                            <b>Somatic information</b>
                        </div>
                        <ul style="padding-left:20px;margin-bottom:0px;">
                            <li><b>Primary Site</b>: ${somaticInformation.primarySite || "-"}</li>
                            <li><b>Primary Histology</b>: ${somaticInformation.primaryHistology || "-"}</li>
                            <li><b>Histology Subtype</b>: ${somaticInformation.histologySubtype || "-"}</li>
                            <li><b>Tumour Origin</b>: ${somaticInformation.tumourOrigin || "-"}</li>
                            <li><b>Sample Source</b>: ${somaticInformation.sampleSource || "-"}</li>
                        </ul>
                    ` : ""}
                    ${additionalProperties?.length > 0 ? `
                        <div style="margin-top:2px;">
                            <b>Additional properties</b>
                        </div>
                        <ul style="padding-left:20px;margin-bottom:0px;">
                            ${additionalProperties.map(item => `<li><b>${item.name}</b>: ${item.value || "-"}</li>`).join("")}
                        </ul>
                    ` : ""}
                `;
            })
            .join("<hr style='margin-top:8px;margin-bottom:8px;opacity:0.2;' />");
    },

    clinvarTooltipFormatter(variant) {
        return (variant.annotation?.traitAssociation || [])
            .map(traitAssociation => {
                const heritableTraits = traitAssociation.heritableTraits?.filter(item => !!item.trait);
                const additionalProperties = traitAssociation.additionalProperties || [];

                return `
                    <div><b>ID</b>: ${traitAssociation.id || "-"}</div>
                    <div><b>Clinical Significance</b>: ${traitAssociation?.variantClassification?.clinicalSignificance || "-"}</div>
                    ${heritableTraits?.length > 0 ? `
                        <div style="margin-top:2px;">
                            <b>Heritable Traits</b>
                        </div>
                        <ul style="padding-left:20px;margin-bottom:0px;">
                            ${heritableTraits.map(item => `<li>${item.trait}</li>`).join("")}
                        </ul>
                    ` : ""}
                    ${additionalProperties?.length > 0 ? `
                        <div style="margin-top:2px;">
                            <b>Additional properties</b>
                        </div>
                        <ul style="padding-left:20px;margin-bottom:0px;">
                            ${additionalProperties.map(item => `<li><b>${item.name}</b>: ${item.value || "-"}</li>`).join("")}
                        </ul>
                    ` : ""}
                `;
            })
            .join("<hr style='margin-top:8px;margin-bottom:8px;opacity:0.2;' />");
    },

    exonsTooltipFormatter(exon) {
        return `
            <div><strong>cdsStart</strong>: ${exon.cdsStart}</div>
            <div><strong>cdsEnd</strong>: ${exon.cdsEnd}</div>
            <div><strong>phase</strong>: ${exon.phase}</div>
        `;
    },

    // Draw protein visualization
    draw(target, transcript, protein, variants, customConfig) {
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
        const width = svg.clientWidth - 2 * config.padding - config.trackInfoWidth;
        let offset = 0;

        // Get protein length
        const chainFeature = protein.feature?.find(feature => feature.type === "chain");
        if (!chainFeature || !chainFeature?.location?.end?.position) {
            throw new Error("No 'chain' feature found in protein");
        }
        const proteinLength = chainFeature.location.end.position;

        // Tiny utility to calculate the position in px from the given protein coordinate
        const getPixelPosition = p => Math.min(p, proteinLength) * width / proteinLength;

        // Container for all tracks
        const container = SVG.addChild(svg, "g", {
            "transform": `translate(${config.padding + config.trackInfoWidth}, 0)`,
        });

        // Vertical rule for displaying position
        const rule = SVG.addChild(container, "g", {
            "transform": "",
            "style": "display:none;",
        });

        if (config.scaleVisible) {
            offset = offset + config.scaleHeight;
            const group = SVG.addChild(container, "g", {
                "data-track": this.TRACK_TYPES.MAIN_SCALE,
                "transform": `translate(0, ${offset})`,
            });

            // Append scale ticks
            VizUtils.getScaleTicks(1, proteinLength, Math.floor(width / 100)).forEach(tickValue => {
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
            });

            // Append scale line
            SVG.addChild(group, "path", {
                "d": `M0.5,-6V0.5H${(width - 0.5)}V-6`,
                "fill": "none",
                "stroke": "black",
                "stroke-width": "1px",
            });

            // Append scale title
            this.generateTrackInfo(group, {
                title: "Scale",
                additionalLines: [],
                translateX: -config.trackInfoPadding,
                translateY: -15,
            });

            // Add a little margin between the scale and the other tracks
            offset = offset + 10;
        }

        // Show protein lollipops track
        if (config.variantsVisible) {
            const group = SVG.addChild(container, "g", {
                "data-track": this.TRACK_TYPES.MAIN_VARIANTS,
            });
            const variantsCounts = {};
            let maxHeight = 0; // Track maximum height
            const lollipopsVariants = this.parseVariantsList(variants, transcript, protein, this.TRACK_TYPES.VARIANTS);

            // Render lollipops
            if (lollipopsVariants.length > 0) {
                LollipopLayout
                    .layout(lollipopsVariants.map(item => getPixelPosition(item.position)), {
                        minSeparation: 20,
                    })
                    .forEach((x1, index) => {
                        const info = lollipopsVariants[index];
                        const x0 = getPixelPosition(info.position);
                        const color = config.variantsColors?.[info.type] || this.COLORS.GRAY;

                        // We will generate a new group to wrap all lollipop elements
                        const lollipopGroup = SVG.addChild(group, "g", {
                            "data-id": info.variant.id,
                            "data-index": index,
                            "data-ct": info.type,
                            "data-position": info.position,
                            "data-highlighted": "false",
                            "style": "opacity:1;",
                        });

                        // Lollipop line
                        SVG.addChild(lollipopGroup, "path", {
                            "d": `M${x0 - 0.5},0V-30L${x1 - 0.5},-50V-70`,
                            "fill": "none",
                            "stroke": color,
                            "stroke-width": "1px",
                            "data-default-stroke-color": color,
                            "data-default-stroke-width": "1px",
                        });

                        // Lollipop circle
                        const circleElement = SVG.addChild(lollipopGroup, "circle", {
                            "cx": x1 - 0.5,
                            "cy": -70,
                            "r": 8,
                            "fill": color,
                            "stroke": "#fff",
                            "stroke-width": "2px",
                            "data-default-stroke-color": "#fff",
                            "data-default-stroke-width": "2px",
                        });

                        // Lollipop ID text
                        const text = SVG.addChildText(lollipopGroup, info.title, {
                            "fill": color,
                            "text-anchor": "start",
                            "dominant-baseline": "middle",
                            "style": `transform:rotate(-90deg) translate(85px,${x1}px);font-size:0.8em;`,
                        });

                        // Add tooltip to the circle
                        if (config.variantsTooltipVisible && typeof config.variantsTooltipFormatter === "function") {
                            VizUtils.createTooltip(circleElement, {
                                title: info.variant.id,
                                content: config.variantsTooltipFormatter(info.variant, info.consequenceType),
                                width: config.variantsTooltipWidth,
                            });
                        }

                        // Register hover and out events
                        circleElement.addEventListener("mouseover", () => {
                            Array.from(parent.querySelectorAll(`g[data-position="${info.position}"]`)).forEach(el => {
                                if (el.dataset.highlighted !== "true") {
                                    [el.querySelector("circle"), el.querySelector("path")].forEach(childEl => {
                                        // eslint-disable-next-line no-param-reassign
                                        childEl.style.stroke = config.hoverStrokeColor;
                                        // eslint-disable-next-line no-param-reassign
                                        childEl.style.strokeWidth = config.hoverStrokeWidth;
                                    });
                                }
                            });

                            // Change font-weight style of lollipop text
                            text.style.fontWeight = "bold";

                            // Show and translate rule element
                            rule.style.display = "";
                            rule.setAttribute("transform", `translate(${getPixelPosition(info.position)},0)`);
                        });
                        circleElement.addEventListener("mouseout", () => {
                            Array.from(parent.querySelectorAll(`g[data-position="${info.position}"]`)).forEach(el => {
                                if (el.dataset.highlighted !== "true") {
                                    // We need to restore the previous stroke and color of the variant, that is stored as a 'data-default-*'
                                    // attribute in the element
                                    [el.querySelector("circle"), el.querySelector("path")].forEach(child => {
                                        // eslint-disable-next-line no-param-reassign
                                        child.style.stroke = child.dataset.defaultStrokeColor;
                                        // eslint-disable-next-line no-param-reassign
                                        child.style.strokeWidth = child.dataset.defaultStrokeWidth;
                                    });
                                }
                            });

                            // Reset font-weight style of lollipop text
                            text.style.fontWeight = "normal";

                            // Hide rule
                            rule.style.display = "none";
                        });

                        // Update track max height, using the size of the variant ID
                        maxHeight = Math.max(maxHeight, 100 + text.getBBox().width);

                        // Add the consequence type of this variant to the legend
                        if (typeof variantsCounts[info.type] !== "number") {
                            variantsCounts[info.type] = 0;
                        }
                        variantsCounts[info.type]++;
                    });
            } else {
                // No variants to display
                this.generateTrackEmptyMessage(group, {
                    width: width,
                    height: config.emptyHeight,
                });
                maxHeight = config.emptyHeight;
            }

            // Info section
            this.generateTrackInfo(group, {
                title: config.title,
                additionalLines: [
                    `${lollipopsVariants.length} Variants`,
                ],
                translateX: -config.trackInfoPadding,
                translateY: -maxHeight,
            });

            // Update the lollipop track position
            offset = offset + maxHeight;
            group.setAttribute("transform", `translate(0, ${offset})`);

            // Display lollipops legend
            if (config.legendVisible && Object.keys(variantsCounts).length > 0) {
                this.generateTrackLegend(group, {
                    items: Object.keys(variantsCounts).map(id => ({
                        id: id,
                        title: id.toUpperCase(),
                        color: this.CONSEQUENCE_TYPES_COLORS[id] || this.CONSEQUENCE_TYPES_COLORS.other,
                        count: variantsCounts[id],
                    })),
                    width: width,
                    height: config.legendHeight,
                    onEnable: item => {
                        Array.from(group.querySelectorAll("g[data-ct]")).forEach(element => {
                            // eslint-disable-next-line no-param-reassign
                            element.style.opacity = item.id === element.dataset.ct ? 1 : 0.2;
                        });
                    },
                    onDisable: () => {
                        Array.from(group.querySelectorAll("g[data-ct]")).forEach(element => {
                            // eslint-disable-next-line no-param-reassign
                            element.style.opacity = 1;
                        });
                    },
                });

                // We need to update the offset to take into accound the legend height
                offset = offset + config.legendHeight;
            }
        }

        // Show protein structure
        if (config.proteinVisible) {
            offset = offset + 10 + config.proteinHeight;

            const featuresCounts = {};
            const defaultColor = this.PROTEIN_FEATURES_COLORS.other;
            const group = SVG.addChild(container, "g", {
                "data-track": this.TRACK_TYPES.MAIN_PROTEIN,
                "transform": `translate(0, ${offset})`,
            });

            // Append protein domains
            protein.feature
                .filter(feature => config.proteinFeatures.includes(feature.type))
                .forEach(feature => {
                    const featureStart = getPixelPosition(feature.location.begin.position);
                    const featureEnd = getPixelPosition(feature.location.end.position);

                    SVG.addChild(group, "rect", {
                        "fill": this.PROTEIN_FEATURES_COLORS[feature.type] || defaultColor,
                        "stroke": "none",
                        "height": config.proteinHeight,
                        "width": (featureEnd - featureStart),
                        "x": featureStart,
                        "y": (-1) * config.proteinHeight,
                        "title": feature.description,
                    });

                    // Register this feature for the legend
                    if (typeof featuresCounts[feature.type] !== "number") {
                        featuresCounts[feature.type] = 0;
                    }
                    featuresCounts[feature.type]++;
                });

            // Add exons separators
            if (config.proteinExonsVisible) {
                (transcript.exons || []).forEach(exon => {
                    if (exon.cdsEnd > 0) {
                        const startPosition = getPixelPosition(exon.cdsStart / 3);
                        const endPosition = getPixelPosition(exon.cdsEnd / 3);

                        SVG.addChild(group, "path", {
                            "d": `M${endPosition - 0.5},-${config.proteinHeight - 0.5}V0.5`,
                            "fill": "none",
                            "stroke": "#212529",
                            "stroke-width": "1px",
                            "stroke-dasharray": "3",
                        });

                        // Add mask for displaying exon tooltip
                        if (typeof config.proteinExonsTooltipFormatter === "function") {
                            const exonMask = SVG.addChild(group, "path", {
                                "d": `M${startPosition},-${config.proteinHeight}H${endPosition}V0H${startPosition}Z`,
                                "fill": "transparent",
                                "stroke": "none",
                            });

                            VizUtils.createTooltip(exonMask, {
                                title: exon.id,
                                content: config.proteinExonsTooltipFormatter(exon),
                                width: config.proteinExonsTooltipWidth,
                            });
                        }
                    }
                });
            }

            // Generate protein rectangle
            SVG.addChild(group, "path", {
                "d": `M0.5,-${config.proteinHeight - 0.5}H${(width - 0.5)}V0.5H0.5Z`,
                "fill": "none",
                "stroke": "#212529",
                "stroke-width": "1px",
            });

            // Section title
            this.generateTrackInfo(group, {
                title: "PROTEIN",
                additionalLines: [
                    transcript?.proteinId,
                    transcript?.id,
                ],
                translateX: -config.trackInfoPadding,
                translateY: -config.proteinHeight,
            });

            if (config.legendVisible) {
                this.generateTrackLegend(group, {
                    items: Object.keys(featuresCounts).map(id => ({
                        title: id.toUpperCase(),
                        color: this.PROTEIN_FEATURES_COLORS[id] || defaultColor,
                    })),
                    width: width,
                    height: config.legendHeight,
                });

                // We need to update the offset to take into accound the legend height
                offset = offset + config.legendHeight;
            }
        }

        // Render additional tracks
        (config.tracks || []).forEach(track => {
            const trackType = track.type || this.TRACK_TYPES.VARIANTS;
            const group = SVG.addChild(container, "g", {
                "data-track": trackType,
            });
            let trackHeight = 40; // Track maximum height
            const countsByType = {};
            const lollipopsVariants = this.parseVariantsList(track.data, transcript, protein, trackType);

            // Render lollipops
            if (lollipopsVariants.length > 0) {
                lollipopsVariants.forEach((info, index) => {
                    const x = getPixelPosition(info.position);

                    // Get item color using the trackType
                    let color = null;
                    switch (trackType) {
                        case this.TRACK_TYPES.VARIANTS:
                        case this.TRACK_TYPES.OPENCGA_VARIANTS:
                        case this.TRACK_TYPES.CELLBASE_VARIANTS:
                            color = config.variantsColors?.[info.type] || this.COLORS.GRAY;
                            break;
                        default:
                            color = this.COLORS.GRAY;
                    }

                    const lollipopGroup = SVG.addChild(group, "g", {
                        "data-ct": info.type || "",
                        "data-index": index,
                        "data-position": info.position,
                        "data-highlighted": "false",
                        "style": "opacity:1;",
                    });

                    // Lollipop line
                    SVG.addChild(lollipopGroup, "path", {
                        "d": `M${x - 0.5},-${trackHeight}V-${trackHeight - 20}`,
                        "fill": "none",
                        "stroke": color,
                        "stroke-width": "1px",
                        "data-default-stroke-color": color,
                        "data-default-stroke-width": "1px",
                    });

                    // Lollipop circle
                    const circleElement = SVG.addChild(lollipopGroup, "circle", {
                        "cx": x - 0.5,
                        "cy": (-1) * (trackHeight - 20),
                        "r": 6,
                        "fill": color,
                        "stroke": "#fff",
                        "stroke-width": "1px",
                        "data-default-stroke-color": "#fff",
                        "data-default-stroke-width": "1px",
                    });

                    // Add tooltip
                    if (typeof track.tooltip === "function") {
                        VizUtils.createTooltip(circleElement, {
                            content: track.tooltip(info.variant, info.consequenceType),
                            width: track.tooltipWidth || config.trackTooltipWidth,
                        });
                    }

                    if (this.isVariantsTrack(track)) {
                        if (typeof countsByType[info.type] !== "number") {
                            countsByType[info.type] = 0;
                        }
                        countsByType[info.type]++;
                    }
                });
            } else {
                // No variants to display
                this.generateTrackEmptyMessage(group, {
                    width: width,
                    height: config.emptyHeight,
                });
                trackHeight = config.emptyHeight;
            }

            // Display track info
            this.generateTrackInfo(group, {
                title: track.title,
                additionalLines: [
                    `${lollipopsVariants.length} Variants`,
                ],
                translateX: (-1) * config.trackInfoPadding,
                translateY: (-1) * trackHeight,
            });

            // Track separation
            if (config.trackSeparationVisible) {
                SVG.addChild(group, "path", {
                    "d": `M-${config.trackInfoWidth},-${trackHeight - 0.5 + config.trackSeparationHeight / 2}H${width + config.trackInfoWidth}`,
                    "fill": "none",
                    "stroke": "#000",
                    "stroke-width": "1px",
                    "stroke-dasharray": "5,5",
                    "style": "opacity:0.4;",
                });
            }

            offset = offset + trackHeight + config.trackSeparationHeight;
            group.setAttribute("transform", `translate(0, ${offset})`);

            // Display track legend
            if (this.isVariantsTrack(track) && config.legendVisible && Object.keys(countsByType).length > 0) {
                this.generateTrackLegend(group, {
                    items: Object.keys(countsByType).map(id => ({
                        id: id,
                        title: id.toUpperCase(),
                        color: this.CONSEQUENCE_TYPES_COLORS[id] || this.CONSEQUENCE_TYPES_COLORS.other,
                        count: countsByType[id],
                    })),
                    width: width,
                    height: config.legendHeight,
                    onEnable: item => {
                        Array.from(group.querySelectorAll("[data-ct]")).forEach(element => {
                            if (item.id === element.dataset.ct) {
                                // eslint-disable-next-line no-param-reassign
                                element.style.opacity = 1;
                                group.appendChild(element); // Bring this element to front
                            } else {
                                // eslint-disable-next-line no-param-reassign
                                element.style.opacity = 0.1;
                            }
                        });
                    },
                    onDisable: () => {
                        Array.from(group.querySelectorAll("[data-ct]"))
                            .sort((a, b) => parseInt(a.dataset.index) < parseInt(b.dataset.index) ? -1 : +1)
                            .forEach(element => {
                                // eslint-disable-next-line no-param-reassign
                                element.style.opacity = 1;
                                group.appendChild(element); // Reorder element
                            });
                    },
                });

                // We need to update the offset to take into accound the legend height
                offset = offset + config.legendHeight;
            }
        });

        // Apply highlights
        (config.highlights || []).forEach(highlight => {
            (highlight.variants || []).forEach(id => {
                const el = svg.querySelector(`g[data-track="${this.TRACK_TYPES.MAIN_VARIANTS}"] g[data-id="${id}"]`);

                if (el && el.dataset.highlighted === "false") {
                    const selector = `g[data-position="${el.dataset.position}"]`;

                    Array.from(svg.querySelectorAll(selector)).forEach(element => {
                        [element.querySelector("circle"), element.querySelector("path")].forEach(child => {
                            if (highlight.style?.strokeColor) {
                                // eslint-disable-next-line no-param-reassign
                                child.style.stroke = highlight.style.strokeColor;
                            }
                            if (highlight.style?.strokeWidth) {
                                // eslint-disable-next-line no-param-reassign
                                child.style.strokeWidth = highlight.style.strokeWidth;
                            }
                        });
                        // Mark this variant as highlighted
                        // eslint-disable-next-line no-param-reassign
                        element.dataset.highlighted = "true";
                    });
                }
            });
        });

        // We need to update the SVG height with the total height of all tracks
        svg.setAttribute("height", `${offset + 1}px`);

        // Generate rule content
        SVG.addChild(rule, "path", {
            "d": `M-0.5,0V${offset}`,
            "fill": "none",
            "stroke": config.positionRuleColor,
            "stroke-width": config.positionRuleWidth,
            "stroke-opacity": "0.75",
        });
        SVG.addChild(rule, "path", {
            "d": "M-0.5,8L-5.5,0L5,0Z",
            "fill": config.positionRuleColor,
            "stroke": "none",
        });

        return svg;
    },

    getDefaultConfig() {
        return {
            title: "",
            padding: 10,
            scaleVisible: true,
            scaleHeight: 25,
            variantsVisible: true,
            variantsColors: this.CONSEQUENCE_TYPES_COLORS,
            variantsTooltipVisible: true,
            variantsTooltipWidth: "240px",
            variantsTooltipPosition: "bottom",
            variantsTooltipFormatter: this.variantsTooltipFormatter,
            proteinVisible: true,
            proteinHeight: 40,
            proteinFeatures: [
                "domain",
                "region of interest",
            ],
            proteinExonsVisible: true,
            proteinExonsTooltipFormatter: this.exonsTooltipFormatter,
            proteinExonsTooltipWidth: "150px",
            tracks: [],
            trackInfoWidth: 120,
            trackInfoPadding: 12,
            trackSeparationVisible: true,
            trackSeparationHeight: 10,
            trackTooltipWidth: "240px",
            legendVisible: true,
            legendHeight: 20,
            emptyHeight: 40,
            hoverStrokeColor: "#fd984399",
            hoverStrokeWidth: "4px",
            positionRuleVisible: true,
            positionRuleColor: "#909294",
            positionRuleWidth: "1px",
            highlights: [],
        };
    },

};
