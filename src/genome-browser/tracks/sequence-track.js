import FeatureTrack from "./feature-track.js";
import SequenceRenderer from "../renderers/sequence-renderer.js";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter.js";
// import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";

export default class SequenceTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        this.renderer = new SequenceRenderer(this.config.renderer);
        // if (!this.config.cellbaseClient) {
        //     const cellBaseConfig = {
        //         host: this.cellbase.host,
        //         version: this.cellbase.version,
        //         species: this.cellbase.species,
        //         cache: {active: false}
        //     };
        //     this.cellbaseClient = new CellBaseClient(cellBaseConfig);
        // }
        this.cellBaseClient = this.config.cellBaseClient;
        this.dataAdapter = new CellBaseAdapter(this.cellBaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100});
    }

    // Get default config for sequence track
    getDefaultConfig() {
        return {
            title: "Sequence",
            height: 20,
            resizable: false,
            visibleRegionSize: 200,
            renderer: {},
        };
    }

}
