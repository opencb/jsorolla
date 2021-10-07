import FeatureTrack from "./feature-track";
import FeatureRenderer from "../renderers/feature-renderer";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client";

/* **************************************************/
/* Create a Variant SNP track for genome-browser    */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/*                    or                             */
/* @param  cellbase: {                               */
/*                    "host": CELLBASE_HOST,         */
/*                    "version": CELLBASE_VERSION,   */
/*                    "species": "hsapiens"          */
/*                }                                  */
/* ***************************************************/

export default class SnpTrack extends FeatureTrack {

    constructor(args) {
        super(args);
        Object.assign(this, this.getDefaultConfig(), args);
        this._init();
        this.resource = this.dataAdapter.resource;
        this.species = this.dataAdapter.species;
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

    _init() {
        this.renderer = new FeatureRenderer(FEATURE_TYPES.snp);
        if (this.cellbase) {
            const cellBaseConfig = {
                host: this.cellbase.host,
                version: this.cellbase.version,
                species: this.cellbase.species,
                cache: {active: false}
            };
            this.cellbaseClient = new CellBaseClient(cellBaseConfig);
        }
        this. dataAdapter= new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "snp", {
            exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples"
        }, {
            chunkSize: 10000
        });
    }

}
