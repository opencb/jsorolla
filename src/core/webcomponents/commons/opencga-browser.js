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
import UtilsNew from "../../utilsNew.js";
import "./opencga-facet-result-view.js";
import "./opencga-active-filters.js";
import "./filters/select-field-filter.js";
import "./opencb-facet-results.js";
import "./facet-filter.js";
import "../loading-spinner.js";
import "../tool-header.js";
import "../files/opencga-file-grid.js";
import "../files/opencga-file-filter.js";
import "../files/opencga-file-detail.js";
import "../samples/opencga-sample-grid.js";
import "../samples/opencga-sample-filter.js";
import "../samples/opencga-sample-detail.js";
import "../individual/opencga-individual-grid.js";
import "../individual/opencga-individual-filter.js";
import "../individual/opencga-individual-detail.js";
import "../family/opencga-family-grid.js";
import "../family/opencga-family-filter.js";
import "../family/opencga-family-detail.js";
import "../cohorts/opencga-cohort-grid.js";
import "../cohorts/opencga-cohort-filter.js";
import "../cohorts/opencga-cohort-detail.js";
import "../jobs/opencga-jobs-grid.js";
import "../jobs/opencga-jobs-filter.js";
import "../jobs/opencga-jobs-detail.js";
import "../jobs/opencga-jobs-browser.js";
import "../jobs/jobs-timeline.js";
import "../clinical/opencga-clinical-analysis-grid.js";
import "../clinical/opencga-clinical-analysis-filter.js";
import "../clinical/opencga-clinical-analysis-detail.js";

// TODO spring-cleaning the old code
// TODO maybe remove this._config, this.config is enough here
// TODO fix props in EACH opencga-x-filter


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

        this.checkProjects = false;

        this.activeFilterAlias = {
        };

        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.activeTab = {};
        this.detail = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // TODO we don't need _config anymore
        this._config = {...this.config};
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
        if (changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession && this.opencgaSession.project) {
            this.checkProjects = true;
            this.query = {study: this.opencgaSession.study.fqn};
            this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        } else {
            this.checkProjects = false;
        }
    }

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && this.opencgaSession && this.opencgaSession.study) {
            _query = {
                study: this.opencgaSession.study.fqn
            };
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = {..._query, ...this.query};
            this.executedQuery = {..._query, ...this.query};
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {detail: this.preparedQuery}));
        this.detail = {};
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
        // this event keeps in sync the query object in opencga-browser with the general one in iva-app (this.queries)
        // it is also in charge of update executedQuery (notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in opencga-browser).
        // if we want to dismiss the general query feature (that is browsers remembering your last query even if you change view) replace the following line with:
        // this.executedQuery = {...this.preparedQuery}; this.requestUpdate();
        this.notifySearch(this.preparedQuery);

        if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                //timeout: 60000,
                field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
           this.facetQuery = null;
        }
    }

    onFilterChange(e) {
        this.query = e.detail;
    }

    onClickPill(e) {
        // e.preventDefault();
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
        //$("#" + this._prefix + "FacetField", this).selectpicker("val", Object.keys(this.selectedFacet)); //TODO recheck it seems not necessary (the facet select is now in facet-filter)
        this.onRun(); // TODO the query should be repeated every action on active-filter (delete, clear, load from Saved filter)
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        //$("#" + this._prefix + "FacetField", this).selectpicker("deselectAll"); //TODO recheck it seems not necessary (the facet select is now in facet-filter)
        this.onRun();
        this.requestUpdate();
    }

    onClickRow(e, resource) {
        console.log(e);
        this.detail = {...this.detail, [resource]: e.detail.row};
        this.requestUpdate();
    }

    renderView(entity) {
        // TODO be sure to EXECUTE this function each template update, otherwise props in the following components won't be updated.
        // possible modular solution (which still doesn't solve the update filter issue): map of TemplateResult: renderView(entity).mainView
        const facetView = html`<div id="facet-tab" class="content-tab">
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
            case "files":
                this.endpoint = this.opencgaSession.opencgaClient.files();
                return html`
                            <div id="table-tab" class="content-tab active">
                                <opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                                   .config="${this._config.filter.grid}"
                                                   .query="${this.executedQuery}"
                                                   .search="${this.executedQuery}"
                                                   .eventNotifyName="${this.eventNotifyName}"
                                                    @selectrow="${e => this.onClickRow(e, "file")}">
                                </opencga-file-grid>
                                <opencga-file-detail    .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter.detail}"
                                                        .fileId="${this.detail.file?.id}">
                                </opencga-file-detail>
                            </div>
                            ${facetView}
                            `;
            case "samples":
                this.endpoint = this.opencgaSession.opencgaClient.samples();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-sample-grid .opencgaSession="${this.opencgaSession}"
                                                     .query="${this.executedQuery}"
                                                     .config="${this._config.filter.grid}"
                                                     .active="${true}"
                                                     @selectsample="${this.onSelectSample}"
                                                     @selectrow="${e => this.onClickRow(e, "sample")}">
                            </opencga-sample-grid>
                            <opencga-sample-detail  .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter.detail}"
                                                    .sampleId="${this.detail.sample?.id}">
                            </opencga-sample-detail>
                        </div>
                        ${facetView}`;
            case "individuals":
                this.endpoint = this.opencgaSession.opencgaClient.individuals();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-individual-grid .opencgaSession="${this.opencgaSession}"
                                                     .config="${this._config.filter.grid}"
                                                     .eventNotifyName="${this.eventNotifyName}"
                                                     .query="${this.executedQuery}"
                                                     .active="${true}"
                                                     @selectrow="${e => this.onClickRow(e, "individual")}">
                            </opencga-individual-grid>
                            <opencga-individual-detail  .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter.detail}"
                                                        .individualId="${this.detail.individual?.id}">
                            </opencga-individual-detail>
                        </div>
                        ${facetView}`;
            case "cohort":
                this.endpoint = this.opencgaSession.opencgaClient.cohorts();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-cohort-grid   .opencgaSession="${this.opencgaSession}"
                                                   .query="${this.executedQuery}"
                                                   .search="${this.executedQuery}"
                                                   .config="${this._config.filter.grid}"
                                                   .eventNotifyName="${this.eventNotifyName}"
                                                   .active="${true}"
                                                   @selectrow="${e => this.onClickRow(e, "cohort")}">
                            </opencga-cohort-grid>
                            <opencga-cohort-detail  .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter.detail}"
                                                    .cohortId="${this.detail.cohort?.id}">
                            </opencga-cohort-detail>
                        </div>
                        ${facetView}`;
            case "family":
                this.endpoint = this.opencgaSession.opencgaClient.families();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-family-grid .opencgaSession="${this.opencgaSession}"
                                                 .query="${this.executedQuery}"
                                                 .config="${this._config.filter.grid}"
                                                 .active="${true}"
                                                 .eventNotifyName="${this.eventNotifyName}"
                                                 @selectrow="${e => this.onClickRow(e, "family")}">
                            </opencga-family-grid>
                            <opencga-family-detail  .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter.detail}"
                                                    .family="${this.detail.family}">
                            </opencga-family-detail>
                        </div>
                        ${facetView}`;
            case "clinical-analysis":
                this.endpoint = this.opencgaSession.opencgaClient.clinical();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter.grid}"
                                                            .query="${this.executedQuery}"
                                                            .search="${this.executedQuery}"
                                                            .active="${true}"
                                                            @selectanalysis="${this.onSelectClinicalAnalysis}"
                                                            @selectrow="${e => this.onClickRow(e, "clinicalAnalysis")}">
                            </opencga-clinical-analysis-grid>
                            <opencga-clinical-analysis-detail   .opencgaSession="${this.opencgaSession}"
                                                                .config="${this._config.filter.detail}"
                                                                .clinicalAnalysisId="${this.detail.clinicalAnalysis?.id}">
                            </opencga-clinical-analysis-detail>
                        </div>
                        `;
            case "jobs":
                this.endpoint = this.opencgaSession.opencgaClient.jobs();
                return html`
                    <div id="table-tab" class="content-tab active">
                         <opencga-jobs-grid .opencgaSession="${this.opencgaSession}"
                                         .config="${this._config.filter.grid}"
                                         .query="${this.executedQuery}"
                                         .search="${this.executedQuery}"
                                         .eventNotifyName="${this.eventNotifyName}"
                                         .files="${this.files}"
                                         @selectrow="${e => this.onClickRow(e, "job")}">
                         </opencga-jobs-grid>
                         <opencga-jobs-detail   .opencgaSession="${this.opencgaSession}"
                                                .config="${this._config.filter.detail}"
                                                .jobId="${this.detail.job?.id}">
                         </opencga-jobs-detail>
                    </div>
                    ${facetView}
                    <div id="visual-browser-tab" class="content-tab">
                        <jobs-timeline  .opencgaSession="${this.opencgaSession}"
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
            ${this.checkProjects ? html`
                <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>
                <div class="row">
                    <div class="col-md-2">
                        <div class="search-button-wrapper">
                            <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                                <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this._config.filter.searchButtonText || "Run"}
                            </button>
                        </div>
                        <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                            <li role="presentation" class="active"><a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a></li>
                            ${this._config.aggregation ? html`<li role="presentation"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>` : null}
                        </ul>
                        
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane active" id="filters_tab">
                                ${this.resource === "files" ? html`
                                    <opencga-file-filter    .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-file-filter>
                                ` : null}
                                
                                ${this.resource === "samples" ? html`
                                    <opencga-sample-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-sample-filter>
                                ` : null}
                                
                                ${this.resource === "individuals" ? html`
                                    <opencga-individual-filter  .opencgaSession="${this.opencgaSession}"
                                                                .config="${this._config.filter}"
                                                                .query="${this.query}"
                                                                .searchButton="${false}"
                                                                @queryChange="${this.onQueryFilterChange}"
                                                                @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-individual-filter>
                                ` : null}                            
                                
                                ${this.resource === "family" ? html`
                                    <opencga-family-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-family-filter>
                                ` : null}
                                
                                ${this.resource === "cohort" ? html`
                                    <opencga-cohort-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .variableSets="${this.variableSets}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-cohort-filter>
                                ` : null}
                                
                                ${this.resource === "clinical-analysis" ? html`
                                    <opencga-clinical-analysis-filter   .opencgaSession="${this.opencgaSession}"
                                                                        .config="${this._config.filter}"
                                                                        .query="${this.query}"
                                                                        .searchButton="${false}"
                                                                        @queryChange="${this.onQueryFilterChange}"
                                                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-clinical-analysis-filter>
                                ` : null}
                                
                                ${this.resource === "jobs" ? html`
                                    <opencga-jobs-filter .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter}"
                                                        .files="${this.files}"
                                                        .query="${this.query}"
                                                        .variableSets="${this.variableSets}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-jobs-filter>
                                ` : null}                                
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
                                ${this._config.views && this._config.views.length ? this._config.views.map( tab => html`
                                    <button type="button" class="btn btn-success ripple content-pills ${tab.active ? "active" : ""}" @click="${this.onClickPill}" data-id="${tab.id}">
                                        <i class="fa fa-table icon-padding" aria-hidden="true"></i> ${tab.name}
                                    </button>
                                `) : html`No view has been configured`}
                            </div>
                        </div>
                        
                        <div>
                            <opencga-active-filters facetActive 
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .defaultStudy="${this.opencgaSession.study.fqn}"
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
                                ${this.renderView(this.resource)}
                            </div>
                            
                            <!-- Other option: return an {string, TemplateResult} map ${this.renderView(this.resource).facetView} -->
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
