import FeatureTrack from "./feature-track";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";
import SequenceRenderer from "../renderers/sequence-renderer";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client";

/* **************************************************/
/* Create a Sequence track for genome-browser       */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/*                    or                             */
/* @param  cellbase: {                               */
/*                    "host": CELLBASE_HOST,         */
/*                    "version": CELLBASE_VERSION,   */
/*                    "species": "hsapiens"          */
/*                }                                  */
/* ***************************************************/
export default class SequenceTrack extends FeatureTrack {

    constructor(args) {
        super(args);
        Object.assign(this, this.getDefaultConfig(), args);
        this._init();
    }

    getDefaultConfig() {
        return {
            title: "Sequence",
            height: 20,
            visibleRegionSize: 200
        };
    }

    _init() {
        this.renderer = new SequenceRenderer();
        if (this.cellbase) {
            const cellBaseConfig = {
                host: this.cellbase.host,
                version: this.cellbase.version,
                species: this.cellbase.species,
                cache: {active: false}
            };
            this.cellbaseClient = new CellBaseClient(cellBaseConfig);
        }
        this.dataAdapter = new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100});
    }

}
