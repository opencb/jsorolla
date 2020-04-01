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
import Utils from "../../utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-facet-result-view.js";
import "./opencga-active-filters.js";
import "./filters/select-field-filter.js";
import "./opencb-facet-results.js";
import "./facet-filter.js";
import "../../loading-spinner.js";
import "../variant/opencga-variant-detail-view.js";
import "../opencga/catalog/files/opencga-file-grid.js";
import "../opencga/catalog/files/opencga-file-filter.js";
import "../opencga/catalog/samples/opencga-sample-grid.js";
import "../opencga/catalog/samples/opencga-sample-filter.js";
import "../opencga/catalog/individual/opencga-individual-grid.js";
import "../opencga/catalog/individual/opencga-individual-filter.js";
import "../opencga/catalog/family/opencga-family-grid.js";
import "../opencga/catalog/family/opencga-family-filter.js";
import "../opencga/catalog/cohorts/opencga-cohort-grid.js";
import "../opencga/catalog/cohorts/opencga-cohort-filter.js";
import "../opencga/catalog/jobs/opencga-jobs-grid.js";
import "../opencga/catalog/jobs/opencga-jobs-filter.js";
import "../opencga/catalog/jobs/opencga-jobs-details.js";
import "../opencga/catalog/jobs/opencga-jobs-browser.js";
import "../opencga/catalog/jobs/jobs-timeline.js";
import "../clinical/opencga-clinical-analysis-grid.js";
import "../clinical/opencga-clinical-analysis-filter.js";

// this is the new opencga-browser

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
            search: {
                type: Object
            },
            config: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        this.checkProjects = false;

        this.activeFilterAlias = {
            "annot-xref": "XRef",
            "biotype": "Biotype",
            "annot-ct": "Consequence Types",
            "alternate_frequency": "Population Frequency",
            "annot-functional-score": "CADD",
            "protein_substitution": "Protein Substitution",
            "annot-go": "GO",
            "annot-hpo": "HPO"
        };

        this.fixedFilters = ["studies"];

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;


        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
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
        // this.renderView(this.resource);
        $(".bootstrap-select", this).selectpicker();
        this._initTooltip();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            // this.configObserver(); // since this is a general component there's no need of a private copy of config
        }
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

    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
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

    opencgaSessionObserver() {
        // debugger
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            // Update cohorts from config, this updates the Cohort filter MAF

            // TODO check WHERE this make sense
            for (const section of this._config.filter.sections) {
                for (const subsection of section.fields) {
                    if (subsection.id === "cohort") {
                        const projectFields = this.opencgaSession.project.alias.split("@");
                        const projectId = (projectFields.length > 1) ? projectFields[1] : projectFields[0];
                        this.cohorts = subsection.cohorts[projectId];
                        // this.set('cohorts', subsection.cohorts[projectId]);
                        // debugger
                    }
                }
            }

            this.checkProjects = true;
            this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        } else {
            this.checkProjects = false;
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
        }
    }

    _initTooltip() {
        // TODO move to Utils
        $("a[tooltip-title]", this).each(function() {
            $(this).qtip({
                content: {
                    title: $(this).attr("tooltip-title"),
                    text: $(this).attr("tooltip-text")
                },
                position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
                show: {delay: 200},
                hide: {fixed: true, delay: 300}
            });
        });
    }

    onFilterChange(e) {
        this.query = e.detail;
        // TODO remove search field everywhere. use query instead
        this.search = e.detail;
    }

    onHistogramChart(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        // TODO Refactor
        this.renderHistogramChart("#" + this._prefix + id + "Plot", id);

        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onPieChart(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        this.renderPieChart("#" + this._prefix + id + "Plot", id);
        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onTabularView(e) {
        this.highlightActivePlot(e.target.parentElement);
        const id = e.target.dataId;
        PolymerUtils.innerHTML(this._prefix + id + "Plot", "");
        PolymerUtils.show(this._prefix + id + "Table", "table");
    }

    highlightActivePlot(button) {
        // PolymerUtils.removeClass(".plots", "active");
        // PolymerUtils.addClass(button, "active");
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
        console.log("onActiveFilterChange on variant facet", e.detail);
        // TODO FIXME! studies prop have to be wiped off. use study instead
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
        $("#" + this._prefix + "FacetField", this).selectpicker("val", Object.keys(this.selectedFacet));
        this.onRun(); // TODO the query should be repeated every action on active-filter (delete, clear, load from Saved filter)
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        $("#" + this._prefix + "FacetField", this).selectpicker("val", "deselectAll");
        this.requestUpdate();
    }

    onClickRow(e) {
        console.log(e);
        this.detail = {...this.detail, [e.detail.resource]: e.detail.data};
        this.requestUpdate();
        console.log("this.detail", this.detail);
    }

    renderView(entity) {
        // TODO be sure to EXECUTE this function each template update, otherwise props in the following components won't be updated.
        // this function cannot be moved in firstUpdated()
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
            // TODO handle specific events
            case "files":
                this.endpoint = this.opencgaSession.opencgaClient.files();
                //this.mainView = html``;
                return html`
                            <div id="table-tab" class="content-tab active">
                                <opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                                           .config="${this._config.filter.grid}"
                                                           .query="${this.executedQuery}"
                                                           .search="${this.executedQuery}"
                                                           .eventNotifyName="${this.eventNotifyName}"
                                                           .files="${this.files}"
                                                           @selectfile="${this.onSelectFile}">
                                     </opencga-file-grid>
                                <h3> Annotation comparator</h3>
                                <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                           .opencgaSession="${this.opencgaSession}"
                                                           .config="${this._config}"
                                                           .entryIds="${this.files}"
                                                           entity="FILE">
                                </opencga-annotation-viewer>
                            </div>
                            ${facetView}`;
            case "samples":
                this.endpoint = this.opencgaSession.opencgaClient.samples();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-sample-grid .opencgaSession="${this.opencgaSession}"
                                                     .query="${this.executedQuery}"
                                                     .config="${this._config.filter.grid}"
                                                     .samples="${this.samples}"
                                                     .active="${true}"
                                                     @selectsample="${this.onSelectSample}">
                            </opencga-sample-grid>
                        </div>
                        ${facetView}`;
            case "individuals":
                this.endpoint = this.opencgaSession.opencgaClient.individuals();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-individual-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                 .opencgaSession="${this.opencgaSession}"
                                                 .config="${this._config.filter.grid}"
                                                 .eventNotifyName="${this.eventNotifyName}"
                                                 .individuals="${this.individuals}"
                                                 .query="${this.executedQuery}"
                                                 .active="${true}">
                            </opencga-individual-grid>


                            <h3> Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                       .opencgaSession="${this.opencgaSession}"
                                                       .config="${this._config}"
                                                       .entryIds="${this.individuals}"
                                                       entity="INDIVIDUAL">
                            </opencga-annotation-viewer>
                        </div>
                        ${facetView}`;
            case "cohort":
                this.endpoint = this.opencgaSession.opencgaClient.cohorts();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-cohort-grid .opencgaSession="${this.opencgaSession}"
                                                     .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                     .query="${this.executedQuery}"
                                                     .search="${this.executedQuery}"
                                                     .config="${this._config.filter.grid}"
                                                     .eventNotifyName="${this.eventNotifyName}"
                                                     .active="${true}"
                                                     @selectcohort="${this.onSelectCohort}">
                                                </opencga-cohort-grid>

                                <div style="padding-top: 5px">
                                    <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                        <li role="presentation" class="active">
                                            <a href="#${this._prefix}CohortViewer" role="tab" data-toggle="tab" class="detail-tab-title"
                                               data-id="info" @click="${this._changeBottomTab}">
                                                Cohort info
                                            </a>
                                        </li>

                                        <li role="presentation">
                                            <a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title"
                                               data-id="sampleGrid" @click="${this._changeBottomTab}">
                                                Sample grid
                                            </a>
                                        </li>
                                    </ul>

                                    <div class="tab-content" style="height: 680px">
                                        <div role="tabpanel" class="tab-pane active" id="${this._prefix}CohortViewer">
                                            Work in progress
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="${this._prefix}SampleViewer">
                                            <opencga-sample-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                                 .opencgaSession="${this.opencgaSession}"
                                                                 .search="${this.sampleSearch}"
                                                                 .active="${true}">
                                            </opencga-sample-grid>
                                        </div>

                                    </div>
                                </div>
                        </div>
                        ${facetView}`;
            case "family":
                this.endpoint = this.opencgaSession.opencgaClient.families();
                return html`

                        ${JSON.stringify(this.activeTab["facet-tab"]) } ${JSON.stringify(this.facetQuery)}
                        <div id="table-tab" class="content-tab active">
                            <opencga-family-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .query="${this.executedQuery}"
                                                .config="${this._config.filter.grid}"
                                                .eventNotifyName="${this.eventNotifyName}"
                                                .families="${this.families}"
                                                .search="${this.search}"
                                                .active="${true}"
                                                @selectfamily="${this.onSelectFamily}">
                            </opencga-family-grid>
                        </div>
                        ${facetView}`;
            case "clinical-analysis":
                this.endpoint = this.opencgaSession.opencgaClient.clinical();
                return html`
                        <div id="table-tab" class="content-tab active">
                            <opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter.grid}"
                                                            .analyses="${this._config.analyses}"
                                                            .query="${this.executedQuery}"
                                                            .search="${this.executedQuery}"
                                                            .active="${true}"
                                                            @selectanalysis="${this.onSelectClinicalAnalysis}">
                                </opencga-clinical-analysis-grid>

                                <div style="padding-top: 5px">
                                <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                    <li role="presentation" class="active">
                                        <a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title">Clinical Analysis Info</a>
                                    </li>
                                </ul>

                                    <div class="tab-content" style="height: 680px">
                                        <div role="tabpanel" class="tab-pane active" id="${this._prefix}SampleViewer">
                                            <clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                                .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                                .clinicalAnalysisId="${this._config.analysis.id}"
                                                                .config="${this._config.sampleDetail}">
                                            </clinical-analysis-view>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <!-- ${facetView} --> `;
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
                                            @clickRow="${this.onClickRow}">
                            </opencga-jobs-grid>
                            <opencga-jobs-details .opencgaSession="${this.opencgaSession}"
                                                  .config="${this._config.filter}"
                                                  .jobId="${1 || this.detail.job.id /* TODO fix */}"
                                                  .job="${this.detail.job}">
                            </opencga-jobs-details>
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

    /*    _filterComp(){
        return html`
             <opencga-file-filter discriminator="hardcoded"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter}"
                                                    .files="${this.files}"
                                                    .query="${this.query}"
                                                    .variableSets="${this.variableSets}"
                                                    .searchButton="${false}"
                                                    @queryChange="${this.onQueryFilterChange}"
                                                    @querySearch="${this.onQueryFilterSearch}">
             </opencga-file-filter>`
    }*/

    render() {
        return html`
        ${this.checkProjects ? html`
            <div class="page-title">
                <h2>
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h2>
            </div>

            <div class="row" style="padding: 0px 10px">
                <div class="col-md-2 left-menu">
                
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> Run
                        </button>
                    </div>
                    <ul class="nav nav-tabs left-menu-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a></li>
                        <li role="presentation"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>
                    </ul>
                    
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane active" id="filters_tab">
                                     
                            <!-- dynamic render doesn't work well with active-filter events  _filterComp ${this._filterComp} -->
                            
                            ${this.resource === "files" ? html`
                                <opencga-file-filter discriminator="hardcoded"  
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter}"
                                                    .files="${this.files}"
                                                    .query="${this.query}"
                                                    .variableSets="${this.variableSets}"
                                                    .searchButton="${false}"
                                                    @queryChange="${this.onQueryFilterChange}"
                                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-file-filter>
                            ` : null}
                            
                            ${this.resource === "samples" ? html`
                                <opencga-sample-filter  discriminator="hardcoded"  
                                                        .opencgaSession="${this.opencgaSession}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .config="${this._config.filter}"
                                                        .query="${this.query}"
                                                        .variableSets="${this.variableSets}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                                </opencga-sample-filter>
                            ` : null}
                            
                            ${this.resource === "individuals" ? html`
                                <opencga-individual-filter discriminator="hardcoded"  
                                                            .opencgaSession="${this.opencgaSession}"
                                                            .config="${this._config.filter}"
                                                            .query="${this.query}"
                                                            .search="${this.search}"
                                                            .variableSets="${this.variableSets}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                </opencga-individual-filter>
                            ` : null}                            
                            
                            ${this.resource === "family" ? html`
                                <opencga-family-filter  discriminator="hardcoded"  
                                                        .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter}"
                                                        .query="${this.query}"
                                                        .search="${this.search}"
                                                        .variableSets="${this.variableSets}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                                </opencga-family-filter>
                            ` : null}
                            
                            ${this.resource === "cohort" ? html`
                                <opencga-cohort-filter  discriminator="hardcoded"  
                                                        .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.filter}"
                                                        .query="${this.query}"
                                                        .search="${this.search}"
                                                        .variableSets="${this.variableSets}"
                                                        .searchButton="${false}"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                                </opencga-cohort-filter>
                            ` : null}
                            
                            ${this.resource === "clinical-analysis" ? html`
                                <opencga-clinical-analysis-filter   .opencgaSession="${this.opencgaSession}"
                                                                    .config="${this._config.filter}"
                                                                    .analyses="${this.config.analyses}"
                                                                    .search="${this.search}"
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
                        
                        <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                            <facet-filter .config="${this._config.aggregation}"
                                          .selectedFacet="${this.selectedFacet}"
                                          @facetQueryChange="${this.onFacetQueryChange}">
                            </facet-filter>
                        </div>
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
                                                .defaultStudy="${this.opencgaSession.study.alias}"
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
                        
                        <div class="v-space">
                        </div>
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
