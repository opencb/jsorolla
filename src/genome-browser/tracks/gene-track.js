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

    // #initDataAdapter() {
    //     // set CellBase adapter as default
    //     if (typeof this.dataAdapter === "undefined") {
    //         if (typeof this.cellbaseClient !== "undefined" && this.cellbaseClient !== null) {
    //             this.dataAdapter = new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "gene", {},
    //                 {chunkSize: 100000});
    //         } else if (typeof this.cellbase !== "undefined" && this.cellbase !== null) {
    //             const cellBaseConfig = {
    //                 host: this.cellbase.host,
    //                 version: this.cellbase.version,
    //                 species: this.cellbase.species,
    //                 cache: {active: false}
    //             };
    //             this.dataAdapter = new CellBaseAdapter(new CellBaseClient(cellBaseConfig), "genomic", "region", "gene", {},
    //                 {chunkSize: 100000});
    //         }
    //     }
    // }

    getExcludedFields(region) {
        if (region.length() < this.config.transcriptMaxRegionSize) {
            return "transcripts.tfbs,transcripts.xrefs,transcripts.cDnaSequence,transcripts.exons.sequence,annotation";
        } else {
            return "transcripts,annotation";
        }
    }

    getData(options) {
        return this.config.cellBaseClient.get("genomic", "region", options.region.toString(), "gene", {
            exclude: this.getExcludedFields(options.region),
            limit: 1000, // TO REVIEW
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
