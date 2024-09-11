import Renderer from "./renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import {SVG} from "../../core/svg.js";
import LollipopLayout from "../../core/visualisation/lollipop-layout.js";

export default class VariantRenderer extends Renderer {

    #getVariantOpaictyByQuality(variant, sample) {
        const quality = this.config.quality;
        const study = variant.studies?.[0];
        if (quality && typeof quality === "object") {
            // Check if no file is associated with this sample
            if (typeof sample?.fileIndex !== "number" || !study?.files?.[sample.fileIndex]) {
                return this.config.qualityNotPassedOpacity;
            }
            const file = study.files[sample.fileIndex];
            // Check filter
            if (quality?.filter && Array.isArray(quality.filter)) {
                if (!quality.filter.includes(file?.data?.FILTER)) {
                    return this.config.qualityNotPassedOpacity;
                }
            }
            // Check minimum quality
            if (typeof quality.minQuality === "number") {
                const qual = Number(file?.data?.QUAL ?? 0);
                if (qual < quality.minQuality) {
                    return this.config.qualityNotPassedOpacity;
                }
            }
            // Check minimum coverage value
            if (typeof quality.minDP === "number") {
                const dpIndex = (study?.sampleDataKeys || []).indexOf("DP");
                const dp = Number(sample?.data?.[dpIndex] ?? 0);
                if (dp < quality.minDP) {
                    return this.config.qualityNotPassedOpacity;
                }
            }
        }
        // Default, return quality passed opacity
        return this.config.qualityPassedOpacity;
    }

    render(features, options) {
        const lollipopRegionWidth = options.requestedRegion.length() * options.pixelBase;
        const lollipopStartX = GenomeBrowserUtils.getFeatureX(options.requestedRegion.start, options);
        const lollipopStickHeight = this.config.lollipopHeight - this.config.lollipopFocusWidth - this.config.lollipopMaxWidth / 2;
        let lollipopStickStart = this.config.lollipopFocusWidth + this.config.lollipopMaxWidth / 2;
        let lollipopPositions = [];
        let topPosition = this.config.lollipopVisible ? this.config.lollipopHeight : this.config.headerHeight;

        if (this.config.lollipopVisible) {
            const featuresForLollipops = (features || []).filter(feature => this.config.lollipopVariantTypes.includes(feature.type));
            lollipopPositions = LollipopLayout.fromFeaturesList(featuresForLollipops, options.requestedRegion, lollipopRegionWidth, {
                minSeparation: this.config.lollipopMaxWidth,
            });
        }

        // Check if highlights are visible
        if (this.config.highlightVisible) {
            topPosition = topPosition + this.config.highlightHeight;
            lollipopStickStart = lollipopStickStart + this.config.highlightHeight;
        }

        (features || []).forEach((feature, featureIndex) => {
            // Check if this variant has been previously rendered
            if (options?.renderedFeatures && feature?.id) {
                if (options.renderedFeatures.has(feature.id)) {
                    return;
                }
                // Prevent rendering this variant in next calls of this renderer
                options.renderedFeatures.add(feature.id);
            }

            const group = SVG.addChild(options.svgCanvasFeatures, "g", {
                "data-cy": "gb-variant",
                "data-id": feature.id || "-",
                "data-type": feature.type || "-",
                "data-ct": feature?.annotation?.displayConsequenceType || "-",
                "data-index": featureIndex,
            });

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);

            // transform to pixel position
            const width = Math.max(length * options.pixelBase, 1);
            const x = GenomeBrowserUtils.getFeatureX(start, options);
            const center = GenomeBrowserUtils.getFeatureX(start + length / 2, options);

            // Get variant information
            const variantColor = this.getValueFromConfig("variantColor", [feature, this.config.sampleNames]);
            const variantTooltipTitle = this.getValueFromConfig("variantTooltipTitle", [feature, this.config.sampleNames]);
            const variantTooltipText = this.getValueFromConfig("variantTooltipText", [feature, this.config.sampleNames]);

            let variantElement = null;

            // Check if lollipops are visible and the feature type is one of the allowed types for lollipops
            if (this.config.lollipopVisible && this.config.lollipopVariantTypes?.includes?.(feature?.type)) {
                const lollipopX = lollipopStartX + lollipopPositions[featureIndex];
                const lollipopWidth = Math.min(1, Math.max(0, this.getValueFromConfig("lollipopWidth", [feature])));
                const lollipopPath = [
                    `M ${lollipopX},${lollipopStickStart}`,
                    `L ${lollipopX},${lollipopStickStart + lollipopStickHeight / 2}`,
                    `L ${center},${lollipopStickStart + 3 * lollipopStickHeight / 4}`,
                    `L ${center},${lollipopStickStart + lollipopStickHeight}`,
                ];

                // Render lollipop stick
                const lollipopStick = SVG.addChild(group, "path", {
                    "data-cy": "gb-variant-lollipop-path",
                    "d": lollipopPath.join(" "),
                    "fill": "transparent",
                    "stroke": this.config.lollipopStickColor,
                    "stroke-width": this.config.lollipopStickWidth,
                });

                // Lollipop shape
                variantElement = this.getValueFromConfig("lollipopShape", [
                    feature,
                    group,
                    lollipopX,
                    lollipopStickStart,
                    this.config.lollipopMinWidth + lollipopWidth * (this.config.lollipopMaxWidth - this.config.lollipopMinWidth),
                    variantColor,
                ]);

                // Register lollipop focus events
                if (this.config.lollipopFocusEnabled) {
                    variantElement.addEventListener("mouseenter", () => {
                        lollipopStick.setAttribute("stroke", this.config.lollipopFocusColor);
                        lollipopStick.setAttribute("stroke-width", this.config.lollipopFocusWidth);
                        variantElement.setAttribute("stroke", this.config.lollipopFocusColor);
                        variantElement.setAttribute("stroke-width", this.config.lollipopFocusWidth);
                    });
                    variantElement.addEventListener("mouseleave", () => {
                        lollipopStick.setAttribute("stroke", this.config.lollipopStickColor);
                        lollipopStick.setAttribute("stroke-width", this.config.lollipopStickWidth);
                        variantElement.setAttribute("stroke-width", 0);
                    });
                }
            } else {
                variantElement = SVG.addChild(group, "rect", {
                    "data-cy": "gb-variant-lollipop-shape",
                    "x": x,
                    "y": 0,
                    "width": `${width}px`,
                    "height": `${this.config.headerHeight - this.config.dividerHeight - 1}px`,
                    "fill": variantColor,
                    "cursor": "pointer",
                });
            }

            // Display tooltip
            if (variantElement && variantTooltipText) {
                $(variantElement).qtip({
                    content: {
                        text: variantTooltipText,
                        title: variantTooltipTitle || null,
                    },
                    position: {
                        viewport: window,
                        target: "mouse",
                        adjust: {x: 10, y: 10},
                    },
                    style: {
                        width: true,
                        classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                    },
                });
            }

            // Check if highlights are visible
            if (this.config.highlightVisible && this.config.highlights?.length) {
                const satisfiedHighlights = this.config.highlights.filter(item => {
                    return !!item.condition(feature);
                });

                if (satisfiedHighlights.length > 0) {
                    const highlightText = satisfiedHighlights.map(item => {
                        return `
                            <div style="font-weight:bold;margin-bottom:2px">${item.name || item.id || "-"}</div>
                            <div style="margin-bottom:8px;">${item.description || "-"}</div>
                        `;
                    });
                    const iconCenterX = this.config.lollipopVisible ? lollipopStartX + lollipopPositions[featureIndex] : center;
                    const iconCenterY = this.config.highlightHeight / 2;
                    const iconHalf = this.config.highlightIconSize / 2;
                    const iconPath = [
                        `M${iconCenterX},${iconCenterY} l0,${iconHalf}`,
                        `M${iconCenterX},${iconCenterY} l0,-${iconHalf}`,
                        `M${iconCenterX},${iconCenterY} l${iconHalf},${iconHalf / 2}`,
                        `M${iconCenterX},${iconCenterY} l${iconHalf},-${iconHalf / 2}`,
                        `M${iconCenterX},${iconCenterY} l-${iconHalf},${iconHalf / 2}`,
                        `M${iconCenterX},${iconCenterY} l-${iconHalf},-${iconHalf / 2}`,
                    ];

                    // Create highlight icon
                    SVG.addChild(group, "path", {
                        "data-cy": "gb-variant-highlight",
                        "d": iconPath.join(" "),
                        "fill": "transparent",
                        "stroke-width": this.config.highlightIconWidth,
                        "stroke": this.config.highlightIconColor,
                    });

                    // Mask for displaying tooltip with the highlight info
                    const highlightMaskElement = SVG.addChild(group, "rect", {
                        "data-cy": "gb-variant-highlight-mask",
                        "x": iconCenterX - this.config.highlightIconSize / 2,
                        "y": 0,
                        "width": this.config.highlightIconSize,
                        "height": this.config.highlightHeight,
                        "fill": "transparent",
                        "stroke": "transparent",
                    });
                    $(highlightMaskElement).qtip({
                        content: {
                            text: highlightText.join(""),
                            title: feature.id || null,
                        },
                        position: {
                            viewport: window,
                            target: "mouse",
                        },
                        style: {
                            width: true,
                            classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                        },
                    });
                }
            }

            // Render for each sample in feature.studies[0].samples
            // this.config.sampleNames.forEach((sampleName, index) => {
            (feature.studies[0]?.samples || []).forEach((sampleData, index) => {
                // Only one study is expected, and GT is always the first field in samplesData
                const genotype = sampleData.data[0];
                const sampleGenotypeColor = this.getValueFromConfig("sampleGenotypeColor", [genotype]);
                const sampleGenotypeTooltipTitle = this.getValueFromConfig("sampleGenotypeTooltipTitle", [feature, sampleData]);
                const sampleGenotypeTooltipText = this.getValueFromConfig("sampleGenotypeTooltipText", [feature, sampleData]);

                const sampleGenotypeElement = SVG.addChild(group, "rect", {
                    "data-cy": "gb-variant-genotype",
                    "data-sample-index": index,
                    "data-sample-genotype": genotype,
                    "x": x,
                    "y": topPosition + (index * this.config.sampleHeight) + 1,
                    "width": width,
                    "height": this.config.sampleHeight - 2,
                    // "stroke": "#000000",
                    // "stroke-width": 1,
                    // "stroke-opacity": 0.7,
                    "fill": sampleGenotypeColor,
                    "cursor": "pointer",
                    "opacity": this.#getVariantOpaictyByQuality(feature, sampleData),
                });

                if (sampleGenotypeTooltipText) {
                    $(sampleGenotypeElement).qtip({
                        content: {
                            text: sampleGenotypeTooltipText,
                            title: sampleGenotypeTooltipTitle || null,
                        },
                        position: {
                            viewport: window,
                            target: "mouse",
                        },
                        style: {
                            width: true,
                            classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                        },
                    });
                }
            });
        });
    }

    getDefaultConfig() {
        return {
            strokeColor: "#555",
            height: 10,
            histogramColor: "#58f3f0",
            // label: GenomeBrowserUtils.variantLabelFormatter,
            variantColor: GenomeBrowserUtils.variantColorFormatter,
            variantTooltipTitle: GenomeBrowserUtils.variantTooltipTitleFormatter,
            variantTooltipText: GenomeBrowserUtils.variantTooltipTextFormatter,
            sampleGenotypeColor: GenomeBrowserUtils.genotypeColorFormatter,
            sampleGenotypeTooltipTitle: GenomeBrowserUtils.sampleGenotypeTooltipTitleFormatter,
            sampleGenotypeTooltipText: GenomeBrowserUtils.sampleGenotypeTooltipTextFormatter,
            // sampleTrackHeight: 20,
            // sampleTrackY: 15,
            // sampleTrackFontSize: 12,
            sampleNames: [],
            sampleHeight: 40,
            // Header configuration
            headerHeight: 20,
            dividerHeight: 2,
            // Lollipop configuration
            lollipopVisible: true,
            lollipopHeight: 40,
            lollipopStickColor: "rgb(164,171,182)",
            lollipopStickWidth: 1,
            lollipopMinWidth: 10,
            lollipopMaxWidth: 15,
            lollipopShape: GenomeBrowserUtils.lollipopShapeFormatter,
            lollipopWidth: GenomeBrowserUtils.lollipopWidthFormatter,
            lollipopVariantTypes: ["SNP", "INDEL", "BREAKEND"],
            // Lollipop focus
            lollipopFocusEnabled: true,
            lollipopFocusWidth: 2,
            lollipopFocusColor: "orange",
            // Highlights
            highlights: [],
            highlightVisible: true,
            highlightHeight: 16,
            highlightIconColor: "red",
            highlightIconSize: 6,
            highlightIconWidth: 1,
            // Quality control
            quality: {
                filter: ["PASS"],
                minQuality: 60,
                minDP: 20,
            },
            qualityPassedOpacity: "1",
            qualityNotPassedOpacity: "0.3",
        };
    }

}
