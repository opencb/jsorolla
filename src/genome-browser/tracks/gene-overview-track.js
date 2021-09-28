import FeatureTrack from "./feature-track";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";
import FeatureRenderer from "../renderers/feature-renderer";


/* **************************************************/
/* Create a GeneOverTrack for genome-browser        */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/* **************************************************/
export default class GeneOverviewTrack {

    constructor(args) {
        this._config = {...this.getDefaultConfig(), ...args};
    }

    getDefaultConfig() {
        return {
            title: "Gene overview",
            height: 80,
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000
        };
    }

    createTrack() {
        return new FeatureTrack({
            title: this._config.title,
            height: this._config.height,
            minHistogramRegionSize: this._config.minHistogramRegionSize,
            maxLabelRegionSize: this._config.maxLabelRegionSize,
            renderer: new FeatureRenderer(FEATURE_TYPES.gene),
            dataAdapter: new CellBaseAdapter(this._config.cellbaseClient, "genomic", "region", "gene", {
                exclude: "transcripts,chunkIds"
            }, {
                chunkSize: 100000
            })
        });
    }

}
