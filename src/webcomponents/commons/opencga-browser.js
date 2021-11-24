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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "./opencga-facet-result-view.js";
import "./opencga-active-filters.js";
import "./forms/select-field-filter.js";
import "./opencb-facet-results.js";
import "./facet-filter.js";
import "../loading-spinner.js";
import "./tool-header.js";
import "../file/opencga-file-grid.js";
import "../file/opencga-file-filter.js";
import "../file/opencga-file-detail.js";
import "../sample/opencga-sample-grid.js";
import "../sample/sample-browser-filter.js";
import "../sample/opencga-sample-detail.js";
import "../individual/individual-grid.js";
import "../individual/individual-browser-filter.js";
import "../individual/individual-detail.js";
import "../family/opencga-family-grid.js";
import "../family/opencga-family-filter.js";
import "../family/opencga-family-detail.js";
import "../cohort/cohort-grid.js";
import "../cohort/cohort-browser-filter.js";
import "../cohort/cohort-detail.js";
import "../job/job-grid.js";
import "../job/opencga-job-filter.js";
import "../job/opencga-job-detail.js";
import "../job/opencga-job-browser.js";
import "../job/job-timeline.js";
import "../clinical/clinical-analysis-grid.js";
import "../clinical/clinical-analysis-browser-filter.js";
import "../clinical/clinical-analysis-detail.js";


export default class OpencgaBrowser extends LitElement {

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
            resource: {
                type: String
            },
            opencgaSession: {
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

    _init() {
        this._prefix = "facet" + UtilsNew.randomString(6);

        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};

        this.checkProjects = false;

        this.activeFilterAlias = {
        };

        this.selectedFacet = {};
        this.preparedFacetQueryFormatted = {};
        this.activeTab = {};
        this.detail = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // we don't need _config here
    }

    firstUpdated(_changedProperties) {
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
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.checkProjects = true;
            this.query = {study: this.opencgaSession.study.fqn};

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
                this.dispatchEvent(new CustomEvent("queryChange", {
                    detail: this.preparedQuery
                }));
                this.detail = {};
            } else {
                // console.error("same queries")
            }
            // this.requestUpdate();
        }
    }

    facetQueryBuilder() {
        if (Object.keys(this.selectedFacet).length) {
            this.executedFacetQueryFormatted = {...this.preparedFacetQueryFormatted};

            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // timeout: 60000,
                field: Object.values(this.preparedFacetQueryFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
            this.facetQuery = null;
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
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in opencga-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        // TODO do the same with facetQuery
        this.query = {...this.preparedQuery};
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);

        this.facetQueryBuilder();
        // this.requestUpdate();

        /* if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // timeout: 60000,
                field: Object.values(this.preparedFacetQueryFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
            this.facetQuery = null;
        }*/
    }

    onFilterChange(e) {
        this.query = e.detail;
    }

    onClickPill(e) {
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        Object.keys(this.activeTab).forEach(tab => {
            this.activeTab[tab] = false;
        });
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        // console.log("onQueryFilterChange")
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    // TODO review
    // this is used only in case of Search button inside filter component. Only in Clinical Analysis Browser.
    onQueryFilterSearch(e) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: e.detail.query
            }
        }));
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

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        this.onRun();
        this.requestUpdate();
    }

    onClickRow(e, resource) {
        this.detail = {...this.detail, [resource]: e.detail.row};
        this.requestUpdate();
    }

    renderView(entity) {
        // TODO be sure to execute this function each template update, otherwise props in the following components won't be updated.
        // possible modular solution (which still doesn't solve the update filter issue): map of TemplateResult: renderView(entity).mainView
        const facetView = html`
            <div id="facet-tab" class="content-tab">
                <opencb-facet-results
                    resource="${this.resource}"
                    .opencgaSession="${this.opencgaSession}"
                    .active="${this.activeTab["facet-tab"]}"
                    .query="${this.facetQuery}"
                    .data="${this.facetResults}">
                </opencb-facet-results>
            </div>
        `;

        switch (entity) {
            case "FILE":
                this.endpoint = this.opencgaSession.opencgaClient.files();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <opencga-file-grid
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.result.grid}"
                            .query="${this.executedQuery}"
                            .eventNotifyName="${this.eventNotifyName}"
                            @selectrow="${e => this.onClickRow(e, "file")}">
                        </opencga-file-grid>
                        <opencga-file-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .fileId="${this.detail.file?.id}">
                        </opencga-file-detail>
                    </div>
                    ${facetView}
                `;
            case "SAMPLE":
                this.endpoint = this.opencgaSession.opencgaClient.samples();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <opencga-sample-grid
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.executedQuery}"
                            .config="${this.config.filter.result.grid}"
                            .active="${true}"
                            @selectrow="${e => this.onClickRow(e, "sample")}">
                        </opencga-sample-grid>
                        <opencga-sample-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .sampleId="${this.detail.sample?.id}">
                        </opencga-sample-detail>
                    </div>
                    ${facetView}`;
            case "INDIVIDUAL":
                this.endpoint = this.opencgaSession.opencgaClient.individuals();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <individual-grid
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.result.grid}"
                            .eventNotifyName="${this.eventNotifyName}"
                            .query="${this.executedQuery}"
                            .active="${true}"
                            @selectrow="${e => this.onClickRow(e, "individual")}">
                        </individual-grid>
                        <individual-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .individualId="${this.detail.individual?.id}">
                        </individual-detail>
                    </div>
                    ${facetView}`;
            case "COHORT":
                this.endpoint = this.opencgaSession.opencgaClient.cohorts();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <cohort-grid
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.executedQuery}"
                            .search="${this.executedQuery}"
                            .config="${this.config.filter.result.grid}"
                            .eventNotifyName="${this.eventNotifyName}"
                            .active="${true}"
                            @selectrow="${e => this.onClickRow(e, "cohort")}">
                        </cohort-grid>
                        <cohort-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .cohortId="${this.detail.cohort?.id}">
                        </cohort-detail>
                    </div>
                    ${facetView}`;
            case "FAMILY":
                this.endpoint = this.opencgaSession.opencgaClient.families();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <opencga-family-grid
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.executedQuery}"
                            .config="${this.config.filter.result.grid}"
                            .active="${true}"
                            .eventNotifyName="${this.eventNotifyName}"
                            @selectrow="${e => this.onClickRow(e, "family")}">
                        </opencga-family-grid>
                        <opencga-family-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .family="${this.detail.family}">
                        </opencga-family-detail>
                    </div>
                    ${facetView}`;
            case "CLINICAL_ANALYSIS":
                this.endpoint = this.opencgaSession.opencgaClient.clinical();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <clinical-analysis-grid
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.result.grid}"
                            .query="${this.executedQuery}"
                            .search="${this.executedQuery}"
                            .active="${true}"
                            @selectanalysis="${this.onSelectClinicalAnalysis}"
                            @selectrow="${e => this.onClickRow(e, "clinicalAnalysis")}">
                        </clinical-analysis-grid>
                        <clinical-analysis-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .clinicalAnalysisId="${this.detail.clinicalAnalysis?.id}">
                        </clinical-analysis-detail>
                    </div>
                `;
            case "JOB":
                this.endpoint = this.opencgaSession.opencgaClient.jobs();
                return html`
                    <div id="table-tab" class="content-tab active">
                        <job-grid
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.result.grid}"
                            .query="${this.executedQuery}"
                            .search="${this.executedQuery}"
                            .eventNotifyName="${this.eventNotifyName}"
                            .files="${this.files}"
                            @selectrow="${e => this.onClickRow(e, "job")}">
                        </job-grid>
                        <opencga-job-detail
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this.config.filter.detail}"
                            .jobId="${this.detail.job?.id}">
                        </opencga-job-detail>
                    </div>
                    ${facetView}
                    <div id="visual-browser-tab" class="content-tab">
                        <jobs-timeline
                            .opencgaSession="${this.opencgaSession}"
                            .active="${this.activeTab["visual-browser-tab"]}"
                            .query="${this.executedQuery}">
                        </jobs-timeline>
                    </div>
                `;
            default:
                return html`entity not recognized`;
        }
    }

    render() {
        return html`
            <!--<div class="alert alert-info">selectedFacet: \${JSON.stringify(this.selectedFacet)}</div>
            <div class="alert alert-info">preparedFacetQueryFormatted: \${JSON.stringify(this.preparedFacetQueryFormatted)}</div>
            <div class="alert alert-info">executedFacetQueryFormatted:\${JSON.stringify(this.executedFacetQueryFormatted)}</div>-->

            ${this.checkProjects ? html`
                <tool-header title="${this.config.title}" icon="${this.config.icon}"></tool-header>
                <div class="row">
                    <div class="col-md-2">
                        <div class="search-button-wrapper">
                            <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                                <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this.config.searchButtonText || "Search"}
                            </button>
                        </div>
                        <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                            <li role="presentation" class="active">
                                <a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a>
                            </li>
                            ${this.config.aggregation ? html`
                                <li role="presentation">
                                    <a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a>
                                </li>
                            ` : null}
                        </ul>
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane active" id="filters_tab">
                                ${this.resource === "FILE" ? html`
                                    <opencga-file-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-file-filter>
                                ` : null}

                                ${this.resource === "SAMPLE" ? html`
                                    <sample-browser-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </sample-browser-filter>
                                ` : null}

                                ${this.resource === "INDIVIDUAL" ? html`
                                    <individual-browser-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </individual-browser-filter>
                                ` : null}

                                ${this.resource === "FAMILY" ? html`
                                    <opencga-family-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-family-filter>
                                ` : null}

                                ${this.resource === "COHORT" ? html`
                                    <cohort-browser-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        .variableSets="${this.variableSets}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </cohort-browser-filter>
                                ` : null}

                                ${this.resource === "CLINICAL_ANALYSIS" ? html`
                                    <clinical-analysis-browser-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </clinical-analysis-browser-filter>
                                ` : null}

                                ${this.resource === "JOB" ? html`
                                    <opencga-job-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this.config.filter}"
                                        .files="${this.files}"
                                        .query="${this.query}"
                                        .variableSets="${this.variableSets}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-job-filter>
                                ` : null}
                            </div>

                            ${this.config.aggregation ? html`
                                <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                                    <facet-filter
                                        .config="${this.config.aggregation}"
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
                                ${this.config.views && this.config.views.length ? this.config.views.map(tab => html`
                                    <button
                                        type="button"
                                        class="btn btn-success ripple content-pills ${tab.active ? "active" : ""}"
                                        ?disabled=${tab.disabled}
                                        @click="${this.onClickPill}"
                                        data-id="${tab.id}">
                                        <i class="${tab.icon ?? "fa fa-table"} icon-padding" aria-hidden="true"></i> ${tab.name}
                                    </button>
                                `) : html`No view has been configured`}
                            </div>
                        </div>

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
                                .config="${this.config.activeFilters}"
                                .filters="${this.config.filter.examples}"
                                @activeFilterChange="${this.onActiveFilterChange}"
                                @activeFilterClear="${this.onActiveFilterClear}"
                                @activeFacetChange="${this.onActiveFacetChange}"
                                @activeFacetClear="${this.onActiveFacetClear}">
                            </opencga-active-filters>

                            <div class="main-view">
                                ${this.renderView(this.resource)}
                            </div>

                            <!-- Other option: return an {string, TemplateResult} map -->
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

customElements.define("opencga-browser", OpencgaBrowser);
