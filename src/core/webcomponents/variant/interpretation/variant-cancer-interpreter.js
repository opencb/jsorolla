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

import {LitElement, html, css} from "/web_modules/lit-element.js";
import Utils from "../../../utils.js";
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./opencga-variant-interpretation-editor.js";
import "./variant-cancer-interpreter-grid.js";
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


class VariantCancerInterpreter extends LitElement {

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
            // diseasePanelId: {
            //     type: String,
            //     observer: "diseasePanelIdObserver"
            // },
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
        this._prefix = "vci-" + Utils.randomString(6);

        this.diseasePanelIds = [];
        this.hasClinicalAnalysis = false;

        this.checkProjects = false;
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

        this.counters = {
            rv: 0,
            ch: 0,
            dn: 0,
            total: 0
        };
        this.counterTitles = {
            rv: "",
            ch: "",
            dn: "",
            total: ""
        };

        // this.lofe = ["missense_variant", "transcript_ablation", "splice_acceptor_variant", "splice_donor_variant", "stop_gained",
        //     "frameshift_variant", "stop_lost", "start_lost", "transcript_amplification", "inframe_insertion", "inframe_deletion"].join(", ");

        this.query = {};
        this.search = {};

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        // if (!this.interactive) {
        //     this.collapseFilter();
        // }

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
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }


    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Check if Beacon hosts are configured
        for (const detail of this._config.filter.detail.views) {
            if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
                this.beaconConfig = {
                    hosts: detail.hosts
                };
            }
        }

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }
        this.requestUpdate();
    }

    queryObserver() {
        // debugger
        // // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        // if (UtilsNew.isNotUndefinedOrNull(this.query)) {
        //     this.preparedQuery = this.query;
        //     this.executedQuery = this.query;
        // }
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
    */
    clinicalAnalysisIdObserver() {

        // TODO tempfix check for clinicalAnalysisId undefined
        // this.clinicalAnalysisId = "AN-3"; return;

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {
            if (UtilsNew.isNotEmpty(this.clinicalAnalysisId)) {
                const _this = this;
                this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        // This triggers the call to clinicalAnalysisObserver function below
                        console.log("response", response);
                        _this.clinicalAnalysis = response.responses[0].results[0];

                        console.log("clinicalAnalysisIdObserver _this.clinicalAnalysis", _this.clinicalAnalysis);
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

    clinicalAnalysisObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
            this._changeView("Interactive");
            // let _individuals = [];
            // let _samples = [];
            // let _sampleIds = [];
            // let _sampleDefaultGenotypes = [];
            //
            // this._checkFullFamily();
            //
            // if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family) && UtilsNew.isNotEmptyArray(this.clinicalAnalysis.family.members)) {
            //     _individuals = this.clinicalAnalysis.family.members;
            // } else {
            //     if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.proband)) {
            //         _individuals = [this.clinicalAnalysis.proband];
            //     }
            // }
            //
            // if (UtilsNew.isNotEmptyArray(_individuals)) {
            //     _individuals.forEach(individual => {
            //         if (UtilsNew.isNotEmptyArray(individual.samples)) {
            //             individual.samples.map(sample => {
            //                 _samples.push(sample);
            //                 _sampleIds.push(sample.id);
            //                 if (this.clinicalAnalysis.proband.id === individual.id) {
            //                     _sampleDefaultGenotypes.push(sample.id + ":0/1,1/1");
            //                 } else {
            //                     _sampleDefaultGenotypes.push(sample.id + ":0/0,0/1,1/1");
            //                     // _sampleIds.push(sample.id + ":0/1,1/1");
            //                 }
            //             });
            //         }
            //     });
            //
            //     if (UtilsNew.isNotEmptyArray(_sampleDefaultGenotypes)) {
            //         if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            //             this.query = Object.assign({}, this.query, {
            //                 genotype: _sampleDefaultGenotypes.join(";"),
            //                 study: this.opencgaSession.study.fqn
            //             });
            //         } else {
            //             this.query = {
            //                 genotype: _sampleDefaultGenotypes.join(";"),
            //                 study: this.opencgaSession.study.fqn
            //             };
            //         }
            //
            //         // Notify to all listeners of the new samples
            //         this.dispatchEvent(new CustomEvent('samplechange', {detail: {samples: this.samples}}));
            //     }
            // } else {
            //     console.warn("A Clinical Analysis with no proband or family has been passed");
            // }
            //
            // this._individuals = _individuals;
            // this._samples = _samples;
            // this._sampleIds = _sampleIds;

            this.hasClinicalAnalysis = true;
            this.requestUpdate();
        } else {
            this.missingMembersMessage = "Missing clinical analysis";
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

    /**
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
        this.variant = e.detail.row;

        this.requestUpdate();
    }

    onCheckVariant(e) {
        this.counters.rv = e.detail.rows.length;
        this.counterTitles.rv = (e.detail.rows.length > 0) ? "(" + e.detail.rows.length + ")" : "";
        this.counters.total = this.counters.rv + this.counters.ch + this.counters.dn;
        this.counterTitles.total = (this.counters.total > 0) ? "(" + this.counters.total + ")" : "";
        this.counters = Object.assign({}, this.counters);
        this.counterTitles = Object.assign({}, this.counterTitles);

        this.checkedVariants = e.detail.rows;
        this._createInterpretation();
    }


    /*
            * Compound Heterozygous Analysis functions
            */
    onCheckCompHetVariant(e) {
        this.counters.ch = e.detail.variants.length;
        this.counterTitles.ch = (e.detail.variants.length > 0) ? "(" + e.detail.variants.length + ")" : "";
        this.counters.total = this.counters.rv + this.counters.ch + this.counters.dn;
        this.counterTitles.total = (this.counters.total > 0) ? "(" + this.counters.total + ")" : "";
        this.counters = Object.assign({}, this.counters);
        this.counterTitles = Object.assign({}, this.counterTitles);

        this.checkedCompHetVariants = e.detail.variants;
        this._createInterpretation();
    }


    /*
             * De Novo Analysis functions
             */
    onCheckDeNovoVariant(e) {
        this.counters.dn = e.detail.variants.length;
        this.counterTitles.dn = (e.detail.variants.length > 0) ? "(" + e.detail.variants.length + ")" : "";
        this.counters.total = this.counters.rv + this.counters.ch + this.counters.dn;
        this.counterTitles.total = (this.counters.total > 0) ? "(" + this.counters.total + ")" : "";
        this.counters = Object.assign({}, this.counters);
        this.counterTitles = Object.assign({}, this.counterTitles);

        this.checkedDeNovoVariants = e.detail.variants;
        this._createInterpretation();
    }


    // _changeBottomTab(e) {
    //     let _activeTabs = {}
    //     for (let detail of this.config.detail) {
    //         _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
    //     }
    //     this.set("detailActiveTabs", _activeTabs);
    // }

    // checkVariant(variant) {
    //     return variant.split(':').length > 2;
    // }


    onSampleChange(e) {
        const _samples = e.detail.samples;
        // this.set("samples", _samples.slice());
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

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        // console.log("onVariantFilterChange preparedQuery", this.preparedQuery)
        this.preparedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = {...this.preparedQuery};
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        // console.log("onActiveFilterChange", e.detail)
        this.query = {...e.detail};
        this.preparedQuery = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.requestUpdate();
    }


    getDefaultConfig() {
        return {
            title: "Variant Cancer Interpreter",
            icon: "fas fa-search",
            active: false,
            filter: {
                title: "Filter",
                searchButtonText: "Run",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types",
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Study and Cohorts",
                        collapsed: false,
                        fields: [
                            {
                                id: "study",
                                title: "Studies Filter",
                                tooltip: tooltips.study
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                cohorts: this.cohorts
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
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
                                tooltip: tooltips.type
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        fields: [
                            // {
                            //     id: "consequenceType",
                            //     title: "Select SO terms",
                            //     tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            // },
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            },
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
                                showSetAll: true
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
                            {
                                id: "fullTextSearch",
                                title: "Full-text search on HPO, ClinVar, protein domains or keywords. Some OMIM and Orphanet IDs are also supported",
                                tooltip: tooltips.fullTextSearch
                            }
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
                        name: "Example BRCA2",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            conservation: "phylop<0.001"
                        }
                    },
                    {
                        name: "Example OR11",
                        query: {
                            gene: "OR11H1",
                            conservation: "phylop<=0.001"
                        }
                    },
                    {
                        name: "Full Example",
                        query: {
                            "region": "1,2,3,4,5",
                            "studies": "corpasome",
                            "xref": "BRCA1,TP53",
                            // "panel": "Albinism_or_congenital_nystagmus-PanelAppId-511,Amyloidosis-PanelAppId-502",
                            "biotype": "protein_coding",
                            "type": "INDEL",
                            "ct": "lof",
                            "populationFrequencyAlt": "1kG_phase3:ALL<0.1,GNOMAD_GENOMES:ALL<0.1",
                            "protein_substitution": "sift>5,polyphen>4",
                            // "functionalScore": "cadd_raw>2,cadd_scaled<4",
                            "conservation": "phylop>1;phastCons>2;gerp<=3"
                        }
                    }
                ],
                result: {
                    grid: {}
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
                            // Uncomment and edit Beacon hosts to change default hosts
                            // hosts: [
                            //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                            //     "lovd", "hgmd", "icgc", "sahgp"
                            // ]
                        }
                    ]
                }
            },
            aggregation: {
                title: "Aggregation",
                default: ["chromosome", "type"],
                sections: [
                    {
                        name: "General",
                        fields: [
                            {
                                id: "chromosome", name: "Chromosome", type: "string"
                            },
                            {
                                id: "studies", name: "Studiy", type: "string"
                            },
                            {
                                id: "type", name: "Variant Type", type: "category", allowedValues: ["SNV", "INDEL", "CNV"]
                            },
                            {
                                id: "genes", name: "Gene", type: "string"
                            },
                            {
                                id: "biotypes", name: "Biotype", type: "string"
                            },
                            {
                                id: "soAcc", name: "Consequence Type", type: "string"
                            }
                        ]
                    },
                    {
                        name: "Conservation & Deleteriousness",
                        fields: [
                            {
                                id: "phastCons", name: "PhastCons", defaultValue: "[0..1]:0.1", type: "number"
                            },
                            {
                                id: "phylop", name: "PhyloP", defaultValue: "", type: "number"
                            },
                            {
                                id: "gerp", name: "Gerp", defaultValue: "[-12.3..6.17]:2", type: "number"
                            },
                            {
                                id: "sift", name: "Sift", defaultValue: "[0..1]:0.1", type: "number"
                            },
                            {
                                id: "polyphen", name: "Polyphen", defaultValue: "[0..1]:0.1", type: "number"
                            }
                        ]
                    },
                    {
                        name: "Population Frequency",
                        fields: [
                            ...this.populationFrequencies.studies.map(study =>
                                study.populations.map(population => (
                                        {
                                            id: `popFreq__${study.id}__${population.id}`,
                                            // value: `popFreq__${study.id}__${population.id}`,
                                            name: `${study.id} - ${population.id}`,
                                            defaultValue: "[0..1]:0.1",
                                            type: "number"
                                        }
                                    )
                                )
                            ).flat()
                        ]
                    }
                ]
            }
        };
    }
    render() {
        return html`
            <style include="jso-styles">
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

        ${this.checkProjects ? html`
            <div class="page-title">
                <h2>
                    ${this.clinicalAnalysis ? html`
                        <i class="fa fa-filter" aria-hidden="true" style="padding-left: 10px;padding-right: 10px"></i>&nbsp;${this._config.title} - Case ${this.clinicalAnalysis.id}
                    ` : html`
                        <i class="fa fa-filter" aria-hidden="true"></i>&nbsp; ${this._config.title}
                    `}
                </h2>
            </div>

            ${this.clinicalAnalysis ? html`
                <div class="col-md-12" style="padding: 10px 25px 25px 25px">
                    <div class="btn-toolbar " role="toolbar" aria-label="..." >
                        <!-- Left buttons -->
                        <div class="btn-group" role="group" aria-label="..." >
                            <button id="${this._prefix}InteractiveButton" type="button" class="btn btn-success variant-interpretation-view-buttons active ripple" data-view="Interactive" @click="${this.onChangeView}">
                                <i class="fa fa-filter icon-padding" aria-hidden="true" data-view="Interactive" @click="${this.onChangeView}"></i>Table Result
                            </button>
                            <button id="${this._prefix}CompoundHeterozygousButton" type="button" class="btn btn-success variant-interpretation-view-buttons ripple" data-view="CompoundHeterozygous" @click="${this.onChangeView}">
                                <i class="fas fa-random icon-padding" aria-hidden="true" data-view="CompoundHeterozygous" @click="${this.onChangeView}"></i>Summary Report
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
                        ${this.hasClinicalAnalysis ? html`
                            <div class="btn-group" role="group" aria-label="..." style="float: right">
                                <button id="${this._prefix}ClinicalAnalysisButton" type="button" class="btn btn-primary variant-interpretation-view-buttons" data-view="ClinicalAnalysis" @click="${this.onChangeView}">
                                    <i class="fa fa-user-md icon-padding" aria-hidden="true" data-view="ClinicalAnalysis" @click="${this.onChangeView}"></i>Case Summary
                                </button>
                                <button id="${this._prefix}InterpretationEditorButton" type="button" class="btn btn-primary variant-interpretation-view-buttons"
                                        data-view="InterpretationEditor" @click="${this.onChangeView}" .disabled="${this._config.disableSaveInterpretation}">
                                    <i class="fa fa-save icon-padding" aria-hidden="true" data-view="InterpretationEditor" @click="${this.onChangeView}"></i>Review and Save ${this.counterTitles.total}
                                </button>
                                
                                <button class="btn btn-primary variant-interpretation-view-buttons" @click="${this.unsetClinicalAnalysis}"> <i class="fas fa-window-close"></i> Close Case</button>
                            </div>
                        ` : html`
                            <div class="btn-group" role="group" aria-label="..." style="float: right">
                                <button id="${this._prefix}ClinicalAnalysisEditorButton" class="btn btn-primary variant-interpretation-view-buttons" data-view="ClinicalAnalysisEditor" @click="${this.onChangeView}" >
                                    <i class="fa fa-edit icon-padding" aria-hidden="true" data-view="ClinicalAnalysisEditor" @click="${this.onChangeView}"></i>Clinical Analysis Definition
                                </button>
                                <button id="${this._prefix}InterpretationEditorButton" type="button" class="btn btn-primary variant-interpretation-view-buttons"
                                        data-view="InterpretationEditor" @click="${this.onChangeView}" .disabled="${this._config.disableSaveInterpretation}">
                                    <i class="fa fa-save icon-padding" aria-hidden="true" data-view="InterpretationEditor" @click="${this.onChangeView}"></i>Review and Save ${this.counterTitles.total}
                                </button>
                            </div>
                        `}
                    </div>
                </div>
    
    
                <!--<div class="row">-->
                <div class="" style="padding: 0px 10px">
    
                    <!-- SEARCH TABLE RESULT -->
                    <div id="${this._prefix}MainContent" class="">
                        <!--<template is="dom-if" if="{{interactive}}">-->
                        <!--                    <div class="col-md-12">-->
                        <!--                        <h4 id="${this._prefix}Title" class="form-section-title" style="margin: 5px 0px;padding: 0px 10px">-->
                        <!--                            Interactive Variant Analysis-->
                        <!--                            <span class='denovo-info-icon' style="color: #337ab7; padding-left: 20px">-->
                        <!--                        <i class='fa fa-info-circle' aria-hidden='true'></i>-->
                        <!--                    </span>-->
                        <!--                        </h4>-->
                        <!--                    </div>-->
                        <div id="${this._prefix}Interactive" class="variant-interpretation-content">
                            <div style="padding: 10px 10px">
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
                                </div>
            
                                <div class="col-md-10">
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
            
                                    <div style="padding-top: 5px">
                                        <variant-cancer-interpreter-grid .opencgaSession="${this.opencgaSession}"
                                                                             .query="${this.executedQuery}"
                                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                             .consequenceTypes="${this.consequenceTypes}"
                                                                             .populationFrequencies="${this.populationFrequencies}"
                                                                             .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                             .config="${this._config.filter.result.grid}"
                                                                             @selected="${this.onSelectedGene}"
                                                                             @selectrow="${this.onSelectVariant}"
                                                                             @checkrow="${this.onCheckVariant}"
                                                                             @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                                        </variant-cancer-interpreter-grid>
            
                                        <!-- Bottom tabs with detailed variant information -->
                                        <opencga-variant-interpretation-detail .opencgaSession="${this.opencgaSession}"
                                                                               .cellbaseClient="${this.cellbaseClient}"
                                                                               .variant="${this.variant}"
                                                                               .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                               .consequenceTypes="${this.consequenceTypes}"
                                                                               .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                               .config=${this._config.filter.detail}>
                                        </opencga-variant-interpretation-detail>
                                    </div>
                                </div>
                            </div>
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
                            <!--
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
                            -->
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
                            <!--<div id="${this._prefix}ClinicalAnalysisCreatorWarning" class="col-md-10 col-md-offset-2" style="padding: 20px 10px">-->
                            <!--<span class="alert alert-warning" role="alert" style="padding: 10px 10px;font-weight: bold;font-size: 1.2em">-->
                            <!--No valid Clinical Analysis found, please fill the form below to define one case. You can also save it.-->
                            <!--</span>-->
                            <!--</div>-->
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
                                <!--                                clinical-analysis="{{clinicalAnalysis}}"-->
                                <!--                                reported-variants="{{checkedVariants}}"-->
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
                </div>
            ` : html`
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

            `}
        ` : html`
             <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                <h3>No public projects available to browse. Please login to continue</h3>
            </div>
        `}
    `;
    }

}

customElements.define("variant-cancer-interpreter", VariantCancerInterpreter);
