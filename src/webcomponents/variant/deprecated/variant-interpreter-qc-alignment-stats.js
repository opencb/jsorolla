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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../alignment/qc/samtools-flagstats-view.js";

class VariantInterpreterQcAlignmentStats extends LitElement {

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
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            // this.setAlignmentstats();
            this.prepareSamtoolsFlgstats();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.setAlignmentstats();
                    this.prepareSamtoolsFlgstats();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    prepareSamtoolsFlgstats() {
        if (this.clinicalAnalysis) {
            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "SINGLE":
                    this.samples = [this.clinicalAnalysis.proband.samples[0]]
                    break;
                case "FAMILY":
                    this.samples = [
                        this.clinicalAnalysis.proband?.samples[0],
                        ...this.clinicalAnalysis?.family?.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id && member.samples && member.samples.length > 0)
                            .map(member => member.samples[0])
                    ];
                    break;
                case "CANCER":
                    this.samples = this.clinicalAnalysis.proband?.samples;
                    break;
            }
            this.requestUpdate();
        }
    }
    // setAlignmentstats() {
    //     if (this.clinicalAnalysis && this.clinicalAnalysis.files) {
    //         let _alignmentStats = [];
    //         for (let file of this.clinicalAnalysis.files) {
    //             if (file.format === "BAM" && file.annotationSets) {
    //                 for (let annotationSet of file.annotationSets) {
    //                     if (annotationSet.id.toUpperCase() === "OPENCGA_ALIGNMENT_STATS") {
    //                         _alignmentStats.push(annotationSet.annotations);
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //         this.alignmentStats = _alignmentStats;
    //     }
    //     this.requestUpdate();
    // }

    getDefaultConfig() {
        return {

        };
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
                    <h3><i class="fas fa-lock"></i> No Case found</h3>
                </div>`;
        }

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div style="margin: 20px 10px">
                <samtools-flagstats-view
                    .samples="${this.samples}"
                    .opencgaSession=${this.opencgaSession}>
                </samtools-flagstats-view>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-alignment-stats", VariantInterpreterQcAlignmentStats);
