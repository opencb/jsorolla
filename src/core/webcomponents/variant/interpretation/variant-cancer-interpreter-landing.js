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


class VariantCancerInterpreterLanding extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this.query = {};
        this.search = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    firstUpdated(_changedProperties) {
        this.requestUpdate();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    onClinicalAnalysisChange() {
        if (this.clinicalAnalysis) {
            this.dispatchEvent(new CustomEvent("selectclinicalnalysis", {
                detail: {
                    id: this.clinicalAnalysis.id,
                    clinicalAnalysis: this.clinicalAnalysis,
                }
            }));
        }
    }

    onFilterChange(name, value) {
        this.clinicalAnalysisId = value;
        let _this = this;
        debugger
        this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
            .then(response => {
                // This triggers the call to clinicalAnalysisObserver function below
                console.log("response", response);
                _this.clinicalAnalysis = response.responses[0].results[0];

                console.log("clinicalAnalysisIdObserver _this.clinicalAnalysis", _this.clinicalAnalysis);
                // _this.requestUpdate();
                // _this.onClinicalAnalysisChange();
            })
            .catch(response => {
                console.error("An error occurred fetching clinicalAnalysis: ", response);
            });
    }

    onIndividualChange(name, individualId) {
        let _this = this;
        this.opencgaSession.opencgaClient.individuals().info(individualId, {study: this.opencgaSession.study.fqn})
            .then(response => {
                // Create a CLinical Analysis object
                let _clinicalAnalysis = {
                    id: "",
                    proband: response.responses[0].results[0],
                    type: "CANCER"
                };
                _this.clinicalAnalysis = _clinicalAnalysis;

                // _this.requestUpdate();
                // _this.onClinicalAnalysisChange();
            })
            .catch(response => {
                console.error("An error occurred fetching clinicalAnalysis: ", response);
            });
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
                <div class="container">
                    <div class="row">
                        <div class="clinical-analysis-id-wrapper col-md-6 col-md-offset-3 shadow">
                            <h3>Clinical Analysis</h3>
                            <div class="text-filter-wrapper">
                                <!--<input type="text" name="clinicalAnalysisText" id="clinicalAnalysisIdText" value="AN-3">-->
                                <select-field-filter-autocomplete-simple .fn="${true}" resource="clinical-analysis" .value="${"AN-3"}" .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("clinicalAnalysisId", e.detail.value)}"></select-field-filter-autocomplete-simple>
                            </div>
                            
                            <h3>Individual</h3>
                            <div class="text-filter-wrapper">
                                <select-field-filter-autocomplete-simple .fn="${true}" resource="individuals" .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onIndividualChange("individualId", e.detail.value)}"></select-field-filter-autocomplete-simple>
                            
                            </div>

                            <div>                            
                                <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">Clear</button>
                                <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

}

customElements.define("variant-cancer-interpreter-landing", VariantCancerInterpreterLanding);
