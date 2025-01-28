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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import {guardPage} from "../commons/html-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "./variant-browser-filter.js";
import "./variant-browser-grid.js";
import "./variant-browser-detail.js";
import "../commons/aggregation-stats.js";
import "../commons/opencb-facet-results.js";
// import "../commons/facet-filter.js";
import "../commons/tool-header.js";
import "../commons/grid-notifications.js";
import "./annotation/cellbase-variant-annotation-summary.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./annotation/variant-annotation-pharmacogenomics-view.js";
import "./variant-cohort-stats.js";
import "./variant-samples.js";
import "./variant-notes.js";
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
        this.COMPONENT_ID = "variant-browser";
        this._prefix = UtilsNew.randomString(8);

        this.searchActive = true;
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.selectedFacet = {};
        this.preparedFacetQueryFormatted = {};
        // this.errorState = false;
        this.variant = null;
        this.notifications = [];

        this.activeView = "table";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query") || changedProperties.has("opencgaSession")) {
            this.queryObserver();
        }
        // if (changedProperties.has("selectedFacet")) {
        //     this.facetQueryBuilder();
        // }

        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = this.getDefaultConfig();

        // Apply Study grid configuration
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        // Grid configuration and take out toolbar admin/user settings to grid level.
        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply User grid configuration. Only 'pageSize', 'columns', 'geneSet', 'consequenceType' and 'populationFrequenciesConfig' are set
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        });
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.preparedQuery = {...this._config?.filter?.defaultFilter};
            this.executedQuery = {...this._config?.filter?.defaultFilter};

            // Search must be disabled even defaultFilter is empty
            this.searchActive = false;
            this.variant = null;

            this.facetQuery = null;
            this.preparedFacetQueryFormatted = null;
        }
    }

    queryObserver() {
        if (this.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (!UtilsNew.isEmpty(this.query) && !UtilsNew.objectCompare(this.query, this.executedQuery)) {
                this.preparedQuery = {...this.query};
                this.executedQuery = {...this.query};

                LitUtils.dispatchCustomEvent(this, "queryChange", undefined, this.preparedQuery);
                this.searchActive = false; // Disable search button
                this.variant = null;
            }
        }
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {
            query: query
        });
    }

    changeView(id) {
        this.activeView = id;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.searchActive = false;
        this.variant = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onVariantFilterClear() {
        this.preparedQuery = {};
        this.executedQuery = {};
        this.searchActive = false;
        this.variant = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onQueryComplete(event) {
        this.notifications = WebUtils.getResponseEvents(event.detail.response);
        this.searchActive = true;
        this.requestUpdate();
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    renderHeaderRightContent() {
        const viewButtons = [
            {name: "Table View", id: "table", icon: "fa fa-table"},
            {name: "Aggregation Stats", id: "aggregation", icon: "fas fa-chart-bar"},
            {name: "Genome Browser", id: "genome", icon: "fas fa-dna"},
        ];
        return html`
            <div class="d-flex gap-1 align-items-stretch">
                <!-- View buttons -->
                <div class="d-flex align-items-center gap-1 border bg-gray-100 rounded-3 p-1">
                    ${viewButtons.map(button => html`
                        <button
                            class="${`btn ${this.activeView === button.id ? "active bg-primary text-white" : ""}`}"
                            @click="${() => this.changeView(button.id)}">
                            <i class="fa ${button.icon} me-2"></i>
                            <strong>${button.name}</strong>
                        </button>
                    `)}
                </div>
                <!-- Separator and buttons -->
                <div class="w-px bg-gray-200 mx-1"></div>
                <grid-notifications
                    class="d-flex align-items-stretch"
                    .notifications="${this.notifications || []}">
                </grid-notifications>
                <button class="btn btn-light">
                    <i class="fa fa-question-circle"></i>
                </button>
            </div>
        `;
    }

    render() {
        // Check if there is any project available
        if (!this.opencgaSession?.study) {
            return guardPage();
        }

        return html`
            <tool-header
                .title="${this._config.title || ""}"
                .rightContent="${this.renderHeaderRightContent()}">
            </tool-header>

            <variant-browser-filter
                .resource="${"VARIANT"}"
                .toolId="${this.COMPONENT_ID || ""}"
                .opencgaSession=${this.opencgaSession}
                .preparedQuery="${this.preparedQuery}"
                .executedQuery="${this.executedQuery}"
                .searchActive="${this.searchActive || false}"
                .config="${this._config.filter}"
                @queryChange="${this.onVariantFilterChange}"
                @querySearch="${this.onVariantFilterSearch}"
                @queryClear="${this.onVariantFilterClear}">
            </variant-browser-filter>

            <div class="${this.activeView === "table" ? "d-block" : "d-none"}">
                <variant-browser-grid
                    .toolId="${this.COMPONENT_ID}"
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
                    @settingsUpdate="${this.onSettingsUpdate}">
                </variant-browser-grid>

                ${this.variant ? html`
                    <variant-browser-detail
                        .variant="${this.variant}"
                        .opencgaSession="${this.opencgaSession}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .config="${this._config.filter.detail}">
                    </variant-browser-detail>
                ` : nothing}
            </div>

            <div class="${this.activeView === "aggregation" ? "d-block" : "d-none"}">
                <aggregation-stats
                    resource="VARIANT"
                    .query="${this.executedQuery}"
                    .active="${this.activeView === "aggregation"}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.aggregation}">
                </aggregation-stats>
            </div>

            <div class="${this.activeView === "genome" ? "d-block" : "d-none"}">
                ${this.variant ? html`
                    <genome-browser
                        .opencgaSession="${this.opencgaSession}"
                        .config="${this._config.genomeBrowser.config}"
                        .region="${this.variant}"
                        .tracks="${this._config.genomeBrowser.tracks}"
                        .active="${this.activeView === "genome"}">
                    </genome-browser>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Variant Browser",
            filter: {
                activeFilters: {
                    hiddenFields: [],
                    lockedFields: [],
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
                            {
                                id: "sample",
                                title: "Sample Filter (up to 3 samples)",
                                tooltip: "Select up to 3 samples"
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: false,
                                tooltip: tooltips.cohort,
                                studies: this.opencgaSession?.project?.studies
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        filters: [
                            {
                                id: "variant",
                                title: "Variant ID",
                                description: "Introduce a comma separated list of variant IDs. Example: 11:66923381:-:A",
                                tooltip: tooltips.variant,
                                quick: true,
                            },
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs",
                                description: "Select a feature from the list (gene, SNP, etc.)",
                                tooltip: tooltips.feature,
                                quick: true,
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
                                },
                                quick: true,
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
                                tooltip: tooltips.diseasePanels,
                                quick: true,
                            },
                            {
                                id: "clinical-annotation",
                                title: "Clinical Annotation",
                                tooltip: tooltips.clinical
                            },
                            {
                                id: "role-in-cancer",
                                title: "Gene Role In Cancer",
                                tooltip: tooltips.roleInCancer,
                                disabled: () => UtilsNew.compareVersions("2.6.0", this.opencgaSession.about.Version) < 0,
                                message: {
                                    visible: () => UtilsNew.compareVersions("2.6.0", this.opencgaSession.about.Version) < 0,
                                    text: "Gene Role in Cancer filter is only available from OpenCGA 2.6.0"
                                },
                                params: {
                                    rolesInCancer: ROLE_IN_CANCER
                                },
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
                                    .consequenceTypes="${variant?.annotation?.consequenceTypes}"
                                    .active="${active}">
                                </variant-consequence-type-view>
                            `,
                        },
                        {
                            id: "annotationPropFreq",
                            name: "Population Frequencies",
                            render: (variant, active) => html`
                                <cellbase-population-frequency-grid
                                    .populationFrequencies="${variant?.annotation?.populationFrequencies}"
                                    .active="${active}">
                                </cellbase-population-frequency-grid>
                            `,
                        },
                        {
                            id: "annotationClinical",
                            name: "Clinical",
                            render: variant => html`
                                <variant-annotation-clinical-view
                                    .traitAssociation="${variant?.annotation?.traitAssociation}"
                                    .geneTraitAssociation="${variant?.annotation?.geneTraitAssociation}">
                                </variant-annotation-clinical-view>
                            `,
                        },
                        {
                            id: "annotationPharmacogenomics",
                            name: "Pharmacogenomics",
                            render: variant => html`
                                <variant-annotation-pharmacogenomics-view
                                    .pharmacogenomics="${variant?.annotation?.pharmacogenomics}">
                                </variant-annotation-pharmacogenomics-view>
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
                            id: "notes",
                            name: "Notes",
                            render: (variant, active, opencgaSession) => html`
                                <variant-notes
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .active="${active}">
                                </variant-notes>
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
                                <json-viewer
                                    .data="${variant}"
                                    .active="${active}">
                                </json-viewer>
                            `,
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
                                // id: "consequence-type",
                                id: "consequenceType",
                                name: "Consequence Type",
                                type: "consequence-type",
                                // type: "string"
                                // render: facetId => html `
                                //     <consequence-type-select-filter
                                //         .ct="${this.preparedQuery.ct}"
                                //         .config="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                                //         @filterChange="${e => this.onNestedFacetFieldChange(e, facetId)}">
                                //     </consequence-type-select-filter>
                                // `,
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

}

customElements.define("variant-browser", VariantBrowser);
