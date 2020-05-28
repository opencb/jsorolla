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
import "./variant-interpreter-qc-variant-family.js";
import "./variant-interpreter-qc-variant-cancer.js";
import "../../simple-plot.js";


class VariantInterpreterQcVariant extends LitElement {

    constructor() {
        super();

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
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No Case selected</h3>
                </div>`;
        }

        // Variant stats are different for FAMILY and CANCER analysis, this does not happens with Alignment
        if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
            return html`
                <div>
                    <h3>RD Variant Stats</h3>
                    <!-- <span>We must use the new component opencga-sample-variant-stats for 
                    <a href="https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122" target="_blank">https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantMetadata.avdl#L122</a></span> -->
<!--                    <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleId="${null}" ?active="${this.active}"></sample-variant-stats-view>-->
                    <variant-interpreter-qc-variant-family .opencgaSession="${this.opencgaSession}" .sampleId="${this.clinicalAnalysis.proband.samples[0].id}" ?active="${this.active}"></variant-interpreter-qc-variant-family>
                </div>
            `;
        }

        if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            return html`
                <div>
                    <h3>Cancer Variant Stats</h3>
                    <variant-interpreter-qc-variant-cancer .opencgaSession="${this.opencgaSession}" .sampleId="${this.clinicalAnalysis.proband.samples[0].id}" ?active="${this.active}"></variant-interpreter-qc-variant-cancer>
                </div>
            `;
        }
    }
}

customElements.define("variant-interpreter-qc-variant", VariantInterpreterQcVariant);
