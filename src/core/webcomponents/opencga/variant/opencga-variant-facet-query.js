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
import OpencgaFacetResultView from "./../commons/opencga-facet-result-view.js";

//TODO avg(popFreq__1kG_phase3__AFR)[0..1]:0.1>>avg(popFreq__GNOMAD_GENOMES__EAS[0..1]):0.1


class OpencgaVariantFacetQuery extends LitElement {

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
            query: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        // this.checkProjects = true;

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

        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query")) {
            this.propertyObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    propertyObserver(opencgaSession, query) {
        // this.clear();
        PolymerUtils.show(this._prefix + "Warning");
    }

    /**
     * Apply the 'config' properties on the default
     */
    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFacetFieldChange(e) {
        if (e.target.selectedOptions[0].dataset.range !== undefined && e.target.selectedOptions[0].dataset.range !== "undefined") {
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", e.target.selectedOptions[0].dataset.range);
        } else {
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", "");
        }
    }

    onNestedFacetFieldChange(e) {
        if (e.target.selectedOptions[0].dataset.range !== undefined && e.target.selectedOptions[0].dataset.range !== "undefined") {
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", e.target.selectedOptions[0].dataset.range);
        } else {
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", "");
        }
    }


    //TODO css refactor
    _onMouseOver(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.facet, "text-decoration", "line-through");
        console.warn("CSS refactor!");
    }

    _onMouseOut(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.facet, "text-decoration", "none");
    }

    addDefaultStats(e) {
        for (let i = 0; i < this._config.defaultStats.fields.length; i++) {
            this.facets.add(this._config.defaultStats.fields[i]);
        }
        this.facetFilters = Array.from(this.facets);
        this.requestUpdate();
    }

    addFacet(e) {
        let facetField = PolymerUtils.getValue(this._prefix + "FacetField");
        if (facetField !== "none") {
            let facetFieldIncludes = PolymerUtils.getValue(this._prefix + "FacetFieldIncludes");

            // TODO check Range is not empty
            let facet = facetField + facetFieldIncludes;
            let nestedFacetField = PolymerUtils.getValue(this._prefix + "NestedFacetField");
            if (nestedFacetField !== "none") {
                let nestedFacetFieldIncludes = PolymerUtils.getValue(this._prefix + "NestedFacetFieldIncludes");
                // TODO check Range is not empty
                facet += ">>" + nestedFacetField + nestedFacetFieldIncludes;
            }

            $(this).find("option:selected").each(function(){
                console.log("optgroup", $(this).parent().attr("label"));
            });


            // Add facet
            this.facets.add(facet);
            this.facetFilters = Array.from(this.facets);

            // Clear form controls
            PolymerUtils.setValue(this._prefix + "FacetField", "none");
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", "");
            PolymerUtils.setValue(this._prefix + "NestedFacetField", "none");
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", "");

            this.requestUpdate();
        }
    }

    removeFacet(e) {
        this.facets.delete(e.target.dataset.facet);
        this.facetFilters = Array.from(this.facets);
        this.requestUpdate();
    }

    isTerm(facetField) {
        for (let term of this._config.fields.terms) {
            if (facetField === term.value) {
                return true;
            }
        }
        return false;
    }

    fetchData() {
        if (UtilsNew.isUndefinedOrNull(this.opencgaSession.opencgaClient)) {
            console.log("opencgaClient is null or undefined");
            return;
        }

        if (this.facets.size === 0) {
            alert("No facets selected.");
            return;
        }

        PolymerUtils.hide(this._prefix + "Warning");

        this.clearPlots();
        // Shows loading modal
        $("#" + this._prefix + "LoadingModal").modal("show");

        // Join 'query' from left menu and facet filters
        let queryParams = Object.assign({}, this.query,
            {
                study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                sid: this.opencgaSession.opencgaClient._config.sessionId,
                fields: this.facetFilters.join(";"),
                timeout: 60000
            });


        console.warn("queryParams", queryParams)
        let _this = this;
        //TODO check why setTimeout
        setTimeout(() => {
                this.opencgaSession.opencgaClient.variants().aggregationStats(queryParams, {})
                    .then(function(queryResponse) {
                        // let response = queryResponse.response[0].result[0].result;
                        _this.facetResults = queryResponse.response[0].result[0].results;

                        // Remove loading modal
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                        _this._showInitMessage = false;
                        _this.requestUpdate();
                    })
                    .catch(function(e) {
                        console.log(e);
                        // Remove loading modal
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                        _this._showInitMessage = false;
                        _this.requestUpdate();
                    });
            }
            , 250);
    }

    clearPlots() {
        if (UtilsNew.isNotUndefined(this.results) && this.results.length > 0) {
            for (let result of this.results) {
                PolymerUtils.removeElement(this._prefix + result.name + "Plot");
            }
        }
        this.results = [];
    }

    clear() {
        this.clearPlots();
        this.chromosome = "";

        this.facets = new Set();
        this.facetFilters = Array.from(this.facets);

        PolymerUtils.hide(this._prefix + "Warning");

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
        this.requestUpdate();
    }

    // onHistogramChart(e) {
    //     this.highlightActivePlot(e.target.parentElement);
    //     let id = e.target.dataId;
    //     //TODO Refactor
    //     this.renderHistogramChart("#" + this._prefix + id + "Plot", id);
    //
    //     PolymerUtils.hide(this._prefix + id + "Table");
    // }
    //
    // onPieChart(e) {
    //     this.highlightActivePlot(e.target.parentElement);
    //     let id = e.target.dataId;
    //     this.renderPieChart("#" + this._prefix + id + "Plot", id);
    //     PolymerUtils.hide(this._prefix + id + "Table");
    // }
    //
    // onTabularView(e) {
    //     this.highlightActivePlot(e.target.parentElement);
    //     let id = e.target.dataId;
    //     PolymerUtils.innerHTML(this._prefix + id + "Plot", "");
    //     PolymerUtils.show(this._prefix + id + "Table", "table");
    // }
    //
    // highlightActivePlot(button) {
    //     // PolymerUtils.removeClass(".plots", "active");
    //     // PolymerUtils.addClass(button, "active");
    // }
    //
    // fetchVariants() {
    //     if (UtilsNew.isNotUndefined(this.opencgaSession.opencgaClient)) {
    //         let queryParams = {
    //             sid: this.opencgaSession.opencgaClient._config.sessionId,
    //             timeout: 60000,
    //             summary: true,
    //             limit: 1
    //         };
    //         Object.assign(queryParams, this.query);
    //
    //         if (UtilsNew.isEmpty(queryParams.studies) || queryParams.studies.split(new RegExp("[,;]")).length == 1) {
    //             queryParams.studies = this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias;
    //         }
    //
    //         let _this = this;
    //         this.opencgaSession.opencgaClient.variants().query(queryParams, {})
    //             .then(function (response) {
    //                 _this.totalVariants = response.response[0].numTotalResults;
    //             });
    //     }
    // }

    // checkField(category) {
    //     return category === "field";
    // }
    //
    // subFieldExists(field) {
    //     return UtilsNew.isNotEmpty(field);
    // }
    //
    // fieldExists(countObj) {
    //     return UtilsNew.isNotUndefined(countObj.field);
    // }
    //
    // countSubFields(countObj) {
    //     return countObj.field.counts.length + 1;
    // }
    //
    // _isValidField(item) {
    //     for (let field of this._config.fields) {
    //         if (field.value == item.value) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    getDefaultConfig() {
        return {
            // title: "Aggregation Stats",
            active: false,
            populationFrequencies: true,
            defaultStats: {
                visible: true,
                fields: ["chromosome", "biotypes", "type"]
            },
            fields: {
                terms: [
                    {
                        name: "Chromosome", value: "chromosome"
                    },
                    {
                        name: "Studies", value: "studies"
                    },
                    {
                        name: "Variant Type", value: "type"
                    },
                    {
                        name: "Genes", value: "genes"
                    },
                    {
                        name: "Biotypes", value: "biotypes"
                    },
                    {
                        name: "Consequence Type", value: "soAcc"
                    }
                ],
                ranges: [
                    {
                        name: "PhastCons", value: "phastCons", default: "[0..1]:0.1"
                    },
                    {
                        name: "PhyloP", value: "phylop", default: ""
                    },
                    {
                        name: "Gerp", value: "gerp", default: "[-12.3..6.17]:2"
                    },
                    {
                        name: "CADD Raw", value: "caddRaw"
                    },
                    {
                        name: "CADD Scaled", value: "caddScaled"
                    },
                    {
                        name: "Sift", value: "sift", default: "[0..1]:0.1"
                    },
                    {
                        name: "Polyphen", value: "polyphen", default: "[0..1]:0.1"
                    }
                ]
            }
        };
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
            .deletable:hover {
                text-decoration: line-through;
            }
        </style>

        <!--<template is="dom-if" if="{{checkProjects}}">-->
        <div class="row">
            <div class="panel panel-default col-md-12">
                <div class="col-md-12">
                    ${this._config.defaultStats.visible ? html`
                        <h3 style="padding-top: 5px">Default Aggregation Stats</h3>
                            <label style="padding-top: 10px; padding-left: 15px">Add default aggregation stats</label>
                            <span style="padding-left: 10px">
                                    <button type="button" class="btn btn-primary" @click="${this.addDefaultStats}">Add</button>
                            </span>
                    ` : null}
                </div>

                <!-- Facet Fields -->
                <div class="col-md-12">
                    <h3 style="padding-top: 10px;padding-bottom: 10px">Aggregation Fields</h3>

                    <div class="form-group">
                        <div class="col-md-2">
                            <label>Select a Term or Range Facet</label>
                            <select id="${this._prefix}FacetField" class="form-control ${this._prefix}FilterSelect bootstrap-select" @change="${this.onFacetFieldChange}">
                                <option value="none" selected>Select a field...</option>
                                <optgroup label="TERM FACET">
                                    ${this._config.fields && this._config.fields.terms && this._config.fields.terms.length && this._config.fields.terms.map(item => html`
                                        <option value="${item.value}" data-facettype="term">${item.name}</option>
                                    `)}
                                </optgroup>
                                <optgroup label="RANGE FACET">
                                    ${this._config.fields.ranges ? html`
                                        <option disabled>Conservation & Deleteriousness</option>
                                        ${this._config.fields.ranges.map(item => html`
                                            <option value="MISSING AGGREGATION FIELD ${item.value}" data-range="${item.default}" data-facettype="range">${item.name}</option>
                                        `)}
                                    ` : null}
                                    ${this._config.populationFrequencies ? html`
                                        <option disabled>Population frequencies</option>
                                        ${this.populationFrequencies && this.populationFrequencies.studies.length ? this.populationFrequencies.studies.map(study => html`
                                            ${study.populations.length ? study.populations.map(population => html`
                                                <option value="popFreq__${study.id}__${population.id}" data-range="[0..1]:0.1" data-facettype="range">${study.id}_${population.id}</option>
                                            `) : null}
                                        `) : null}
                                    ` : null}
                                </optgroup>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label>Include values or set range</label>
                            <!--<textarea id="${this._prefix}FacetFieldIncludes" class="form-control" rows="1" placeholder="Include values or range"></textarea>-->


                            <div class="input-group">
                                <input id="${this._prefix}FacetFieldIncludes" type="text" class="form-control dropdown-toggle" value="" placeholder="Include values or range">
                                <span role="button" class="input-group-addon dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                                      aria-expanded="false">
                                    <span class="caret"></span>
                                </span>

                                <!--<input id="${this._prefix}FacetFieldIncludes" type="text" class="form-control" value="" placeholder="Include values or range">-->
                                <!--<div class="input-group-btn">-->
                                <!--<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">-->
                                <!--<span class="caret"></span>-->
                                <!--</button>-->


                                <ul class="dropdown-menu">
                                    <li class="dropdown-header" style="font-weight: bold;font-size: 1.10em">Aggregation Function</li>
                                    <!--<li class="disabled"><a href="#" data-value="+47">Avg</a></li>-->
                                    <li><a href="#" data-value="avg">Average</a></li>
                                    <li><a href="#" data-value="percentile">Percentile</a></li>
                                    <li role="separator"  class="divider"></li>
                                    <li><a href="#" data-value="reset">Reset</a></li>
                                </ul>
                                <!--</div>-->
                            </div>

                            <div>
                                <span style="font-style: italic;color: grey;font-size: 0.9em">For Terms you can set include values with [], e.g. for chromosome [1,2,3]</span>
                                <br>
                                <span style="font-style: italic;color: grey;font-size: 0.9em">For Range facets you can set [start..end]:step, e.g. for sift[0..1]:0.1</span>
                            </div>
                        </div>

                        <div class="col-md-2" style="padding-left: 50px">
                            <label>Nested Facet (optional)</label>
                            <select id="${this._prefix}NestedFacetField" class="form-control ${this._prefix}FilterSelect bootstrap-select" @change="${this.onNestedFacetFieldChange}">
                                <option value="none" selected>Select a field...</option>
                                <optgroup label="TERM FACET">
                                    ${this._config.fields && this._config.fields.terms && this._config.fields.terms.length && this._config.fields.terms.map(item => html`
                                        <option value="${item.value}" data-facettype="term">${item.name}</option>
                                    `)}
                                </optgroup>
                                <optgroup label="RANGE FACET">
                                    ${this._config.fields.ranges ? html`
                                        <option disabled>Conservation & Deleteriousness</option>
                                        ${this._config.fields.ranges.length && this._config.fields.ranges.map(item => html`
                                            <option value="${item.value}" data-range="${item.default}" data-facettype="range">${item.name}</option>
                                        `)}  
                                    ` : null}
                                    ${this._config.populationFrequencies ? html`
                                        <option disabled>Population frequencies</option>
                                        ${this.populationFrequencies.studies.map(study => html`
                                            ${study.populations.length ? study.populations.map(population => html`
                                                <option value="${study.id}_${population.id}" data-range="[0..1]:0.1" data-facettype="range">${study.id}_${population.id}</option>
                                            `) : null}
                                        `)}
                                    ` : null}
                                </optgroup>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label>Include values or set range</label>
                            <textarea id="${this._prefix}NestedFacetFieldIncludes" class="form-control" rows="1" placeholder="Include values"></textarea>
                        </div>

                        <div class="col-md-1" style="padding-top: 25px">
                            <button type="button" class="btn btn-primary" @click="${this.addFacet}" style="cursor: pointer">Add</button>
                        </div>
                    </div>
                </div>

                <div class="col-md-12">
                    <div style="padding: 25px">
                        ${this.facetFilters.length ? html`
                            <span style="font-weight: bold; padding: 0px 20px">Selected Facets:</span>
                            ${this.facetFilters.map(item => html`
                                <button type="button" class="btn btn-warning btn-sm ${item} deletable" data-facet="${item}"
                                        @click="${this.removeFacet}">
                                    ${item}
                                </button>
                            `)}
                        ` : null}
                            
                    </div>
                </div>

                <div class="col-md-6 col-md-offset-2">
                    <div style="float: right; padding: 0px 10px 10px 10px">
                        <button type="button" class="btn btn-primary btn-lg" @click="${this.fetchData}">Run</button>
                    </div>
                    <div style="float: right; padding: 0px 10px 10px 10px">
                        <button type="button" class="btn btn-primary btn-lg" @click="${this.clear}">Clear</button>
                    </div>
                </div>
            </div>


            <!-- RESULTS - Facet Plots -->
            <div class="col-md-12">
                <div class="alert alert-warning col-md-12" role="alert" id="${this._prefix}Warning" style="display: none;padding: 15px;margin-bottom: 10px">
                    <span style="font-weight: bold;font-size: 1.20em">Warning!</span>&nbsp;&nbsp;Filters changed, please click on Run button to update the aggregation results.
                </div>

                <div class="col-md-12">
                    <h2>Results</h2>
                    ${this._showInitMessage ? html`
                        <h4>No facet filters selected</h4>
                    ` : html`
                        ${this.facetResults.map(item => html`
                            <div style="padding: 20px">
                                <h3>${item.name}</h3>
                                <opencga-facet-result-view .facetResult="${item}"
                                                           .config="${this.facetConfig}"
                                                           ?active="${this.facetActive}"
                                                           >
                                </opencga-facet-result-view>
                            </div>
                        `)}
                    `}
                </div>
            </div>
        </div>
        <!--</template>-->

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

customElements.define("opencga-variant-facet-query", OpencgaVariantFacetQuery);
