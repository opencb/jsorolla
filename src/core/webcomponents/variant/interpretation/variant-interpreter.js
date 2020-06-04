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
import "./variant-interpreter-landing.js";
import "./variant-interpreter-qc.js";
import "./variant-interpreter-rd-browser.js";
import "./variant-interpreter-cancer-browser.js";
import "./variant-interpreter-review.js";
import "./variant-interpreter-interpretation.js";
import "./opencga-variant-interpreter-genome-browser.js";
import "../../alignment/gene-coverage-view.js";
import "../../opencga/opencga-genome-browser.js";
import "../../clinical/opencga-clinical-analysis-view.js";
import "../../clinical/clinical-interpretation-view.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter-autocomplete-simple.js";


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
        this._prefix = "vgi-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    // firstUpdated(_changedProperties) {
    //     this.requestUpdate();
    // }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
    }

    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.clinicalAnalysis = null;
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        if (e.currentTarget?.dataset?.view && !e.currentTarget.className.includes("disabled")) {
            $(".clinical-portal-content", this).hide(); // hides all content divs
            // $("#" + this._prefix + e.target.dataset.view).show(); // get the href and use it find which div to show
            this.querySelector("#" + this._prefix + e.currentTarget.dataset.view).style.display = "block";
            // Show the active button
            // $(".clinical-portal-button").removeClass("active");
            $(".clinical-portal-step").removeClass("active");
            // $(e.target).addClass("active");
            $(e.currentTarget).addClass("active");
        }
    }

    onClinicalAnalysisUpdate (e) {
        this.clinicalAnalysis = {...e.detail.clinicalAnalysis};
        this.requestUpdate();
    }

    onClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
        // debugger
        // this.clinicalAnalysis.type = "CANCER";
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Variant Interpreter",
            icon: "fas fa-search",
            active: false,
            tools: [
                {
                    id: "select",
                    title: "Case Info",
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
                // {
                //     id: "genome-browser",
                //     title: "Genome Browser",
                //     acronym: "VB",
                //     description: "",
                //     icon: "fa fa-bars"
                // },
                {
                    id: "interpretation",
                    title: "Interpretation Methods",
                    acronym: "VB",
                    description: "",
                    icon: "fa fa-sync"
                },
                {
                    id: "variant-browser",
                    title: "Variant Browser",
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
                    icon: "fa fa-file-alt"
                }
            ]
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <div class="row">
                <div class="page-title">
                    <h2>
                        ${this.clinicalAnalysis && this.clinicalAnalysis.id ? html`
                            <i class="fa fa-filter" aria-hidden="true" style="padding-left: 10px;padding-right: 10px"></i>&nbsp;${this._config.title} - Case ${this.clinicalAnalysis.id}
                        ` : html`
                            <i class="fa fa-filter" aria-hidden="true"></i>&nbsp; ${this._config.title}
                        `}
                    </h2>
                </div>
            
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
                                ${this._config.tools && this._config.tools.map( item => html`
                                    <a class="icon-wrapper clinical-portal-step ${!this.clinicalAnalysis && item.id !== "select" ? "disabled" : ""}" href="javascript: void 0" data-view="${item.id}" @click="${this._changeView}">
                                        <div class="hi-icon ${item.icon}"></div>
                                        <p>${item.title}</p>
                                        <span class="smaller"></span>
                                    </a>
                                `)}
                                </div>
                            </div> 
                        </div> 
                    </nav> 
                </div>
                
                <div id="${this._prefix}MainWindow" class="col-md-12">
                    <div>
                        ${this._config.tools ? html`
                            <div id="${this._prefix}select" class="clinical-portal-content">
                                <variant-interpreter-landing .opencgaSession="${this.opencgaSession}"
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .config="${this._config}"
                                                             @selectClinicalAnalysis="${this.onClinicalAnalysis}">
                                </variant-interpreter-landing>
                            </div>
        
                            <div id="${this._prefix}qc" class="clinical-portal-content" 
                                        style="${this._config.tools[0].id !== "qc" ? "display: none" : ""}">
                                <variant-interpreter-qc .opencgaSession="${this.opencgaSession}"
                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                        .config="${this._config}">
                                </variant-interpreter-qc>
                            </div>
                            
                            <div id="${this._prefix}interpretation" class="clinical-portal-content col-md-8 col-md-offset-2" 
                                        style="${this._config.tools[0].id !== "interpretation" ? "display: none" : ""}">
                                <variant-interpreter-interpretation .opencgaSession="${this.opencgaSession}"
                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                        .config="${this._config}">
                                </variant-interpreter-interpretation>
                            </div>                            
                            
                            <div id="${this._prefix}genome-browser" class="clinical-portal-content" style="${this._config.tools[0].id !== "genome-browser" ? "display: none" : ""}">
                                <opencga-variant-interpreter-genome-browser .opencgaSession="${this.opencgaSession}"
                                                                            .cellbaseClient="${this.cellbaseClient}"
                                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                            .config="${this._config}">
                                </opencga-variant-interpreter-genome-browser>
                                <!--
                                <opencga-variant-interpreter-genome-browser .opencgaSession="${this.opencgaSession}"
                                                                            .cellbaseClient="${this.cellbaseClient}"
                                                                            .samples="${this.samples}"
                                                                            .query="${this.query}"
                                                                            .search="${this.search}"
                                                                            .region="${this.search?.region}"
                                                                            .geneIds="${this.geneIds}"
                                                                            .panelIds="${this.diseasePanelIds}"
                                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                            .active="${this._genomeBrowserActive}"
                                                                            .fullScreen="${this.fullScreen}"
                                                                            .config="${this._config.genomeBrowser}">
                                </opencga-variant-interpreter-genome-browser>
                                -->
                            </div>
                            
                            <div id="${this._prefix}variant-browser" class="clinical-portal-content" style="${this._config.tools[0].id !== "variant-browser" ? "display: none" : ""}">
                                
                                ${this.clinicalAnalysis && (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY") 
                                    ? html`
                                        <variant-interpreter-rd-browser .opencgaSession="${this.opencgaSession}"
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                        .query="${this.interpretationSearchQuery}"
                                                                        .cellbaseClient="${this.cellbaseClient}"
                                                                        .populationFrequencies="${this._config.populationFrequencies}"
                                                                        .proteinSubstitutionScores="${this._config.proteinSubstitutionScores}"
                                                                        .consequenceTypes="${this._config.consequenceTypes}"
                                                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                                                        @gene="${this.geneSelected}"
                                                                        @samplechange="${this.onSampleChange}">
                                        </variant-interpreter-rd-browser>`
                                    : html `
                                        <variant-interpreter-cancer-browser .opencgaSession="${this.opencgaSession}"
                                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                            .query="${this.interpretationSearchQuery}"
                                                                            .cellbaseClient="${this.cellbaseClient}"
                                                                            .populationFrequencies="${this._config.populationFrequencies}"
                                                                            .proteinSubstitutionScores="${this._config.proteinSubstitutionScores}"
                                                                            .consequenceTypes="${this._config.consequenceTypes}"
                                                                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                                                            @gene="${this.geneSelected}">
                                        </variant-interpreter-cancer-browser>`
                                }
                            </div>
                            
                            <div id="${this._prefix}review" class="clinical-portal-content col-md-10 col-md-offset-1" style="${this._config.tools[0].id !== "review" ? "display: none" : ""}">
                                <variant-interpreter-review .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .populationFrequencies="${this._config.populationFrequencies}"
                                                            .proteinSubstitutionScores="${this._config.proteinSubstitutionScores}"
                                                            .consequenceTypes="${this._config.consequenceTypes}"
                                                            .config="${this._config}"
                                                            @gene="${this.geneSelected}"
                                                            @samplechange="${this.onSampleChange}">
                                 </variant-interpreter-review>
                            </div>
                        ` : null}
                    </div>
                </div>
            </div> 
            
            <div class="v-space"></div>
        `;
    }

}

customElements.define("variant-interpreter", VariantInterpreter);
