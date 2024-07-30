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

import {LitElement, html} from "lit";
import "./steiner-variant-interpreter-analysis-overview.js";
import "../../commons/view/detail-tabs.js";
import "../../clinical/analysis/hrdetect-analysis.js";
import "../../clinical/analysis/mutational-signature-analysis.js";

class SteinerVariantInterpreterAnalysis extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")) {
            this._config = this.getDefaultConfig();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession?.opencgaClient && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
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
                </div>
            `;
        }

        // Check if no analysis have been configured --> display a warning message
        if (!this._config?.items || this._config.items.length === 0) {
            return html`
                <div class="col-md-6 offset-md-3 p-4">
                    <div class="alert alert-warning" role="alert">
                        No Custom Analysis available.
                    </div>
                </div>
            `;
        }

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [];

        if (this.clinicalAnalysis) {
            items.push({
                id: "overview",
                active: true,
                name: "Overview",
                render: (clinicalAnalysis, active, opencgaSession) => {
                    return html`
                        <div class="col-md-8 offset-md-2">
                            <tool-header title="Analysis Overview" class="bg-white"></tool-header>
                            <steiner-variant-interpreter-analysis-overview
                                .opencgaSession="${opencgaSession}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .active="${active}">
                            </steiner-variant-interpreter-analysis-overview>
                        </div>
                    `;
                },
            });
            items.push({
                id: "mutational-signature",
                name: "Mutational Signature",
                render: (clinicalAnalysis, active, opencgaSession) => {
                    const probandId = clinicalAnalysis.proband.id;
                    const somaticSample = clinicalAnalysis?.proband?.samples?.find(sample => sample.somatic);
                    return html`
                        <div class="col-md-8 offset-md-2">
                            <tool-header
                                title="Mutational Signature - ${probandId} (${somaticSample?.id})"
                                class="bg-white">
                            </tool-header>
                            <mutational-signature-analysis
                                .toolParams="${{query: {sample: somaticSample?.id}}}"
                                .opencgaSession="${opencgaSession}"
                                .active="${active}">
                            </mutational-signature-analysis>
                        </div>
                    `;
                },
            });
            items.push({
                id: "hrdetect",
                name: "HRDetect",
                render: (clinicalAnalysis, active, opencgaSession) => {
                    const probandId = clinicalAnalysis.proband.id;
                    const somaticSample = clinicalAnalysis?.proband?.samples?.find(sample => sample.somatic);
                    return html`
                        <div class="col-md-8 offset-md-2">
                            <tool-header
                                title="HRDetect - ${probandId} (${somaticSample?.id})"
                                class="bg-white">
                            </tool-header>
                            <hrdetect-analysis
                                .toolParams="${{query: {sample: somaticSample?.id}}}"
                                .opencgaSession="${opencgaSession}"
                                .active="${active}">
                            </hrdetect-analysis>
                        </div>
                    `;
                },
            });
        }

        return {
            display: {
                align: "center",
                classes: "justify-content-center"
            },
            items: items,
        };
    }

}

customElements.define("steiner-variant-interpreter-analysis", SteinerVariantInterpreterAnalysis);
