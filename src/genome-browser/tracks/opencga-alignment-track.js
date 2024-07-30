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
import AlignmentRenderer from "../renderers/alignment-renderer.js";

export default class OpenCGAAlignmentTrack extends FeatureTrack {

    constructor(config) {
        super(config);

        this.renderer = new AlignmentRenderer({
            ...(this.config.renderer || {}),
            alignmentsMaxRegionSize: this.config.alignmentsMaxRegionSize,
        });

        this.sampleInfo = null;
        this.alignmentInfo = null;
        this.fetchedSampleAndAlignmentInfo = false;
    }

    // Import sample info
    async #getSampleAndAlignmentInfo() {
        const sampleResponse = await this.config.opencgaClient.samples()
            .info(this.config.sample, {
                study: this.config.opencgaStudy,
                includeIndividual: true,
            });

        const alignmentResponse = await this.config.opencgaClient.files()
            .search({
                study: this.config.opencgaStudy,
                sampleIds: this.config.sample,
                bioformat: "ALIGNMENT",
                exclude: "qualityControl,attributes",
            });

        this.sampleInfo = sampleResponse?.responses?.[0]?.results?.[0] || null;
        this.alignmentInfo = alignmentResponse?.responses?.[0]?.results?.[0] || null;
        this.fetchedSampleAndAlignmentInfo = true;
    }

    async getData(options) {
        if (!this.fetchedSampleAndAlignmentInfo) {
            await this.#getSampleAndAlignmentInfo();
        }

        // Check if no alignments file has been found
        if (!this.alignmentInfo) {
            return Promise.reject(new Error(`No alignments file found for sample '${this.config.sample}'`));
        }

        let alignmentsRequest = null;
        // Fetch alignments info only if the current region length is lower than the alignmentsMaxRegionSize value
        if (options.region.length() < this.config.alignmentsMaxRegionSize) {
            alignmentsRequest = this.config.opencgaClient.alignments().query(this.alignmentInfo.id, {
                study: this.config.opencgaStudy,
                limit: 5000,
                region: options.region.toString(),
                offset: 0,
            });
        } else {
            alignmentsRequest = Promise.resolve(null);
        }

        // Fetch coverage data for the current region
        const coverageRequest = this.config.opencgaClient.alignments().queryCoverage(this.alignmentInfo.id, {
            study: this.config.opencgaStudy,
            region: options.region.toString(),
            windowSize: Math.max(1, Math.round(10 / this.pixelBase)),
            offset: 0,
        });

        // Wrap all requests in a single promise
        return Promise.all([
            coverageRequest,
            alignmentsRequest,
        ]);
    }

    getDefaultConfig() {
        return {
            title: "",
            height: 200,
            maxHeight: 300,
            resizable: true,
            opencgaClient: null,
            opencgaStudy: "",
            sample: null,
            alignmentsMaxRegionSize: 50000,
            renderer: {}, // Renderer configuration
        };
    }

}
