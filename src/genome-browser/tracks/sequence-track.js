/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import FeatureTrack from "./feature-track.js";
import SequenceRenderer from "../renderers/sequence-renderer.js";
// import CellBaseAdapter from "../../core/data-adapter/cellbase-adapter.js";
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
        // this.dataAdapter = new CellBaseAdapter(this.cellBaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100});
    }

    getData(options) {
        const region = options.region.toString();
        return this.config.cellBaseClient.get("genomic", "region", region, "sequence", {});
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
