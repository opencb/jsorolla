import Renderer from "./renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import {SVG} from "../../core/svg.js";
import LollipopLayout from "../../core/visualisation/lollipop-layout.js";

export default class VariantRenderer extends Renderer {

    constructor(config) {
        super(config);
        this.lollipopLayout = new LollipopLayout({
            maxWidth: this.config.lollipopMaxWidth,
        });
    }

    render(features, options) {
        const topPosition = this.config.lollipopVisible ? this.config.lollipopHeight : this.config.headerHeight;
        let lollipopPositions = [];
        const lollipopRegionWidth = options.requestedRegion.length() * options.pixelBase;
        const lollipopStartX = GenomeBrowserUtils.getFeatureX(options.requestedRegion.start, options);

        if (this.config.lollipopVisible) {
            lollipopPositions = this.lollipopLayout.layout(features || [], options.requestedRegion, lollipopRegionWidth);
        }

        (features || []).forEach((feature, featureIndex) => {
            const group = SVG.addChild(options.svgCanvasFeatures, "g", {});

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);

            // transform to pixel position
            const width = Math.max(length * options.pixelBase, 1);
            const x = GenomeBrowserUtils.getFeatureX(start, options);

            // Get variant information
            const variantColor = this.getValueFromConfig("variantColor", [feature]);
            const variantTooltipTitle = this.getValueFromConfig("variantTooltipTitle", [feature]);
            const variantTooltipText = this.getValueFromConfig("variantTooltipText", [feature]);

            let variantElement = null;

            // Check if lollipops are visible
            if (this.config.lollipopVisible) {
                const lollipopX = lollipopStartX + lollipopPositions[featureIndex];
                const lollipopWidth = Math.min(1, Math.max(0, this.getValueFromConfig("lollipopWidth", [feature])));
                console.log(lollipopWidth);
                const lollipopPath = [
                    `M ${lollipopX},${this.config.lollipopHeight / 8}`,
                    `L ${lollipopX},${this.config.lollipopHeight / 2}`,
                    `L ${x},${3 * this.config.lollipopHeight / 4}`,
                    `L ${x},${this.config.lollipopHeight}`,
                ];
                // Render lollipop stick
                SVG.addChild(group, "path", {
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
                    this.config.lollipopHeight / 8,
                    this.config.lollipopMinWidth + lollipopWidth * (this.config.lollipopMaxWidth - this.config.lollipopMinWidth),
                    variantColor,
                ]);
            } else {
                variantElement = SVG.addChild(group, "rect", {
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
                    },
                    style: {
                        width: true,
                        classes: `${this.config.toolTipfontClass} ui-tooltip ui-tooltip-shadow`,
                    },
                });
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
                    "x": x,
                    "y": topPosition + (index * this.config.sampleHeight) + 1,
                    "width": width,
                    "height": this.config.sampleHeight - 2,
                    // "stroke": "#000000",
                    // "stroke-width": 1,
                    // "stroke-opacity": 0.7,
                    "fill": sampleGenotypeColor,
                    "cursor": "pointer",
                    // "data-genotype": genotype,
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
            infoWidgetId: "id",
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
            lollipopMinWidth: 5,
            lollipopMaxWidth: 10,
            lollipopShape: GenomeBrowserUtils.lollipopShapeFormatter,
            lollipopWidth: 1, // GenomeBrowserUtils.lollipopWidthFormatter,
        };
    }

}
