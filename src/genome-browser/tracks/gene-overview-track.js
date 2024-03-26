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
