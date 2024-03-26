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

import {html, LitElement} from "lit";

import UtilsNew from "../../../core/utils-new.js";
import Region from "../../../core/bioinfo/region.js";

import GenomeBrowser from "../../../genome-browser/genome-browser.js";
import GeneOverviewTrack from "../../../genome-browser/tracks/gene-overview-track.js";
import GeneTrack from "../../../genome-browser/tracks/gene-track.js";
import SequenceTrack from "../../../genome-browser/tracks/sequence-track.js";
import VariantTrack from "../../../genome-browser/tracks/variant-track.js";
import OpenCGAVariantTrack from "../../../genome-browser/tracks/opencga-variant-track.js";
import OpenCGAAlignmentTrack from "../../../genome-browser/tracks/opencga-alignment-track.js";

class GenomeBrowserTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._data = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("testDataVersion") || changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        if (this.opencgaSession?.cellbaseClient && this.testDataVersion) {
            const filesToImport = [
                "genome-browser-features-of-interest.json",
            ];
            const promises = filesToImport.map(file => {
                return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
            });

            // Import all files
            Promise.all(promises)
                .then(data => {
                    this._data = {
                        featuresOfInterest: data[0],
                    };
                    // Mutate data and draw protein lollipop
                    this.mutate();
                    this.drawGenomeBrowser();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    mutate() {
        return null;
    }

    drawGenomeBrowser() {
        const target = this.querySelector(`div#${this._prefix}`);
        const region = new Region({
            chromosome: "17",
            start: 43102293,
            end: 43106467,
        });
        const species = {
            id: "hsapiens",
            scientificName: "Homo sapiens",
            assembly: {
                name: "GRCh38",
                ensemblVersion: "104_38",
            },
        };

        const genomeBrowser = new GenomeBrowser(target, {
            cellBaseClient: this.opencgaSession.cellbaseClient,
            cellBaseHost: "CELLBASE_HOST",
            cellBaseVersion: "CELLBASE_VERSION",
            width: target.getBoundingClientRect().width,
            region: region,
            species: species,
            resizable: true,
            featuresOfInterest: this._data.featuresOfInterest,
        });

        // When GB is ready add tracks and draw
        genomeBrowser.on("ready", () => {
            // Overview tracks
            genomeBrowser.addOverviewTracks([
                new GeneOverviewTrack({
                    cellBaseClient: this.opencgaSession.cellbaseClient,
                }),
            ]);

            // Detail tracks
            genomeBrowser.addTracks([
                // Sequence Track
                new SequenceTrack({
                    cellBaseClient: this.opencgaSession.cellbaseClient,
                }),
                // Gene track
                new GeneTrack({
                    title: "Gene",
                    cellBaseClient: this.opencgaSession.cellbaseClient,
                }),
                // CellBase Variant track
                new VariantTrack({
                    title: "Variants (CellBase)",
                    cellBaseClient: this.opencgaSession.cellbaseClient,
                    renderer: {
                        color: () => "#8BC35A",
                    },
                }),
                // OpenCGA Variant track with query
                new OpenCGAVariantTrack({
                    title: "Variants (OpenCGA)",
                    closable: false,
                    minHistogramRegionSize: 20000000,
                    maxLabelRegionSize: 10000000,
                    minTranscriptRegionSize: 200000,
                    visibleRegionSize: 100000000,
                    height: 200,
                    opencgaClient: this.opencgaSession.opencgaClient,
                    opencgaStudy: "TEST_STUDY_PLATINUM_GB",
                    query: {
                        sample: "NA12877,NA12878,NA12889",
                    },
                    highlights: [
                        {
                            id: "test1",
                            name: "[TEST] Length > 0",
                            description: "This variant has length > 0.",
                            condition: feature => feature.end - feature.start + 1 > 0,
                        },
                    ],
                }),
                // OpenCGA alignments track
                new OpenCGAAlignmentTrack({
                    title: "Alignments (OpenCGA)",
                    opencgaClient: this.opencgaSession.opencgaClient,
                    opencgaStudy: "TEST_STUDY_CANCER_GB",
                    sample: "TEST_SAMPLE_GB",
                }),
            ]);

            genomeBrowser.draw();
        });
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <h2 style="font-weight: bold;">
                        Genome Browser Test
                    </h2>
                    <div
                        id="${"" + this._prefix}"
                        data-cy="genome-browser-container"
                        style="margin-bottom:4rem;">
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("genome-browser-test", GenomeBrowserTest);
