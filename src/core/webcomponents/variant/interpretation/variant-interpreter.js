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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../commons/tool-header.js";
import "./variant-interpreter-landing.js";
import "./variant-interpreter-qc.js";
import "./variant-interpreter-browser.js";
import "./variant-interpreter-report.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";
import "./variant-interpreter-review.js";
import "./variant-interpreter-methods.js";
import "../../clinical/opencga-clinical-analysis-view.js";
import "../../clinical/clinical-interpretation-view.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter-autocomplete-simple.js";
import "../../download-button.js";
import "../../loading-spinner.js";

class VariantInterpreter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // With each property change we must updated config and create the columns again. No extra checks are needed.
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.clinicalAnalysis = null;
            this._changeView(this._config?.tools[0].id);
            this.requestUpdate();

            // To delete
            // this.clinicalAnalysisId = "test3";
            // this.clinicalAnalysisId = "CA-2";
            // this.clinicalAnalysisId = "TN2_PINDEL";
            // this.clinicalAnalysisId = "C-MA6250";
            // this.clinicalAnalysisIdObserver();
        }
    }

    async clinicalAnalysisIdObserver() {
        if (this.opencgaSession) {
            this._config = {...this._config, loading: true};
            await this.requestUpdate();
            if (this.clinicalAnalysisId) {
                this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                    .then(async response => {
                        this.clinicalAnalysis = response.getResult(0);
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
                    })
                    .finally(async () => {
                        this._config = {...this._config, loading: false};
                        await this.requestUpdate();
                    });
            } else {
                this.clinicalAnalysis = null;
            }
        }
    }

    onClickSection(e) {
        e.preventDefault();
        if (e.currentTarget?.dataset?.view && !e.currentTarget.className.split(" ").includes("disabled")) {
            this._changeView(e.currentTarget.dataset.view);
        }
    }

    _changeView(tabId) {
        // console.log("changing to ", tabId)
        /* $(`.clinical-portal-step`, this).removeClass("active");
        $(`.clinical-portal-content`, this).hide(); // hides all content divs
        for (const tab in this.activeTab) this.activeTab[tab] = false;

        $(`.clinical-portal-step[data-view=${tabId}]`, this).addClass("active");
        $("#" + this._prefix + tabId, this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();*/


        $(".clinical-portal-step", this).removeClass("active");
        // $(".clinical-portal-content", this).removeClass("active");
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onClinicalAnalysisUpdate(e) {
        this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysis.id, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                this.clinicalAnalysis = restResponse.responses[0].results[0];
                this.requestUpdate();
            });
    }

    onClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
        this.requestUpdate();
    }

    /* async closeClinicalAnalysis() {
        // after a while clinicalAnalysis reappears as it is defined in the hash
        this.clinicalAnalysisId = null;
        this.clinicalAnalysis = null;
    }*/

    getDefaultConfig() {
        return {
            title: "Case Interpreter",
            icon: "fas fa-user-md",
            active: false,
            tools: [
                {
                    id: "select",
                    title: "Case Info Manager",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-folder-open"
                },
                {
                    id: "qc",
                    title: "Quality Control",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-chart-bar"
                },
                {
                    id: "methods",
                    title: "Interpretation Methods",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-sync"
                },
                {
                    id: "variant-browser",
                    title: "Sample Variant Browser",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-search"
                },
                {
                    id: "review",
                    title: "Interpretation Review",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-edit"
                },
                {
                    id: "report",
                    title: "Report",
                    acronym: "VB",
                    description: "",
                    disabled: true,
                    icon: "fa fa-file-alt"
                }
            ]
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession || !this.opencgaSession.study) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <div class="variant-interpreter-tool">
                ${this.clinicalAnalysis && this.clinicalAnalysis.id ? html`
                    <tool-header icon="${this._config.icon}"
                                 .title="${`${this._config.title}<span class="inverse"> Case ${this.clinicalAnalysis?.id} </span>` }"
                                 .rhs="${html`
                                    <download-button .json="${this.clinicalAnalysis}" title="Download Clinical Analysis"></download-button>
                                    <a class="btn btn-default ripple text-black" title="Close Case" href="#clinicalAnalysisPortal/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}"><i class="fas fa-times"></i> Close</a>
                                    <!--<div class="dropdown more-button">
                                        <a class="btn btn-default ripple dropdown-toggle" type="button" data-toggle="dropdown"><i class="fas fa-ellipsis-h"></i></a>
                                        <ul class="dropdown-menu pull-right">
                                            <li><a title="Lock Case" href="#"><i class="fas fa-lock"></i> Lock Case</a></li>
                                        </ul>
                                    </div>-->
                                 `}"></tool-header>
                ` : html`
                    <tool-header .title="${this._config.title}" icon="${this._config.icon}"></tool-header>
                `}
            
                <div class="col-md-10 col-md-offset-1">
                    <nav class="navbar" style="margin-bottom: 5px; border-radius: 0px">
                        <div class="container-fluid">
                            <!-- Brand and toggle get grouped for better mobile display -->
                            <div class="navbar-header">
                                <!--
                                    <a class="navbar-brand" href="#home" @click="${this.changeTool}">
                                        <b>${this._config.title} <sup>${this._config.version}</sup></b>
                                    </a>
                                 -->
                            </div>
                            <div>
                                <!-- Controls aligned to the LEFT -->
                                <div class="row hi-icon-wrap wizard hi-icon-animation">
                                ${this._config.tools && this._config.tools.map(item => html`
                                    ${!item.hidden ? html`
                                        <a class="icon-wrapper clinical-portal-step ${!this.clinicalAnalysis && item.id !== "select" || item.disabled ? "disabled" : ""}" href="javascript: void 0" data-view="${item.id}" @click="${this.onClickSection}">
                                            <div class="hi-icon ${item.icon}"></div>
                                            <p>${item.title}</p>
                                            <span class="smaller"></span>
                                        </a>` :
                                    null}
                                `)}
                                </div>
                            </div> 
                        </div> 
                    </nav> 
                </div>
                
                <div id="${this._prefix}MainWindow" class="col-md-12">
                    <div>
                        ${this._config.tools ? html`
                            ${this.activeTab["select"] ? html`
                                <div id="${this._prefix}select" class="clinical-portal-content">
                                    <variant-interpreter-landing .opencgaSession="${this.opencgaSession}"
                                                                 .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                 .config="${this._config}"
                                                                 @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                                                 @selectClinicalAnalysis="${this.onClinicalAnalysis}">
                                    </variant-interpreter-landing>
                                </div>
                            ` : null}
                            
                            ${this.activeTab["qc"] ? html`
                                <div id="${this._prefix}qc" class="clinical-portal-content">
                                    <variant-interpreter-qc .opencgaSession="${this.opencgaSession}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .config="${this._config}" 
                                                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-qc>
                                </div>
                            ` : null}

                            ${this.activeTab["methods"] ? html`
                                <div id="${this._prefix}methods" class="clinical-portal-content">
                                    <variant-interpreter-methods    .opencgaSession="${this.opencgaSession}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                    .config="${this._config}">
                                    </variant-interpreter-methods>
                                </div>
                            ` : null}
                            
                            ${this.activeTab["variant-browser"] ? html`
                                <div id="${this._prefix}variant-browser" class="clinical-portal-content">
                                    <variant-interpreter-browser    .opencgaSession="${this.opencgaSession}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                    .query="${this.interpretationSearchQuery}"
                                                                    .cellbaseClient="${this.cellbaseClient}"
                                                                    @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-browser>
                                </div>
                            ` : null}

                            ${this.activeTab["review"] ? html`
                                <div id="${this._prefix}review" class="clinical-portal-content">
                                <variant-interpreter-review .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .populationFrequencies="${this._config.populationFrequencies}"
                                                            .proteinSubstitutionScores="${this._config.proteinSubstitutionScores}"
                                                            .consequenceTypes="${this._config.consequenceTypes}"
                                                            .config="${this._config}"
                                                            @gene="${this.geneSelected}"
                                                            @samplechange="${this.onSampleChange}"
                                                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                 </variant-interpreter-review>
                            </div>
                            ` : null}

                            ${this.activeTab["report"] ? html`
                                <div id="${this._prefix}report" class="clinical-portal-content col-md-10 col-md-offset-1">
                                    <variant-interpreter-report .opencgaSession="${this.opencgaSession}">
                                    </variant-interpreter-report>
                                </div>
                            ` : null}
                        ` : null}
                    </div>
                </div>
            </div> 
            
            <div class="v-space"></div>
        `;
    }

}

customElements.define("variant-interpreter", VariantInterpreter);
