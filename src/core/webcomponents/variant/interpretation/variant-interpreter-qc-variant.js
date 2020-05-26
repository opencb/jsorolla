/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../simple-plot.js";
import "./variant-interpreter-qc-variant-cancer.js";

// General component Cancer/Family QC

class VariantInterpreterQcVariant extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();

        this.variantTypes = ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"]
        this.sampleVariantStats = {
            id: "001",
            variantCount: 5,
            chromosomeCount: [1,3,5,7,11],
            typeCount: [1,3,5,7,11],
            genotypeCount: [3,5,7],
            filterCount: [],
            tiTvRatio: .8
        }
    }

    firstUpdated(_changedProperties) {
        console.log(this.variantTypes.map( (type, i) => ({name: type, data: this.sampleVariantStats.typeCount[i]})))
        /*this.barChart({
            title: "Variant types",
            categories: this.variantTypes,
            data: this.sampleVariantStats.typeCount
        }, "typePlot")*/
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
    }

    clinicalAnalysisIdObserver() {
        if (this.clinicalAnalysisId) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No Case open</h3>
                    </div>`;
        }

        // Variant stats are different for FAMILY and CANCER analysis, this does not happens with Alignment
        if (false && this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
            return html`
                <div>
                    <h3>RD Variant Stats</h3>
                    <!-- <span>We must use the new component opencga-sample-variant-stats for 
                    <a href="https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122" target="_blank">https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122</a></span> -->
                    <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleId="${null}">
                    </sample-variant-stats-view>
                </div>
            
            `;
        }

        if (true || this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            return html`
                <div>
                    <h3>Cancer Variant Stats</h3>
                    <variant-interpreter-qc-variant-cancer .opencgaSession="${this.opencgaSession}" .sampleId="${this.clinicalAnalysis.proband.samples[0].id}" ></variant-interpreter-qc-variant-cancer>
                </div>
            `;
        }
    }

}

customElements.define("variant-interpreter-qc-variant", VariantInterpreterQcVariant);
