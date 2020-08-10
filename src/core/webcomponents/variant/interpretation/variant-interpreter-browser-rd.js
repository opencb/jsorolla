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
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";


class VariantInterpreterBrowserRd extends LitElement {

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
        this._prefix = "virdb-" + UtilsNew.randomString(6);

        this.diseasePanelIds = [];

        this.interactive = true;
        // this.filterClass = "col-md-2";
        // this.gridClass = "col-md-10";

        this._collapsed = true;

        this.messageError = false;
        this.messageSuccess = false;

        this.samples = [];

        this.variant = null;
        this.reportedVariants = [];

        this.query = {};
        this.search = {};

        this.activeFilterFilters = [];

        this.predefinedFilter = false; // flag that hides the warning message in active-filter for predefined samples value

        this.notSavedVariantIds = 0;
        this.removedVariantIds = 0;
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this._config = {...this.getDefaultConfig(), ...this.config};
        //     this.requestUpdate();
        // }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        // if (this.query) {
        //     this.preparedQuery = this.query;
        //     this.executedQuery = this.query;
        // }
        if (this.opencgaSession) {
            if (this.query) {
                this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            } else {
                this.preparedQuery = {study: this.opencgaSession.study.fqn, sample: this.predefinedFilter};
                this.executedQuery = {study: this.opencgaSession.study.fqn, sample: this.predefinedFilter};
            }
        }
        this.requestUpdate();
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.clinicalAnalysisObserver();
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        // If sample is not defined then we must set the default genotypes
        if (!this.query?.sample) {
            if (this.clinicalAnalysis.type.toUpperCase() === "SINGLE") {
                if (this.clinicalAnalysis.proband?.samples) {
                    if (!this.query) {
                        this.query = {};
                    }
                    this.query.sample = this.clinicalAnalysis.proband.samples[0].id + ":0/1,1/1";
                }
            }

            if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
                let sampleGenotypes = [];
                for (let member of this.clinicalAnalysis.family.members) {
                    if (member.samples && member.samples.length > 0) {
                        sampleGenotypes.push(member.samples[0].id + ":0/1,1/1");
                    }
                }
                if (!this.query) {
                    this.query = {};
                }
                this.query.sample = sampleGenotypes.join(";");
                // this.requestUpdate();
            }
        }

        // Check if QC filters exist and add them to active filter
        let sampleQc = ClinicalAnalysisUtils.getProbandSampleQc(this.clinicalAnalysis);
        let _activeFilterFilters = [];
        if (sampleQc?.metrics?.length > 0) {
            let variantStats = sampleQc.metrics[0].variantStats;
            if (variantStats && variantStats.length > 0) {
                _activeFilterFilters = variantStats.map(variantStat => ({id: variantStat.id, query: variantStat.query}));
            }
        }
        // If WC variant stats filters are found we add them to active filters, we do not replace them.
        if (_activeFilterFilters.length > 0) {
            // Concat QC filters to examples
            if (this._config?.filter?.examples && this._config.filter.examples.length > 0) {
                _activeFilterFilters.push({separator: true});
                _activeFilterFilters.push(...this._config.filter.examples);
            }
            this.activeFilterFilters = _activeFilterFilters;
        } else {
            this.activeFilterFilters = this._config.filter.examples;
        }

        if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            this.savedVariants = this.clinicalAnalysis?.interpretation?.primaryFindings?.map(v => v.id);
        }
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;

        this.requestUpdate();
    }

    onCheckVariant(e) {
        // let checkedVariants = e.detail.rows;
        // for (let checkedVariant of checkedVariants) {
        //     if (!this.clinicalAnalysis.interpretation.primaryFindings.some(e => e.id === checkedVariant.id)) {
        //         this.notSavedvVriants.push(checkedVariant);
        //     }
        // }

        if (!this.clinicalAnalysis) {
            console.error("It is not possible have this error");
            return;
        }

        this.clinicalAnalysis.modificationDate = e.detail.timestamp;
        this.clinicalAnalysis.interpretation = {
            attributes: {
                modificationDate: e.detail.timestamp
            }
        };

        this.clinicalAnalysis.interpretation.primaryFindings = Array.from(e.detail.rows);

        this.currentSelection = e.detail?.rows?.map(v => v.id) ?? [];

        //the following counters keep track of the current variant selection compared to the one saved on the server
        this.notSavedVariantIds = this.currentSelection.filter(v => !~this.savedVariants.indexOf(v)).length;
        this.removedVariantIds = this.savedVariants.filter(v => !~this.currentSelection.indexOf(v)).length;
        this.requestUpdate();

        // let _interpretation = {primaryFindings: [], ...this.clinicalAnalysis.interpretation};
        // _interpretation.clinicalAnalysisId = this.clinicalAnalysis.id;
        // _interpretation.methods = [{name: "IVA"}];
        // _interpretation.primaryFindings = Array.from(e.detail.rows);
        //
        // this.clinicalAnalysis.interpretation = _interpretation;
        //
        // this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
        //     detail: {
        //         clinicalAnalysis: this.clinicalAnalysis
        //     },
        //     bubbles: true,
        //     composed: true
        // }));
    }

    onViewVariants(e) {
        let variantIds = this.clinicalAnalysis.interpretation.primaryFindings.map(e => e.id);
        this.preparedQuery = {...this.preparedQuery, id: variantIds.join(",")};
        this.executedQuery = {...this.executedQuery, id: variantIds.join(",")};
        this.requestUpdate();
    }

    onResetVariants(e) {
        let alreadySaved = this.clinicalAnalysis.interpretation.primaryFindings.filter(e => e.attributes.creationDate);
        // debugger
        this.clinicalAnalysis.interpretation.primaryFindings = alreadySaved;
        console.error("primaryFindings", this.clinicalAnalysis.interpretation.primaryFindings);
        this.clinicalAnalysis = {...this.clinicalAnalysis};
        this.requestUpdate();
    }

    onSaveVariants(e) {
        let f = clinicalAnalysis => this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                clinicalAnalysis: clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
        ClinicalAnalysisUtils.updateInterpretatoin(this.clinicalAnalysis, this.opencgaSession, f);

        // if (!this.clinicalAnalysis) {
        //     console.error("It is not possible have this error");
        //     return;
        // }
        //
        // let _interpretation = {
        //     primaryFindings: [],
        //     ...this.clinicalAnalysis.interpretation,
        //     clinicalAnalysisId: this.clinicalAnalysis.id,
        //     methods: [{name: "IVA"}]
        // };
        //
        // _interpretation.primaryFindings = JSON.parse(JSON.stringify(this.clinicalAnalysis.interpretation.primaryFindings));
        // for (let variant of _interpretation.primaryFindings) {
        //     // delete variant.checkbox;
        //     if (!variant.attributes.creationDate) {
        //         variant.attributes.creationDate = new Date().getTime();
        //     }
        // }
        // this.clinicalAnalysis.interpretation = _interpretation;
        // this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation,
        //     {
        //         study: this.opencgaSession.study.fqn,
        //         primaryFindingsAction: "SET",
        //         secondaryFindingsAction: "SET",
        //     })
        //     .then(restResponse => {
        //         Swal.fire(
        //             "Interpretation Saved",
        //             "Primary findings have been saved.",
        //             "success"
        //         );
        //         this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
        //             detail: {
        //                 clinicalAnalysis: this.clinicalAnalysis
        //             },
        //             bubbles: true,
        //             composed: true
        //         }));
        //     })
        //     .catch(restResponse => {
        //         console.error(restResponse);
        //         //optional chaining is to make sure the response is a restResponse instance
        //         const msg = restResponse?.getResultEvents?.("ERROR")?.map(event => event.message).join("<br>") ?? "Server Error";
        //         Swal.fire({
        //             title: "Error",
        //             icon: "error",
        //             html: msg
        //         });
        //     });
    }

    onSampleChange(e) {
        const _samples = e.detail.samples;
        this.samples = _samples.slice();
        this.dispatchEvent(new CustomEvent("samplechange", {detail: e.detail, bubbles: true, composed: true}));
        // this._initGenotypeSamples(this.samples);
    }

    onChangeView(e) {
        e.preventDefault();
        const view = e.target.dataset.view;
        if (view) {
            // Hide all views and show the requested one
            PolymerUtils.hideByClass("variant-interpretation-content");
            PolymerUtils.show(this._prefix + view);

            // Show the active button
            // $(e.target).addClass("active");
            PolymerUtils.removeClass(".variant-interpretation-view-buttons", "active");
            PolymerUtils.addClass(this._prefix + view + "Button", "active");
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        // TODO quick fix to avoid warning message on sample
        if (!this.predefinedFilter) {
            this.executedQuery = e.detail.query;
            this.predefinedFilter = e.detail.query;
        }
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        // this.executedQuery = {...this.preparedQuery};
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }


    onActiveFilterChange(e) {
        this.query = {...this.predefinedFilter, ...e.detail}; // we add this.predefinedFilter in case sample field is not present
        this.preparedQuery = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn, ...this.predefinedFilter};
        this.preparedQuery = {...this.query};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "RD Case Interpreter",
            showSaveInterpretation: true,
            showOtherTools: true,
            showTitle: false,
            searchButtonText: "Search",
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types",
                    },
                    complexFields: ["sample", "genotype"],
                    hiddenFields: [],
                    lockedFields: [{id: "sample"}]
                },
                sections: [
                    {
                        title: "Sample",
                        collapsed: false,
                        fields: [
                            {
                                id: "sample",
                                title: "Sample Genotype",
                                tooltip: tooltips.sample
                            },
                            {
                                id: "file-quality",
                                title: "Quality Filters",
                                tooltip: "VCF file based FILTER and QUAL filters",
                                showDepth: application.appConfig === "opencb"
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                tooltip: tooltips.cohort,
                                // cohorts: this.cohorts
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        fields: [
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: tooltips.feature
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        fields: [
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                            // {
                            //     id: "consequenceTypeSelect",
                            //     title: "Select SO terms",
                            //     tooltip: tooltips.consequenceTypeSelect
                            // },
                        ]
                    },
                    {
                        title: "Population Frequency",
                        collapsed: true,
                        fields: [
                            {
                                id: "populationFrequency",
                                title: "Select Population Frequency",
                                tooltip: tooltips.populationFrequencies,
                                showSetAll: false
                            }
                        ]
                    },
                    {
                        title: "Phenotype-Disease",
                        collapsed: true,
                        fields: [

                            {
                                id: "go",
                                title: "GO Accessions (max. 100 terms)",
                                tooltip: tooltips.go
                            },
                            {
                                id: "hpo",
                                title: "HPO Accessions",
                                tooltip: tooltips.hpo
                            },
                            {
                                id: "clinvar",
                                title: "ClinVar Accessions",
                                tooltip: tooltips.clinvar
                            },
                        ]
                    },
                    {
                        title: "Deleteriousness",
                        collapsed: true,
                        fields: [
                            {
                                id: "proteinSubstitutionScore",
                                title: "Protein Substitution Score",
                                tooltip: tooltips.proteinSubstitutionScore
                            },
                            {
                                id: "cadd",
                                title: "CADD",
                                tooltip: tooltips.cadd
                            }
                        ]
                    },
                    {
                        title: "Conservation",
                        collapsed: true,
                        fields: [
                            {
                                id: "conservation",
                                title: "Conservation Score",
                                tooltip: tooltips.conservation
                            }
                        ]
                    },
                ],
                examples: [
                    {
                        id: "Example BRCA2",
                        query: {
                            gene: "BRCA2",
                            ct: "missense_variant"
                        }
                    },
                    {
                        id: "Full Example",
                        query: {
                            "xref": "BRCA1,TP53",
                            "biotype": "protein_coding",
                            "type": "SNV,INDEL",
                            "ct": "lof",
                            "populationFrequencyAlt": "GNOMAD_GENOMES:ALL<0.1",
                            "protein_substitution": "sift>5,polyphen>4",
                            "conservation": "phylop>1;phastCons>2;gerp<=3"
                        }
                    }
                ],
                result: {
                    grid: {
                        pagination: true,
                        pageSize: 10,
                        pageList: [10, 25, 50],
                        showExport: false,
                        detailView: true,
                        showReview: false,
                        showActions: false,
                        showSelectCheckbox: true,
                        multiSelection: false,
                        nucleotideGenotype: true,
                        alleleStringLengthMax: 10,

                        header: {
                            horizontalAlign: "center",
                            verticalAlign: "bottom"
                        },

                        quality: {
                            qual: 30,
                            dp: 20
                        },
                        // populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
                    }
                },
                detail: {
                    title: "Selected Variant",
                    views: [
                        {
                            id: "annotationSummary",
                            title: "Summary",
                            active: true
                        },
                        {
                            id: "annotationConsType",
                            title: "Consequence Type",
                        },
                        {
                            id: "annotationPropFreq",
                            title: "Population Frequencies"
                        },
                        {
                            id: "annotationClinical",
                            title: "Clinical"
                        },
                        {
                            id: "fileMetrics",
                            title: "File Metrics"
                        },
                        {
                            id: "cohortStats",
                            title: "Cohort Stats",
                            cohorts: this.cohorts
                        },
                        {
                            id: "beacon",
                            title: "Beacon"
                        }
                    ]
                }
            },
            aggregation: {
            }
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
                
                .form-section-title {
                    padding: 5px 0px;
                    width: 95%;
                    border-bottom-width: 1px;
                    border-bottom-style: solid;
                    border-bottom-color: #ddd
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

            ${this._config.showTitle ? html`
                <tool-header title="${this.clinicalAnalysis ? `${this._config.title} (${this.clinicalAnalysis.id})` : this._config.title}" icon="${this._config.icon}"></tool-header>
            ` : null}

            <div class="row">
                <div class="col-md-2">
                    <opencga-variant-filter .opencgaSession="${this.opencgaSession}"
                                            .query="${this.query}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${populationFrequencies}"
                                            .consequenceTypes="${consequenceTypes}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}"
                                            @samplechange="${this.onSampleChange}">
                    </opencga-variant-filter>
                </div> <!-- Close col-md-2 -->
                
                <div class="col-md-10">
                    <div>
                        <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin-bottom: 20px">
                            <div class="pull-right" role="group">
                                <button type="button" class="btn btn-default ripple" @click="${this.onViewVariants}" title="This shows saved variants">
                                    <i class="fas fa-eye icon-padding" aria-hidden="true"></i> View
                                </button>
                                <button type="button" class="btn btn-default ripple" @click="${this.onResetVariants}" title="This removes not saved variants">
                                    <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Reset
                                </button>
                                <button type="button" class="btn btn-default ripple" @click="${this.onSaveVariants}" title="Save variants in the server">
                                    <i class="fas fa-save icon-padding" aria-hidden="true"></i> Save
                                </button>
                            </div>
                        </div>
                        ${this.notSavedVariantIds || this.removedVariantIds 
                            ? html`
                                <div class="alert alert-warning" role="alert" id="${this._prefix}SaveWarning">
                                    <span><strong>Warning!</strong></span>&nbsp;&nbsp;Primary findings have changed:
                                    ${this.notSavedVariantIds ? html`${this.notSavedVariantIds} variant${this.notSavedVariantIds > 1 ? "s have" : " has"} been added` : null}${this.removedVariantIds ? html`${this.notSavedVariantIds ? " and " : null}${this.removedVariantIds} variant${this.removedVariantIds > 1 ? "s have" : " has"} been removed` : null}. Please click on <strong> Save </strong> to make the results persistent.
                                </div>` 
                            : null
                        }
                    </div>
                    
                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
                            <opencga-active-filters resource="VARIANT"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                    .defaultStudy="${this.opencgaSession.study.fqn}"
                                                    .query="${this.preparedQuery}"
                                                    .refresh="${this.executedQuery}"
                                                    .filters="${this.activeFilterFilters}"
                                                    .alias="${this._config.activeFilterAlias}"
                                                    .genotypeSamples="${this.genotypeSamples}"
                                                    .modeInheritance="${this.modeInheritance}"
                                                    .config="${this._config.filter.activeFilters}"
                                                    @activeFilterChange="${this.onActiveFilterChange}"
                                                    @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>
                            
                        <!-- SEARCH TABLE RESULT -->
                        <div class="main-view">
                            <div id="${this._prefix}Interactive" class="variant-interpretation-content">
                                <variant-interpreter-grid .opencgaSession="${this.opencgaSession}"
                                                          .clinicalAnalysis="${this.clinicalAnalysis}"
                                                          .query="${this.executedQuery}"
                                                          .consequenceTypes="${consequenceTypes}"
                                                          .populationFrequencies="${populationFrequencies}"
                                                          .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                          .config="${this._config.filter.result.grid}"
                                                          @selected="${this.onSelectedGene}"
                                                          @selectrow="${this.onSelectVariant}"
                                                          @checkrow="${this.onCheckVariant}">
                                </variant-interpreter-grid>
                                
                                <!-- Bottom tabs with detailed variant information -->
                                <variant-interpreter-detail .opencgaSession="${this.opencgaSession}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .variant="${this.variant}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .consequenceTypes="${consequenceTypes}"
                                                            .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                            .config=${this._config.filter.detail}>
                                </variant-interpreter-detail>
                            </div>
                        </div>
                    </div> <!-- Close MainContent -->
                </div> <!-- Close col-md-10 -->
            </div> <!-- Close row -->
        `;
    }
}

customElements.define("variant-interpreter-browser-rd", VariantInterpreterBrowserRd);
