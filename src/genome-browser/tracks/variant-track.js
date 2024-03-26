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
// import HistogramRenderer from "../renderers/histogram-renderer.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";


export default class VariantTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        // this.renderer = new FeatureRenderer(FEATURE_TYPES.snp);
        this.renderer = new FeatureRenderer({
            color: GenomeBrowserUtils.variantColorFormatter,
            ...this.config.renderer,
        });
    }

    // Get data for this track
    getData(options) {
        return this.config.cellBaseClient.get("genomic", "region", options.region.toString(), "variant", {
            // exclude: "annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples",
            exclude: "annotation,transcriptVariations,xrefs,samples,studies",
            limit: 5000,
        });
    }

    getDefaultConfig() {
        return {
            title: "Variants (CellBase)",
            featureType: "SNP",
            height: 120,
            resizable: true,
            // histogramMinRegionSize: 12000,
            histogramMinRegionSize: 1000000,
            labelMaxRegionSize: 3000,
            renderer: {},
        };
    }

}
