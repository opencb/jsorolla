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
import "./tool-header.js";
import "../file/opencga-file-grid.js";
import "../file/opencga-file-filter.js";
import "../file/opencga-file-detail.js";
import "../sample/opencga-sample-grid.js";
import "../sample/sample-browser-filter.js";
import "../sample/opencga-sample-detail.js";
import "../individual/opencga-individual-grid.js";
import "../individual/opencga-individual-filter.js";
import "../individual/opencga-individual-detail.js";
import "../family/opencga-family-grid.js";
import "../family/opencga-family-filter.js";
import "../family/opencga-family-detail.js";
import "../cohort/opencga-cohort-grid.js";
import "../cohort/opencga-cohort-filter.js";
import "../cohort/opencga-cohort-detail.js";
import "../job/opencga-job-grid.js";
import "../job/opencga-job-filter.js";
import "../job/opencga-job-detail.js";
import "../job/opencga-job-browser.js";
import "../job/job-timeline.js";
import "../clinical/opencga-clinical-analysis-grid.js";
import "../clinical/opencga-clinical-analysis-filter.js";
import "../clinical/opencga-clinical-analysis-detail.js";


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
        this.executedQuery = {};

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
        // TODO we don't need _config anymore, this.config is enough here
        this._config = {...this.config};
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

            // TODO FIXME
            /** temp fix this.onRun(): when you switch study this.facetQuery contains the old study when you perform a new Aggregation query.
             *  As a consequence, we need to update preparedQuery as this.onRun() uses it (without it the old study is in query in table result as well)
             */
            this.preparedQuery = {study: this.opencgaSession.study.fqn};
            this.facetQuery = null;
            this.selectedFacetFormatted = null;
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
                // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
                this.dispatchEvent(new CustomEvent("queryChange", {
                    detail: this.preparedQuery
                }
                ));
                this.detail = {};
            } else {
                // console.error("same queries")
            }
            // this.requestUpdate();
        }
    }

    facetQueryBuilder() {
        if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // timeout: 60000,
                field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
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
        this.query = {...this.preparedQuery};
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);

        this.facetQueryBuilder();
        /* if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // timeout: 60000,
                field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
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
        for (const tab in this.activeTab) this.activeTab[tab] = false;
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

    onClickRow(e, resource) {
        this.detail = {...this.detail, [resource]: e.detail.row};
        this.requestUpdate();
    }

    renderView(entity) {
        // TODO be sure to EXECUTE this function each template update, otherwise props in the following components won't be updated.
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
            </div>`;
        switch (entity) {
            case "FILE":
                this.endpoint = this.opencgaSession.opencgaClient.files();
                return html`
                            <div id="table-tab" class="content-tab active">
                                <opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                                   .config="${this._config.filter.grid}"
                                                   .query="${this.executedQuery}"
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
            case "SAMPLE":
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
            case "INDIVIDUAL":
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
            case "COHORT":
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
            case "FAMILY":
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
            case "CLINICAL_ANALYSIS":
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
            case "JOB":
                this.endpoint = this.opencgaSession.opencgaClient.jobs();
                return html`
                    <div id="table-tab" class="content-tab active">
                         <opencga-job-grid .opencgaSession="${this.opencgaSession}"
                                         .config="${this._config.filter.grid}"
                                         .query="${this.executedQuery}"
                                         .search="${this.executedQuery}"
                                         .eventNotifyName="${this.eventNotifyName}"
                                         .files="${this.files}"
                                         @selectrow="${e => this.onClickRow(e, "job")}">
                         </opencga-job-grid>
                         <opencga-job-detail   .opencgaSession="${this.opencgaSession}"
                                                .config="${this._config.filter.detail}"
                                                .jobId="${this.detail.job?.id}">
                         </opencga-job-detail>
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
                                ${this.resource === "FILE" ? html`
                                    <opencga-file-filter    .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-file-filter>
                                ` : null}
                                
                                ${this.resource === "SAMPLE" ? html`
                                    <sample-browser-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </sample-browser-filter>
                                ` : null}
                                
                                ${this.resource === "INDIVIDUAL" ? html`
                                    <opencga-individual-filter  .opencgaSession="${this.opencgaSession}"
                                                                .config="${this._config.filter}"
                                                                .query="${this.query}"
                                                                .searchButton="${false}"
                                                                @queryChange="${this.onQueryFilterChange}"
                                                                @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-individual-filter>
                                ` : null}                            
                                
                                ${this.resource === "FAMILY" ? html`
                                    <opencga-family-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-family-filter>
                                ` : null}
                                
                                ${this.resource === "COHORT" ? html`
                                    <opencga-cohort-filter  .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .variableSets="${this.variableSets}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-cohort-filter>
                                ` : null}
                                
                                ${this.resource === "CLINICAL_ANALYSIS" ? html`
                                    <opencga-clinical-analysis-filter   .opencgaSession="${this.opencgaSession}"
                                                                        .config="${this._config.filter}"
                                                                        .query="${this.query}"
                                                                        .searchButton="${false}"
                                                                        @queryChange="${this.onQueryFilterChange}"
                                                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-clinical-analysis-filter>
                                ` : null}
                                
                                ${this.resource === "JOB" ? html`
                                    <opencga-job-filter .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter}"
                                                        .files="${this.files}"
                                                        .query="${this.query}"
                                                        .variableSets="${this.variableSets}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                                    </opencga-job-filter>
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
                                ${this._config.views && this._config.views.length ? this._config.views.map(tab => html`
                                    <button type="button" class="btn btn-success ripple content-pills ${tab.active ? "active" : ""}" ?disabled=${tab.disabled} @click="${this.onClickPill}" data-id="${tab.id}">
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
