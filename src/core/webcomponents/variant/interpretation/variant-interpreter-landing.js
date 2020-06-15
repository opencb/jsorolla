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
import "../../clinical/opencga-clinical-analysis-writer.js";
import "../../commons/filters/clinical-analysis-id-autocomplete.js";
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
        // Check logged user is the study owner
        let _studyOwner = this.opencgaSession.study.fqn.split("@")[0];
        if (this.opencgaSession.user.id === _studyOwner) {
            this.editMode = true;
        } else {
            this.editMode = this.opencgaSession.study.acl.includes("WRITE_CLINICAL_ANALYSIS");
        }

        this.getLastClinicalAnalysis();
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

    getLastClinicalAnalysis() {
        // Fetch object from server since the server automatically adds some information
        this.opencgaSession.opencgaClient.clinical().search({study: this.opencgaSession.study.fqn, limit: 10})
            .then(response => {
                this.lastClinicalAnalysis = response.responses[0].results.map(value => value.id);
                debugger
                this.requestUpdate();
            })
            .catch(response => {
                console.error("An error occurred fetching clinicalAnalysis: ", response);
            });
    }

    onSearchFieldChange(e) {
        switch (e.detail.param) {
            case "id":
                this.clinicalAnalysisId = e.detail.value;
                this.probandId = null;
                break;
            case "proband.id":
                this.probandId = e.detail.value;
                this.clinicalAnalysisId = null;
                break;
        }
    }

    getSearchConfig() {
        return {
            id: "clinical-analysis",
            title: "",
            icon: "",
            type: "form",
            description: "Sample Variant Stats description",
            display: {
                showTitle: true,
                infoIcon: "",
                labelAlign: "left",
                defaultLayout: "vertical",
                classes: "col-md-4 col-md-offset-4",
                buttons: {
                    show: true,
                    clearText: "Clear",
                    submitText: "Open"
                }
            },
            sections: [
                {
                    title: "Open Case",
                    display: {
                    },
                    elements: [
                        {
                            name: "Clinical Analysis ID",
                            field: "id",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <select-field-filter-autocomplete-simple resource="clinical-analysis"
                                                .opencgaSession="${this.opencgaSession}" 
                                                @filterChange="${e => this.onClinicalAnalysisIdChange("clinicalAnalysisId", e.detail.value)}">
                                        </select-field-filter-autocomplete-simple>
                                    `;
                                },
                                placeholder: "eg. AN-3",
                                errorMessage: ""
                            }
                        },
                        {
                            name: "Proband ID",
                            field: "proband.id",
                            type: "custom",
                            display: {
                                render: () => {
                                    const config = {
                                        addButton: false,
                                        dataSource: (query, process) => {
                                            const filters = {
                                                study: this.opencgaSession.study.fqn,
                                                limit: 5,
                                                count: false,
                                                proband: "^" + query.toUpperCase()
                                            };
                                            this.opencgaSession.opencgaClient.clinical().search(filters).then(restResponse => {
                                                const results = restResponse.getResults();
                                                process(results.map( item => ({name: item.id, secondary: {Proband: item?.proband?.id}})));
                                            });
                                        }
                                    }
                                    return html`<clinical-analysis-id-autocomplete .config=${config} .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onProbandIdChange("individualId", e.detail.value)}"></clinical-analysis-id-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Recent Analysis created",
                            field: "id",
                            type: "select",
                            allowedValues: data => {
                                return {allowedValues: this.lastClinicalAnalysis};
                            },
                            display: {
                            }
                        },
                    ]
                }
            ]
        }
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
                <style>
                    #variant-interpreter-landing .nav-tabs.nav-center {
                        margin-bottom: 20px;
                    }
                </style>
                <div id="variant-interpreter-landing">
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        <li role="presentation" class="content-pills active ${this._prefix}-search-tab">
                            <a href="javascript: void 0" role="tab" data-id="${this._prefix}-search" @click="${this._changeTab}" class="tab-title">Select Case
                            </a>
                        </li>
                        <li role="presentation" class="content-pills ${this._prefix}-create-tab">
                            <a href="javascript: void 0" role="tab" data-id="${this._prefix}-create" @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Create Case
                            </a>
                        </li>
                    </ul>              
                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}-search" role="tabpanel" class="tab-pane active content-tab">
                            <data-form  .data="${{}}" 
                                        .config="${this.getSearchConfig()}" 
                                        @fieldChange="${this.onSearchFieldChange}"
                                        @clear="${this.onClinicalAnalysisChange}"
                                        @submit="${this.onClinicalAnalysisChange}">
                            </data-form>
                            
                            ${this.clinicalAnalysis ? html`
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
                                </div>` : null}
                        </div>
                        
                        <div id="${this._prefix}-create" role="tabpanel" class="tab-pane content-tab col-md-8 col-md-offset-2">
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
