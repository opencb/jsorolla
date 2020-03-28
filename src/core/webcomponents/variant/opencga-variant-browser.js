/**
 * Copyright 2015-2019 OpenCB
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
import Utils from "./../../utils.js";
import UtilsNew from "./../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-variant-grid.js";
import "./opencga-variant-filter.js";
import "../opencga/commons/opencga-facet-result-view.js";
import "../opencga/commons/facet-filter.js";
import "../opencga/opencga-active-filters.js";
import "./opencga-variant-detail-view.js";
import "../commons/filters/select-field-filter.js";
import "../../loading-spinner.js";


export default class OpencgaVariantBrowser extends LitElement {

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
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            query: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            // selectedFacet: { //TODO naming change: preparedQueryFacet (selectedFacet), preparedQueryFacetFormatted (selectedFacetFormatted), executedQueryFacet (queryFacet) (also in opencga-browser)
            //     type: Object
            // },
            search: {
                type: Object
            },
            cohorts: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        // this.checkProjects = false;

        this.activeFilterAlias = {
            "annot-xref": "XRef",
            "biotype": "Biotype",
            "annot-ct": "Consequence Types",
            "alternate_frequency": "Population Frequency",
            "annot-functional-score": "CADD",
            "protein_substitution": "Protein Substitution",
            "annot-go": "GO",
            "annot-hpo": "HPO"
        };

        this.fixedFilters = ["studies"];

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;


        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {
            sample: "ISDBM322015"
        };
        this.preparedQuery = {};
        this.executedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

        this._collapsed = false;
        this.genotypeColor = {
            "0/0": "#6698FF",
            "0/1": "#FFA500",
            "1/1": "#FF0000",
            "./.": "#000000",
            "0|0": "#6698FF",
            "0|1": "#FFA500",
            "1|0": "#FFA500",
            "1|1": "#FF0000",
            ".|.": "#000000"
        };
        this.variantId = "No variant selected";

        this._sessionInitialised = false;
        this.detailActiveTabs = [];

        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // if cohort filter exists but this.cohorts is not defined then we add cohorts ALL to the 'filter' menu itself
        let _tempConfig = {...this.getDefaultConfig(), ...this.config};
        for (let section of _tempConfig.filter.sections) {
            for (let field of section.fields) {
                if (field.id === "cohort") {
                    if (field.cohorts === undefined) {
                        let _cohorts = {};
                        for (let project of this.opencgaSession.projects) {
                            _cohorts[project.id] = {};
                            for (let study of project.studies) {
                                if (field.onlyCohortAll) {
                                    _cohorts[project.id][study.id] = [{id: "ALL", name: "ALL"}]
                                } else {
                                    // TODO if onlyCohortAll is false then we must add all cohorts indexed
                                    // we can take this from session object
                                }
                            }
                        }
                        // we edit the config.filter.sections.fields.cohorts
                        field.cohorts = _cohorts;

                        // _tempConfig.filter.detail.views.foreach(view => {if (view.id === "cohortStats") {view.cohorts = _cohorts}});
                        for (let view of _tempConfig.filter.detail.views) {
                            if (view.id === "cohortStats") {
                                view.cohorts = _cohorts;
                            }
                        }
                        // if we are here is because this.cohorts is undefined
                        this.cohorts = _cohorts;
                    } else {
                        field.cohorts = this.cohorts;
                    }
                    break;
                }
            }
        }
        this._config = _tempConfig;
    }

    // firstUpdated(_changedProperties) {
    //     // $(".bootstrap-select", this).selectpicker();
    //     // console.log("this.opencgaSession",this.opencgaSession)
    //     // console.log("this.query from BROWSER", this.query)
    // }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        // if (changedProperties.has("selectedFacet")) {
        //     this.selectedFacetObserver();
        // }
    }

    /**
     * Apply the 'config' properties on the default
     */
    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    // opencgaSessionObserver() {
    //     if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
    //         // this.checkProjects = true;
    //         // this.requestUpdate(); //.then(() => $(".bootstrap-select", this).selectpicker());
    //     } else {
    //         // this.checkProjects = false;
    //     }
    // }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            _query = {
                study: this.opencgaSession.study.fqn
            };
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = {..._query, ...this.query};
            this.executedQuery = {..._query, ...this.query};
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {
                detail: this.preparedQuery
            }
        ));
        this.requestUpdate();
    }

    onCollapse() {
        if (this._collapsed) {
            $("#" + this._prefix + "FilterMenu").show(400);
            $("#" + this._prefix + "MainWindow").removeClass("browser-center").addClass("col-md-10");
        } else {
            $("#" + this._prefix + "FilterMenu").hide(400);
            $("#" + this._prefix + "MainWindow").removeClass("col-md-10").addClass("browser-center");
        }
        this._collapsed = !this._collapsed;
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    async onRun() {
        // this event keeps in sync the query object in variant-browser with the general one in iva-app (this.queries)
        // it is also in charge of update executedQuery (notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in variant-browser).
        // if we want to dismiss the general query feature (that is browsers remembering your last query even if you change view) replace the following line with:
        // this.executedQuery = {...this.preparedQuery}; this.requestUpdate();
        this.notifySearch(this.preparedQuery);

        if(Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                timeout: 60000,
                fields: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        }
    }

    // _initTooltip() {
    //     // TODO move to Utils
    //     $("a[tooltip-title]", this).each(function() {
    //         $(this).qtip({
    //             content: {
    //                 title: $(this).attr("tooltip-title"),
    //                 text: $(this).attr("tooltip-text")
    //             },
    //             position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
    //             style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
    //             show: {delay: 200},
    //             hide: {fixed: true, delay: 300}
    //         });
    //     });
    // }

    onFilterChange(e) {
        this.query = e.detail;
        // TODO remove search field everywhere. use query instead
        this.search = e.detail;
    }

    onClickPill(e){
        //e.preventDefault();
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant facet", e.detail);
        this.preparedQuery = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
    }

    onFacetQueryChange(e) {
        this.selectedFacetFormatted = e.detail.value;
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        // console.log("selectedFacet",Object.keys(this.selectedFacet))
        $("#" + this._prefix + "FacetField", this).selectpicker("val", Object.keys(this.selectedFacet));
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        $("#" + this._prefix + "FacetField", this).selectpicker("val", "deselectAll");
        this.requestUpdate();
    }

    onClickRow(e) {
        console.log(e);
        this.detail = {...this.detail, [e.detail.resource]: e.detail.data};
        this.requestUpdate();
        console.log("this.detail", this.detail);
    }

    onSampleChange(e) {
        this.samples = e.detail.samples;
        this.dispatchEvent(new CustomEvent("samplechange", {detail: {samples: this.samples}, bubbles: true, composed: true}));
    }

    _changeBottomTab(e) {
        const _activeTabs = {};
        for (const detail of this.config.detail) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

    onGenomeBrowserPositionChange(e) {
        $(".variant-browser-content").hide(); // hides all content divs

        // Show genome browser div
        PolymerUtils.getElementById(this._prefix + "GenomeBrowser").style.display = "block";

        // Show the active button
        $(".variant-browser-view-buttons").removeClass("active");
        PolymerUtils.addClass(this._prefix + "GenomeBrowserButton", "active");

        this._genomeBrowserActive = true;
        this.region = e.detail.genomeBrowserPosition;
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.variant;
        const genes = [];
        for (let i = 0; i < e.detail.variant.annotation.consequenceTypes.length; i++) {
            const gene = e.detail.variant.annotation.consequenceTypes[i].geneName;
            if (UtilsNew.isNotEmpty(gene) && genes.indexOf(gene) === -1) {
                genes.push(gene);
            }
        }
        this.genes = genes;

        this.requestUpdate();
    }

    selectedGene(e) {
        this.dispatchEvent(new CustomEvent("propagate", {gene: e.detail.gene}));
    }

    getDefaultConfig() {
        return {
            title: "Variant Browser",
            icon: "fas fa-search",
            active: false,
            filter: {
                title: "Filter",
                button: "Run",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types",
                    },
                    complexFields: ["genotype"],
                    hiddenFields: ["study"]
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Study and Cohorts",
                        collapsed: false,
                        fields: [
                            {
                                id: "study",
                                title: "Studies Filter",
                                tooltip: "Only considers variants from the selected studies"
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
                                tooltip: "Filter out variants falling outside the genomic interval(s) defined"
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: "Filter out variants falling outside the genomic intervals (typically genes) defined by the panel(s) chosen"
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: [
                                    "3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene", "IG_J_pseudogene",
                                    "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene", "TR_J_gene", "TR_J_pseudogene",
                                    "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA", "misc_RNA", "non_stop_decay",
                                    "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript",
                                    "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic", "sense_overlapping", "snRNA",
                                    "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
                                    "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
                                ],
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
                                tooltip: "Only considers variants of the selected type"
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
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
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
                                // tooltip: populationFrequencies.tooltip, // TODO expose common data
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
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "hpo",
                                title: "HPO Accessions",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "clinvar",
                                title: "ClinVar Accessions",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
                            },
                            {
                                id: "fullTextSearch",
                                title: "Full-text search on HPO, ClinVar, protein domains or keywords. Some OMIM and Orphanet IDs are also supported",
                                tooltip: "Filter out variants falling outside the genomic features (gene, transcript, SNP, etc.) defined"
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
                                tooltip: "<strong>SIFT score:</strong> Choose either a Tolerated/Deleterious qualitative score or provide below a " +
                                    "quantitative impact value. SIFT scores <0.05 are considered deleterious. " +
                                    "<strong>Polyphen:</strong> Choose, either a Benign/probably damaging qualitative score or provide below a " +
                                    "quantitative impact value. Polyphen scores can be Benign (<0.15), Possibly damaging (0.15-0.85) or Damaging (>0.85)"
                            },
                            {
                                id: "cadd",
                                title: "CADD",
                                tooltip: "Raw values have relative meaning, with higher values indicating that a variant is more likely to be " +
                                    "simulated (or not observed) and therefore more likely to have deleterious effects. If discovering causal variants " +
                                    "within an individual, or small groups, of exomes or genomes te use of the scaled CADD score is recommended"
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
                                tooltip: "<strong>PhyloP</strong> scores measure evolutionary conservation at individual alignment sites. The scores " +
                                    "are interpreted as follows compared to the evolution expected under neutral drift: positive scores (max 3.0) mean " +
                                    "conserved positions and negative scores (min -14.0) indicate positive selection. PhyloP scores are useful to " +
                                    "evaluate signatures of selection at particular nucleotides or classes of nucleotides (e.g., third codon positions, " +
                                    "or first positions of miRNA target sites).<br>" +
                                    "<strong>PhastCons</strong> estimates the probability that each nucleotide belongs to a conserved element, based on " +
                                    "the multiple alignment. The phastCons scores represent probabilities of negative selection and range between 0 " +
                                    "(non-conserved) and 1 (highly conserved).<br>" +
                                    "<strong>Genomic Evolutionary Rate Profiling (GERP)</strong> score estimate the level of conservation of positions." +
                                    " Scores ≥ 2 indicate evolutionary constraint to and ≥ 3 indicate purifying selection."
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
                            // component: "opencga-variant-cohort-stats",
                            title: "Summary",
                            active: true
                        },
                        {
                            id: "annotationConsType",
                            // component: "opencga-variant-cohort-stats",
                            title: "Consequence Type",
                        },
                        {
                            id: "annotationPropFreq",
                            // component: "opencga-variant-cohort-stats",
                            title: "Population Frequencies"
                        },
                        {
                            id: "cohortStats",
                            // component: "opencga-variant-cohort-stats",
                            title: "Cohort Stats",
                            cohorts: this.cohorts
                        },
                        {
                            id: "samples",
                            // component: "opencga-variant-samples",
                            title: "Samples"
                        },
                        {
                            id: "beacon",
                            // component: "variant-beacon-network",
                            title: "Beacon"
                            // Uncomment and edit Beacon hosts to change default hosts
                            // hosts: [
                            //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                            //     "lovd", "hgmd", "icgc", "sahgp"
                            // ]
                        },
                        {
                            id: "network",
                            // component: "reactome-variant-network",
                            title: "Reactome Pathways"
                        },
                        // {
                        //     id: "template",
                        //     component: "opencga-variant-detail-template",
                        //     title: "Template"
                        // }
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

    static get styles() {
        return css`
            .content-tab { 
                padding-top: 20px; 
            }
        `;
    }

    render() {
        // Check if there is any project available
        if (!this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>`;
        }

        return html`
            <div class="page-title">
                <h2>
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h2>
            </div>
            
            <div class="row" style="padding: 0px 10px">
                <div class="col-md-2 left-menu">
                
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this._config.filter.button}
                        </button>
                    </div>
                    
                    <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                        <li role="presentation" class="active">
                            <a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">${this._config.filter.title}</a>
                        </li>
                        <li role="presentation">
                            <a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">${this._config.aggregation.title}</a>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane active" id="filters_tab">
                            <opencga-variant-filter     .opencgaSession=${this.opencgaSession}
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .populationFrequencies="${this.populationFrequencies}"
                                                        .consequenceTypes="${this.consequenceTypes}"
                                                        .query="${this.query}"
                                                        .cohorts="${this.cohorts}"
                                                        .searchButton="${false}"
                                                        .config="${this._config.filter}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                            </opencga-variant-filter>
                        </div>
                        
                        <div role="tabpanel" class="tab-pane" id="facet_tab">
                            <facet-filter   .selectedFacet="${this.selectedFacet}"
                                            .config="${this._config.aggregation}"
                                            @facetQueryChange="${this.onFacetQueryChange}">
                            </facet-filter>
                        </div>
                    </div>
                </div>

                <div class="col-md-10">
                
                    <!-- tabs buttons -->
                    <div>
                        <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                            <div class="btn-group" role="group" style="margin-left: 0px">
                                <button type="button" class="btn btn-success active ripple content-pills" @click="${this.onClickPill}" data-id="table-tab">
                                    <i class="fa fa-table icon-padding" aria-hidden="true"></i> Table Result
                                </button>
                                <button type="button" class="btn btn-success ripple content-pills" @click="${this.onClickPill}" data-id="facet-tab">
                                    <i class="fas fa-chart-bar icon-padding" aria-hidden="true"></i> Aggregation Stats
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <opencga-active-filters facetActive
                                                filterBioformat="VARIANT"
                                                .opencgaSession="${this.opencgaSession}"
                                                .defaultStudy="${this.opencgaSession.study.alias}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .facetQuery="${this.selectedFacetFormatted}"
                                                .alias="${this.activeFilterAlias}"
                                                .filters="${this._config.filter.examples}"
                                                .config="${this._config.filter.activeFilters}"
                                                @activeFacetChange="${this.onActiveFacetChange}"
                                                @activeFacetClear="${this.onActiveFacetClear}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>
                        
                        <div id="table-tab" class="content-tab">
                            <opencga-variant-grid .opencgaSession="${this.opencgaSession}"
                                                  .query="${this.executedQuery}"
                                                  .cohorts="${this.cohorts}"
                                                  .cellbaseClient="${this.cellbaseClient}"
                                                  .populationFrequencies="${this.populationFrequencies}"
                                                  .active="${this.active}" 
                                                  .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                  .consequenceTypes="${this.consequenceTypes}"
                                                  .config="${this._config.filter}"
                                                  @selected="${this.selectedGene}"
                                                  @selectvariant="${this.onSelectVariant}"
                                                  @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                            </opencga-variant-grid>
            
                            <!-- Bottom tabs with specific variant information -->
                            <opencga-variant-detail-view    .opencgaSession="${this.opencgaSession}" 
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .variantId="${this.variantId}"
                                                            .config="${this._config.filter.detail}">
                            </opencga-variant-detail-view>
                        </div>
                        
                        <div id="facet-tab" class="content-tab">
                            <opencb-facet-results  resource="variant"
                                                   .opencgaSession="${this.opencgaSession}" 
                                                   .active="${this.activeTab["facet-tab"]}"
                                                  .query="${this.facetQuery}"
                                                  .data="${this.facetResults}"
                                                  .error="${this.errorState}">
                            </opencb-facet-results>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("opencga-variant-browser", OpencgaVariantBrowser);
