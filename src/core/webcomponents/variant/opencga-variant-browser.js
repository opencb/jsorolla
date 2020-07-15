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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "./../tool-header.js";
import "./opencga-variant-filter.js";
import "./opencga-variant-grid.js";
import "./opencga-variant-detail-view.js";
import "../commons/opencga-facet-result-view.js";
import "../commons/facet-filter.js";
import "../commons/opencga-active-filters.js";

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
            cohorts: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vb" + UtilsNew.randomString(6);

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;

        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

        // this.genotypeColor = {
        //     "0/0": "#6698FF",
        //     "0/1": "#FFA500",
        //     "1/1": "#FF0000",
        //     "./.": "#000000",
        //     "0|0": "#6698FF",
        //     "0|1": "#FFA500",
        //     "1|0": "#FFA500",
        //     "1|1": "#FF0000",
        //     ".|.": "#000000"
        // };

        this.detailActiveTabs = [];
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

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession && this.opencgaSession.project) {
            this.query = {study: this.opencgaSession.study.fqn};
        }
        // if cohort filter exists but this.cohorts is not defined then we add cohorts ALL to the 'filter' menu itself
        let _tempConfig = {...this.getDefaultConfig(), ...this.config};
        for (let section of _tempConfig.filter.sections) {
            for (let field of section.fields) {
                if (field.id === "cohort") {
                    if (field.cohorts === undefined) {
                        let _cohorts = {};
                        // in case of no public project this.opencgaSession is being created, but the prop projects won't
                        // TODO NOTE this.opencgaSession is undefined in connectedCallback() method
                        if (this.opencgaSession && this.opencgaSession.projects) {
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
                        this.requestUpdate()
                    } else {
                        field.cohorts = this.cohorts;
                    }
                    break;
                }
            }
        }
        this._config = _tempConfig;
    }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        // (it checks just for undefined, empty object is a valid value)
        if (this.opencgaSession) {
            if(this.query) {
                this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            } else {
                this.preparedQuery = {study: this.opencgaSession.study.fqn};
                this.executedQuery = {study: this.opencgaSession.study.fqn};
            }
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {
                detail: this.preparedQuery
            }
        ));

        this.requestUpdate();
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
        // this.executedQuery = {...this.preparedQuery};
        // this.requestUpdate();
        this.notifySearch(this.preparedQuery);

        if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                timeout: 60000,
                fields: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
            this.facetQuery = null;
        }
    }

    onClickPill(e) {
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }


    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }


    onActiveFilterChange(e) {
        // this.query = {...e.detail};
        this.preparedQuery = {...e.detail};
        this.onRun(); //TODO recheck queryObserver is supposed to handle the update of the grid
    }

    onActiveFilterClear() {
        // this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {study: this.opencgaSession.study.fqn};
        this.onRun(); //TODO recheck queryObserver is supposed to handle the update of the grid
    }


    onVariantFacetChange(e) {
        this.selectedFacetFormatted = e.detail.value;
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        this.onRun();
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        this.onRun();
        this.requestUpdate();
    }


    onClickRow(e) {
        this.detail = {...this.detail, [e.detail.resource]: e.detail.data};
        this.requestUpdate();
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

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Variant Browser",
            icon: "variant_browser.svg",
            active: false,
            searchButtonText: "Search",
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types",
                        "annot-xref": "XRef",
                        "biotype": "Biotype",
                        "annot-ct": "Consequence Types",
                        "alternate_frequency": "Population Frequency",
                        "annot-functional-score": "CADD",
                        "protein_substitution": "Protein Substitution",
                        "annot-go": "GO",
                        "annot-hpo": "HPO"
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
                                title: "Study Filter",
                                tooltip: tooltips.study
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                tooltip: tooltips.cohort,
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
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"],
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
                            }
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
                        title: "Clinical and Disease",
                        collapsed: true,
                        fields: [
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
                        title: "Phenotype",
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
                        id: "BRCA2 missense variants",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            ct: "missense_variant"
                        }
                    },
                    {
                        id: "Complex Example",
                        query: {
                            "xref": "BRCA1,TP53",
                            "biotype": "protein_coding",
                            "type": "SNV,INDEL",
                            "ct": "lof",
                            "populationFrequencyAlt": "GNOMAD_GENOMES:ALL<0.1",
                            "protein_substitution": "sift>5,polyphen>4",
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
                            id: "annotationClinical",
                            title: "Clinical"
                        },
                        {
                            id: "cohortStats",
                            title: "Cohort Variant Stats",
                            onlyCohortAll: true,
                            tooltip: tooltips.cohort
                            //cohorts: this.cohorts
                        },
                        {
                            id: "samples",
                            title: "Samples"
                        },
                        {
                            id: "beacon",
                            title: "Beacon"
                        },
                        // {
                        //     id: "network",
                        //     title: "Reactome Pathways"
                        // },
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
                                id: "studies", name: "Study", type: "string"
                            },
                            {
                                id: "type", name: "Variant Type", type: "category", allowedValues: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"]
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
        // Check if there is any project available
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>`;
        }

        return html`
           <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>

            <div class="row">
                <div class="col-md-2 left-menu">
                
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this._config.searchButtonText}
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
                                                        .query="${this.query}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .populationFrequencies="${this.populationFrequencies}"
                                                        .consequenceTypes="${this.consequenceTypes}"
                                                        .cohorts="${this.cohorts}"
                                                        .searchButton="${false}"
                                                        .config="${this._config.filter}"
                                                        @queryChange="${this.onVariantFilterChange}"
                                                        @querySearch="${this.onVariantFilterSearch}">
                            </opencga-variant-filter>
                        </div>
                        
                        <div role="tabpanel" class="tab-pane" id="facet_tab">
                            <facet-filter   .selectedFacet="${this.selectedFacet}"
                                            .config="${this._config.aggregation}"
                                            @facetQueryChange="${this.onVariantFacetChange}">
                            </facet-filter>
                        </div>
                    </div>
                </div>

                <div class="col-md-10">
                    <!-- TAB buttons -->
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
                                                resource="VARIANT"
                                                .opencgaSession="${this.opencgaSession}"
                                                .defaultStudy="${this.opencgaSession.study.fqn}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .facetQuery="${this.selectedFacetFormatted}"
                                                .alias="${this._config.filter.activeFilters.alias}"
                                                .filters="${this._config.filter.examples}"
                                                .config="${this._config.filter.activeFilters}"
                                                @activeFacetChange="${this.onActiveFacetChange}"
                                                @activeFacetClear="${this.onActiveFacetClear}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>
                        
                        <div class="main-view">
                            <div id="table-tab" class="content-tab active">
                                <opencga-variant-grid .opencgaSession="${this.opencgaSession}"
                                                      .query="${this.executedQuery}"
                                                      .cohorts="${this.cohorts}"
                                                      .cellbaseClient="${this.cellbaseClient}"
                                                      .populationFrequencies="${this.populationFrequencies}"
                                                      .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                      .consequenceTypes="${this.consequenceTypes}"
                                                      .config="${this._config.filter}"
                                                      @selectrow="${this.onSelectVariant}">
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
            </div>
        `;
    }
}

customElements.define("opencga-variant-browser", OpencgaVariantBrowser);
