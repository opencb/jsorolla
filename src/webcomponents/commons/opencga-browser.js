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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
import {guardPage} from "./html-utils.js";
import "./opencga-browser-filter.js";
import "./opencga-facet-result-view.js";
import "./opencb-facet-results.js";
import "./facet-filter.js";
import "../loading-spinner.js";
import "./tool-header.js";

export default class OpencgaBrowser extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            resource: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = "facet" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();

        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};

        this.activeView = "";

        this.activeFilterAlias = {};

        this.selectedFacet = {};
        this.preparedFacetQueryFormatted = {};
        this.detail = null;
    }

    firstUpdated() {
        UtilsNew.initTooltip(this);
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query") || changedProperties.has("opencgaSession")) {
            this.queryObserver();
        }

        if (changedProperties.has("selectedFacet")) {
            this.facetQueryBuilder();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.preparedQuery = {...this._config?.filter?.defaultFilter};
            this.executedQuery = {...this._config?.filter?.defaultFilter};
            this.detail = null;

            this.facetQuery = null;
            this.preparedFacetQueryFormatted = null;
        }
    }

    queryObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (!UtilsNew.isEmpty(this.query) && !UtilsNew.objectCompare(this.query, this.executedQuery)) {
                this.preparedQuery = {...this.query};
                this.executedQuery = {...this.query};

                // onServerFilterChange() in opencga-active-filters fires an activeFilterChange event when the Filter dropdown is used
                LitUtils.dispatchCustomEvent(this, "queryChange", undefined, this.preparedQuery);
                this.detail = null;
            }
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        if (this._config?.views) {
            const defaultActiveView = this._config.views.find(view => view.active);
            if (defaultActiveView) {
                this.activeView = defaultActiveView.id;
            }
        }
    }

    facetQueryBuilder() {
        this.facetQuery = null;

        if (Object.keys(this.selectedFacet).length) {
            this.executedFacetQueryFormatted = {...this.preparedFacetQueryFormatted};

            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                field: Object.values(this.preparedFacetQueryFormatted).map(v => v.formatted).join(";")
            };
            this.changeView("facet-tab");
        }
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", undefined, {
            query: query
        });
    }

    onRun() {
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in opencga-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        // TODO do the same with facetQuery
        this.executedQuery = {...this.preparedQuery};
        this.detail = null;
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);

        this.facetQueryBuilder();
        this.requestUpdate();
    }

    changeView(id) {
        this.activeView = id;
        this.requestUpdate();
    }

    onFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.searchActive = false;
        this.detail = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onFilterClear() {
        this.preparedQuery = {};
        this.executedQuery = {};
        this.searchActive = false;
        this.detail = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    // onQueryFilterChange(e) {
    //     this.preparedQuery = e.detail.query;
    //     this.requestUpdate();
    // }

    // onQueryFilterSearch(e) {
    //     this.preparedQuery = {...e.detail};
    //     this.executedQuery = {...e.detail};
    //     this.detail = null;
    //     this.notifySearch(this.preparedQuery);
    //     this.requestUpdate();
    // }

    // onActiveFilterChange(e) {
    //     this.preparedQuery = {...e.detail};
    //     this.executedQuery = {...e.detail};
    //     this.detail = null;
    //     this.notifySearch(this.preparedQuery);
    //     this.facetQueryBuilder();
    //     this.requestUpdate();
    // }

    // onActiveFilterClear() {
    //     this.preparedQuery = {};
    //     this.executedQuery = {};
    //     this.detail = null;
    //     this.notifySearch(this.preparedQuery);
    //     this.facetQueryBuilder();
    //     this.requestUpdate();
    // }

    onFacetQueryChange(e) {
        this.preparedFacetQueryFormatted = e.detail.value;
        // this.facetQueryBuilder();
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        this.preparedFacetQueryFormatted = {...e.detail};
        // this.onRun(); // TODO the query should be repeated every action on active-filter (delete, clear, load from Saved filter)
        this.facetQueryBuilder();
        this.requestUpdate();
    }

    onActiveFacetClear() {
        this.selectedFacet = {};
        this.onRun();
    }

    onClickRow(e) {
        this.detail = e.detail.row;
        this.requestUpdate();
    }

    onComponentUpdate() {
        this.detail = null;
        this.requestUpdate();
    }

    renderView() {
        if (!this._config.views) {
            return html`No view has been configured`;
        }

        return this._config.views.map(view => html`
            <div id="${view.id}" class="${this.activeView === view.id ? "d-block" : "d-none"}">
                ${view.render({
                    opencgaSession: this.opencgaSession,
                    config: this._config,
                    executedQuery: this.executedQuery,
                    detail: this.detail,
                    resource: this.resource,
                    facetQuery: this.facetQuery,
                    facetResults: this.facetResults,
                    eventNotifyName: this.eventNotifyName,
                    active: this.activeView === view.id,
                    onClickRow: event => this.onClickRow(event),
                    onComponentUpdate: event => this.onComponentUpdate(event),
                })}
            </div>
        `);
    }

    renderfilter() {
        if (this._config.filter.render) {
            // TODO can this be deleted?
            return html`
                <div class="tab-pane fade show active" id="filters_tab" role="tabpanel" >
                    ${this._config.filter.render({
                        opencgaSession: this.opencgaSession,
                        config: this._config,
                        query: this.preparedQuery,
                        onQueryFilterChange: this.onQueryFilterChange,
                        onQueryFilterSearch: this.onQueryFilterSearch,
                    })}
                </div>
            `;
        } else {
            return html`
                <div class="tab-pane active" id="filters_tab" role="tabpanel" >
                </div>
            `;
        }
    }

    renderAggregation() {
        if (typeof this._config?.aggregation?.render !== "function") {
            return html`${nothing}`;
        }

        return html `
            <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                ${this._config.aggregation.render({
                    config: this._config,
                    selectedFacet: this.selectedFacet,
                    onFacetQueryChange: this.onFacetQueryChange,
                })}
            </div>
        `;
    }

    renderHeaderRightContent() {
        return html`
            <div class="d-flex gap-1 align-items-stretch">
                <!-- View buttons -->
                <div class="d-flex align-items-center gap-1 border bg-gray-100 rounded-3 p-1">
                    ${(this._config.views || []).map(view => html`
                        <button
                            class="${`btn ${this.activeView === view.id ? "active bg-primary text-white" : ""}`}"
                            @click="${() => this.changeView(view.id)}">
                            <i class="fa ${view.icon} me-2"></i>
                            <strong>${view.name}</strong>
                        </button>
                    `)}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession?.study?.fqn) {
            return guardPage();
        }

        return html`
            ${this._config.showHeader ? html`
                <tool-header
                    .title="${this._config.title}"
                    .rightContent="${this.renderHeaderRightContent()}">
                </tool-header>
            ` : nothing}

            <!-- DEPRECATED
            <div class="d-flex gap-4" style="padding-right:21px">
                <div class="col-2">
                    <div class="d-grid gap-2 pb-3">
                        <button type="button" class="btn btn-primary" @click="${this.onRun}">
                            <i class="fa fa-search mx-1"></i>
                            <span class="fw-bold">${this._config.searchButtonText || "Search"}</span>
                        </button>
                    </div>
                    <ul class="nav nav-tabs mb-3" id="filterTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active fw-bold"
                                href="#filters_tab"
                                aria-controls="filters_tab"
                                aria-current="page"
                                aria-selected="true"
                                role="tab"
                                type="button"
                                data-bs-target="#filters_tab"
                                data-bs-toggle="tab"><span class="fw-bold fs-5">Filters</span>
                            </button>
                        </li>
                        ${this._config.aggregation ? html`
                            <li class="nav-item" role="presentation">
                                <button class="nav-link fw-bold"
                                    href="#facet_tab"
                                    aria-controls="facet_tab"
                                    aria-current="facet_tab"
                                    aria-selected="facet_tab"
                                    role="tab"
                                    type="button"
                                    data-bs-toggle="tab"
                                    data-bs-target="#facet_tab"><span class="fw-bold fs-5">Aggregation</span>
                                </button>
                            </li>
                        ` : null}
                    </ul>
                    <div class="tab-content">
                        ${this.renderfilter()}
                        ${this.renderAggregation()}
                    </div>
                </div>
            <opencga-active-filters
                facetActive
                .resource="${this.resource}"
                .opencgaSession="${this.opencgaSession}"
                .defaultStudy="${this.opencgaSession?.study?.fqn}"
                .query="${this.preparedQuery}"
                .executedQuery="${this.executedQuery}"
                .facetQuery="${this.preparedFacetQueryFormatted}"
                .executedFacetQuery="${this.executedFacetQueryFormatted}"
                .alias="${this.activeFilterAlias}"
                .config="${this._config?.filter?.activeFilters}"
                .filters="${this._config?.filter?.examples}"
                .defaultFilter="${this._config?.filter?.defaultFilter}"
                @activeFilterChange="${this.onActiveFilterChange}"
                @activeFilterClear="${this.onActiveFilterClear}"
                @activeFacetChange="${this.onActiveFacetChange}"
                @activeFacetClear="${this.onActiveFacetClear}">
            </opencga-active-filters>
            -->

            <opencga-browser-filter
                .preparedQuery="${this.preparedQuery}"
                .executedQuery="${this.executedQuery}"
                .resource="${this.resource}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config.filter}"
                @queryClear="${this.onFilterClear}"
                @queryChange="${this.onFilterChange}"
                @querySearch="${this.onFilterSearch}">
            </opencga-browser-filter>

            ${this.renderView()}
        `;
    }

    getDefaultConfig() {
        return {
            showHeader: true,
            searchButtonText: "Search",
        };
    }

}

customElements.define("opencga-browser", OpencgaBrowser);
