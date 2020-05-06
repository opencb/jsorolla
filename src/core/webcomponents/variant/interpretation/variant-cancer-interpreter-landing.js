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
            // clinicalAnalysisId: {
            //     type: String
            // },
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
        // this._config = {...this.getDefaultConfig(), ...this.config};
        // this.requestUpdate();
    }

    firstUpdated(_changedProperties) {
        // this.requestUpdate();
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
    }

    onCloseClinicalAnalysis() {
        this.clinicalAnalysis = null;
        this.dispatchEvent(new CustomEvent("selectclinicalnalysis", {
            detail: {
                id: null,
                clinicalAnalysis: null
            }
        }));
    }

    onClinicalAnalysisChange() {
        if (this.clinicalAnalysisId) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.dispatchEvent(new CustomEvent("selectclinicalnalysis", {
                        detail: {
                            id: _this.clinicalAnalysis?.id,
                            clinicalAnalysis: _this.clinicalAnalysis
                        }
                    }));
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        } else if (this.probandId) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().search({proband: this.probandId, study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.dispatchEvent(new CustomEvent("selectclinicalnalysis", {
                        detail: {
                            id: _this.clinicalAnalysis?.id,
                            clinicalAnalysis: _this.clinicalAnalysis
                        }
                    }));
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onClinicalAnalysisIdChange(key, value) {
        this.clinicalAnalysisId = value;
        this.probandId = null;
    }

    onProbandIdChange(key, value) {
        this.probandId = value;
        this.clinicalAnalysisId = null;
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

        if (this.clinicalAnalysis) {
            return html`
                    <div class="row">
                        <div class="col-md-10 col-md-offset-1">
                            <div style="float: right">
                                <button class="btn btn-default" @click="${this.onCloseClinicalAnalysis}">Close</button>
                            </div>
                        </div>
                        
                        <div class="col-md-10 col-md-offset-1">
                            <h2>Case ${this.clinicalAnalysis.id}</h2>
                            <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            style="font-size: 12px"
                                                            .config="${this._config}">
                            </opencga-clinical-analysis-view>
                        </div>
                    </div>`;
        }

        return html`
                <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active">
                        <a href="#${this._prefix}-search" role="tab" data-toggle="tab" data-id="${this._prefix}-search"
                            class="browser-variant-tab-title">Search Case
                        </a>
                    </li>
                    <li role="presentation" class="">
                        <a href="#${this._prefix}-create" role="tab" data-toggle="tab" data-id="${this._prefix}-create"
                            class="browser-variant-tab-title">Create Case
                        </a>
                    </li>
                </ul>
                
                <div class="tab-content">
                    <div id="${this._prefix}-search" role="tabpanel" class="tab-pane active">
                        <div class="row">
                            <div class="col-md-4 col-md-offset-1">
                                <div style="padding: 25px">
<!--                                    <h3>Search Clinical Analysis</h3>-->
                                    <div>
                                        <label>Clinical Analysis ID</label>
                                        <select-field-filter-autocomplete-simple .fn="${true}" resource="clinical-analysis" .value="${"AN-3"}" 
                                                .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onClinicalAnalysisIdChange("clinicalAnalysisId", e.detail.value)}">
                                        </select-field-filter-autocomplete-simple>
                                    </div>
                                    
                                    <div>
                                        <label>Proband ID</label>
                                        <select-field-filter-autocomplete-simple .fn="${true}" resource="individuals" 
                                                .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onProbandIdChange("individualId", e.detail.value)}">
                                        </select-field-filter-autocomplete-simple>
                                    </div>
        
                                    <div style="float: right; padding: 10px">                            
                                        <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">Clear</button>
                                        <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">OK</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="${this._prefix}-create" role="tabpanel" class="tab-pane">
                        <opencga-clinical-analysis-editor   .opencgaSession="${this.opencgaSession}"
                                                            .config="${1 || this._config.clinicalAnalysisBrowser}"
                                                            @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                         </opencga-clinical-analysis-editor>
                    </div>
                </div>
            `;
    }

}

customElements.define("variant-cancer-interpreter-landing", VariantCancerInterpreterLanding);
