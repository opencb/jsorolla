import FeatureTrack from "./feature-track.js";
import FeatureRenderer from "../renderers/feature-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";
// import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";
// import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client";

export default class GeneOverviewTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize renderer
        // this.renderer = new FeatureRenderer(FEATURE_TYPES.gene);
        this.renderer = new FeatureRenderer({
            height: 4,
            color: GenomeBrowserUtils.geneColorFormatter,
            label: GenomeBrowserUtils.geneLabelFormatter,
            tooltipTitle: GenomeBrowserUtils.geneTooltipTitleFormatter,
            tooltipText: GenomeBrowserUtils.geneTooltipTextFormatter,
            ...this.config.renderer,
        });
    }

    // Get data for gene overview track
    getData(options) {
        return this.config.cellBaseClient.get("genomic", "region", options.region.toString(), "gene", {
            exclude: "transcripts,annotation",
            limit: 5000,
        });
    }

    getDefaultConfig() {
        return {
            title: "Gene overview",
            height: 100,
            resizable: true,
            histogramMinRegionSize: 20000000000,
            labelMaxRegionSize: 10000000,
            renderer: {},
        };
    }

}
