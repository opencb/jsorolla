import FeatureRenderer from "./feature-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
import {SVG} from "../../core/svg.js";

export default class VariantRenderer extends FeatureRenderer {

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

            // Render feature position
            SVG.addChild(group, "rect", {
                "x": x,
                "y": 0,
                "width": width,
                "height": this.config.sampleHeight - 2,
                // "stroke": "#000000",
                // "stroke-width": 1,
                // "stroke-opacity": 0.7,
                "fill": "darkBlue",
                "cursor": "pointer",
            });

            // Render for each sample in feature.studies[0].samples
            // this.config.sampleNames.forEach((sampleName, index) => {
            (feature.studies[0]?.samples || []).forEach((sampleData, index) => {
                // Only one study is expected, and GT is always the first field in samplesData
                const genotype = sampleData.data[0];
                const genotypeColor = typeof this.config.genotypeColor === "function" ? this.config.genotypeColor(genotype) : this.config.genotypeColor;

                SVG.addChild(group, "rect", {
                    "x": x,
                    "y": (index + 1) * this.config.sampleHeight,
                    "width": width,
                    "height": this.config.sampleHeight - 2,
                    // "stroke": "#000000",
                    // "stroke-width": 1,
                    // "stroke-opacity": 0.7,
                    "fill": genotypeColor,
                    "cursor": "pointer",
                    // "data-genotype": genotype,
                });
            });
        });
    }

    getDefaultConfig() {
        return {
            infoWidgetId: "id",
            color: GenomeBrowserUtils.variantColorFormatter,
            strokeColor: "#555",
            height: 10,
            histogramColor: "#58f3f0",
            label: GenomeBrowserUtils.variantLabelFormatter,
            tooltipTitle: GenomeBrowserUtils.variantTooltipTitleFormatter,
            tooltipText: GenomeBrowserUtils.variantTooltipTextFormatter,
            genotypeColor: GenomeBrowserUtils.genotypeColorFormatter,
            // sampleTrackHeight: 20,
            // sampleTrackY: 15,
            // sampleTrackFontSize: 12,
            sampleNames: [],
            sampleHeight: 20,
        };
    }

}
