// import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
// import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter.js";
import FeatureTrack from "./feature-track.js";
import GeneRenderer from "../renderers/gene-renderer.js";
// import HistogramRenderer from "../renderers/histogram-renderer.js";

export default class GeneTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // Initialize renderers for gene track
        this.renderer = new GeneRenderer(this.config.renderer);
        // this.histogramRenderer = new HistogramRenderer(this.config.histogramRenderer);
    }

    getExcludedFields(region) {
        if (region.length() < this.config.transcriptMaxRegionSize) {
            return "transcripts.tfbs,transcripts.xrefs,transcripts.cdnaSequence,transcripts.exons.sequence,transcripts.annotation,annotation";
        } else {
            return "transcripts,annotation";
        }
    }

    getData(options) {
        return this.config.cellBaseClient.get("genomic", "region", options.region.toString(), "gene", {
            exclude: this.getExcludedFields(options.region),
            limit: 2000,
        });
    }

    getDefaultConfig() {
        return {
            title: "Gene",
            height: 100,
            resizable: true,
            histogramMinRegionSize: 20000000,
            labelMaxRegionSize: 10000000,
            transcriptMaxRegionSize: 200000,
            renderer: {},
            histogramRenderer: {},
        };
    }

}
