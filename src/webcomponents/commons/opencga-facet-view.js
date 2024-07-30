/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-facet-result-view.js";
import "./opencga-facet-view-selector.js";

/**
 * @deprecated
 * */
export default class OpencgaFacetView extends LitElement {

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
            variableSets: {
                type: Array
            },
            entity: {
                type: String
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + UtilsNew.randomString(6) + "_";
        this.disableNestedSelector = false;
        this._showInitMessage = true;
        this.facets = new Set();
        this.facetFilters = [];
        this._firstVariable = {};
        this._secondVariable = {};
        this.variableSets = [];
        this.query = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("variableSets") ||
            changedProperties.has("entity") ||
            changedProperties.has("query") ||
            changedProperties.has("config")) {
            this.renderFacetView();
        }
    }

    renderFacetView(variableSets, entity, query, config) {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        this.dataModelTerms = this.getDataModelTerms(this.entity);

        // Take variableSets from the opencgaSession if it has not been passed
        if (UtilsNew.isUndefinedOrNull(this.variableSets) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession)
            && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)
            && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study.variableSets)) {
            this.variableSets = this.opencgaSession.study.variableSets;
        }
    }

    onVariableSelectedChange(e) {
        if (e.target.id === `${this._prefix}-ofvs-first`) {
            if (e.detail.value === "average" || e.detail.value === "percentile") {
                this.disableNestedSelector = true;
            } else {
                this.disableNestedSelector = false;
            }

            this._firstVariable = e.detail;
        } else {
            this._secondVariable = e.detail;
        }
    }

    getDataModelTerms(entity) {
        let catalogCommon = [
            {
                id: "creationYear",
                name: "Creation year"
            }, {
                id: "creationMonth",
                name: "Creation month"
            }, {
                id: "creationDay",
                name: "Creation day"
            }, {
                id: "creationDayOfWeek",
                name: "Creation day of week"
            }, {
                id: "status",
                name: "Status"
            }, {
                id: "release",
                name: "Release"
            }
        ];

        switch (entity) {
        case "COHORT":
            return catalogCommon.concat([{
                id: "type",
                name: "Type"
            }, {
                id: "numSamples",
                name: "Number of samples"
            }]);
        case "FILE":
            return catalogCommon.concat([{
                id: "name",
                name: "Name"
            }, {
                id: "type",
                name: "Type"
            }, {
                id: "format",
                name: "Format"
            }, {
                id: "bioformat",
                name: "Bioformat"
            }, {
                id: "external",
                name: "External"
            }, {
                id: "size",
                name: "Size"
            }, {
                id: "numSamples",
                name: "Number of samples"
            }, {
                id: "numRelatedFiles",
                name: "Number of related files"
            }]);
        case "SAMPLE":
            return catalogCommon.concat([{
                id: "somatic",
                name: "Somatic"
            }, {
                id: "version",
                name: "Version"
            }]);
        case "INDIVIDUAL":
            return catalogCommon.concat([{
                id: "hasFather",
                name: "Has father"
            }, {
                id: "hasMother",
                name: "Has mother"
            }, {
                id: "numMultiples",
                name: "Number of multiples"
            }, {
                id: "multiplesType",
                name: "Multiples type"
            }, {
                id: "sex",
                name: "Sex"
            }, {
                id: "karyotypicSex",
                name: "Karyotypic sex"
            }, {
                id: "version",
                name: "Version"
            }, {
                id: "lifeStatus",
                name: "Life status"
            }, {
                id: "affectationStatus",
                name: "Affectation status"
            }, {
                id: "numSamples",
                name: "Number of samples"
            }, {
                id: "parentalConsanguinity",
                name: "Parental consanguinity"
            }]);
        case "FAMILY":
            return catalogCommon.concat([{
                id: "phenotypes",
                name: "Phenotypes"
            }, {
                id: "numMembers",
                name: "Number of members"
            }, {
                id: "expectedSize",
                name: "Expected size"
            }, {
                id: "version",
                name: "Version"
            }]);
        default:
            return [{}];
        }
    }

    getOpencgaClient(entity) {
        switch (entity) {
        case "COHORT":
            return this.opencgaSession.opencgaClient.cohorts();
        case "FILE":
            return this.opencgaSession.opencgaClient.files();
        case "SAMPLE":
            return this.opencgaSession.opencgaClient.samples();
        case "INDIVIDUAL":
            return this.opencgaSession.opencgaClient.individuals();
        case "FAMILY":
            return this.opencgaSession.opencgaClient.families();
        default:
            return [{}];
        }
    }

    /**
     * Apply the 'config' properties on the default
     */
    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    onFacetFieldChange(e) {
        if (e.target.selectedOptions[0].dataset.range !== undefined) {
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", e.target.selectedOptions[0].dataset.range);
        } else {
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", "");
        }
    }

    onNestedFacetFieldChange(e) {
        if (e.target.selectedOptions[0].dataset.range !== undefined) {
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", e.target.selectedOptions[0].dataset.range);
        } else {
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", "");
        }
    }

    onClear() {
        this.query = {};
        this.search = {};
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

    _isAggregationFunction(value) {
        return value === "percentile" || value === "average";
    }

    addDefaultStats(e) {
        for (let i = 0; i < this._config.defaultStats.length; i++) {
            this.facets.add(this._config.defaultStats[i]);
        }
        this.facetFilters = Array.from(this.facets);
        this.requestUpdate();
    }

    addFacet(e) {
        let facetField = this._firstVariable.term;

        if (UtilsNew.isNotEmpty(facetField)) {
            let facetFieldIncludes = this._firstVariable.value;

            let facet;
            if (this._isAggregationFunction(facetFieldIncludes)) {
                facet = `${facetFieldIncludes}(${facetField})`;
            } else {
                facet = facetField + facetFieldIncludes;
            }

            let nestedFacetField = this._secondVariable.term;
            if (!this.disableNestedSelector && UtilsNew.isNotEmpty(nestedFacetField)) {
                let nestedFacetFieldIncludes = this._secondVariable.value;

                let nestedFacet;
                if (this._isAggregationFunction(nestedFacetFieldIncludes)) {
                    nestedFacet = `${nestedFacetFieldIncludes}(${nestedFacetField})`;
                } else {
                    nestedFacet = nestedFacetField + nestedFacetFieldIncludes;
                }

                facet += ">>" + nestedFacet;
            }

            // Add facet
            this.facets.add(facet);
            this.facetFilters = Array.from(this.facets);

            // Clear form controls
            this.clearSelectedOptions = true;
            this.clearSelectedOptions = false;

            this._firstVariable = {};
            this._secondVariable = {};
        }
    }

    removeFacet(e) {
        this.facets.delete(e.target.dataset.facet);
        this.facetFilters = Array.from(this.facets);
        this.requestUpdate();
    }

    fetchData() {
        let client = this.getOpencgaClient(this.entity);
        if (UtilsNew.isUndefinedOrNull(client)) {
            console.log("opencgaClient is null or undefined");
            return;
        }

        if (this.facets.size === 0) {
            alert("No facets selected.");
            return;
        }

        this.clearPlots();
        // Shows loading modal
        $(PolymerUtils.getElementById(this._prefix + "LoadingModal")).modal("show");

        // Join 'query' from left menu and facet filters
        let queryParams = Object.assign(this.query,
            {
                // sid: this.opencgaClient._config.sessionId,
                study: this.opencgaSession.study.fqn,
                timeout: 60000,
                field: this.facetFilters.join(";")
            });

        let _this = this;
        setTimeout(() => {
                client.stats(queryParams, {})
                    .then(function(queryResponse) {
                        // let response = queryResponse.response[0].result[0].result;
                        _this.facetResults = queryResponse.response[0].result[0].results;

                        // Remove loading modal
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                        _this._showInitMessage = false;
                    })
                    .catch(function(e) {
                        console.log(e);
                        // Remove loading modal
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                        _this._showInitMessage = false;
                    });
            }
            , 250);
    }

    clearPlots() {
        this.facetResults = [];
    }

    clearAll() {
        this.clearPlots();
        this.facets = new Set();
        this.facetFilters = [];
        this._showInitMessage = true;

        this.clearSelectedOptions = true;
        this.clearSelectedOptions = false;
    }

    isNotEmpty(myArray) {
        return typeof myArray !== "undefined" && myArray.length > 0;
    }

    getDefaultConfig() {
        return {
            defaultStats: ["creationYear>>creationMonth"]
        };
    }


    render() {
        return html`
            <!-- Facet Fields -->
            <div class="row" style="padding: 0px 15px">
                <div class="col-md-12 card">
                    <h3>Select Aggregation Stats</h3>

                    <div class="col-md-12">
                        ${this._config && this._config.defaultStats && this._config.defaultStats.length ? html`
                            <h4 style="padding-top: 5px">Default Aggregation Stats</h4>
                            <span style="padding-left: 10px">Add default aggregation stats</span>
                            <span style="padding-left: 10px">
                                <button type="button" class="btn btn-primary" @click="${this.addDefaultStats}">Add</button>
                            </span>
                            ` : null }
                    </div>

                    <div class="col-md-12">
                        <h4 style="padding: 20px 0px 5px 0px">Select Custom Aggregation Fields</h4>

                        <div class="row">
                            <div class="col-md-5" style="padding: 0px 30px 0px 10px">
                                <opencga-facet-view-selector
                                    id="${this._prefix}-ofvs-first" .terms="${this.dataModelTerms}" .variableSets="${this.variableSets}"
                                    @variablechange="${this.onVariableSelectedChange}" .clear="${this.clearSelectedOptions}">
                                </opencga-facet-view-selector>
                            </div>
                            <div class="col-md-5" style="padding: 0px 10px 0px 30px">
                                <opencga-facet-view-selector
                                    id="${this._prefix}-ofvs-nested" .terms="${this.dataModelTerms}" .variableSets="${this.variableSets}"
                                    @variablechange="${this.onVariableSelectedChange}" .clear="${this.clearSelectedOptions}"
                                    ?disabled="${this.disableNestedSelector}">
                                </opencga-facet-view-selector>
                            </div>

                            <div class="col-md-1 col-md-offset-1" style="padding-top: 25px">
                                <button type="button" class="btn btn-primary" @click="${this.addFacet}" style="cursor: pointer">Add</button>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-12">
                        <div style="padding: 35px 10px 15px 25px">
                            ${this.facetFilters.length ? html`
                                <span style="font-weight: bold; padding-right: 10px">Selected Aggregation Fields:</span>
                                ${this.facetFilters.map(item => html`
                                    <button type="button" class="btn btn-warning btn-sm ${item}" data-facet="${item}" @click="${this.removeFacet}"
                                        @mouseover="${this._onMouseOver}" @mouseout="${this._onMouseOut}">
                                            ${item}
                                    </button>
                               `)}

                            ` : null}

                        </div>
                    </div>

                    <div class="col-md-10 col-md-offset-2">
                        <div style="float: right; padding: 10px">
                            <button type="button" class="btn btn-primary btn-lg" @click="${this.fetchData}">Run</button>
                        </div>

                        <div style="float: right; padding: 10px">
                            <button type="button" class="btn btn-primary btn-lg" @click="${this.clearAll}">Clear</button>
                        </div>
                    </div>
                </div>

                <!-- RESULTS - Facet Plots -->
                <h3>Results</h3>
                ${this._showInitMessage ? html`
                    <h4 style="padding-left: 20px">No aggregation fields selected.</h4>
                ` : null}

                <div id="facetResultsDiv">
                ${this.facetResults && this.facetResults.length && this.facetResults.map(item => html`
                    <div style="padding: 20px">
                        <h4>${item.name}</h4>
                        <opencga-facet-result-view .facetResult="${item}" .config="${this._config.result}"></opencga-facet-result-view>
                    </div>
                `)}
                </div>

            </div>

            <div class="modal fade" id="${this._prefix}LoadingModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Loading ...</h3>
                        </div>
                        <div class="modal-body">
                            <div class="progress progress-striped active">
                                <div class="progress-bar progress-bar-success" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("opencga-facet-view", OpencgaFacetView);
