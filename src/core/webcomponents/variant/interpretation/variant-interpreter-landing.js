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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
// import {ifDefined} from "/web_modules/lit-html/directives/if-defined.js";
import UtilsNew from "../../../utilsNew.js";


class VariantInterpreterLanding extends LitElement {

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

        this.clinicalAnalysisEditorConfig = {
            display: {
                showTitle: false,
                buttons: {
                    show: true
                }
            }
        }

        // TODO Delete this code, just for the development purposes.
        this.clinicalAnalysisId = "AN-12";
        // this.clinicalAnalysisIdObserver();
    }

    connectedCallback() {
        super.connectedCallback();
        this.activeTab = {};
        // this._config = {...this.getDefaultConfig(), ...this.config};
        // this.requestUpdate();
    }

    firstUpdated(_changedProperties) {
        // this.requestUpdate();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
             this.opencgaSessionObserver();
        }
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }
        if (changedProperties.has("clinicalAnalysis")) {
            //this.clinicalAnalysisObserver();
            //this.clinicalAnalysis;
        }
    }

    opencgaSessionObserver() {
        // that's how the bitwise management of permissions would look like
        // this.opencgaSession.study.acl would be an integer
        // ACL would be a map in UtilsNew
        //this.editMode = this.opencgaSession.study.acl & ACL["WRITE_CLINICAL_ANALYSIS"];

        this.editMode = this.opencgaSession.study.acl.includes("WRITE_CLINICAL_ANALYSIS");
    }

    // non-bootstrap tabs
    _changeTab(e) {
        e.preventDefault();

        const tabId = e.currentTarget.dataset.id;
        //the selectors are strictly defined to avoid conflics in tabs in children components
        $("#variant-interpreter-landing > .tablist > .content-pills", this).removeClass("active");
        $("#variant-interpreter-landing > .content-tab-wrapper > .content-tab", this).hide();
        $(`.${tabId}-tab`).addClass("active");
        $("#" + tabId, this).show();

        for (const tab in this.activeTab) this.activeTab[tab] = false;
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onCloseClinicalAnalysis() {
        // this.clinicalAnalysis = null;
        this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
            detail: {
                id: null,
                clinicalAnalysis: null
            },
            bubbles: true,
            composed: true
        }));
    }

    onClinicalAnalysisUpdate(e) {
        // debugger
        // this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
        //     detail: {
        //         id: e.detail.clinicalAnalysis?.id,
        //         clinicalAnalysis: e.detail.clinicalAnalysis
        //     },
        //     bubbles: true,
        //     composed: true
        // }));
    }


    onClinicalAnalysisIdChange(key, value) {
        this.clinicalAnalysisId = value;
        this.probandId = null;

    }

    onProbandIdChange(key, value) {
        this.probandId = value;
        this.clinicalAnalysisId = null;
    }

    onClinicalAnalysisChange() {
        let _this = this;
        if (this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                        detail: {
                            id: _this.clinicalAnalysis ? _this.clinicalAnalysis.id : null,
                            clinicalAnalysis: _this.clinicalAnalysis
                        },
                        bubbles: true,
                        composed: true
                    }));
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        } else if (this.probandId) {
            this.opencgaSession.opencgaClient.clinical().search({proband: this.probandId, study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                        detail: {
                            id: _this.clinicalAnalysis ? _this.clinicalAnalysis.id : null,
                            clinicalAnalysis: _this.clinicalAnalysis
                        },
                        bubbles: true,
                        composed: true
                    }));
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onClinicalAnalysisCreate(e) {
        // Fetch object from server since the server automatically adds some information
        let _this = this;
        this.opencgaSession.opencgaClient.clinical().info(e.detail.id, {study: this.opencgaSession.study.fqn})
            .then(response => {
                _this.clinicalAnalysis = response.responses[0].results[0];
                _this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                    detail: {
                        id: _this.clinicalAnalysis ? _this.clinicalAnalysis.id : null,
                        clinicalAnalysis: _this.clinicalAnalysis
                    },
                    bubbles: true,
                    composed: true
                }));
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

        // debugger
        if (this.clinicalAnalysis) {
            return html`
                <div class="row">
                    <div class="col-md-10 col-md-offset-1">
                        <h2>Case ${this.clinicalAnalysis.id}</h2>

                        <div style="float: right; padding-right: 20px">
                            <button class="btn btn-primary" @click="${this.onCloseClinicalAnalysis}">Close</button>
                        </div>
                                                        
                        <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                        </opencga-clinical-analysis-view>
                    </div>
                </div>`;
        }

        return html`
                <style>
                    #variant-interpreter-landing .nav-tabs.nav-center {
                        margin-bottom: 20px;
                    }
                </style>
                <div id="variant-interpreter-landing">
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        <li role="presentation" class="content-pills active ${this._prefix}-search-tab">
                            <a href="javascript: void 0" role="tab" data-id="${this._prefix}-search" @click="${this._changeTab}" class="tab-title">Search Case
                            </a>
                        </li>
                        <li role="presentation" class="content-pills ${this._prefix}-create-tab">
                            <a href="javascript: void 0" role="tab" data-id="${this._prefix}-create" @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Create Case
                            </a>
                        </li>
                    </ul>              
                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}-search" role="tabpanel" class="tab-pane active content-tab">
                            <div class="row">
                                <div class="col-md-4 col-md-offset-4">
                                    <div>
    <!--                                    <h3>Search Clinical Analysis</h3>-->
                                        <div>
                                            <label>Clinical Analysis ID</label>
                                            <select-field-filter-autocomplete-simple resource="clinical-analysis"
                                                    .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onClinicalAnalysisIdChange("clinicalAnalysisId", e.detail.value)}">
                                            </select-field-filter-autocomplete-simple>
                                        </div>
                                        
                                        <div>
                                            <label>Proband ID</label>
                                            <select-field-filter-autocomplete-simple resource="individuals" 
                                                    .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onProbandIdChange("individualId", e.detail.value)}">
                                            </select-field-filter-autocomplete-simple>
                                        </div>
            
                                        <div class="pull-right">                            
                                            <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">Clear</button>
                                            <button class="btn btn-default ripple" @click="${this.onClinicalAnalysisChange}">OK</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="${this._prefix}-create" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                            <opencga-clinical-analysis-writer   .opencgaSession="${this.opencgaSession}"
                                                                .config="${this.clinicalAnalysisEditorConfig}"
                                                                @clinicalanalysischange="${e => this.onClinicalAnalysisUpdate(e)}"
                                                                @clinicalAnalysisCreate="${e => this.onClinicalAnalysisCreate(e)}">
                             </opencga-clinical-analysis-writer>
                        </div>
                    </div>
                </div>
            `;
    }

}

customElements.define("variant-interpreter-landing", VariantInterpreterLanding);
