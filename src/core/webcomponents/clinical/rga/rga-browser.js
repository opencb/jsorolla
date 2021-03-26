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
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter.js";
import "../../loading-spinner.js";
import "../../commons/tool-header.js";
import "./rga-gene-view.js";
// import "./rga-individual-view.js";
// import "./rga-variant-view.js";
import "./rga-gene-grid.js";
import "./rga-gene-filter.js";
import "./rga-individual-grid.js";
import "./rga-variant-grid.js";

export default class RgaBrowser extends LitElement {

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
            query: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + UtilsNew.randomString(6);
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};

        this.checkProjects = false;

        this.activeFilterAlias = {
        };
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.activeTab = {"gene-tab": true};
        this.detail = {};
        this.resource = "rga";

        // LoF as defaultQuery
        this.defaultQuery = {
            consequenceType: "transcript_ablation,splice_acceptor_variant,splice_donor_variant,stop_gained,frameshift_variant,stop_lost,start_lost,transcript_amplification,inframe_insertion,inframe_deletion",
            knockoutType: "COMP_HET"
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
        UtilsNew.initTooltip(this);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.checkProjects = true;
            this.query = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};


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
                    this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
                    this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
                }
                // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
                this.dispatchEvent(new CustomEvent("queryChange", {
                        detail: this.preparedQuery
                    }
                ));
                this.detail = {};
            } else {
                // console.error("same queries")
            }
            this.requestUpdate();
        }
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
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() here in rga-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        this.query = {...this.preparedQuery};
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);
    }

    onClickPill(e) {
        this._changeView(e.currentTarget.dataset.tabId);
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

    onFilterChange(e) {
        this.query = e.detail;
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
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
        this.onRun(); // TODO the query should be repeated every action on active-filter (delete, clear, load from Saved filter)
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        this.onRun();
        this.requestUpdate();
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Recessive Variant Browser",
            icon: "fas fa-dna",
            active: false,
            searchButtonText: "Search",
            views: [
                {
                    id: "gene-tab",
                    name: "Gene",
                    icon: "fa fa-table",
                    active: true
                },
                {
                    id: "individual-tab",
                    name: "Individuals",
                    icon: "fas fa-table"
                },
                {
                    id: "variant-tab",
                    name: "Variant",
                    icon: "fas fa-table"
                }
            ],
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types"
                    },
                    complexFields: [],
                    hiddenFields: []
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Gene",
                        collapsed: false,
                        fields: [
                            {
                                id: "geneName",
                                name: "Gene",
                                description: "Gene selection"
                            },
                            {
                                id: "knockoutType",
                                name: "Knockout Type",
                                allowedValues: ["COMP_HET", "HOM_ALT"]
                            }
                        ]
                    },
                    {
                        title: "Individual",
                        collapsed: false,
                        fields: [
                            {
                                id: "individualId",
                                name: "Individual",
                                description: "Individual selection"
                            }
                        ]
                    },
                    {
                        title: "Confidence",
                        fields: [
                            {
                                id: "numParents",
                                name: "Include families with",
                                description: "description....",
                                type: "checkbox",
                                allowedValues: [{id: 0, name: "No parents"}, {id: 1, name: "One parent"}, {id: 2, name: "Two parents"}]
                            },
                            {
                                id: "probandOnly",
                                name: "Affected individuals (proband) only",
                                type: "boolean",
                                defaultValue: "no",
                                tooltip: "other info here"
                                // allowedValues: ["father", "mother"]
                            }
                        ]
                    },
                    {
                        title: "Variants",
                        fields: [
                            {
                                id: "cohort",
                                name: "Cohort",
                                description: "Cohort selection"
                            },
                            {
                                id: "populationFrequencyAlt",
                                name: "",
                                type: "POPULATION_FREQUENCY_FILTER",
                                onlyPopFreqAll: true
                            },
                            {
                                id: "type",
                                name: "Variant types",
                                types: ["SNV", "INDEL", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                                // layout: "horizontal"
                            },
                            {
                                id: "consequenceType",
                                name: "Consequence type",
                                tooltip: tooltips.consequenceTypeSelect,
                                value: consequenceTypes.lof
                            },
                            {
                                id: "clinicalSignificance",
                                name: "Clinical Significance",
                                type: "CLINVAR_ACCESSION_FILTER"
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "BRCA2 missense variants",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            ct: "missense_variant"
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
                        }
                    ]
                }
            }
        };
    }

    render() {
        return html`
            
            <style>
                .rga-individual-box {
                    border: 1px solid #8a8a8a;
                    width: 12px;
                    height: 16px;
                    display: inline-block;
                    margin-right: 1px;
                }

            </style>
            
            ${this.checkProjects ? html`
                <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>
                <div class="row">
                    <div class="col-md-2">
                        <div class="search-button-wrapper">
                            <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                                <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this._config.searchButtonText || "Run"}
                            </button>
                        </div>
                        <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                            <li role="presentation" class="active">
                                <a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a>
                            </li>
                            ${this._config.aggregation ? html`<li role="presentation"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>` : null}
                        </ul>
                        
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane active" id="filters_tab">
                                <rga-gene-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .config="${this._config.filter}"
                                        .query="${this.query}"
                                        .searchButton="${false}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                </rga-gene-filter>
                            </div>
                            
                            ${this._config.aggregation ? html`
                                <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                                    <facet-filter .config="${this._config.aggregation}"
                                                  .selectedFacet="${this.selectedFacet}"
                                                  @facetQueryChange="${this.onFacetQueryChange}">
                                    </facet-filter>
                                </div>
                            ` : null}
                        </div>
                    </div>
    
                    <div class="col-md-10">
                        <!-- tabs buttons -->
                        <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                            <div class="btn-group" role="group" style="margin-left: 0px">
                                ${this._config.views && this._config.views.length ? this._config.views.map(tab => html`
                                    <button type="button" class="btn btn-success ripple content-pills ${this.activeTab[tab.id] ? "active" : ""}" ?disabled=${tab.disabled} @click="${this.onClickPill}" data-tab-id="${tab.id}">
                                        <i class="${tab.icon ?? "fa fa-table"} icon-padding" aria-hidden="true"></i> ${tab.name}
                                    </button>
                                `) : html`No view has been configured`}
                            </div>
                        </div>
                        
                        <div>
                            <opencga-active-filters facetActive 
                                                    .resource="${this.resource}"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .defaultStudy="${this.opencgaSession?.study?.fqn}"
                                                    .query="${this.preparedQuery}"
                                                    .refresh="${this.executedQuery}"
                                                    .facetQuery="${this.selectedFacetFormatted}"
                                                    .alias="${this.activeFilterAlias}"
                                                    .config="${this._config.activeFilters}"
                                                    .filters="${this._config.filter.examples}"
                                                    @activeFacetChange="${this.onActiveFacetChange}"
                                                    @activeFacetClear="${this.onActiveFacetClear}"
                                                    @activeFilterChange="${this.onActiveFilterChange}"
                                                    @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>

                            <div class="main-view">
                                <div id="gene-tab" class="content-tab active">
                                    <rga-gene-grid .query=${this.executedQuery} .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["gene-tab"]}"></rga-gene-grid>
                                </div>

                                <div id="individual-tab" class="content-tab">
                                    <rga-individual-grid .query=${this.executedQuery} .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["individual-tab"]}"></rga-individual-grid>
                                </div>

                                <div id="variant-tab" class="content-tab">
                                    <rga-variant-grid .query=${this.executedQuery} .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["variant-tab"]}"></rga-variant-grid>
                                </div>
                                
                            </div>
                            
                            <div class="v-space"></div>
                        </div>
                    </div>
                </div>
            ` : html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `}
        `;
    }

}

customElements.define("rga-browser", RgaBrowser);
