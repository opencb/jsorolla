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

import {LitElement, html} from "lit";
import UtilsNew from "./../../core/utilsNew.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import VariantUtils from "./variant-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/tool-header.js";
import "./variant-browser-filter.js";
import "./variant-browser-grid.js";
import "./variant-browser-detail.js";
import "../commons/opencb-facet-results.js";
import "../commons/facet-filter.js";
import "../commons/opencga-active-filters.js";
import "./annotation/cellbase-variant-annotation-summary.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./variant-cohort-stats.js";
import "./variant-samples.js";

import "../visualization/genome-browser.js";

export default class VariantBrowser extends LitElement {

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
            query: {
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
            // query object sent to Opencga client (includes this.selectedFacet serialised)
            facetQuery: {
                type: Object
            },
            // complex object that keeps track of the values of all facets
            selectedFacet: {
                type: Object
            },
            settings: {
                type: Object
            },
            cellbaseClient: {
                type: Object,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        // These are for making the queries to server
        /* this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];*/

        this.results = [];
        this._showInitMessage = true;

        this.searchActive = true;
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.selectedFacet = {};
        this.preparedFacetQueryFormatted = {};
        this.errorState = false;
        this.variant = null;

        this.activeTab = "table-tab";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
            this.settingsObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("selectedFacet")) {
            this.facetQueryBuilder();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        if (!this.opencgaSession) {
            return;
        }
        // merge filters
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        // Grid configuration
        if (this.settings?.table) {
            this._config.filter.result.grid = {...this._config.filter.result.grid, ...this.settings.table};
        }
        if (this.settings?.table?.toolbar) {
            this._config.filter.result.grid.toolbar = {
                ...this._config.filter.result.grid.toolbar,
                ...this.settings.table.toolbar,
            };
        }

        // Apply user configuration
        if (this.opencgaSession.user?.configs?.IVA?.variantBrowser?.grid) {
            this._config.filter.result.grid = {
                ...this._config.filter.result.grid,
                ...this.opencgaSession.user.configs.IVA.variantBrowser.grid,
            };
        }

        this.requestUpdate();
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.checkProjects = true;
            this.query = {study: this.opencgaSession.study.fqn};

            // TODO FIXME
            /** temp fix this.onRun(): when you switch study this.facetQuery contains the old study when you perform a new Aggregation query.
             *  As a consequence, we need to update preparedQuery as this.onRun() uses it (without it the old study is in query in table result as well)
             */
            this.preparedQuery = {study: this.opencgaSession.study.fqn};
            this.facetQuery = null;
            this.preparedFacetQueryFormatted = null;
            // this.requestUpdate();
            // this.onRun();

            // this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        } else {
            this.checkProjects = false;
        }
    }

    queryObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (!UtilsNew.objectCompare(this.query, this._query)) {
                this._query = this.query;
                if (this.query) {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                    this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                } else {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn};
                    this.executedQuery = {study: this.opencgaSession.study.fqn};
                }
                // onServerFilterChange() in opencga-active-filters fires an activeFilterChange event when the Filter dropdown is used
                LitUtils.dispatchCustomEvent(this, "queryChange", undefined, this.preparedQuery);
                this.detail = {};
                this.searchActive = false; // Disable search button
            }
        }
    }

    facetQueryBuilder() {
        // facetQuery is the query object sent to the client in <opencb-facet-results>
        if (Object.keys(this.selectedFacet).length) {
            this.executedFacetQueryFormatted = {...this.preparedFacetQueryFormatted};

            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // FIXME rename fields to field
                fields: Object.values(this.preparedFacetQueryFormatted).map(v => v.formatted).join(";")
            };
            this.changeView("facet-tab");
        } else {
            this.facetQuery = null;
        }
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {
            query: query
        });
    }

    async onRun() {
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in variant-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        this.query = {...this.preparedQuery};
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);

        this.facetQueryBuilder();
        /* if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                timeout: 60000,
                fields: Object.values(this.preparedFacetQueryFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
            this.facetQuery = null;
        }*/
    }

    changeView(id) {
        this.activeTab = id;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        VariantUtils.validateQuery(e.detail);
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.notifySearch(this.query);
        this.facetQueryBuilder();
    }

    onActiveFilterClear() {
        // console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.notifySearch(this.query);
        this.facetQueryBuilder();
    }

    onFacetQueryChange(e) {
        // console.log("onFacetQueryChange");
        this.preparedFacetQueryFormatted = e.detail.value;
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        this.preparedFacetQueryFormatted = {...e.detail};
        // this.onRun();
        this.facetQueryBuilder();
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        this.onRun();
        this.requestUpdate();
    }

    onQueryComplete() {
        this.searchActive = true;
        this.requestUpdate();
    }

    onClickRow(e) {
        this.detail = {...this.detail, [e.detail.resource]: e.detail.data};
        this.requestUpdate();
    }

    onSampleChange(e) {
        this.samples = e.detail.samples;
        LitUtils.dispatchCustomEvent(this, "sampleChange", undefined, {
            samples: this.samples,
        });
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    async onGridConfigSave(e) {
        const newGridConfig = {...e.detail.value};

        // Remove highlights and copies configuration from new config
        delete newGridConfig.highlights;
        // delete newConfig.copies;

        // Update user configuration
        try {
            await OpencgaCatalogUtils.updateGridConfig(this.opencgaSession, "variantBrowser", newGridConfig);
            this.settingsObserver();

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Variant Browser",
            icon: "img/tools/icons/variant_browser.svg",
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
                        "biotype": "Biotype",
                        "alternate_frequency": "Population Frequency",
                        "proteinSubstitution": "Protein Substitution"
                    },
                    complexFields: [],
                    hiddenFields: []
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Study and Cohorts",
                        collapsed: false,
                        filters: [
                            {
                                id: "study",
                                title: "Study Filter",
                                visible: () => this.opencgaSession.project.studies.length > 1,
                                tooltip: tooltips.study
                            },
                            // {
                            //     id: "sample",
                            //     title: "Sample Filter (<5 samples)",
                            //     tooltip: tooltips.study
                            // },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: false,
                                tooltip: tooltips.cohort,
                                // cohorts: this.cohorts
                                cohorts: this.opencgaSession?.project?.studies
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        filters: [
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs...)",
                                tooltip: tooltips.feature
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: BIOTYPES,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                tooltip: tooltips.type,
                                params: {
                                    types: VARIANT_TYPES,
                                }
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        filters: [
                            {
                                id: "consequence-type",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect,
                                params: {
                                    consequenceTypes: this.consequenceTypes || CONSEQUENCE_TYPES
                                }
                            }
                        ]
                    },
                    {
                        title: "Population Frequency",
                        collapsed: true,
                        filters: [
                            {
                                id: "populationFrequency",
                                title: "Select Population Frequency",
                                tooltip: tooltips.populationFrequencies,
                                params: {
                                    populationFrequencies: this.populationFrequencies || POPULATION_FREQUENCIES,
                                    showSetAll: true
                                }
                            }
                        ]
                    },
                    {
                        title: "Clinical",
                        collapsed: true,
                        filters: [
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "clinical-annotation",
                                title: "Clinical Annotation",
                                tooltip: tooltips.clinical
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
                        filters: [
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
                        filters: [
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
                        filters: [
                            {
                                id: "conservation",
                                title: "Conservation Score",
                                tooltip: tooltips.conservation
                            }
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {}
                },
                detail: {
                    title: "Selected Variant:",
                    items: [
                        {
                            id: "annotationSummary",
                            name: "Summary",
                            active: true,
                            render: (variant, active, opencgaSession) => html`
                                <cellbase-variant-annotation-summary
                                    .variantAnnotation="${variant.annotation}"
                                    .consequenceTypes="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                                    .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                                    .assembly="${opencgaSession?.project?.organism?.assembly}">
                                </cellbase-variant-annotation-summary>
                            `,
                        },
                        {
                            id: "annotationConsType",
                            name: "Consequence Type",
                            render: (variant, active) => html`
                                <variant-consequence-type-view
                                    .consequenceTypes="${variant.annotation.consequenceTypes}"
                                    .active="${active}">
                                </variant-consequence-type-view>
                            `,
                        },
                        {
                            id: "annotationPropFreq",
                            name: "Population Frequencies",
                            render: (variant, active) => html`
                                <cellbase-population-frequency-grid
                                    .populationFrequencies="${variant.annotation.populationFrequencies}"
                                    .active="${active}">
                                </cellbase-population-frequency-grid>
                            `,
                        },
                        {
                            id: "annotationClinical",
                            name: "Clinical",
                            render: variant => html`
                                <variant-annotation-clinical-view
                                    .traitAssociation="${variant.annotation.traitAssociation}"
                                    .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                                </variant-annotation-clinical-view>
                            `,
                        },
                        {
                            id: "cohortStats",
                            name: "Cohort Variant Stats",
                            render: (variant, active, opencgaSession) => html`
                                <variant-cohort-stats
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .config="${this.cohortConfig}"
                                    .active="${active}">
                                </variant-cohort-stats>
                            `,
                        },
                        {
                            id: "samples",
                            name: "Samples",
                            render: (variant, active, opencgaSession) => html`
                                <variant-samples
                                    .opencgaSession="${opencgaSession}"
                                    .variantId="${variant.id}"
                                    .active="${active}">
                                </variant-samples>
                            `,
                        },
                        {
                            id: "beacon",
                            name: "Beacon",
                            render: (variant, active, opencgaSession) => html`
                                <variant-beacon-network
                                    .variant="${variant.id}"
                                    .assembly="${opencgaSession.project.organism.assembly}"
                                    .config="${this.beaconConfig}"
                                    .active="${active}">
                                </variant-beacon-network>
                            `,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (variant, active) => html`
                                <json-viewer .data="${variant}" .active="${active}"></json-viewer>
                            `,
                        }
                        // TODO Think about Neeworks
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
                                id: "type", name: "Variant Type", type: "category", allowedValues: VARIANT_TYPES
                            },
                            {
                                id: "genes", name: "Gene", type: "string"
                            },
                            {
                                id: "biotypes", name: "Biotype", type: "string"
                            },
                            {
                                id: "consequenceType", name: "Consequence Type", type: "string"
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
                            ...(this.populationFrequencies || POPULATION_FREQUENCIES).studies.map(study =>
                                study.populations.map(population => (
                                    {
                                        id: `popFreq__${study.id}__${population.id}`,
                                        name: `${study.id} - ${population.id}`,
                                        defaultValue: "[0..1]:0.1",
                                        type: "number"
                                    }
                                ))
                            ).flat()
                        ]
                    }
                ]
            },
            genomeBrowser: {
                config: {
                    cellBaseClient: this.cellbaseClient,
                },
                tracks: [
                    {
                        type: "gene-overview",
                        overview: true,
                        config: {},
                    },
                    {
                        type: "sequence",
                        config: {},
                    },
                    {
                        type: "gene",
                        config: {},
                    },
                    {
                        type: "opencga-variant",
                        config: {
                            title: "Variants",
                            height: 120,
                        },
                    },
                ],
            },
        };
    }

    render() {
        // Check if there is any project available
        if (!this.opencgaSession?.study) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue.</h3>
                </div>
            `;
        }

        return html`
            <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>
            <div class="row">
                <div class="col-md-2 left-menu">

                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary btn-block" ?disabled="${!this.searchActive}" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                            <strong>${this._config.searchButtonText || "Search"}</strong>
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
                            <variant-browser-filter
                                .opencgaSession=${this.opencgaSession}
                                .query="${this.query}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .config="${this._config.filter}"
                                @queryChange="${this.onQueryFilterChange}"
                                @querySearch="${this.onVariantFilterSearch}"
                                @activeFacetChange="${this.onActiveFacetChange}"
                                @activeFacetClear="${this.onActiveFacetClear}">
                            </variant-browser-filter>
                        </div>

                        <div role="tabpanel" class="tab-pane" id="facet_tab">
                            <facet-filter
                                .selectedFacet="${this.selectedFacet}"
                                .config="${this._config.aggregation}"
                                @facetQueryChange="${this.onFacetQueryChange}">
                            </facet-filter>
                        </div>
                    </div>
                </div>

                <div class="col-md-10">
                    <!-- TAB buttons -->
                    <div class="content-pills" role="toolbar" aria-label="toolbar">
                        <button
                            type="button"
                            class="${`btn btn-success ${this.activeTab === "table-tab" ? "active" : ""} content-pills`}"
                            @click="${() => this.changeView("table-tab")}">
                            <i class="fa fa-table icon-padding" aria-hidden="true"></i>
                            <strong>Table Result</strong>
                        </button>
                        <button
                            type="button"
                            class="${`btn btn-success ${this.activeTab === "facet-tab" ? "active" : ""} content-pills`}"
                            @click="${() => this.changeView("facet-tab")}">
                            <i class="fas fa-chart-bar icon-padding" aria-hidden="true"></i>
                            <strong>Aggregation Stats</strong>
                        </button>
                        <button
                            type="button"
                            class="${`btn btn-success ${this.activeTab === "genome-tab" ? "active" : ""} content-pills`}"
                            @click="${() => this.changeView("genome-tab")}">
                            <i class="fas fa-dna icon-padding" aria-hidden="true"></i>
                            <strong>Genome Browser</strong>
                        </button>
                    </div>

                    <div>
                        <opencga-active-filters
                            facetActive
                            resource="VARIANT"
                            .opencgaSession="${this.opencgaSession}"
                            .defaultStudy="${this.opencgaSession.study?.fqn}"
                            .query="${this.preparedQuery}"
                            .executedQuery="${this.executedQuery}"
                            .facetQuery="${this.preparedFacetQueryFormatted}"
                            .executedFacetQuery="${this.executedFacetQueryFormatted}"
                            .alias="${this._config.filter.activeFilters.alias}"
                            .filters="${this._config.filter.examples}"
                            .config="${this._config.filter.activeFilters}"
                            @activeFacetChange="${this.onActiveFacetChange}"
                            @activeFacetClear="${this.onActiveFacetClear}"
                            @activeFilterChange="${this.onActiveFilterChange}"
                            @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>

                        <div class="main-view">
                            <div id="table-tab" class="${`content-tab ${this.activeTab === "table-tab" ? "active" : ""}`}">
                                <variant-browser-grid
                                    .opencgaSession="${this.opencgaSession}"
                                    .query="${this.executedQuery}"
                                    .cohorts="${this.opencgaSession?.project?.studies ?? []}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .consequenceTypes="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                                    .populationFrequencies="${this.populationFrequencies || POPULATION_FREQUENCIES}"
                                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                    .config="${this._config.filter.result.grid}"
                                    @queryComplete="${this.onQueryComplete}"
                                    @selectrow="${this.onSelectVariant}"
                                    @gridconfigsave="${this.onGridConfigSave}">
                                </variant-browser-grid>

                                <!-- Bottom tabs with specific variant information -->
                                <variant-browser-detail
                                    .variant="${this.variant}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .config="${this._config.filter.detail}">
                                </variant-browser-detail>
                            </div>

                            <div id="facet-tab" class="${`content-tab ${this.activeTab === "facet-tab" ? "active" : ""}`}">
                                <opencb-facet-results
                                    resource="VARIANT"
                                    .opencgaSession="${this.opencgaSession}"
                                    .active="${this.activeTab === "facet-tab"}"
                                    .query="${this.facetQuery}"
                                    .data="${this.facetResults}"
                                    .error="${this.errorState}">
                                </opencb-facet-results>
                            </div>

                            <div id="genome-tab" class="${`content-tab ${this.activeTab === "genome-tab" ? "active" : ""}`}">
                                ${this.variant ? html`
                                    <genome-browser
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this._config.genomeBrowser.config}"
                                        .region="${this.variant}"
                                        .tracks="${this._config.genomeBrowser.tracks}"
                                        .active="${this.activeTab === "genome-tab"}">
                                    </genome-browser>
                                ` : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-browser", VariantBrowser);
