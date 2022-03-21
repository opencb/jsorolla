import FeatureTrack from "./feature-track.js";
import FeatureRenderer from "../renderers/feature-renderer.js";
// import HistogramRenderer from "../renderers/histogram-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";


export default class VariantTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // this.renderer = new FeatureRenderer(FEATURE_TYPES.snp);
        this.renderer = new FeatureRenderer({
            color: GenomeBrowserUtils.variantColorFormatter,
            ...this.config.renderer,
        });
    }

    // Get data for this track
    getData(options) {
        return this.config.cellBaseClient.get("genomic", "region", options.region.toString(), "variant", {
            // exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples",
            exclude: "annotation,transcriptVariations,xrefs,samples,studies",
            limit: 5000,
        });
    }

    getDefaultConfig() {
        return {
            title: "Variants (CellBase)",
            featureType: "SNP",
            height: 120,
            resizable: true,
            // histogramMinRegionSize: 12000,
            histogramMinRegionSize: 1000000,
            labelMaxRegionSize: 3000,
            renderer: {},
        };
    }

}
