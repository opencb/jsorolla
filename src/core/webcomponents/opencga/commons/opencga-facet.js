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
// import "./opencga-variant-filter.js";
import "./opencga-facet-result-view.js";
import "../../opencga/opencga-active-filters.js";
import "../../commons/filters/select-field-filter.js";
import "../../commons/opencb-facet-results.js";
import "../../../loading-spinner.js";
import "../../variant/opencga-variant-detail-view.js";
// this is the new opencga-browser

// TODO spring-cleaning the old code
// TODO maybe remove this._config, this.config is enough here
// TODO fix props in EACH opencga-x-filter


export default class OpencgaFacet extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
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
            },
            resource: {
                type: String
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
        this.errorState = false;

        this.activeTab = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // TODO we don't need _config anymore
        this._config = {...this.config};
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            // this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        /* if (changedProperties.has("executedQuery")) {
            this.fetchVariants();
        }*/
        if (changedProperties.has("query")) {
            // console.warn("queryObserver is commented")
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
        this.requestUpdate();
    }

    opencgaSessionObserver() {
        // debugger
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            // Update cohorts from config, this updates the Cohort filter MAF
            console.warn("this._config.filter.menu", this._config.filter.menu);
            for (const section of this._config.filter.menu.sections) {
                for (const subsection of section.subsections) {
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

    selectedFacetObserver() {
        /**
         * Helper for formatting the list of facets to show in opencga-active-filters
         */
        const _valueFormatter = (k, v) => {
            let str = "";
            if (v.fn && (v.fn === "Avg" || v.fn === "Percentile")) {
                str = v.fn + "(" + k + ")";
            } else {
                str = k + v.value;
            }
            if (v.nested) {
                str += ">>" + ((v.nested.fn && (v.nested.fn === "Avg" || v.nested.fn === "Percentile")) ? v.nested.fn + "(" + v.nested.facet + ")" : v.nested.facet + v.nested.value);
            }
            return str;
        };
        if (Object.keys(this.selectedFacet).length) {
            // Object property spreading cannot be used here as it creates an Object with numeric indexes in Chrome 78...
            this.selectedFacetFormatted = Object.assign({}, ...Object.keys(this.selectedFacet).map(k => ({
                [k]: {
                    ...this.selectedFacet[k],
                    formatted: _valueFormatter(k, this.selectedFacet[k])
                }
            })));
        } else {
            this.selectedFacetFormatted = {};
        }
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

    // TODO since this is the new opencga-browser, this have to be moved this in opencga-facet-results
    async onRun() {
        this.clearPlots();
        const queryParams = {
            ...this.preparedQuery,
            // sid: this.opencgaClient._config.sessionId,
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            timeout: 60000,
            field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
        };
        // this event keeps in sync the query object with the one in iva-app
        // TODO do not use this.preparedQuery, use this.query (change this component accordingly)
        this.notifySearch(this.preparedQuery);

        // this.querySelector("#loading").style.display = "block";

        this._config.endpoint.aggregationStats(queryParams, {})
            .then(queryResponse => {
                console.log("queryResponse", queryResponse);
                this.errorState = false;
                this.facetResults = queryResponse.response[0].result[0].results;
                this.requestUpdate();
            })
            .catch(e => {
                this.errorState = "Error from server: " + e.error;
                this.requestUpdate();
            })
            .finally(() => {
                this.querySelector("#loading").style.display = "none";
            });

    }

    addDefaultFacet() {
        this._config.defaultFacetFields = ["cattype"];
        for (const a of this._config.defaultFacetFields) {
            const newField = this._recFind(this._config.fields, a);
            this.selectedFacet[a] = {...newField, value: newField && newField.defaultValue ? newField.defaultValue : ""};
            this.selectedFacet = {...this.selectedFacet};
            this.requestUpdate();
        }
    }

    async onFacetFieldChange(e) {
        const currentSelectionNames = e.detail.value ? e.detail.value.split(",") : [];
        // compute the symmetric difference between this.selectedFacet and currentSelectionNames
        const differences = Object.keys(this.selectedFacet)
            .filter(a => !currentSelectionNames.includes(a))
            .concat(currentSelectionNames.filter(name => !Object.keys(this.selectedFacet).includes(name)));

        // the difference involves one item a time
        if (differences.length > 1) console.error("Difference error!", this.selectedFacet, currentSelectionNames);

        const difference = differences[0];
        // addition
        if (currentSelectionNames.length > Object.keys(this.selectedFacet).length) {
            console.log("addition of", difference);
            // Array.find() cannot be nested.. let newField = this._config.fields.find(field => field.fields ? field.fields.find(nested => nested === difference) : field.name === difference);
            // console.log(this._config.fields, difference)
            const newField = this._recFind(this._config.fields, difference);
            // console.log("newField", newField)
            this.selectedFacet[difference] = {...newField, value: newField && newField.defaultValue ? newField.defaultValue : ""};
            await this.requestUpdate();
            $(".bootstrap-select", this).selectpicker();
        } else {
            console.log("deletion of", difference);
            // deletion
            delete this.selectedFacet[difference];
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetValueChange(e) {
        // console.log("onFacetValueChange",e);
        const id = e.target.dataset.id;
        // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? e.target.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetSelectChange(e) {
        // console.log("onFacetSelectChange",e);
        const id = e.target.dataset.id;
        // this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.detail.value ? e.detail.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.facet;
        if (value && (value === "Avg" || value === "Percentile")) {
            this.selectedFacet[facet]["fn"] = value;
            this.querySelector("#" + this._prefix + facet + "_text").disabled = true;
        } else {
            delete this.selectedFacet[facet]["fn"];
            this.querySelector("#" + this._prefix + facet + "_text").disabled = false;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    toggleCollapse(e) {
        $(e.target.dataset.collapse).collapse("toggle");
    }

    onNestedFacetValueChange(e) {
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.target.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFieldChange(e, parent) {
        const selected = e.detail.value;
        if (selected) {
            const newField = this._recFind(this._config.fields, selected);
            this.selectedFacet[parent].nested = {...newField, facet: selected, value: newField.defaultValue || ""};
        } else {
            delete this.selectedFacet[parent].nested;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.parentFacet;
        console.log("nestedFacetFNCHANGE", "#" + this._prefix + facet + "_NestedValue");
        if (value && (value === "Avg" || value === "Percentile")) {
            if (this.selectedFacet[facet].nested) {
                this.selectedFacet[facet].nested.fn = value;
                this.querySelector("#" + this._prefix + facet + "_NestedValue").disabled = true;
            } else {
                console.error("function selected before facet!");
            }
        } else {
            this.querySelector("#" + this._prefix + facet + "_NestedValue").disabled = false;
            delete this.selectedFacet[facet].nested.fn;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        // console.log("selectedFacet",Object.keys(this.selectedFacet))
        $("#" + this._prefix + "FacetField", this).selectpicker("val", Object.keys(this.selectedFacet));
        this.requestUpdate();
    }

    onActiveFacetClear(e) {
        this.selectedFacet = {};
        $("#" + this._prefix + "FacetField", this).selectpicker("val", "deselectAll");
        this.requestUpdate();
    }

    onFilterChange(e) {
        this.query = e.detail;
        // TODO remove search field everywhere. use query instead
        this.search = e.detail;
    }

    clearPlots() {
        if (UtilsNew.isNotUndefined(this.results) && this.results.length > 0) {
            for (const result of this.results) {
                PolymerUtils.removeElement(this._prefix + result.name + "Plot");
            }
        }
        this.results = [];
    }

    clearAll() {
        this.clearPlots();
        this.chromosome = "";
        this.facetFields = [];
        this.facetRanges = [];
        this.facetFieldsName = [];
        this.facetRangeFields = [];
        this._showInitMessage = true;

        PolymerUtils.setAttributeByClassName(this._prefix + "FilterSelect", "selectedIndex", 0);

        PolymerUtils.setValue(this._prefix + "FieldIncludes", "");
        PolymerUtils.setValue(this._prefix + "NestedFieldIncludes", "");
        PolymerUtils.setValue(this._prefix + "ChromosomeInput", "");
        PolymerUtils.removeAttribute(this._prefix + "ChromosomeAdd", "disabled");
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

/*    fetchVariants() {
        console.log("executedQuery changed!!");
        if (UtilsNew.isNotUndefined(this.opencgaClient)) {
            const queryParams = {
                sid: this.opencgaClient._config.sessionId,
                timeout: 60000,
                summary: true,
                limit: 1
            };
            Object.assign(queryParams, this.query);

            if (UtilsNew.isEmpty(queryParams.studies) || queryParams.studies.split(new RegExp("[,;]")).length === 1) {
                queryParams.studies = this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias;
            }

            const _this = this;
            this.opencgaClient.variants().query(queryParams, {})
                .then(function(response) {
                    _this.totalVariants = response.response[0].numTotalResults;
                    console.log("_this.totalVariants", _this.totalVariants);
                });
        }
    }*/

    _recFind(array, value) {
        for (const f of array) {
            if (f.fields) {
                const r = this._recFind(f.fields, value);
                if (r) return r;
            } else {
                if (f.id === value) {
                    // console.log("found", f);
                    return f;
                }
            }
        }
    }

    _changeView(e) {
        e.preventDefault();
        $(".content-pills").removeClass("active");
        $(".content-tab").hide();
        $(e.currentTarget).addClass("active");
        $("#" + e.currentTarget.dataset.view).show();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        this.activeTab[e.currentTarget.dataset.view] = true;
        /* if (e.target.dataset.view === "Summary") {
            this.SummaryActive = true;
            this.requestUpdate();
        } else {
            this.SummaryActive = false;
        }*/
        this.requestUpdate();
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant facet", e.detail);
        // TODO FIXME study prop have to be wiped off if possible. use studies instead
        this.preparedQuery = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.alias};
        this.preparedQuery = {...this.query};
    }

    renderField(facet) {
        const renderNestedFieldWrapper = faced => html`
                    <!-- nested facet -->
                    <div class="row facet-row nested">
                        <div class="col-md-12 text-center">
                            <a class="btn btn-small collapsed" role="button" data-collapse="#${facet.id}_nested" @click="${this.toggleCollapse}"> <i class="fas fa-arrow-alt-circle-down"></i> Nested Facet (optional) </a>
                            <div class="collapse" id="${facet.id}_nested">
                                <div class="">
                                    <select-field-filter .data="${this._config.fields.map(field => field.id !== facet.id ? field : {...field, disabled: true})}" .value=${null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet.id)}"></select-field-filter>
                                    <div class="row facet-row nested">
                                        ${this.renderNestedField(this.selectedFacet[facet.id].nested, facet.id)}
                                    </div>                                
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- /nested facet -->
        `;

        switch (facet.type) {
            case "category":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <select-field-filter multiple .data="${facet.values}" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_Select" data-id="${facet.id}" @filterChange="${this.onFacetSelectChange}"></select-field-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "number":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="Include values or set range" id="${this._prefix}${facet.id}_text" data-id="${facet.id}" .value="${facet.value || ""}" @input="${this.onFacetValueChange}" />
                        </div>
                        <div class="col-md-6">
                            <select-field-filter .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${this._prefix}${facet.id}_FnSelect" data-facet="${facet.id}" @filterChange="${this.onFacetFnChange}"></select-field-filter>
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            case "string":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <input type="text" class="form-control" placeholder="Include values" @input="${this.onFacetValueChange}" data-id="${facet.id}" type="text" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_NestedFnSelect"  />
                        </div>
                    </div>
                    ${renderNestedFieldWrapper(facet)}
                `;
            default:
                return html`no type recognized`;
        }
    }

    renderNestedField(facet, parent) {
        if (!facet || !facet.type) return null;
        console.log("renderNestedField", facet);
        switch (facet.type) {
            case "category":
                return html`
                    <div class="col-md-12">
                        <select-field-filter multiple .data="${facet.values}" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet.id}_NestedSelect" data-parent-facet="${parent}" @filterChange="${this.onNestedFacetValueChange}"></select-field-filter>
                    </div>
                `;
            case "number":
                return html`
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Include values or set range" data-parent-facet="${parent}" .disabled="${!(facet.facet)}" id="${this._prefix}${parent}_NestedValue" .value="${facet.value || ""}"  @input="${this.onNestedFacetValueChange}"  />
                    </div>
                    <div class="col-md-6">
                        <select-field-filter .disabled="${false}" .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${parent}_NestedFnSelect" data-parent-facet="${parent}" @filterChange="${this.onNestedFacetFnChange}"></select-field-filter>
                    </div>
                `;
            case "string":
                return html`
                    <div class="col-md-12">
                        <input type="text" class="form-control" placeholder="Include values" data-parent-facet="${parent}" id="${this._prefix}${facet.id}_Nested_text" .value="${facet.value || ""}"  @input="${this.onNestedFacetValueChange}"  />
                    </div>`;
            default:
                return html`no type recognized`;
        }
    }

    renderGrid(entity) {
        switch (entity) {
            // TODO handle specific events
            case "files":
                return html`<opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                                       .config="${this._config.grid}"
                                                       .query="${this.executedQuery}"
                                                       .search="${this.executedQuery}"
                                                       .eventNotifyName="${this.eventNotifyName}"
                                                       .files="${this.files}"
                                                       style="font-size: 12px"
                                                       @selectfile="${this.onSelectFile}">
                                 </opencga-file-grid>`;
            case "samples":
                return html`<opencga-sample-grid .opencgaSession="${this.opencgaSession}"
                                                     .query="${this.executedQuery}"
                                                     .search="${this.executedQuery}"
                                                     .config="${this._config.grid}"
                                                     .samples="${this.samples}"
                                                     .active="${true}"
                                                     style="font-size: 12px"
                                                     @selectsample="${this.onSelectSample}">
                                 </opencga-sample-grid>`;
            case "cohort":
                return html`<opencga-cohort-grid .opencgaSession="${this.opencgaSession}"
                                                     .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                     .query="${this.executedQuery}"
                                                     .search="${this.executedQuery}"
                                                     .config="${this._config.grid}"
                                                     .eventNotifyName="${this.eventNotifyName}"
                                                     .active="${true}"
                                                     style="font-size: 12px"
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
                                                                 .active="${true}"
                                                                 style="font-size: 12px" >
                                            </opencga-sample-grid>
                                        </div>
        
                                    </div>
                                </div>`;
            case "clinical-analysis":
                return html`<opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                                .config="${this._config.grid}"
                                                                .analyses="${this.analyses}"
                                                                .query="${this.executedQuery}"
                                                                .search="${this.executedQuery}"
                                                                style="font-size: 12px"
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
                                                                .clinicalAnalysisId="${this.analysis.id}"
                                                                .config="${this._config.sampleDetail}"
                                                                style="font-size: 12px;">
                                            </clinical-analysis-view>
                                        </div>
                                    </div>
                                </div>`;
            default:
                return html`entity not recognized`;
        }
    }

    render() {
        return html`
 
        <style include="jso-styles">
        </style>

        ${this.checkProjects ? html`
            <div class="panel" style="margin-bottom: 15px">
                <h3 style="margin: 10px 10px 10px 15px">
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h3>
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
                            
                            ${this.resource === "variants" ? html`
                                <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                                            .opencgaClient="${this.opencgaClient}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .populationFrequencies="${this.populationFrequencies}"
                                                            .consequenceTypes="${this.consequenceTypes}"
                                                            .query="${this.query}"
                                                            .config="${this._config.filter}"
                                                            .searchButton="${false}"
                                                            @queryChange="${this.onQueryFilterChange}"
                                                            @querySearch="${this.onQueryFilterSearch}">
                                </opencga-variant-filter>
                            ` : null}
                            
                            ${this.resource === "files" ? html`
                                <opencga-file-filter
                                    discriminator="hardcoded"  
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${1 /* TODO FIXME this._config.filter*/}"
                                    .files="${this.files}"
                                    .query="${this.query}"
                                    .search="${this.search}"
                                    .variableSets="${this.variableSets}"
                                    .searchButton="${false}"
                                    @queryChange="${this.onQueryFilterChange}"
                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-file-filter>
                            ` : null}
                            
                            ${this.resource === "samples" ? html`
                                <opencga-sample-filter
                                    discriminator="hardcoded"  
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${1 /* TODO FIXME this._config.filter*/}"
                                    .query="${this.query}"
                                    .search="${this.search}"
                                    .variableSets="${this.variableSets}"
                                    .searchButton="${false}"
                                    @queryChange="${this.onQueryFilterChange}"
                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-sample-filter>
                            ` : null}
                            
                            ${this.resource === "individuals" ? html`
                                <opencga-individual-filter
                                    discriminator="hardcoded"  
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${1 /* TODO FIXME this._config.filter*/}"
                                    .query="${this.query}"
                                    .search="${this.search}"
                                    .variableSets="${this.variableSets}"
                                    .searchButton="${false}"
                                    @queryChange="${this.onQueryFilterChange}"
                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-individual-filter>
                            ` : null}                            
                            
                            ${this.resource === "family" ? html`
                                <opencga-family-filter
                                    discriminator="hardcoded"  
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${1 /* TODO FIXME this._config.filter*/}"
                                    .query="${this.query}"
                                    .search="${this.search}"
                                    .variableSets="${this.variableSets}"
                                    .searchButton="${false}"
                                    @queryChange="${this.onQueryFilterChange}"
                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-family-filter>
                            ` : null}
                            
                            ${this.resource === "cohort" ? html`
                                <opencga-cohort-filter
                                    discriminator="hardcoded"  
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${1 /* TODO FIXME this._config.filter*/}"
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
                                                                    .config="${1 /* TODO FIXME this._config.filter*/}"
                                                                    .analyses="${this.analyses}"
                                                                    .search="${this.search}"
                                                                    .query="${this.query}"
                                                                    @queryChange="${this.onQueryFilterChange}"
                                                                    @querySearch="${this.onQueryFilterSearch}">
                                </opencga-clinical-analysis-filter>
                            ` : null}
                            
                        </div>
                        
                        <div role="tabpanel" class="tab-pane" id="facet_tab" aria-expanded="true">
                            <div class="facet-selector">
                                <label>Select a Term or Range Facet</label>
                                    <select-field-filter multiple .data="${this._config.fields}" .value=${Object.keys(this.selectedFacet).join(",")} @filterChange="${this.onFacetFieldChange}"></select-field-filter>
                                    <div class="text-center">
                                        <p class="or-text">- or -</p>
                                        <button class="btn btn-default btn-small ripple" @click="${this.addDefaultFacet}">Add default fields</button>
                                    </div> 
                            </div>
                            
                            <div class="facet-list-container">
                                <label>Selected facets</label>
                                <div class="facet-list panel-group panel-body">
                                    <!-- this.selectedFacet <pre>${JSON.stringify(this.selectedFacet, null, "  ")}</pre> --> 
                                    
                                    ${Object.keys(this.selectedFacet).length>0 ? Object.entries(this.selectedFacet).map( ([, facet]) => html`
                                        <div class="facet-box" id="${this._prefix}Heading">
                                            <div class="subsection-content form-group">
                                                <div class="browser-subsection">${facet.name}
                                                    <div class="tooltip-div pull-right">
                                                        <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}${facet.id}Tooltip"></i></a>
                                                    </div>
                                                </div>
                                                <div id="${this._prefix}${facet.id}" class="" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                                    <div class="">
                                                        ${this.renderField(facet)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>                                    
                                    `) : html`
                                        <div class="alert alert-info text-center" role="alert"><i class="fas fa-3x fa-info-circle"></i><br><small>No aggregation field has been selected yet.</small></div>
                                    `}
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>

                <div class="col-md-10">
                
                    <!-- tabs buttons -->
                    <div>
                        <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                            <div class="btn-group" role="group" style="margin-left: 0px">
                                <button type="button" class="btn btn-success active ripple content-pills" data-view="table-results" @click="${this._changeView}" data-id="table">
                                    <i class="fa fa-table icon-padding" aria-hidden="true"></i> Table Result
                                </button>
                                <button type="button" class="btn btn-success ripple content-pills" data-view="facet-results" @click="${this._changeView}" data-id="aggregation">
                                    <i class="fas fa-chart-bar icon-padding" aria-hidden="true"></i> Aggregation stats
                                </button>
                                <button type="button" class="btn btn-success ripple content-pills" data-view="comparator" @click="${this._changeView}" data-id="comparator">
                                    <i class="fa fa-users icon-padding" aria-hidden="true"></i> Comparator
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <opencga-active-filters facetActive 
                                                .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                .defaultStudy="${this.opencgaSession.study.alias}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .facetQuery="${this.selectedFacetFormatted}"
                                                .alias="${this.activeFilterAlias}"
                                                .config="${this._config.activeFilters}"
                                                @activeFacetChange="${this.onActiveFacetChange}"
                                                @activeFacetClear="${this.onActiveFacetClear}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>

                    
                        <div id="table-results" class="content-tab">
                        <!-- TODO continue integrating browser grids -->
                            ${this.renderGrid(this.resource)}
                        </div>
                        
                        <div id="facet-results" class="content-tab">
                            <opencb-facet-results .active="${this.activeTab["facet-results"]}"
                                                  .data="${this.facetResults}"
                                                  .error="${this.errorState}">
                            </opencb-facet-results>
                        </div>
                                                
                        <!-- RESULTS - Facet Plots 
                        <div id="loading" style="display: none">
                            <loading-spinner></loading-spinner>
                        </div>
                        ${this.errorState ? html`
                            <div id="error" class="alert alert-danger" role="alert">
                                ${this.errorState}
                            </div>
                        ` : null}
                        ${this._showInitMessage ? html`
                            
                        ` : null}

                        ${this.facetResults && this.facetResults.length ? this.facetResults.map(item => html`
                            <div class="facetResultsDiv">
                                <div>
                                    <h3>${item.name}</h3>
                                    <opencga-facet-result-view .facetResult="${item}" .config="${this.facetConfig}" .active="${this.facetActive}"></opencga-facet-result-view>
                                </div>
                            </div>
                        `) : null}
                        -->
                    </div>
                </div>
            </div>
        ` : html`
            <span><h3>No public projects available to browse. Please login to continue</h3></span>
        `}
    `;
    }

}

customElements.define("opencga-facet", OpencgaFacet);
