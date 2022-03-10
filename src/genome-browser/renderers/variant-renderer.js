import Renderer from "./renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import {SVG} from "../../core/svg.js";

export default class VariantRenderer extends Renderer {

    render(features, options) {
        (features || []).forEach(feature => {
            const group = SVG.addChild(options.svgCanvasFeatures, "g", {});

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            const length = Math.max(Math.abs((end - start) + 1), 1);

            // transform to pixel position
            const width = Math.max(length * options.pixelBase, 1);
            const x = GenomeBrowserUtils.getFeatureX(start, options);

            // Get variant info
            const variantColor = this.getValueFromConfig("variantColor", [feature]);
            const variantTooltipTitle = this.getValueFromConfig("variantTooltipTitle", [feature]);
            const variantTooltipText = this.getValueFromConfig("variantTooltipText", [feature]);

            // Render feature position
            const variantElement = SVG.addChild(group, "rect", {
                "x": x,
                "y": 0,
                "width": width,
                "height": this.config.sampleHeight - 2,
                // "stroke": "#000000",
                // "stroke-width": 1,
                // "stroke-opacity": 0.7,
                "fill": variantColor,
                "cursor": "pointer",
            });

            if (variantTooltipText) {
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
                    "y": (index + 1) * this.config.sampleHeight,
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
            sampleHeight: 20,
        };
    }

}
