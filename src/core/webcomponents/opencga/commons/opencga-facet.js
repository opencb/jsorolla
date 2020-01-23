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
// import "./opencga-variant-filter.js"; TODO this will be translated in specific filter wrapper component with a switch
import "./opencga-facet-result-view.js";
import "../../opencga/opencga-active-filters.js";
import "../../commons/filters/select-field-filter.js";
import "../../commons/opencb-facet-results.js";
import "../../../loading-spinner.js";

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

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.config};
        console.log("connectedCallback _config", this._config)
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

        this.facets = new Set();
        this.facetFilters = [];

        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();

        /*//TODO metadata fetching not used anymore
        fetch('http://51.104.252.173:8080/opencga/webservices/rest/v1/meta/api')
            .then((response) => {
            if(response.ok) {
                return response.json(); //pending promise
            }
            throw new Error('Network response was not ok.');
        }).then( response => {
            console.log("response", response)
            let param = "files"
            let aggregationFields = response.responses[0].results[0]
                                .find( resource => resource.name.toLowerCase() === param).endpoints
                                .find( endpoint => endpoint.path.toLowerCase() === "/{apiversion}/" + param + "/aggregationstats").parameters;
            console.log("aggregationFields",aggregationFields)
            this.aggregationFieldNames = aggregationFields.map(_ => _.name);
            this.requestUpdate()
        }).catch((error) => {
            console.log('There has been a problem with fetch operation: ' + error.message);
        });*/

        //TODO remove, each config comes from the wrapper component now (still need resource prop, the template needs it for filters component)
        switch(this.resource) {
            case "files":
                this._client = this.opencgaSession.opencgaClient.files();
                //this._config = this.getDefaultConfig(this.resource);
                //this._annotations = this.opencgaSession.opencgaClient.studies().variableSets();
                //this._config.fields.push(variableOptions);
                break;
            case "samples":
                this._client = this.opencgaSession.opencgaClient.samples();
                break;
            case "individuals":
                this._client = this.opencgaSession.opencgaClient.individuals();
                break;
            case "family":
                this._client = this.opencgaSession.opencgaClient.families();
                break;
            case "cohort":
                this._client = this.opencgaSession.opencgaClient.cohorts();
                break;
            default:
                throw new Error("No resource found.");
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        /*if (changedProperties.has("executedQuery")) {
            this.fetchVariants();
        }*/
        if (changedProperties.has("query")) {
            //console.warn("queryObserver is commented")
            this.queryObserver();
        }
        if (changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
    }

    //TODO recheck (there's no need for executedQuery anymore)
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
            console.warn("this._config.filter.menu",this._config.filter.menu)
            for (let section of this._config.filter.menu.sections) {
                for (let subsection of section.subsections) {
                    if (subsection.id === "cohort") {
                        let projectFields = this.opencgaSession.project.alias.split("@");
                        let projectId = (projectFields.length > 1) ? projectFields[1] : projectFields[0];
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

    /**
     * Apply the 'config' properties on the default
     */
    configObserver() {
        //this._config = {...this.config};
        console.log("this._config",this._config)
    }

    selectedFacetObserver() {
        /**
         * Helper for formatting the list of facets to show in opencga-active-filters
         */
        let _valueFormatter = (k, v) => {
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
        if(Object.keys(this.selectedFacet).length) {
            //Object property spreading cannot be used here as it creates an Object with numeric indexes in Chrome 78...
            this.selectedFacetFormatted = Object.assign({}, ...Object.keys(this.selectedFacet).map(k => ({[k]: {...this.selectedFacet[k], formatted: _valueFormatter(k, this.selectedFacet[k])} } )) );
        } else {
            this.selectedFacetFormatted = {};
        }
        this.requestUpdate();
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query,
            },
            bubbles: true,
            composed: true
        }));
    }

    async onRun() {
        this.clearPlots();
        let queryParams = {
            ...this.preparedQuery,
            // sid: this.opencgaClient._config.sessionId,
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            timeout: 60000,
            field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
        };
        //this event keeps in sync the query object with the one in iva-app
        //TODO do not use this.preparedQuery, use this.query (change this component accordingly)
        this.notifySearch(this.preparedQuery);

        this.querySelector("#loading").style.display = "block";

        this._client.stats(queryParams, {})
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

    async onFacetFieldChange(e) {
        let currentSelectionNames = e.detail.value ? e.detail.value.split(",") : [];
        //compute the symmetric difference between this.selectedFacet and currentSelectionNames
        let differences = Object.keys(this.selectedFacet)
            .filter(a => !currentSelectionNames.includes(a))
            .concat(currentSelectionNames.filter(name => !Object.keys(this.selectedFacet).includes(name)));

        //the difference involves one item a time
        if (differences.length > 1) console.error("Difference error!", this.selectedFacet, currentSelectionNames);

        let difference = differences[0];
        //addition
        if (currentSelectionNames.length > Object.keys(this.selectedFacet).length) {
            console.log("addition of", difference);

            //Array.find() cannot be nested..
            //let newField = this._config.fields.find(field => field.fields ? field.fields.find(nested => nested === difference) : field.name === difference);

            //console.log(this._config.fields, difference)
            let newField = this._recursiveFind(this._config.fields, difference);
            //console.log("newField", newField)
            this.selectedFacet[difference] = {...newField, value: newField && newField.defaultValue ? newField.defaultValue : "aaa"};
            //console.log("defaultValue", this._config.fields.find((field) => field.name === difference))
            await this.requestUpdate();
            $(".bootstrap-select", this).selectpicker();
        } else {
            console.log("deletion of", difference);
            //deletion
            delete this.selectedFacet[difference];
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetValueChange(e) {
        console.log("onFacetValueChange",e)
        let id = e.target.dataset.id;
        //this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? e.target.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetSelectChange(e) {
        console.log("onFacetSelectChange",e)
        let id = e.target.dataset.id;
        //this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.detail.value ? e.detail.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetFnChange(e) {
        const value = e.detail.value;
        const facet = e.target.dataset.facet;
        if (value && (value[0] === "Avg" || value[0] === "Percentile")) {
            this.selectedFacet[facet]["fn"] = value[0];
            this.querySelector("#" + this._prefix + facet + "_text").disabled = true;
        } else {
            delete this.selectedFacet[facet]["fn"];
            this.querySelector("#" + this._prefix + facet + "_text").disabled = false;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetValueChange(e) {
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.target.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetSelectChange(e) {
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.detail.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFieldChange(e, parent) {
        let selected = e.detail.value && e.detail.value[0];
        if(selected) {
            let newField = this._recursiveFind(this._config.fields, selected);
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
        console.log("nestedFacetFNCHANGE", "#" + this._prefix + facet + "_NestedValue")
        if (value && (value[0] === "Avg" || value[0] === "Percentile")) {
            if (this.selectedFacet[facet].nested) {
                this.selectedFacet[facet].nested.fn = value[0];
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

    /**
     * @deprecated
     * */
    onFacetTextChange(e) {
        let id = e.target.dataset.id;
        //this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? e.target.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    /**
     * @deprecated
     * */
    onNestedFacetTextChange(e) {
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.target.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
        //console.log("selectedFacet",Object.keys(this.selectedFacet))
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
        this.search = e.detail;
    }

    _onMouseOver(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.facet, "text-decoration", "line-through");
    }

    _onMouseOut(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.facet, "text-decoration", "none");
    }

    clearPlots() {
        if (UtilsNew.isNotUndefined(this.results) && this.results.length > 0) {
            for (let result of this.results) {
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
        let id = e.target.dataId;
        //TODO Refactor
        this.renderHistogramChart("#" + this._prefix + id + "Plot", id);

        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onPieChart(e) {
        this.highlightActivePlot(e.target.parentElement);
        let id = e.target.dataId;
        this.renderPieChart("#" + this._prefix + id + "Plot", id);
        PolymerUtils.hide(this._prefix + id + "Table");
    }

    onTabularView(e) {
        this.highlightActivePlot(e.target.parentElement);
        let id = e.target.dataId;
        PolymerUtils.innerHTML(this._prefix + id + "Plot", "");
        PolymerUtils.show(this._prefix + id + "Table", "table");
    }

    highlightActivePlot(button) {
        // PolymerUtils.removeClass(".plots", "active");
        // PolymerUtils.addClass(button, "active");
    }

    /**
     *  TODO recheck if is still useful
     * */
    fetchVariants() {
        console.log("executedQuery changed!!");
        if (UtilsNew.isNotUndefined(this.opencgaClient)) {
            let queryParams = {
                sid: this.opencgaClient._config.sessionId,
                timeout: 60000,
                summary: true,
                limit: 1
            };
            Object.assign(queryParams, this.query);

            if (UtilsNew.isEmpty(queryParams.studies) || queryParams.studies.split(new RegExp("[,;]")).length == 1) {
                queryParams.studies = this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias;
            }

            let _this = this;
            this.opencgaClient.variants().query(queryParams, {})
                .then(function(response) {
                    _this.totalVariants = response.response[0].numTotalResults;
                    console.log("_this.totalVariants", _this.totalVariants);
                });
        }
    }

    //TODO refactor in continuation-passing style
    _recursiveFind(array, value) {
        for (let i in array) {
            let f = array[i];
            if(f.fields) {
                let r = this._recursiveFind(f.fields, value);
                if(r) return r;
            } else {
                if(f.id === value) {
                    console.log("found", f);
                    return f;
                }
            }
        }
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant facet", e.detail);
        //TODO FIXME study prop have to be wiped off if possible. use studies instead
        this.preparedQuery = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        this.preparedQuery = {...this.query};
    }

    renderField(facet) {
        console.log("renderField", facet)
        switch(facet[1].type) {
            case "category":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <select-field-filter multiple .data="${facet[1].values}" .value="${facet[1].defaultValue ? facet[1].defaultValue : ""}" id="${facet[0]}_Select" data-id="${facet[0]}" @filterChange="${this.onFacetSelectChange}"></select-field-filter>
                        </div>
                    </div>
                    <!-- nested facet -->
                    <div class="row facet-row nested">
                        <div class="col-md-12">
                            <label for="${facet[0]}_text">Nested Facet (optional)</label>
                            <select-field-filter .data="${this._config.fields}" .value=${null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet[0])}"></select-field-filter>
                        </div>
                    </div>
                    <div class="row facet-row nested">
                        ${this.renderNestedField(this.selectedFacet[facet[0]].nested, facet[0])}
                    </div>
                    <!-- /nested facet -->
                `;
            case "number":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="Include values or set range" id="${this._prefix}${facet[0]}_text" data-id="${facet[0]}" .value="${facet[1].value || ""}" @input="${this.onFacetValueChange}" />
                        </div>
                        <div class="col-md-6">
                            <select-field-filter .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${this._prefix}${facet[0]}_FnSelect" data-facet="${facet[0]}" @filterChange="${this.onFacetFnChange}"></select-field-filter>
                        </div>
                    </div>
                    <!-- nested facet -->
                    <div class="row facet-row nested">
                        <div class="col-md-12">
                            <label for="${facet[0]}_text">Nested Facet (optional)</label>
                            <select-field-filter .data="${this._config.fields}" .value=${null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet[0])}"></select-field-filter>
                        </div>
                    </div>
                    <div class="row facet-row nested">
                        ${this.renderNestedField(this.selectedFacet[facet[0]].nested || {}, facet[0])}
                    </div>
                    <!-- /nested facet -->
                `;
            case "string":
                return html`
                    <div class="row facet-row">
                        <div class="col-md-12">
                            <input type="text" class="form-control" placeholder="Include values" @input="${this.onFacetValueChange}" data-id="${facet[0]}" type="text" .value="${facet[1].defaultValue ? facet[1].defaultValue : ""}" id="${facet[0]}_NestedFnSelect"  />
                        </div>
                    </div>
                    <!-- nested facet -->
                    <div class="row facet-row nested">
                        <div class="col-md-12">
                            <label for="${facet[0]}_text">Nested Facet (optional)</label>
                            <select-field-filter .data="${this._config.fields}" .value=${null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet[0])}"></select-field-filter>
                        </div>
                    </div>
                    <div class="row facet-row nested">
                        ${this.renderNestedField(this.selectedFacet[facet[0]].nested || {}, facet[0])}
                    </div>
                    <!-- /nested facet -->`;
            default:
                return html`no type recognized`
        }
    }

    renderNestedField(facet, parent) {
        if(!facet || !facet.type) return null;
        console.log("renderNestedField", facet)
        switch(facet && facet.type ) {
            case "category":
                return html`
                    <div class="col-md-12">
                        <select-field-filter multiple .data="${facet.values}" .value="${facet.defaultValue ? facet.defaultValue : ""}" id="${facet[0]}_NestedSelect" data-parent-facet="${parent}" @filterChange="${this.onNestedFacetSelectChange}"></select-field-filter>
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
                        <input type="text" class="form-control" placeholder="Include values" data-parent-facet="${parent}" .disabled="${false && !(facet.nested && facet.nested.facet)}" id="${this._prefix}${facet[0]}_Nested_text" .value="${facet.value || ""}"  @input="${this.onNestedFacetValueChange}"  />
                    </div>`;
        default:
            return html`no type recognized`
        }
    }

    render() {
        return html`
 
        <style include="jso-styles">
            option:disabled {
                font-size: 0.85em;
                font-weight: bold;
            }

            .active-filter-button:hover {
                text-decoration: line-through;
            }
            
            .aggregation-tabs li {
                width: 50%;
            }
            /*
            .facet-list-container .panel-heading {
                padding: 0px 5px;
            }
            
            .facet-list-container .panel-title {
                font-size: 13.5px;
            }
            
            .facet-list-container .panel-title i {
                margin-right: 5px;
            }*/

            .facet-list-container {
                margin-top: 15px;
            }
            
            .facet-row-container{
                padding: 0 5px;
                margin: 10px;
            }
            
            .facet-row {
                margin: 0;
            }
            
            .facet-row > div {
                padding: 3px;
                margin: 0;
            }
            /*
            .facet-row .panel-body {
                padding: 0px;
            }*/
            
            .facet-row .nested {
                /*padding: 15px;*/
            }
            
            .panel-title p{
                margin: 0;
            }
            
            .facetResultsDiv {
                padding-top: 20px;
            }
        </style>

        ${this.checkProjects ? html`
            <div class="panel" style="margin-bottom: 15px">
                <h3 style="margin: 10px 10px 10px 15px">
                    <i class="${this._config.icon}" aria-hidden="true"></i>&nbsp;${this._config.title}
                </h3>
            </div>

            <div class="row" style="padding: 0px 10px">
                <div class="col-md-2">
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary ripple" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> Run
                        </button>
                    </div>
                    <ul class="nav nav-tabs aggregation-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>
                        <li role="presentation"><a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a></li>
                    </ul>
                    
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane active" id="facet_tab" aria-expanded="true">
                
                            <div>
                                <label>Select a Term or Range Facet</label>
                                    <select-field-filter multiple .data="${this._config.fields}" .value=${Object.keys(this.selectedFacet).join(",")} @filterChange="${this.onFacetFieldChange}"></select-field-filter>

                            </div>
                            
                            <div class="facet-list-container panel-group">
                                <!-- this.selectedFacet <pre>${JSON.stringify(this.selectedFacet,null, "  ") }</pre> --> 
                                ${Object.entries(this.selectedFacet).map(facet => html`
                                    <div class="container-fluid facet-row-container">
                                        <div class="row ">
                                            <div class="panel panel-default filter-section">
                                                <div class="panel-heading" role="tab" id="${this._prefix}Heading">
                                                    <h4 class="panel-title">
                                                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                                            href="#${this._prefix}${facet[1].id}" aria-expanded="true" aria-controls="${this._prefix}">
                                                            <p class="subsection-content">${facet[1].name}</p>
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="${this._prefix}${facet[1].id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                                    <div class="panel-body">
                                                        ${this.renderField(facet)}
                                                     </div>
                                                </div>
                                            </div>
                    
                                        </div>
                                    </div>
                                               
                                    <!--<div class="container-fluid facet-row-container">
                                        <div class="row ">
                                            <div class="panel panel-default filter-section">
                                                <div class="panel-heading" role="tab" id="${this._prefix}Heading">
                                                    <h4 class="panel-title">
                                                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                                            href="#${this._prefix}${facet[1].id}" aria-expanded="true" aria-controls="${this._prefix}">
                                                            <p class="subsection-content">${facet[0]}</p>
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="${this._prefix}${facet[1].id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                                    <div class="panel-body">
                                                        <div class="row facet-row">
                                                            <div class="col-md-6">
                                                                <input type="text" class="form-control subsection-content" placeholder="Include values or set range" id="${this._prefix}${facet[0]}_text" data-id="${facet[0]}" .value="${facet[1].value || ""}" @input="${this.onFacetTextChange}" />
                                                            </div>
                                                            <div class="col-md-6">
                                                                <select-field-filter .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" @filterChange="${e => this.onFacetFnChange(facet[0], e.detail.value)}"></select-field-filter>
                                                            </div>
                                                        </div>
                                                        
                                                        <div class="row facet-row nested">
                                                            <div class="col-md-12">
                                                                <label for="${facet[0]}_text">Nested Facet (optional)</label>
                                                                <select-field-filter .data="${this._config.fields}" .value=${null} @filterChange="${e => this.onNestedFacetFieldChange(e, facet[0])}"></select-field-filter>
                                                            </div>
                                                        </div>
                                                        <div class="row facet-row nested">
                                                            <div class="col-md-6">
                                                                <input type="text" class="form-control subsection-content" placeholder="Include values or set range" data-parent-facet="${facet[0]}" .disabled="${!(facet[1].nested && facet[1].nested.facet)}" id="${this._prefix}${facet[0]}_Nested_text" .value="${facet[1].nested ? facet[1].nested.value : ""}"  @input="${this.onNestedFacetTextChange}"  />
                                                            </div>
                                                            <div class="col-md-6">
                                                                <select-field-filter .disabled="${!(facet[1].nested && facet[1].nested.facet)}" .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${facet[0]}_NestedFnSelect" data-nested-facet="${facet[0]}" @filterChange="${e => this.onNestedFacetFnChange(facet[0], e.detail.value)}"></select-field-filter>
                                                            </div>
                                                        </div>
                                                     </div>
                                                </div>
                                            </div>
                    
                                        </div>
                                    </div> -->
                                `) }
                            </div>
                
                        </div>
                        
                        <div role="tabpanel" class="tab-pane" id="filters_tab">
                        
                                            
                            <!-- dynamic render doesn't work well with active-filter events  _filterComp ${this._filterComp} -->
                            ${this.resource === "files" ? html`
                            <opencga-file-filter
                                discriminator="hardcoded"  
                                .opencgaSession="${this.opencgaSession}"
                                .config="${ 1 /*TODO FIXME this._config.filter*/}"
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
                                .config="${ 1 /*TODO FIXME this._config.filter*/}"
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
                                .config="${ 1 /*TODO FIXME this._config.filter*/}"
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
                                .config="${ 1 /*TODO FIXME this._config.filter*/}"
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
                                .config="${ 1 /*TODO FIXME this._config.filter*/}"
                                .query="${this.query}"
                                .search="${this.search}"
                                .variableSets="${this.variableSets}"
                                .searchButton="${false}"
                                @queryChange="${this.onQueryFilterChange}"
                                @querySearch="${this.onQueryFilterSearch}">
                            </opencga-cohort-filter>
                            ` : null}
                            
                        </div>
                    </div>
                </div>

                <div class="col-md-10">
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

                        <opencb-facet-results .data="${this.facetResults}"
                                              .error="${this.errorState}">
                        </opencb-facet-results>
                        
                        <!-- RESULTS - Facet Plots -->
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
                        `) : null }
                    </div>
                </div>
            </div>
        ` : html`
            <span style="text-align: center"><h3>No public projects available to browse. Please login to continue</h3></span>
        `}
    `;
    }

}

customElements.define("opencga-facet", OpencgaFacet);
