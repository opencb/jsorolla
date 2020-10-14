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
import "../../tool-header.js";
import "./variant-interpreter-landing.js";
import "./variant-interpreter-qc.js";
import "./variant-interpreter-browser.js";
import "./variant-interpreter-report.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";
import "./variant-interpreter-review.js";
import "./variant-interpreter-interpretation.js";
import "./opencga-variant-interpreter-genome-browser.js";
import "../../opencga/opencga-genome-browser.js";
import "../../clinical/opencga-clinical-analysis-view.js";
import "../../clinical/clinical-interpretation-view.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter-autocomplete-simple.js";
import "../../download-button.js";


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
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.clinicalAnalysis = null;
        this._changeView(this._config?.tools[0].id)
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession) {
            if( this.clinicalAnalysisId) {
                this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        this.clinicalAnalysis = response.responses[0].results[0];
                        this.requestUpdate();
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
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
        //console.log("changing to ", tabId)
        $(`.clinical-portal-step`, this).removeClass("active");
        $(`.clinical-portal-content`, this).hide(); // hides all content divs
        for (const tab in this.activeTab) this.activeTab[tab] = false;

        $(`.clinical-portal-step[data-view=${tabId}]`, this).addClass("active");
        $("#" + this._prefix + tabId, this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    /*_changeView(e) {
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
    }*/

    onClinicalAnalysisUpdate (e) {
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

    /*async closeClinicalAnalysis() {
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
                    title: "Case Manager",
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
                    id: "interpretation",
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
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <style>
                variant-interpreter-interpretation .page-title {
                    background: transparent;
                }
            </style>
            
            <div class="variant-interpreter-interpretation">
                ${this.clinicalAnalysis && this.clinicalAnalysis.id ? html`
                    <tool-header icon="${this._config.icon}"
                                 .title="${`${this._config.title}<span class="inverse"> Case ${this.clinicalAnalysis?.id} </span>` }"
                                 .rhs="${html`
                                    <download-button .json="${this.clinicalAnalysis}" title="Download Clinical Analysis"></download-button>
                                    <a class="btn btn-default ripple" title="Close Case" href="#clinicalAnalysisPortal/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}"><i class="fas fa-times"></i> Close</a>
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
                                ${this._config.tools && this._config.tools.map( item => html`
                                    ${!item.hidden ? html`
                                        <a class="icon-wrapper clinical-portal-step ${!this.clinicalAnalysis && item.id !== "select" || item.disabled ? "disabled" : ""}" href="javascript: void 0" data-view="${item.id}" @click="${this.onClickSection}">
                                            <div class="hi-icon ${item.icon}"></div>
                                            <p>${item.title}</p>
                                            <span class="smaller"></span>
                                        </a>`
                                    : null}
                                `)}
                                </div>
                            </div> 
                        </div> 
                    </nav> 
                </div>
                
                <div id="${this._prefix}MainWindow" class="col-md-12">
                    <div>
                        ${this._config.tools ? html`
                            <div id="${this._prefix}select" class="clinical-portal-content" 
                                        style="${this._config.tools[0].id !== "select" ? "display: none" : ""}">
                                <variant-interpreter-landing .opencgaSession="${this.opencgaSession}"
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .config="${this._config}"
                                                             @selectClinicalAnalysis="${this.onClinicalAnalysis}">
                                </variant-interpreter-landing>
                            </div>
        
                            <div id="${this._prefix}qc" class="clinical-portal-content" 
                                        style="${this._config.tools[0].id !== "qc" ? "display: none" : ""}">
                                <variant-interpreter-qc .opencgaSession="${this.opencgaSession}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                        .config="${this._config}">
                                </variant-interpreter-qc>
                            </div>
                            
                            <div id="${this._prefix}interpretation" class="clinical-portal-content" 
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
                                <variant-interpreter-browser    .opencgaSession="${this.opencgaSession}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                .query="${this.interpretationSearchQuery}"
                                                                .cellbaseClient="${this.cellbaseClient}"
                                                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                </variant-interpreter-browser>
                            </div>
                            
                            <div id="${this._prefix}review" class="clinical-portal-content" style="${this._config.tools[0].id !== "review" ? "display: none" : ""}">
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
                            <div id="${this._prefix}report" class="clinical-portal-content col-md-10 col-md-offset-1" style="${this._config.tools[0].id !== "report" ? "display: none" : ""}">
                                <variant-interpreter-report .opencgaSession="${this.opencgaSession}">
                                </variant-interpreter-report>
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
