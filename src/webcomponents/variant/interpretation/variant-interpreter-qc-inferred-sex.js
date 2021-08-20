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
import UtilsNew from "../../../core/utilsNew.js";
import "../../individual/opencga-individual-inferred-sex-view.js";

class VariantInterpreterQcSummary extends LitElement {

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
            this.getIndividuals();
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
                    this.getIndividuals();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getIndividuals() {
        if (this.clinicalAnalysis) {
            let _individuals = [];
            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "SINGLE":
                case "CANCER":
                    // _individuals must be an array
                    _individuals = [this.clinicalAnalysis.proband];
                    break;
                case "FAMILY":
                    _individuals = this.clinicalAnalysis.family.members;
                    break;
            }
            this.individuals = _individuals;
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
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
                        <h3><i class="fas fa-lock"></i> No Case found</h3>
                    </div>`;
        }

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div style="margin: 20px 10px">
                <h4>Individual Inferred Sex</h4>
                <opencga-individual-inferred-sex-view   .individuals="${this.individuals}"
                                                        .opencgaSession="${this.opencgaSession}">
                </opencga-individual-inferred-sex-view>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-inferred-sex", VariantInterpreterQcSummary);
