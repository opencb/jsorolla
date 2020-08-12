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
import UtilsNew from "../../../utilsNew.js";
import "./variant-interpreter-qc-overview.js";
import "./variant-interpreter-qc-alignment.js";
import "./variant-interpreter-qc-gene-coverage.js";


class VariantInterpreterQc extends LitElement {

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
            cellbaseClient: {
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
        this._prefix = "vcis-" + UtilsNew.randomString(6);
        this.activeTab = {"Overview": true}; //default active tab
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
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.proband?.samples) {
            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                this.sample = this.clinicalAnalysis.proband.samples.find(elem => elem.somatic);
            } else {
                this.sample = this.clinicalAnalysis.proband.samples[0];
            }
        }
        this.requestUpdate();
    }

    _changeTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        const navTabs = $(`#${this._prefix}QcTabs > .nav-tabs > .content-pills`, this);
        const contentTabs = $(`#${this._prefix}QcTabs > .content-tab-wrapper > .tab-pane`, this);
        if (!e.currentTarget?.className?.split(" ")?.includes("disabled")) {
            navTabs.removeClass("active");
            contentTabs.removeClass("active");
            $("#" + this._prefix + tabId).addClass("active");
            for (const tab in this.activeTab) this.activeTab[tab] = false;
            this.activeTab[tabId] = true;
            this.requestUpdate();
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

        // if (!this.clinicalAnalysis) {
        //     return html`
        //             <div>
        //                 <h3><i class="fas fa-lock"></i> No Case open</h3>
        //             </div>`;
        // }

        return this.clinicalAnalysis ? html`
            <div id="${this._prefix}QcTabs">
                <div class="">
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Overview"]})}">
                            <a href="javascript: void 0" role="tab" data-id="Overview" @click="${this._changeTab}" class="tab-title">Overview
                            </a>
                        </li>
                        
                        ${this.clinicalAnalysis.type.toUpperCase() === "CANCER" 
                            ? html`
                                <li role="presentation" class="content-pills ${classMap({active: this.activeTab["VariantQcCancer"]})}">
                                    <a href="javascript: void 0" role="tab" data-id="VariantQcCancer" @click="${this._changeTab}" class="tab-title">Cancer QC Plots
                                    </a>
                                </li>` 
                            : null
                        }
                        
                        <li role="presentation" class="content-pills ${classMap({active: this.activeTab["SampleVariantStats"]})}">
                            <a href="javascript: void 0" role="tab" data-id="SampleVariantStats" @click="${this._changeTab}" class="tab-title">Sample Variant Stats
                            </a>
                        </li>
                        
                        <!--<li role="presentation" class="content-pills ${classMap({active: this.activeTab["AlignmentQc"]})}">
                            <a href="javascript: void 0" role="tab" data-id="AlignmentQc" @click="${this._changeTab}" class="tab-title">Alignment
                            </a>
                        </li>-->
                        
                        ${application.appConfig === "opencb" 
                            ? html`
                                <li role="presentation" class="content-pills ${classMap({active: this.activeTab["GeneCoverage"]})}">
                                    <a href="javascript: void 0" role="tab" data-id="GeneCoverage" @click="${this._changeTab}" class="tab-title">Gene Coverage Stats
                                    </a>
                                </li>` 
                            : null
                        }
                        
                        <!-- 
                        ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY" ? html`
                            <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Upd"]})}">
                                <a href="javascript: void 0" role="tab" data-id="Upd" @click="${this._changeTab}" class="tab-title disabled">UPD (coming soon)
                                </a>
                            </li>` : null 
                        }
                        
                        <li role="presentation" class="content-pills ${classMap({active: this.activeTab["GenomeBrowser"]})}">
                            <a href="javascript: void 0" role="tab" data-id="GenomeBrowser" @click="${this._changeTab}" class="tab-title">Genome Browser
                            </a>
                        </li>
                        -->
                    </ul>
                </div>
                
                <div class="content-tab-wrapper">
                    <div id="${this._prefix}Overview" role="tabpanel" class="tab-pane active col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Quality Control Overview - ${this.clinicalAnalysis.proband.id}" class="bg-white"></tool-header>
                        <variant-interpreter-qc-overview .opencgaSession="${this.opencgaSession}" 
                                                         .clinicalAnalysis="${this.clinicalAnalysis}"
                                                         .active="${this.activeTab["Overview"]}">
                        </variant-interpreter-qc-overview>
                    </div>
                     
                    <div id="${this._prefix}VariantQcCancer" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Cancer QC Plots - ${this.clinicalAnalysis.proband.id}" class="bg-white"></tool-header>
                        <sample-cancer-variant-stats-browser    .opencgaSession="${this.opencgaSession}" 
                                                                .sample="${this.sample}"
                                                                .active="${this.activeTab["VariantQc"]}" 
                                                                .config="${{showTitle: false}}">
                        </sample-cancer-variant-stats-browser>
                    </div>
                    
                    <div id="${this._prefix}SampleVariantStats" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Sample Variant Stats - ${this.clinicalAnalysis.proband.id}" class="bg-white"></tool-header>
                        <sample-variant-stats-browser .opencgaSession="${this.opencgaSession}" 
                                                      .sample="${this.sample}"
                                                      .active="${this.activeTab["VariantQc"]}"
                                                      .config="${{showTitle: false}}">
                        </sample-variant-stats-browser>
                    </div>
                   
                    <!--
                    <div id="${this._prefix}AlignmentQc" role="tabpanel" class="tab-pane container content-tab">
                        <variant-interpreter-qc-alignment   .opencgaSession="${this.opencgaSession}" 
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .active="${this.activeTab["AlignmentQc"]}">
                        </variant-interpreter-qc-alignment>
                    </div>
                    -->
                    
                    <div id="${this._prefix}GeneCoverage" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Gene Coverage Stats - ${this.clinicalAnalysis.proband.id}" class="bg-white"></tool-header>
                        <variant-interpreter-qc-gene-coverage   .opencgaSession="${this.opencgaSession}" 
                                                                .cellbaseClient="${this.cellbaseClient}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                .active="${this.activeTab["Coverage"]}">
                        </variant-interpreter-qc-gene-coverage>
                    </div>
                    
                    ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                        ? html`
                            <div id="${this._prefix}Upd" role="tabpanel" class="tab-pane content-tab">
                                <h3>Not implemented yet.</h3>
                            </div>`
                        : ""
                    }
                    <!--
                    <div id="${this._prefix}GenomeBrowser" role="tabpanel" class="tab-pane content-tab">
                        <opencga-variant-interpreter-genome-browser .opencgaSession="${this.opencgaSession}"
                                                                    .cellbaseClient="${this.cellbaseClient}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                    .config="${this._config}"
                                                                    .active="${this.activeTab["GenomeBrowser"]}">
                        </opencga-variant-interpreter-genome-browser>
                    </div>
                    -->
                </div>
            </div>
        ` : null;
    }

}

customElements.define("variant-interpreter-qc", VariantInterpreterQc);
