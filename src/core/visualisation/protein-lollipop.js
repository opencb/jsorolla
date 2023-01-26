import LollipopLayout from "./lollipop-layout.js";
import {SVG} from "../svg.js";
import UtilsNew from "../utils-new.js";
import VizUtils from "./viz-utils.js";

export default {
    TRACK_TYPES: {
        VARIANTS: "variants",
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

    // This is a terrible hack to find the correct protein ID and the transcript ID
    getProteinInfoFromGene(cellbaseClient, geneName) {
        let protein = null;
        return cellbaseClient.getProteinClient(null, "search", {gene: geneName})
            .then(response => {
                protein = response.responses[0].results[0];
                // const gene = protein?.gene[0]?.name?.find(item => item.type === "primary");
                return cellbaseClient.getGeneClient(geneName, "transcript", {});
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
        // const legendId = UtilsNew.randomString(8);
        const legendParent = SVG.addChild(parent, "foreignObject", {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width,
            height: config.height,
        });

        const template = UtilsNew.renderHTML(`
            <div style="display:flex;flex-direction:row-reverse;padding-top:0.4em;">
                ${(config.items || []).map((item, index) => `
                    <div data-index="${index}" style="display:flex;align-items:center;font-size:8px;margin-left:1em;cursor:pointer;">
                        <div style="background-color:${item.color};border-radius:1em;padding:0.5em;"></div>
                        <div style="margin-left:0.5em;line-height:1.5;">
                            <strong style="color:${item.color};">${item.title.toUpperCase()}</strong>
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

    parseVariantsList(data = [], transcript, protein, type) {
        switch (type) {
            case this.TRACK_TYPES.VARIANTS:
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
                                type: ct.sequenceOntologyTerms?.[0]?.name || "other",
                                variant: variant,
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

        if (config.showProteinScale) {
            offset = offset + 25;
            const group = SVG.addChild(container, "g", {
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
        if (config.showProteinLollipops) {
            const group = SVG.addChild(container, "g", {});
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
                        const color = this.CONSEQUENCE_TYPES_COLORS[info.type] || this.CONSEQUENCE_TYPES_COLORS.other;

                        // We will generate a new group to wrap all lollipop elements
                        const lollipopGroup = SVG.addChild(group, "g", {
                            "data-id": info.variant.id,
                            "data-index": index,
                            "data-ct": info.type,
                            "data-position": info.position,
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
                            "style": `transform:rotate(-90deg) translate(85px,${x1}px);font-size:0.8em;font-weight:bold;`,
                        });

                        // Add tooltip to the circle
                        VizUtils.createTooltip(circleElement, {
                            title: `Lollipop ${index}`,
                            content: "Lollipop tooltip content",
                            width: "120px",
                        });

                        // Register hover and out events for highlighting matches
                        circleElement.addEventListener("mouseover", () => {
                            Array.from(parent.querySelectorAll(`g[data-position="${info.position}"]`)).forEach(el => {
                                [el.querySelector("circle"), el.querySelector("path")].forEach(childEl => {
                                    // eslint-disable-next-line no-param-reassign
                                    childEl.style.stroke = config.highlightStrokeColor;
                                    // eslint-disable-next-line no-param-reassign
                                    childEl.style.strokeWidth = config.highlightStrokeWidth;
                                });

                                // Show and translate rule element
                                rule.style.display = "";
                                rule.setAttribute("transform", `translate(${getPixelPosition(info.position)},0)`);
                            });
                        });
                        circleElement.addEventListener("mouseout", () => {
                            Array.from(parent.querySelectorAll(`g[data-position="${info.position}"]`)).forEach(el => {
                                // We need to restore the previous stroke and color of the variant, that is stored as a 'data-default-*'
                                // attribute in the element
                                [el.querySelector("circle"), el.querySelector("path")].forEach(child => {
                                    // eslint-disable-next-line no-param-reassign
                                    child.style.stroke = child.dataset.defaultStrokeColor;
                                    // eslint-disable-next-line no-param-reassign
                                    child.style.strokeWidth = child.dataset.defaultStrokeWidth;
                                });

                                // Hide rule
                                rule.style.display = "none";
                            });
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
            if (config.showLegend && Object.keys(variantsCounts).length > 0) {
                this.generateTrackLegend(group, {
                    items: Object.keys(variantsCounts).map(id => ({
                        id: id,
                        title: id.toUpperCase(),
                        color: this.CONSEQUENCE_TYPES_COLORS[id] || this.CONSEQUENCE_TYPES_COLORS.other,
                        // color: this.PROTEIN_FEATURES_COLORS[id] || defaultColor,
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
        if (config.showProteinStructure) {
            offset = offset + 10 + config.proteinHeight;

            const featuresCounts = {};
            const defaultColor = this.PROTEIN_FEATURES_COLORS.other;
            const group = SVG.addChild(container, "g", {
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
                    transcript.proteinId,
                ],
                translateX: -config.trackInfoPadding,
                translateY: -config.proteinHeight,
            });

            if (config.showLegend) {
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
            const group = SVG.addChild(container, "g", {});
            const trackType = track.type || this.TRACK_TYPES.VARIANTS;
            let trackHeight = 40; // Track maximum height
            const countsByConsequenceType = {};
            const lollipopsVariants = this.parseVariantsList(track.data, transcript, protein, trackType);

            // Render lollipops
            if (lollipopsVariants.length > 0) {
                lollipopsVariants.forEach((info, index) => {
                    const x = getPixelPosition(info.position);

                    // Get item color using the trackType
                    let color = null;
                    switch (trackType) {
                        case this.TRACK_TYPES.VARIANTS:
                            color = this.CONSEQUENCE_TYPES_COLORS[info.type];
                            break;
                        default:
                            color = this.CONSEQUENCE_TYPES_COLORS.other;
                    }

                    const lollipopGroup = SVG.addChild(group, "g", {
                        "data-ct": info.type || "",
                        "data-index": index,
                        "data-position": info.position,
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
                    SVG.addChild(lollipopGroup, "circle", {
                        "cx": x - 0.5,
                        "cy": (-1) * (trackHeight - 20),
                        "r": 6,
                        "fill": color,
                        "stroke": "#fff",
                        "stroke-width": "1px",
                        "data-default-stroke-color": "#fff",
                        "data-default-stroke-width": "1px",
                    });

                    if (track.type === this.TRACK_TYPES.VARIANTS) {
                        if (typeof countsByConsequenceType[info.type] !== "number") {
                            countsByConsequenceType[info.type] = 0;
                        }
                        countsByConsequenceType[info.type]++;
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
            if (track.type === this.TRACK_TYPES.VARIANTS && config.showLegend && Object.keys(countsByConsequenceType).length > 0) {
                this.generateTrackLegend(group, {
                    items: Object.keys(countsByConsequenceType).map(id => ({
                        id: id,
                        title: id.toUpperCase(),
                        color: this.CONSEQUENCE_TYPES_COLORS[id] || this.CONSEQUENCE_TYPES_COLORS.other,
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

        // We need to update the SVG height with the total height of all tracks
        svg.setAttribute("height", `${offset + 1}px`);

        // Generate rule content
        SVG.addChild(rule, "path", {
            "d": `M-0.5,0V${offset}`,
            "fill": "none",
            "stroke": config.positionRuleColor,
            "stroke-width": config.positionRuleWidth,
            "stroke-opacity": "0.75",
            "stroke-dasharray": "3",
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
            showProteinScale: true,
            showProteinStructure: true,
            showProteinLollipops: true,
            showLegend: true,
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
            legendHeight: 20,
            emptyHeight: 40,
            highlightStrokeColor: "#fd984399",
            highlightStrokeWidth: "4px",
            positionRuleVisible: true,
            positionRuleColor: "#909294",
            positionRuleWidth: "1px",
        };
    },

};
