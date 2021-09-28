import FeatureTrack from "./feature-track";
import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter";
import SequenceRenderer from "../renderers/sequence-renderer";

/* **************************************************/
/* Create a Sequence track for genome-browser       */
/* @author Asunción Gallego                         */
/* @param cellbaseClient       required             */
/* **************************************************/
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
        this.dataAdapter = new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100});

    }

}
