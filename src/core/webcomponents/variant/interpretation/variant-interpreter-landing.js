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
import OpencgaCatalogUtils from "../../../clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../../utilsNew.js";
import "../../clinical/clinical-analysis-editor.js";
import "../../clinical/opencga-clinical-analysis-writer.js";
import "../../clinical/clinical-analysis-interpretation-editor.js";
import "../../commons/filters/clinical-analysis-id-autocomplete.js";
import "../../commons/view/data-form.js";
import "../../clinical/clinical-analysis-audit-browser.js";
import "../../clinical/clinical-analysis-consent-editor.js";

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
        this._prefix = UtilsNew.randomString(8);

        this.clinicalAnalysisEditorConfig = {
            display: {
                showTitle: false,
                buttons: {
                    show: true
                }
            }
        };

        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this.activeTab["General"] = true;
        this._config = {...this.getDefaultConfig(), ...this.config};
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

        //debugger

        // TODO decomment
        // Check logged user is the study owner
        /*let _studyOwner = this.opencgaSession.study.fqn.split("@")[0];
        if (this.opencgaSession.user.id === _studyOwner) {
            this.editMode = true;
        } else {
            let _editMode = false;
            for (let group of this.opencgaSession.study.groups) {
                if (group.id === "@admins") {
                    _editMode = group.userIds.includes(this.opencgaSession.user.id);
                    break;
                }
            }
            if (!_editMode) {
                _editMode = this.opencgaSession.study?.acl?.includes("WRITE_CLINICAL_ANALYSIS");
            }
            this.editMode = _editMode;
        }*/

        // TODO comment
        this.editMode = true;

        this.onCloseClinicalAnalysis();

        this.getLastClinicalAnalysis();
    }

    // non-bootstrap tabs
    _changeTab(e) {
        e.preventDefault();

        const tabId = e.currentTarget.dataset.id;
        //the selectors are strictly defined to avoid conflics in tabs in children components
        $("#variant-interpreter-landing > div > .tablist > .content-pills", this).removeClass("active");
        $("#variant-interpreter-landing > .content-tab-wrapper > .content-tab", this).hide();
        $("#" + this._prefix + tabId, this).show();
        $("#" + this._prefix + tabId).addClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
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

    onClinicalAnalysisUpdate (e) {
        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                clinicalAnalysis: e.detail.clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
    }

    onClinicalAnalysisIdChange(key, value) {
        this.clinicalAnalysisId = value;
        this.probandId = null;
    }

    onProbandIdChange(key, value) {
        //this.probandId = value;
        this.clinicalAnalysisId = value;
    }

    onClinicalAnalysisChange() {
        if (this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                        detail: {
                            id: this.clinicalAnalysis ? this.clinicalAnalysis.id : null,
                            clinicalAnalysis: this.clinicalAnalysis
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
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                        detail: {
                            id: this.clinicalAnalysis ? this.clinicalAnalysis.id : null,
                            clinicalAnalysis: this.clinicalAnalysis
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
        this.opencgaSession.opencgaClient.clinical().info(e.detail.id, {study: this.opencgaSession.study.fqn})
            .then(response => {
                this.clinicalAnalysis = response.responses[0].results[0];
                this.dispatchEvent(new CustomEvent("selectClinicalAnalysis", {
                    detail: {
                        id: this.clinicalAnalysis ? this.clinicalAnalysis.id : null,
                        clinicalAnalysis: this.clinicalAnalysis
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
        //console.error("getLastClinicalAnalysis")
        this.opencgaSession.opencgaClient.clinical().search({study: this.opencgaSession.study.fqn, limit: 10})
            .then(response => {
                this.lastClinicalAnalysis = response.responses[0].results.map(value => value.id);
                this.lastClinicalAnalysis = [...this.lastClinicalAnalysis];
                //console.log("this.lastClinicalAnalysis", this.lastClinicalAnalysis)
                //debugger
                this.requestUpdate();
            })
            .catch(response => {
                console.error("An error occurred fetching clinicalAnalysis: ", response);
                this.lastClinicalAnalysis = [];
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
            buttons: {
                show: true,
                clearText: "Clear",
                submitText: "Open",
                classes: "col-md-4 col-md-offset-4"
            },
            display: {
                showTitle: true,
                infoIcon: "",
                labelAlign: "left",
                defaultLayout: "vertical",
                classes: "col-md-4 col-md-offset-4"
            },
            sections: [
                {
                    title: "Open Case",
                    display: {},
                    elements: [
                        {
                            name: "Clinical Analysis ID",
                            field: "id",
                            type: "custom",
                            display: {
                                render: () => {
                                    const config = {
                                        addButton: false,
                                        multiple: false,
                                        dataSource: (query, process) => {
                                            const filters = {
                                                study: this.opencgaSession.study.fqn,
                                                limit: 20,
                                                count: false,
                                                id: "~^" + query.toUpperCase()
                                            };
                                            this.opencgaSession.opencgaClient.clinical().search(filters).then(restResponse => {
                                                const results = restResponse.getResults();
                                                process(results.map(item => ({name: item.id, Type: item?.type, "Proband Id": item?.proband?.id})));
                                            });
                                        }
                                    };
                                    return html`<clinical-analysis-id-autocomplete .config=${config} .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onClinicalAnalysisIdChange("clinicalAnalysisId", e.detail.value)}"></clinical-analysis-id-autocomplete>`;
                                },
                                placeholder: "eg. AN-3",
                                errorMessage: ""
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "proband.id",
                            type: "custom",
                            display: {
                                render: () => {
                                    const config = {
                                        addButton: false,
                                        multiple: false,
                                        dataSource: (query, process) => {
                                            const filters = {
                                                study: this.opencgaSession.study.fqn,
                                                limit: 20,
                                                count: false,
                                                proband: "~^" + query.toUpperCase()
                                            };
                                            this.opencgaSession.opencgaClient.clinical().search(filters).then(restResponse => {
                                                const results = restResponse.getResults();
                                                process(results.map(item => ({name: item.id, Proband: item?.proband?.id})));
                                            });
                                        }
                                    };
                                    return html`<clinical-analysis-id-autocomplete .config=${config} .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onProbandIdChange("individualId", e.detail.value)}"></clinical-analysis-id-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Recent Analysis created",
                            field: "id",
                            type: "select",
                            //defaultValue: this.lastClinicalAnalysis ? this.lastClinicalAnalysis[0] : null,
                            allowedValues: data => {
                                return this.lastClinicalAnalysis;
                            },
                            display: {}
                        }
                    ]
                }
            ]
        };
    }

    getDefaultConfig() {
        return {
            clinicalAnalysisSelector: true
        };
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
            <div id="variant-interpreter-landing">
                <div>
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ? html`
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["General"] || UtilsNew.isEmpty(this.activeTab)})}">
                                <a href="javascript: void 0" role="tab" data-id="General" 
                                    @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">General</a>
                            </li>
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Clinical"]})}">
                                <a href="javascript: void 0" role="tab" data-id="Clinical" 
                                    @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Clinical</a>
                            </li>
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Interpretations"]})}">
                                <a href="javascript: void 0" role="tab" data-id="Interpretations" 
                                    @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Interpretation Manager</a>
                            </li>
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Consent"]})}">
                                <a href="javascript: void 0" role="tab" data-id="Consent" 
                                    @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Consent</a>
                            </li>                                                        
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Audit"]})}">
                                <a href="javascript: void 0" role="tab" data-id="Audit" 
                                    @click="${e => this.editMode && this._changeTab(e)}" class="tab-title ${classMap({disabled: !this.editMode})}">Audit</a>
                            </li>
                            ` : null
                        }
                        <li role="presentation" class="content-pills active ${classMap({active: this.activeTab["Overview"]})}">
                            <a href="javascript: void 0" role="tab" data-id="Overview" 
                                @click="${this._changeTab}" class="tab-title">${this.clinicalAnalysis ? "Case Overview" : "Select Case"}</a>
                        </li>
                    </ul>
                </div>
                
                <div class="content-tab-wrapper">
                    <div id="${this._prefix}General" role="tabpanel" class="active tab-pane content-tab col-md-10 col-md-offset-1">
                        <tool-header title="General Settings - ${this.clinicalAnalysis?.id ?? ""}" class="bg-white"></tool-header>
                        <div style="padding: 0px 20px">
                            <clinical-analysis-editor   .opencgaSession=${this.opencgaSession} 
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                            </clinical-analysis-editor>
                        </div>
                    </div>
                    <div id="${this._prefix}Clinical" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                        <tool-header title="Clinical" class="bg-white"></tool-header>
                        <div style="padding: 0px 20px">
                            <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}">
                            </opencga-clinical-analysis-view>
                        </div>                                    
                    </div>                           
                    <div id="${this._prefix}Interpretations" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                        <tool-header title="Interpretation Manager" class="bg-white"></tool-header>
                        <div style="padding: 0px 20px">
                            <clinical-analysis-interpretation-editor    .opencgaSession="${this.opencgaSession}"
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}" 
                                                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                            </clinical-analysis-interpretation-editor>
                        </div>                                    
                    </div>                                    
                    <div id="${this._prefix}Consent" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                        <tool-header title="Consent - ${this.clinicalAnalysis?.proband.id}" class="bg-white"></tool-header>
                        <div style="padding: 0px 20px">
                            <clinical-analysis-consent-editor   .opencgaSession=${this.opencgaSession} 
                                                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </clinical-analysis-consent-editor>
                        </div>                    
                    </div>                    
                    <div id="${this._prefix}Audit" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                        <tool-header title="Audit Log" class="bg-white"></tool-header>
                        <div style="padding: 0px 10px">
                            <clinical-analysis-audit-browser    .opencgaSession="${this.opencgaSession}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                .active="${this.activeTab["Audit"]}">
                            </clinical-analysis-audit-browser>
                        </div> 
                    </div> 
                    
                    <div id="${this._prefix}Overview" role="tabpanel" class="tab-pane content-tab col-md-10 col-md-offset-1">
                        ${this.clinicalAnalysis
                            ? html`
                                <tool-header title="Case Summary - ${this.clinicalAnalysis?.id}" class="bg-white"></tool-header>
                                <div style="padding: 0px 20px">
                                    <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                                    </opencga-clinical-analysis-view>
                                </div>`
                            : this._config.clinicalAnalysisSelector
                                ? html`
                                    <data-form  .data="${{}}" 
                                                .config="${this.getSearchConfig()}" 
                                                @fieldChange="${this.onSearchFieldChange}"
                                                @clear="${this.onClinicalAnalysisChange}"
                                                @submit="${this.onClinicalAnalysisChange}">
                                    </data-form>`
                                : null
                        }
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-landing", VariantInterpreterLanding);
