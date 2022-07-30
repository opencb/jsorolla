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
import UtilsNew from "../../core/utilsNew.js";
import LitUtils from "./utils/lit-utils.js";
import "./opencga-browser-filter.js";
import "./opencga-facet-result-view.js";
import "./opencga-active-filters.js";
import "./forms/select-field-filter.js";
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
        this.detail = {};
    }

    firstUpdated() {
        $(".bootstrap-select", this).selectpicker();
        UtilsNew.initTooltip(this);
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("selectedFacet")) {
            this.facetQueryBuilder();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.query = {
                study: this.opencgaSession.study.fqn,
            };
            this.preparedQuery = {
                study: this.opencgaSession.study.fqn,
            };
            this.facetQuery = null;
            this.preparedFacetQueryFormatted = null;
        }
    }

    queryObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (!UtilsNew.objectCompare(this.query, this._query)) {
                this._query = UtilsNew.objectClone(this.query);
                if (this.query) {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                    this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                } else {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn};
                    this.executedQuery = {study: this.opencgaSession.study.fqn};
                }
                // onServerFilterChange() in opencga-active-filters fires an activeFilterChange event when the Filter dropdown is used
                LitUtils.dispatchCustomEvent(this, "queryChange", undefined, {
                    ...this.preparedQuery,
                });
                this.detail = {};
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

    async onRun() {
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in opencga-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        // TODO do the same with facetQuery
        this.query = {...this.preparedQuery};
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);

        this.facetQueryBuilder();
    }

    onFilterChange(e) {
        this.query = e.detail;
    }

    changeView(id) {
        this.activeView = id;
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    // TODO review
    // this is used only in case of Search button inside filter component. Only in Clinical Analysis Browser.
    onQueryFilterSearch(e) {
        LitUtils.dispatchCustomEvent(this, "querySearch", undefined, {
            query: e.detail.query,
        });
    }

    onActiveFilterChange(e) {
        // console.log("onActiveFilterChange");
        this.preparedQuery = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.facetQueryBuilder();
    }

    onActiveFilterClear() {
        // console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.facetQueryBuilder();
    }

    onFacetQueryChange(e) {
        // console.log("onFacetQueryChange");
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
        this.requestUpdate();
    }

    onClickRow(e, resource) {
        this.detail = {
            ...this.detail,
            [resource]: e.detail.row,
        };
        this.requestUpdate();
    }

    renderView() {
        if (!this._config.views) {
            return html`No view has been configured`;
        }

        return this._config.views.map(view => html`
            <div id="${view.id}" class="content-tab ${this.activeView === view.id ? "active" : ""}">
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
                    onClickRow: (e, eventName) => this.onClickRow(e, eventName),
                })}
            </div>
        `);
    }

    renderfilter() {
        if (this._config.filter.render) {
            // TODO can this be deleted?
            return html`
                <div role="tabpanel" class="tab-pane active" id="filters_tab">
                    ${this._config.filter.render({
                        opencgaSession: this.opencgaSession,
                        config: this._config,
                        query: this.query,
                        onQueryFilterChange: this.onQueryFilterChange,
                        onQueryFilterSearch: this.onQueryFilterSearch,
                    })}
                </div>
            `;
        } else {
            return html`
                <div role="tabpanel" class="tab-pane active" id="filters_tab">
                    <opencga-browser-filter
                        .query="${this.query}"
                        .resource="${this.resource}"
                        .opencgaSession="${this.opencgaSession}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .config="${this._config.filter}"
                        @queryChange="${this.onQueryFilterChange}"
                        @querySearch="${this.onQueryFilterSearch}">
                    </opencga-browser-filter>
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

    renderButtonViews() {
        return html `
            <div class="content-pills" role="toolbar" aria-label="toolbar">
                ${(this._config.views || []).map(view => html`
                    <button
                        type="button"
                        class="btn btn-success ${this.activeView === view.id ? "active" : ""}"
                        ?disabled=${view.disabled}
                        @click="${() => this.changeView(view.id)}">
                        <i class="${view.icon ?? "fa fa-table"} icon-padding" aria-hidden="true"></i>
                        <strong>${view.name}</strong>
                    </button>
                `)}
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession?.study?.fqn) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            ${this._config.showHeader ? html`
                <tool-header
                    .title="${this._config.title}"
                    .icon="${this._config.icon}">
                </tool-header>
            ` : null}
            <div class="row">
                <div class="col-md-2">
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary btn-block" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                            <strong>${this._config.searchButtonText || "Search"}</strong>
                        </button>
                    </div>
                    <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                        <li role="presentation" class="active">
                            <a href="#filters_tab" aria-controls="filter" role="tab" data-toggle="tab">Filters</a>
                        </li>
                        ${this._config.aggregation ? html`
                            <li role="presentation">
                                <a href="#facet_tab" aria-controls="aggregation" role="tab" data-toggle="tab">Aggregation</a>
                            </li>
                        ` : null}
                    </ul>
                    <div class="tab-content">
                        ${this.renderfilter()}
                        ${this.renderAggregation()}
                    </div>
                </div>
                <div class="col-md-10">
                    ${this.renderButtonViews()}
                    <div>
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
                            .config="${this._config.activeFilters}"
                            .filters="${this._config.filter.examples}"
                            @activeFilterChange="${this.onActiveFilterChange}"
                            @activeFilterClear="${this.onActiveFilterClear}"
                            @activeFacetChange="${this.onActiveFacetChange}"
                            @activeFacetClear="${this.onActiveFacetClear}">
                        </opencga-active-filters>

                        <div class="main-view">
                            ${this.renderView()}
                        </div>
                        <!-- Other option: return an {string, TemplateResult} map -->
                        <div class="v-space"></div>
                    </div>
                </div>
            </div>
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
