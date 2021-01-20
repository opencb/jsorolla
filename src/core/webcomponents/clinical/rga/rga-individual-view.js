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
import UtilsNew from "../../../utilsNew.js";
import GridCommons from "../../commons/grid-commons.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./rga-individual-filter.js";
import "./rga-individual-grid.js";

export default class RgaIndividualView extends LitElement {

    constructor() {
        super();
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
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "rga-g-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
    }

    async onDownload(e) {

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

    onClickRow(e) {
        this.detail = e.detail.row;
        this.requestUpdate();
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Recessive Gene Analysis Browser",
            icon: "fas fa-dna",
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
                    },
                    complexFields: [],
                    hiddenFields: []
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Filters",
                        collapsed: false,
                        fields: [
                            {
                                id: "sex",
                                name: "Sex",
                                allowedValues: ["MALE", "FEMALE", "UNKNOWN", "UNDETERMINED"],
                                multiple: true,
                                description: ""
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
            },
            aggregation: {
                title: "Aggregation",
                default: [],
                sections: [
                ]
            }
        };
    }

    render() {
        return html`
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
                            <rga-individual-filter
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${this._config.filter}"
                                    .query="${this.query}"
                                    .searchButton="${false}"
                                    @queryChange="${this.onQueryFilterChange}"
                                    @querySearch="${this.onQueryFilterSearch}">
                            </rga-individual-filter>                                                               
                        </div>
                        
                        ${this._config.aggregation ? html`
                            <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                                <facet-filter2 .config="${this._config.aggregation}"
                                              .selectedFacet="${this.selectedFacet}"
                                              @facetQueryChange="${this.onFacetQueryChange}">
                                </facet-filter2>
                            </div>
                        ` : null}
                    </div>
                </div>

                <div class="col-md-10">
                    <div>
                        <opencga-active-filters .resource="${this.resource}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .defaultStudy="${this.opencgaSession?.study?.fqn}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .facetQuery="${this.selectedFacetFormatted}"
                                                .alias="${this.activeFilterAlias}"
                                                .config="${this._config?.activeFilters}"
                                                .filters="${this._config?.filter?.examples}"
                                                @activeFacetChange="${this.onActiveFacetChange}"
                                                @activeFacetClear="${this.onActiveFacetClear}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>

                        <div class="main-view">
                            <rga-individual-grid .opencgaSession="${this.opencgaSession}" .active="${true}"></rga-individual-grid>
                        </div>
                        <div class="v-space"></div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rga-individual-view", RgaIndividualView);
