import FeatureTrack from "./feature-track";
import FeatureRenderer from "../renderers/feature-renderer";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";

/* **************************************************/
/* Create a Variant SNP track for genome-browser    */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/* **************************************************/

export default class SnpTrack {

    constructor(args) {
        this._config = {...this.getDefaultConfig(), ...args};
    }

    getDefaultConfig() {
        return {
            title: "Variation",
            featureType: "SNP",
            minHistogramRegionSize: 12000,
            maxLabelRegionSize: 3000,
            height: 120,
            exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
        };
    }

    createTrack() {
        return new FeatureTrack({
            title: this._config.title,
            featureType: this._config.featureType,
            minHistogramRegionSize: this._config.minHistogramRegionSize,
            maxLabelRegionSize: this._config.maxLabelRegionSize,
            height: this._config.height,
            exclude: this._config.exclude,
            renderer: new FeatureRenderer(FEATURE_TYPES.snp),
            dataAdapter: new CellBaseAdapter(this._config.cellbaseClient, "genomic", "region", "snp", {
                exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
            }, {
                chunkSize: 10000
            })
        });
    }

}
