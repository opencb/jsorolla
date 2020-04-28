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
import PolymerUtils from "../../PolymerUtils.js";
import "./opencga-variant-interpretation-editor.js";
import "./opencga-variant-interpretation-grid.js";
import "./opencga-variant-interpretation-detail.js";
import "./opencga-variant-interpreter-genome-browser.js";
import "../opencga-variant-filter.js";
import "../../opencga/alignment/opencga-panel-transcript-view.js";
import "../../opencga/opencga-genome-browser.js";
import "../../clinical/opencga-clinical-analysis-view.js";
import "../../clinical/clinical-interpretation-view.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter-autocomplete-simple.js";
import {biotypes, tooltips} from "../../commons/opencga-variant-contants.js";

class VariantRdInterpreter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovi-" + UtilsNew.randomString(6);

        this.diseasePanelIds = [];
        this.hasClinicalAnalysis = false;

        this.interactive = true;
        this.filterClass = "col-md-2";
        this.gridClass = "col-md-10";

        this._collapsed = true;

        this.messageError = false;
        this.messageSuccess = false;

        this.samples = [];

        this.missingMembersMessage = "Missing clinical analysis";

        this.variant = null;
        this.reportedVariants = [];

        // this.lofe = ["missense_variant", "transcript_ablation", "splice_acceptor_variant", "splice_donor_variant", "stop_gained",
        //     "frameshift_variant", "stop_lost", "start_lost", "transcript_amplification", "inframe_insertion", "inframe_deletion"].join(", ");

        this.query = {};
        this.search = {};

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(_changedProperties) {
        // CellBase version
        this.cellbaseClient.getMeta("about").then(response => {
            if (UtilsNew.isNotUndefinedOrNull(response) && UtilsNew.isNotEmptyArray(response.response)) {
                if (UtilsNew.isNotUndefinedOrNull(response.response[0].result) && UtilsNew.isNotEmptyArray(response.response[0].result)) {
                    this.cellbaseVersion = response.response[0].result[0]["Version: "];
                }
            }
        });
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();

            /* TODO temp hack for autoselecting (comment prop as well)
            this.clinicalAnalysisId = "AN-3";
            this.clinicalAnalysisIdObserver()*/

        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }


    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};

        // // Check if Beacon hosts are configured
        // for (const detail of this._config.detail) {
        //     if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
        //         this.beaconConfig = {
        //             hosts: detail.hosts
        //         };
        //     }
        // }

        this.requestUpdate();
    }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = this.query;
            this.executedQuery = this.query;
        }
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
    */
    clinicalAnalysisIdObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {
            if (UtilsNew.isNotEmpty(this.clinicalAnalysisId)) {
                let _this = this;
                this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        _this.clinicalAnalysis = response.responses[0].results[0];
                        _this.requestUpdate();
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
                    });
            } else {
                this.requestUpdate();
            }
        }
    }

    onClinicalAnalysisEditor(e) {
        // console.warn("onClinicalAnalysisEditor commented")
        // console.warn(" e.detail.clinicalAnalysis", e.detail.clinicalAnalysis)
        // this.clinicalAnalysis = Object.assign({}, e.detail.clinicalAnalysis);
    }

    // interactiveObserver() {
    //     if (!this.interactive) {
    //         this.collapseFilter();
    //     } else {
    //         this.unCollapseFilter();
    //     }
    // }

    onCollapse() {
        if (this._collapsed) {
            this.unCollapseFilter();
        } else {
            this.collapseFilter();
        }
    }

    collapseFilter() {
        this.filterClass = "hidden";
        this.gridClass = "prioritization-center";
        this._collapsed = true;
    }

    unCollapseFilter() {
        if (this.interactive) {
            this.filterClass = "col-md-2";
            this.gridClass = "col-md-10";
            this._collapsed = false;
        }
    }

    setClinicalAnalysisId() {
        console.log($("#clinicalAnalysisIdText").val());
        this.clinicalAnalysisId = $("#clinicalAnalysisIdText").val();
    }

    unsetClinicalAnalysis() {
        this.clinicalAnalysisId = null;
        this.clinicalAnalysis = null;
    }

    /*
     * Set properties for LowCoverage tools and others
     */
    _setPropertiesForTools() {
        this.diseasePanelIds = (UtilsNew.isNotEmpty(this.preparedQuery.panel)) ? this.preparedQuery.panel.split(",") : [];
        if (UtilsNew.isNotUndefinedOrNull(this.preparedQuery.xref)) {
            const _geneIds = [];
            for (const geneId of this.preparedQuery.xref.split(",")) {
                if (!geneId.startsWith("ENS") && !geneId.startsWith("rs") && !geneId.startsWith("RCV")) {
                    _geneIds.push(geneId);
                }
            }
            this.geneIds = _geneIds;
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = {...e.detail.query};
        this.preparedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = {...e.detail.query};
        this.executedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onClear() {
        const _search = {};
        for (const hiddenField of this._config.activeFilters.hiddenFields) {
            if (UtilsNew.isNotUndefinedOrNull(this.query[hiddenField])) {
                _search[hiddenField] = this.query[hiddenField];
            }
        }

        // this.search = _search;
        this.query = {
            study: this.opencgaSession.study.fqn
        };
    }

    onSelectVariant(e) {
        this.variant = e.detail.variant;
        this.requestUpdate();
    }

    onCheckVariant(e) {
        this.checkedVariants = e.detail.variants;
        this._createInterpretation();
    }

    onSampleChange(e) {
        const _samples = e.detail.samples;
        this.samples =_samples.slice();
        this.dispatchEvent(new CustomEvent("samplechange", {detail: e.detail, bubbles: true, composed: true}));
        // this._initGenotypeSamples(this.samples);
    }

    onGenomeBrowserPositionChange(e) {
        $(".variant-interpretation-content").hide(); // hides all content divs
        $("#" + this._prefix + "GenomeBrowser").show(); // get the href and use it find which div to show

        // Show the active button
        $(".variant-interpretation-view-buttons").removeClass("active");
        // $(e.target).addClass("active");
        PolymerUtils.addClass(this._prefix + "GenomeBrowserButton", "active");

        this._genomeBrowserActive = true;
        this.region = e.detail.genomeBrowserPosition;
    }

    onChangeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        this._changeView(e.target.dataset.view);
    }

    _changeView(view) {
        if (UtilsNew.isNotUndefinedOrNull(view)) {
            // Hide all views and show the requested one
            PolymerUtils.hideByClass("variant-interpretation-content");
            PolymerUtils.show(this._prefix + view);

            // Show the active button
            // $(e.target).addClass("active");
            PolymerUtils.removeClass(".variant-interpretation-view-buttons", "active");
            PolymerUtils.addClass(this._prefix + view + "Button", "active");
        }

        // Make Genome Browser active
        // this._genomeBrowserActive = (e.target.dataset.view === "GenomeBrowser");
    }

    _backToSelectAnalysis(e) {
        this.dispatchEvent(new CustomEvent("backtoselectanalysis", {detail: {idTab: "PrioritizationButton"}}));
    }

    _goToReport(e) {
        this.dispatchEvent(new CustomEvent("gotoreport", {detail: {interpretation: this.interpretation}}));
    }

    triggerBeacon(e) {
        this.variantToBeacon = this.variant.id;
    }

    onViewInterpretation(e) {
        this.interpretationView = this._createInterpretation();
    }

    onSaveInterpretation(e, obj) {
        const id = PolymerUtils.getValue(this._prefix + "IDInterpretation");
        const description = PolymerUtils.getValue(this._prefix + "DescriptionInterpretation");
        const comment = PolymerUtils.getValue(this._prefix + "CommentInterpretation");

        if (UtilsNew.isNotEmpty(id)) {
            if (/\s/.test(id)) {
                this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                    detail: {
                        message: "ID must not contains blanks.",
                        type: UtilsNew.MESSAGE_ERROR
                    },
                    bubbles: true,
                    composed: true
                }));
            } else {
                this.interpretation = this._createInterpretation();
            }
        } else {
            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                detail: {
                    message: "ID must not be empty.",
                    type: UtilsNew.MESSAGE_ERROR
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    _createInterpretation() {
        try {
            const userId = this.opencgaSession.opencgaClient._config.userId;
            const interpretation = {};
            interpretation.id = this.clinicalAnalysis.id + "-" + this.clinicalAnalysis.interpretations.length + 1;
            interpretation.clinicalAnalysisId = this.clinicalAnalysis.id;
            // interpretation.description = PolymerUtils.getValue(this._prefix + "DescriptionInterpretation");
            interpretation.software = {
                name: "IVA",
                version: "1.0.1",
                repository: "https://github.com/opencb/iva",
                commit: "",
                website: "",
                params: {}
            };
            interpretation.analyst = {
                name: userId,
                email: "",
                company: ""
            };
            interpretation.dependencies = [
                {
                    name: "CellBase", repository: "https://github.com/opencb/cellbase", version: this.cellbaseVersion
                }
            ];
            interpretation.filters = this.query;
            //                interpretation.creationDate = Date();
            // interpretation.comments = [{
            //     author: userId,
            //     type: "comment",
            //     text: PolymerUtils.getValue(this._prefix + "CommentInterpretation"),
            //     date: moment(new Date(), "YYYYMMDDHHmmss").format('D MMM YY')
            // }];

            // Remove 'stateCheckbox' from the variant list. When we receive the list from the grid, we are getting
            // an additional field that should not be present in a reported variant.
            // let allCheckedVariants = [].concat(this.checkedVariants).concat(this.checkedCompHetVariants).concat(this.checkedDeNovoVariants);
            const reportedVariants = [];
            for (const i in this.checkedVariants) {
                const variant = Object.assign({}, this.checkedVariants[i]);
                delete variant["stateCheckBox"];
                reportedVariants.push(variant);
            }
            if (UtilsNew.isNotEmptyArray(this.checkedCompHetVariants)) {
                for (const i in this.checkedCompHetVariants) {
                    const variant = Object.assign({}, this.checkedCompHetVariants[i]);
                    delete variant["stateCheckBox"];
                    reportedVariants.push(variant);
                }
            }
            if (UtilsNew.isNotEmptyArray(this.checkedDeNovoVariants)) {
                for (const i in this.checkedDeNovoVariants) {
                    const variant = Object.assign({}, this.checkedDeNovoVariants[i]);
                    delete variant["stateCheckBox"];
                    reportedVariants.push(variant);
                }
            }

            interpretation.primaryFindings = reportedVariants;
            interpretation.attributes = {};
            // interpretation.creationDate = moment(new Date(), "YYYYMMDDHHmmss").format('D MMM YY');

            this.interpretation = interpretation;

            this.requestUpdate();
        } catch (err) {
            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                detail: {
                    message: err,
                    type: UtilsNew.MESSAGE_ERROR
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    onFilterChange(name, value) {
        this.clinicalAnalysisId = value;
    }

    getDefaultConfig() {
        return {
            title: "Variant Interpreter",
            showSaveInterpretation: true,
            showOtherTools: true,
            activeFilters: {
                alias: {
                    // Example:
                    // "region": "Region",
                    // "gene": "Gene",
                    // "genotype": "Sample Genotypes",
                },
                complexFields: ["genotype"],
                hiddenFields: ["study"]
            },
            genomeBrowser: {
                showTitle: false
            }
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession && !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        if (!this.clinicalAnalysis) {
            return html`
                <div class="container">
                    <div class="row">
                        <div class="clinical-analysis-id-wrapper col-md-6 col-md-offset-3 shadow">
                            <h3>Clinical Analysis</h3>
                            <div class="text-filter-wrapper">
                                <!--<input type="text" name="clinicalAnalysisText" id="clinicalAnalysisIdText" value="AN-3">-->
                                <select-field-filter-autocomplete-simple .fn="${true}" resource="clinical-analysis" .value="${"AN-3"}" .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("clinicalAnalysisId", e.detail.value)}"></select-field-filter-autocomplete-simple>
                                    
                            </div>
                            <button class="btn btn-default ripple" @click="${this.setClinicalAnalysisId}">Search</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <style>
                opencga-variant-intepretation {
                    font-size: 12px;
                }
                
                .prioritization-center {
                    margin: auto;
                    text-align: justify;
                    width: 95%;
                }
    
                .browser-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }
    
                .prioritization-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }
    
                .icon-padding {
                    padding-left: 4px;
                    padding-right: 8px;
                }
    
                .form-section-title {
                    padding: 5px 0px;
                    width: 95%;
                    border-bottom-width: 1px;
                    border-bottom-style: solid;
                    border-bottom-color: #ddd
                }
    
                .jso-label-title {
                    width: 15em !important;
                }
                
                #clinicalAnalysisIdText {
                    padding: 10px;
                }
                
                .clinical-analysis-id-wrapper {
                    padding: 20px;
                }
                
                .clinical-analysis-id-wrapper .text-filter-wrapper {
                    margin: 20px 0;
                }
            </style>
     
            <div class="page-title">
                <h2>
                    ${this.clinicalAnalysis ? html`
                        <i class="fa fa-filter" aria-hidden="true" style="padding-left: 10px;padding-right: 10px"></i>&nbsp;${this.config.title} - Case ${this.clinicalAnalysis.id}
                    ` : html`
                        <i class="fa fa-filter" aria-hidden="true"></i>&nbsp; ${this.config.title}
                    `}
                </h2>
            </div>

            <div class="row" style="padding: 5px 10px">

                <div class="col-md-2">
                    <opencga-variant-filter .opencgaSession="${this.opencgaSession}"
                                            .query="${this.query}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${this.populationFrequencies}"
                                            .consequenceTypes="${this.consequenceTypes}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}"
                                            @samplechange="${this.onSampleChange}"
                                            @inheritancemode="${this._onInheritanceMode}">
                    </opencga-variant-filter>
                </div> <!-- Close col-md-2 -->
                
                <div class="col-md-10">
                    <div class="btn-toolbar " role="toolbar" aria-label="..." style="padding-bottom: 20px">
                        <!-- Left buttons -->
                        <div class="btn-group" role="group" aria-label="..." >
                            <button id="${this._prefix}InteractiveButton" type="button" class="btn btn-success variant-interpretation-view-buttons active ripple" data-view="Interactive" @click="${this.onChangeView}">
                                <i class="fa fa-filter icon-padding" aria-hidden="true" data-view="Interactive" @click="${this.onChangeView}"></i>Table Result
                            </button>
                             <button id="${this._prefix}SummaryReportButton" type="button" class="btn btn-success variant-interpretation-view-buttons ripple" data-view="SummaryReport" @click="${this.onChangeView}">
                                <i class="fas fa-random icon-padding" aria-hidden="true" data-view="SummaryReport" @click="${this.onChangeView}"></i>Summary Report
                            </button>
                        </div>
    
                        ${this._config.showOtherTools ? html`
                            <div class="btn-group">
                                <button type="button" class="btn btn-success dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fa fa-wrench" aria-hidden="true" style="padding-right: 5px"></i> Other Tools <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <a id="${this._prefix}LowCoverageButton" data-view="LowCoverage" @click="${this.onChangeView}" style="cursor: pointer">
                                            <i class="fa fa-water icon-padding" aria-hidden="true" data-view="LowCoverage" @click="${this.onChangeView}"></i>Low Coverage Regions
                                        </a>
                                    </li>
                                    <li>
                                        <a id="${this._prefix}GenomeBrowserButton" data-view="GenomeBrowser" @click="${this.onChangeView}" data-view="GenomeBrowser" style="cursor: pointer">
                                            <i class="fa fa-stream icon-padding" aria-hidden="true" data-view="GenomeBrowser" @click="${this.onChangeView}"></i>Genome Browser (Beta)
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        ` : null}
    
                        <!-- Right buttons -->
                        <div class="btn-group" role="group" aria-label="..." style="float: right">
                            <button id="${this._prefix}ClinicalAnalysisButton" type="button" class="btn btn-primary variant-interpretation-view-buttons" data-view="ClinicalAnalysis" @click="${this.onChangeView}">
                                <i class="fa fa-user-md icon-padding" aria-hidden="true" data-view="ClinicalAnalysis" @click="${this.onChangeView}"></i>Case Summary
                            </button>
                            <button id="${this._prefix}InterpretationEditorButton" type="button" class="btn btn-primary variant-interpretation-view-buttons"
                                        data-view="InterpretationEditor" @click="${this.onChangeView}" .disabled="${this._config.disableSaveInterpretation}">
                                <i class="fa fa-save icon-padding" aria-hidden="true" data-view="InterpretationEditor" @click="${this.onChangeView}"></i>Review and Save
                            </button>
                            <button class="btn btn-primary variant-interpretation-view-buttons" @click="${this.unsetClinicalAnalysis}"> <i class="fas fa-window-close"></i> Close Case</button>
                        </div>
                    </div>  <!-- Close toolbar -->
    
                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
                            <opencga-active-filters .opencgaSession="${this.opencgaSession}"
                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                        .defaultStudy="${this.opencgaSession.study.id}"
                                                        .query="${this.preparedQuery}"
                                                        .refresh="${this.executedQuery}"
                                                        .filters="${this._config.filter.examples}"
                                                        .filterBioformat="VARIANT"
                                                        .alias="${this._config.activeFilterAlias}"
                                                        .genotypeSamples="${this.genotypeSamples}"
                                                        .modeInheritance="${this.modeInheritance}"
                                                        .config="${this._config.activeFilters}"
                                                        @activeFilterChange="${this.onActiveFilterChange}"
                                                        @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>
                            
                        <!-- SEARCH TABLE RESULT -->
                        <div class="main-view" style="padding-top: 5px">
                            <div id="${this._prefix}Interactive" class="variant-interpretation-content">
                                <opencga-variant-interpretation-grid .opencgaSession="${this.opencgaSession}"
                                                             .query="${this.executedQuery}"
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .consequenceTypes="${this.consequenceTypes}"
                                                             .populationFrequencies="${this.populationFrequencies}"
                                                             .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                             .config="${this._config.grid}"
                                                             @selected="${this.onSelectedGene}"
                                                             @selectvariant="${this.onSelectVariant}"
                                                             @checkvariant="${this.onCheckVariant}"
                                                             @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                                </opencga-variant-interpretation-grid>
                                                                <!-- Bottom tabs with detailed variant information -->
                                <opencga-variant-interpretation-detail .opencgaSession="${this.opencgaSession}"
                                                                       .cellbaseClient="${this.cellbaseClient}"
                                                                       .variant="${this.variant}"
                                                                       .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                       .consequenceTypes="${this.consequenceTypes}"
                                                                       .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                       .config=${this._config.detail}>
                                </opencga-variant-interpretation-detail>
                            </div>
        
                            <!-- PANEL LOW COVERAGE VIEW -->
                            <div id="${this._prefix}LowCoverage" class="variant-interpretation-content" style="display: none">
                                <opencga-panel-transcript-view .opencgaSession="${this.opencgaSession}"
                                                               .cellbaseClient="${this.cellbaseClient}"
                                                               .clinicalAnalysis="${this.clinicalAnalysis}"
                                                               .geneIds="${this.geneIds}"
                                                               .panelIds="${this.diseasePanelIds}">
                                </opencga-panel-transcript-view>
                            </div>
        
                            <!-- GENOME BROWSER VIEW -->
                            <div id="${this._prefix}GenomeBrowser" class="variant-interpretation-content" style="display: none">
                                <opencga-variant-interpreter-genome-browser .opencgaSession="${this.opencgaSession}"
                                                                            .cellbaseClient="${this.cellbaseClient}"
                                                                            .samples="${this.samples}"
                                                                            .query="${this.query}"
                                                                            .search="${this.search}"
                                                                            .region="${this.search.region}"
                                                                            .geneIds="${this.geneIds}"
                                                                            .panelIds="${this.diseasePanelIds}"
                                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                            .active="${this._genomeBrowserActive}"
                                                                            .fullScreen="${this.fullScreen}"
                                                                            .config="${this._config.genomeBrowser}">
                                </opencga-variant-interpreter-genome-browser>
                            </div>
        
        
                            <!-- CLINICAL ANALYSIS VIEW -->
                            <div id="${this._prefix}ClinicalAnalysis" class="variant-interpretation-content" style="padding: 0px 20px;display: none">
                                <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                style="font-size: 12px"
                                                                .config="${this._config}">
                                </opencga-clinical-analysis-view>
                            </div>
        
                            <!-- CREATE CLINICAL ANALYSIS TAB -->
                            <div id="${this._prefix}ClinicalAnalysisEditor" class="variant-interpretation-content" style="display: none">
                                <div style="padding: 10px 20px">
                                    <opencga-clinical-analysis-editor .opencgaSession="${this.opencgaSession}"
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                        .config="${this._config.clinicalAnalysisBrowser}"
                                                                        @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                                    </opencga-clinical-analysis-editor>
                                </div>
                            </div>
        
                            <!-- SAVE INTERPRETATION TAB -->
                            <div id="${this._prefix}InterpretationEditor" class="variant-interpretation-content" style="display: none">
                                <div style="padding: 10px 20px">
                                    <opencga-variant-interpretation-editor .opencgaSession="${this.opencgaSession}"
                                                                           .cellbaseClient="${this.cellbaseClient}"
                                                                           .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                           .interpretation="${this.interpretation}"
                                                                           .populationFrequencies="${this.populationFrequencies}"
                                                                           .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                           .consequenceTypes="${this.consequenceTypes}"
                                                                           .config="${this._config}"
                                                                           @gene="${this.geneSelected}"
                                                                           @samplechange="${this.onSampleChange}"
                                                                           style="font-size: 12px" >
                                    </opencga-variant-interpretation-editor>
                                </div>
                            </div>
                        </div>
                    </div> <!-- Close MainContent -->
                </div> <!-- Close col-md-10 -->
            </div> <!-- Close row -->
        `;
    }

}

customElements.define("variant-rd-interpreter", VariantRdInterpreter);
