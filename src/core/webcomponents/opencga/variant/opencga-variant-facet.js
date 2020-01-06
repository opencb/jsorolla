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
import "./opencga-variant-filter.js";
import "../commons/opencga-facet-result-view.js";
import "../../opencga/opencga-active-filters.js";
import "../../commons/filters/select-field-filter.js";
import "../../../loading-spinner.js";

// TODO spring-cleaning the old code

export default class OpencgaVariantFacet extends LitElement {

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
        //console.log("this.query from BROWSER", this.query)
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("executedQuery")) {
            this.fetchVariants();
        }
        if (changedProperties.has("query")) {
            console.warn("queryObserver is commented")
            //this.queryObserver();
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
        console.log("this._config", this._config, this.opencgaSession.project);
        // debugger
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            // Update cohorts from config, this updates the Cohort filter MAF
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
        this._config = Object.assign(this.getDefaultConfig(), this.config);
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
            /*for (let k in this.selectedFacet) {
                this.selectedFacetFormatted[k] = {...this.selectedFacet[k], formatted: _valueFormatter(k, this.selectedFacet[k])};
            }
            this.selectedFacetFormatted = {...this.selectedFacetFormatted};
            */

            //using Object property spreading here creates an Object with numeric indexes in Chrome 78...
            this.selectedFacetFormatted = Object.assign({}, ...Object.keys(this.selectedFacet).map(k => ({[k]: {...this.selectedFacet[k], formatted: _valueFormatter(k, this.selectedFacet[k])} } )) );
        } else {
            this.selectedFacetFormatted = {};
        }
        this.requestUpdate();
    }

    async onFacetFieldChange(e) {
        let currentSelectionNames = $(e.target).val() || [];
        //compute the symmetric difference between this.selectedFacet and currentSelection
        let differences = Object.keys(this.selectedFacet)
            .filter(a => !currentSelectionNames.includes(a))
            .concat(currentSelectionNames.filter(name => !Object.keys(this.selectedFacet).includes(name)));
        if (differences.length > 1) console.error("Difference error!", this.selectedFacet, currentSelectionNames);

        let difference = differences[0];

        //addition
        if (currentSelectionNames.length > Object.keys(this.selectedFacet).length) {
            console.log("addition of", difference);
            const range = this.querySelector(`option[value=${difference}]`).dataset.range;
            //this.selectedFacet.push({name: difference});
            this.selectedFacet[difference] = {value: ""}; //I need an object bacause in case of nested facet there will be another prop
            await this.requestUpdate();
            if (range) {
                this.querySelector(`#${difference}_text`).value = range;
                this.selectedFacet[difference] = {value: range};
            }
            $(".bootstrap-select", this).selectpicker();
        } else {
            console.log("deletion of", difference);
            //deletion
            delete this.selectedFacet[difference];
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFieldChange(e) {
        let parentFacet = e.target.dataset.parentFacet;
        let selected = $(e.target).val();
        let range = e.target.querySelector(`option[value=${selected}]`).dataset.range;
        this.querySelector("#" + parentFacet + "_Nested_text").value = range || "";
        if(selected === "none") {
            delete this.selectedFacet[parentFacet].nested;
        } else {
            this.selectedFacet[parentFacet].nested = {facet: selected, value: range || ""};
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetFnChange(facet, value) {
        if (value === "Avg" || value === "Percentile") {
            this.selectedFacet[facet]["fn"] = value;
            this.querySelector("#" + facet + "_text").disabled = true;
        } else {
            delete this.selectedFacet[facet]["fn"];
            this.querySelector("#" + facet + "_text").disabled = false;
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetFnChange(facet, value) {
        if (this.selectedFacet[facet].nested) {
            this.selectedFacet[facet].nested.fn = value;
        } else {
            console.error("function selected before facet!");
            console.log("facet:", facet, "not exist", this.selectedFacet);
        }
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onNestedFacetTextChange(e) {
        //console.log("parentFacet",e.target.dataset.parentFacet)
        this.selectedFacet[e.target.dataset.parentFacet].nested.value = e.target.value;
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onFacetTextChange(e) {
        let id = e.target.dataset.id;
        //this.selectedFacet = {...this.selectedFacet, [id]: (e.target.value.trim() ? e.target.value : "")};
        this.selectedFacet[id].value = e.target.value.trim() ? e.target.value : "";
        this.selectedFacet = {...this.selectedFacet};
        this.requestUpdate();
    }

    onActiveFacetChange(e) {
        this.selectedFacet = {...e.detail};
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

    /**
     * @deprecated
     * */
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

            // Add facet
            this.facets.add(facet);
            this.facetFilters = Array.from(this.facets);

            // Clear form controls
            PolymerUtils.setValue(this._prefix + "FacetField", "none");
            PolymerUtils.setValue(this._prefix + "FacetFieldIncludes", "");
            PolymerUtils.setValue(this._prefix + "NestedFacetField", "none");
            PolymerUtils.setValue(this._prefix + "NestedFacetFieldIncludes", "");
        }
        this.requestUpdate();
    }

    /**
     * @deprecated
     * */
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

    /**
     * @deprecated
     * */
    addFacets() {
        console.warn("addFacets is commented");
    }

    // addFacets() {
    //     // Facets
    //     if (PolymerUtils.getValue(this._prefix + "FacetField") != "none") {
    //         let field = {
    //             name: PolymerUtils.getTextOptionSelected(this._prefix + "FacetField"),
    //             value: PolymerUtils.getValue(this._prefix + "FacetField")
    //         };
    //         // Includes for facet field
    //         if (PolymerUtils.isNotEmptyValueById(this._prefix + "FieldIncludes")) {
    //             field.name += "[" + PolymerUtils.getValue(this._prefix + "FieldIncludes") + "]";
    //             field.value += "[" + PolymerUtils.getValue(this._prefix + "FieldIncludes") + "]";
    //         }
    //
    //         // Check if the nested field is a valid value
    //         if (PolymerUtils.getValue(this._prefix + "FacetFieldNested") != "none"
    //             && PolymerUtils.getValue(this._prefix + "FacetFieldNested") != PolymerUtils.getValue(this._prefix + "FacetField")) {
    //             // Take it into account only if it is not present already in the selected values
    //
    //             if (this.facetFields.indexOf(PolymerUtils.getValue(this._prefix + "FacetField") + ">>" + PolymerUtils.getValue(this._prefix + "FacetFieldNested")) == -1) {
    //                 let nestedField = {
    //                     name: PolymerUtils.getTextOptionSelected(this._prefix + "FacetFieldNested"),
    //                     value: PolymerUtils.getValue(this._prefix + "FacetFieldNested")
    //                 };
    //                 // Includes for nested facet field
    //                 if (PolymerUtils.isNotEmptyValueById(this._prefix + "NestedFieldIncludes")) {
    //                     nestedField.name += "[" + PolymerUtils.getValue(this._prefix + "NestedFieldIncludes") + "]";
    //                     nestedField.value += "[" + PolymerUtils.getValue(this._prefix + "NestedFieldIncludes") + "]";
    //                 }
    //
    //                 this.push('facetFieldsName', {
    //                     name: field.name + " >> " + nestedField.name,
    //                     value: field.value + ">>" + nestedField.value
    //                 });
    //                 this.push('facetFields', field.value + ">>" + nestedField.value);
    //             }
    //         } else {
    //             this.push('facetFieldsName', {
    //                 name: field.name,
    //                 value: field.value
    //             });
    //             this.push('facetFields', field.value);
    //         }
    //         PolymerUtils.setValue(this._prefix + "FacetField", "none");
    //         PolymerUtils.setValue(this._prefix + "FacetFieldNested", "none");
    //         PolymerUtils.setValue(this._prefix + "FieldIncludes", "");
    //         PolymerUtils.setValue(this._prefix + "NestedFieldIncludes", "");
    //     }
    //
    //     // Facets Range
    //     if (PolymerUtils.getValue(this._prefix + "FacetRangeField") !== "none" && PolymerUtils.isNotEmptyValueById(this._prefix + "FacetRangeStart")
    //         && PolymerUtils.isNotEmptyValueById(this._prefix + "FacetRangeEnd") && PolymerUtils.isNotEmptyValueById(this._prefix + "FacetRangeGap")
    //         && !isNaN(PolymerUtils.getValue(this._prefix + "FacetRangeStart")) && !isNaN(PolymerUtils.getValue(this._prefix + "FacetRangeEnd"))
    //         && !isNaN(PolymerUtils.getValue(this._prefix + "FacetRangeGap"))) {
    //         // if any of the field is already selected, remove the old value before pushing
    //         for (let i = 0; i < this.facetRanges.length; i++) {
    //             if (this.facetRanges[i].startsWith(PolymerUtils.getValue(this._prefix + "FacetRangeField"))) {
    //                 this.splice('facetRanges', i, 1);
    //                 this.splice('facetRangeFields', i, 1);
    //                 break;
    //             }
    //         }
    //         this.push('facetRangeFields', PolymerUtils.getTextOptionSelected(this._prefix + "FacetRangeField")
    //             + "[" + PolymerUtils.getValue(this._prefix + "FacetRangeStart")
    //             + "," + PolymerUtils.getValue(this._prefix + "FacetRangeEnd") + "], Interval :" + PolymerUtils.getValue(this._prefix + "FacetRangeGap"));
    //         this.push('facetRanges', PolymerUtils.getValue(this._prefix + "FacetRangeField") + ":" + PolymerUtils.getValue(this._prefix + "FacetRangeStart")
    //             + ":" + PolymerUtils.getValue(this._prefix + "FacetRangeEnd") + ":" + PolymerUtils.getValue(this._prefix + "FacetRangeGap"));
    //
    //         PolymerUtils.setValue(this._prefix + "FacetRangeField", "none");
    //         PolymerUtils.setValue(this._prefix + "FacetRangeStart", "0");
    //         PolymerUtils.setValue(this._prefix + "FacetRangeEnd", "1");
    //         PolymerUtils.setValue(this._prefix + "FacetRangeGap", "0.1");
    //     }
    //
    //     // Population Frequency Range
    //     if (PolymerUtils.getValue(this._prefix + "PopFreqRangeField") !== "none" && PolymerUtils.isNotEmptyValueById(this._prefix + "PopFreqRangeStart")
    //         && PolymerUtils.isNotEmptyValueById(this._prefix + "PopFreqRangeEnd") && PolymerUtils.isNotEmptyValueById(this._prefix + "PopFreqRangeGap")
    //         && !isNaN(PolymerUtils.getValue(this._prefix + "PopFreqRangeStart")) && !isNaN(PolymerUtils.getValue(this._prefix + "PopFreqRangeEnd"))
    //         && !isNaN(PolymerUtils.getValue(this._prefix + "PopFreqRangeGap"))) {
    //         // if any of the field is already selected, remove the old value before pushing
    //         this.facetRanges.forEach(function (element, index) {
    //             if (element.startsWith(PolymerUtils.getValue(this._prefix + "PopFreqRangeField"))) {
    //                 facetRanges.splice(index, 1);
    //                 facetRangeFields.splice(index, 1);
    //             }
    //         });
    //
    //
    //         this.push('facetRangeFields', PolymerUtils.getValue(this._prefix + "PopFreqRangeField") + "[" + PolymerUtils.getValue(this._prefix + "PopFreqRangeStart")
    //             + "," + PolymerUtils.getValue(this._prefix + "PopFreqRangeEnd") + "], Interval: " + PolymerUtils.getValue(this._prefix + "PopFreqRangeGap"));
    //         this.push('facetRanges', "popFreq_" + PolymerUtils.getValue(this._prefix + "PopFreqRangeField") + ":" + PolymerUtils.getValue(this._prefix + "PopFreqRangeStart")
    //             + ":" + PolymerUtils.getValue(this._prefix + "PopFreqRangeEnd") + ":" + PolymerUtils.getValue(this._prefix + "PopFreqRangeGap"));
    //
    //         PolymerUtils.setValue(this._prefix + "PopFreqRangeField", "none");
    //         PolymerUtils.setValue(this._prefix + "PopFreqRangeStart", "0");
    //         PolymerUtils.setValue(this._prefix + "PopFreqRangeEnd", "1");
    //         PolymerUtils.setValue(this._prefix + "PopFreqRangeGap", "0.1");
    //     }
    //
    //     // Chromosome
    //     if (PolymerUtils.isNotEmptyValueById(this._prefix + "ChromosomeInput")) {
    //         this.chromosome = PolymerUtils.getValue(this._prefix + "ChromosomeInput");
    //         let _this = this;
    //         if (UtilsNew.isNotUndefined(this.cellbaseClient) && this.cellbaseClient instanceof CellBaseClient) {
    //             this.cellbaseClient.get("genomic", "chromosome", this.chromosome, "info", {})
    //                 .then(function (response) {
    //                     let chromosome = response.response[0].result[0].chromosomes[0];
    //                     _this.push("facetRanges", "start:" + chromosome.start + ":" + chromosome.size + ":"
    //                         + PolymerUtils.getValue(_this._prefix + "ChromosomeRangeGap"));
    //                     _this.push("facetRangeFields", chromosome.name + "[" + chromosome.start + "," + chromosome.size + "], Interval: "
    //                         + PolymerUtils.getValue(_this._prefix + "ChromosomeRangeGap"));
    //
    //                     PolymerUtils.setValue(_this._prefix + "ChromosomeInput", "");
    //                     PolymerUtils.setValue(_this._prefix + "ChromosomeRangeGap", "1000000");
    //                     PolymerUtils.setAttribute(_this._prefix + "ChromosomeAdd", "disabled", true);
    //                 });
    //         }
    //     }
    // }
    //
    // removeFacetField(e) {
    //     if (e.target.dataset.field === "field") {
    //         let index = this.facetFields.indexOf(e.target.dataId);
    //         facetFields.splice(index, 1);
    //
    //         this.facetFieldsName.forEach(function (element, index) {
    //             if (element.value === e.target.dataId) {
    //                 facetFieldsName.splice(index, 1);
    //             }
    //         });
    //     } else if (e.target.dataset.field === "range") {
    //         let index = this.facetRangeFields.indexOf(e.target.dataId);
    //         if (this.facetRanges[index].startsWith("start")) {
    //             PolymerUtils.removeAttribute(this._prefix + "ChromosomeAdd", "disabled");
    //         }
    //         this.splice('facetRangeFields', index, 1);
    //         this.splice('facetRanges', index, 1);
    //     }
    // }

    async onRun() {
        this.clearPlots();
        let queryParams = {
            ...this.preparedQuery,
            // sid: this.opencgaClient._config.sessionId,
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            timeout: 60000,
            facet: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
        };
        this.querySelector("#loading").style.display = "block";
        this.opencgaClient.variants().facet(queryParams, {})
            .then(queryResponse => {
                console.log("queryResponse", queryResponse);
                this.errorState = false;
                this.facetResults = queryResponse.response[0].result[0].results;
                this.requestUpdate();
            })
            .catch(e => {
                this.errorState = "Error from server";
                this.requestUpdate();
            })
            .finally(() => {
                this.querySelector("#loading").style.display = "none";
            });
    }

    /**
     * @deprecated
     * */
    fetchData() {
        if (UtilsNew.isUndefinedOrNull(this.opencgaClient)) {
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
        let queryParams = Object.assign({}, this.executedQuery,
            {
                // sid: this.opencgaClient._config.sessionId,
                study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                timeout: 60000,
                facet: this.facetFilters.join(";")
            });

        let _this = this;
        setTimeout(() => {
                this.opencgaClient.variants().facet(queryParams, {})
                    .then(function(queryResponse) {
                        // let response = queryResponse.response[0].result[0].result;
                        _this.facetResults = queryResponse.response[0].result[0].results;

                        console.log("facetResults", _this.facetResults);
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

//             render() {
//                 if (UtilsNew.isUndefined(this.opencgaClient)) {
//                     return;
//                 }
//
//                 if (this.facetFields.length === 0 && this.facetRangeFields.length === 0) {
//                     alert("Add some facet fields.");
//                     return;
//                 }
//
//                 this.clearPlots();
//
//                 // Shows loading modal
//                 $(PolymerUtils.getElementById(this._prefix + "LoadingModal")).modal("show");
//
//                 let _fieldNamesMap = {};
//                 for (let f of this._config.fields) {
//                     _fieldNamesMap[f.value] = f.name;
//                 }
//                 for (let f of this._config.ranges) {
//                     _fieldNamesMap[f.value] = f.name;
//                 }
//                 // Add chromosome to _fieldNamesMap
//                 _fieldNamesMap["start"] = "Chromosome";
//
//                 this.fieldNamesMap = _fieldNamesMap;
//
//                 let queryParams = {
// //                    sid: this.opencgaClient._config.sessionId,
//                     timeout: 60000
//                 };
//                 if (UtilsNew.isNotUndefinedOrNull(this.opencgaClient._config.sessionId)) {
//                     queryParams.sid = this.opencgaClient._config.sessionId;
//                 }
//                 Object.assign(queryParams, this.query);
//
// //                if (UtilsNew.isNotEmpty(queryParams.sid)) {
// //                    delete queryParams["sid"];
// //                }
//
//                 if (UtilsNew.isEmpty(queryParams.studies) || queryParams.studies.split(new RegExp("[,;]")).length === 1) {
//                     queryParams.studies = this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias;
//                 }
//
//                 if (UtilsNew.isNotEmpty(this.chromosome)) {
//                     queryParams.region = this.chromosome;
//                 }
//                 if (this.facetFields.length > 0) {
//                     queryParams.facet = this.facetFields.join(";");
//                 }
//                 if (this.facetRanges.length > 0) {
//                     queryParams.facetRange = this.facetRanges.join(";");
//                 }
//
//                 let _this = this;
//                 // Promise needs to be executed in a setTimeout to give time the browser to update the DOM and show the loading modal
//                 setTimeout(() => {
//                         this.opencgaClient.variants().facet(queryParams, {})
//                             .then(function (queryResponse) {
//                                 let response = queryResponse.response[0].result[0].result;
//
//                                 let _facetResults = {};
//                                 let _results = [];
//                                 debugger
//                                 // Facet fields
//                                 for (let field of response.facetFields) {
//                                     let _name;
//                                     let _subField = "";
//                                     if (UtilsNew.isUndefined(field.buckets[0].field)) {
//                                         _name = field.name;
//                                     } else {
//                                         _name = field.name + "-" + field.buckets[0].field.name;
//                                         _subField = field.counts[0].field.name;
//                                     }
//                                     _facetResults[_name] = field;
//                                     _facetResults[_name].title = _this.fieldNamesMap[field.name]; // Setting title before we modify name property
//                                     _facetResults[_name].name = _name;
//                                     _facetResults[_name].subField = _this.fieldNamesMap[_subField];
//                                     _facetResults[_name].renderHistogramChart = true;
//                                     _facetResults[_name].renderPieChart = true;
//                                     _facetResults[_name].category = "field";
//                                     _results.push(_facetResults[field.name]);
//
//
//                                 }
//
//                                 // Facet Ranges
//                                 // for (let range of response.ranges) {
//                                 //     _facetResults[range.name] = range;
//                                 //     _facetResults[range.name].title = _this.fieldNamesMap[range.name];
//                                 //     _facetResults[range.name].renderHistogramChart = true;
//                                 //     _facetResults[range.name].renderPieChart = false;
//                                 //     _facetResults[range.name].category = "range";
//                                 //
//                                 //     // Preparing data for table
//                                 //     let data = [];
//                                 //     let start = Number(range.start);
//                                 //     for (let rangeCount of range.counts) {
//                                 //         if (Math.round(start) !== start) {
//                                 //             start = Number(start.toFixed(1));
//                                 //         }
//                                 //         let end = Number(start + range.gap);
//                                 //         if (Math.round(end) !== end) {
//                                 //             end = Number(end.toFixed(1));
//                                 //         }
//                                 //         data.push({
//                                 //             range: start + "-" + end,
//                                 //             count: rangeCount
//                                 //         });
//                                 //         start = end;
//                                 //     }
//                                 //     _facetResults[range.name].data = data;
//                                 //
//                                 //     _results.push(_facetResults[range.name]);
//                                 // }
//
//                                 _this.facetResults = Object.assign({}, _facetResults);
//                                 _this.results = _results;
//                                 debugger
//                                 _this.$.resultsDiv.render();
//                                 for (let result of _this.results) {
//                                     _this.renderHistogramChart("#" + _this._prefix + result.name + "Plot", result.name);
//                                 }
//
//                                 // Remove loading modal
//                                 $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
//                                 _this._showInitMessage = false;
//                             })
//                             .catch(function (e) {
//                                 console.log(e);
//                                 // Remove loading modal
//                                 $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
//                                 _this._showInitMessage = false;
//                             });}
//                     , 250);
//
//             }

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

    // renderHistogramChart(div, id) {
    //     let params = this._getHistogramData(id);
    //
    //     $(div).highcharts({
    //         credits: {enabled: false},
    //         chart: {
    //             type: "column"
    //         },
    //         title: {
    //             text: params.title || params.name
    //         },
    //         xAxis: {
    //             categories: params.categories
    //         },
    //         yAxis: {
    //             min: 0,
    //             title: {
    //                 text: 'Total number of Variants'
    //             }
    //         },
    //         tooltip: {
    //             headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    //             pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
    //                 '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
    //             footerFormat: '</table>',
    //             shared: true,
    //             useHTML: true
    //         },
    //         plotOptions: {
    //             column: {
    //                 pointPadding: 0.2,
    //                 borderWidth: 0
    //             }
    //         },
    //         series: params.series
    //     });
    // }

    // renderPieChart(div, id) {
    //     let params;
    //     let renderDonut = false;
    //     if (UtilsNew.isNotUndefined(this.facetResults[id]) && UtilsNew.isNotUndefined(this.facetResults[id].buckets[0].field)) {
    //         params = this._getDonutData(id);
    //         renderDonut = true;
    //     } else {
    //         params = this._getPieData(id);
    //     }
    //
    //     if (renderDonut) {
    //         $(div).highcharts({
    //             credits: {enabled: false},
    //             chart: {
    //                 type: 'pie'
    //             },
    //             title: {
    //                 text: params.title || params.name
    //             },
    //             plotOptions: {
    //                 pie: {
    //                     shadow: false,
    //                     center: ['50%', '50%']
    //                 }
    //             },
    //             series: params.series
    //         });
    //     } else {
    //         $(div).highcharts({
    //             credits: {enabled: false},
    //             chart: {
    //                 plotBackgroundColor: null,
    //                 plotBorderWidth: null,
    //                 plotShadow: false,
    //                 type: 'pie'
    //             },
    //             title: {
    //                 text: params.title
    //             },
    //             tooltip: {
    //                 pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    //             },
    //             plotOptions: {
    //                 pie: {
    //                     allowPointSelect: true,
    //                     cursor: 'pointer',
    //                     dataLabels: {
    //                         enabled: false
    //                     },
    //                     showInLegend: true
    //                 }
    //             },
    //             series: params.series
    //         });
    //     }
    // }

    // _getHistogramData(id) {
    //     let params;
    //     if (this.facetResults[id].category === "field") {
    //         let field = this.facetResults[id];
    //         let fields = field.name.split("-");
    //         let title = [];
    //         if (fields.length > 1) {
    //             for (let name of fields) {
    //                 title.push(this.fieldNamesMap[name]);
    //             }
    //         } else {
    //             title.push(this.fieldNamesMap[field.name]);
    //         }
    //         let obj = {
    //             name: field.name,
    //             title: title.join(" - "),
    //             categories: [],
    //             series: []
    //         };
    //         let series = {};
    //         let data = [];
    //         for (let i = 0; i < field.buckets.length; i++) {
    //             let countObj = field.buckets[i];
    //             obj.categories.push(countObj.value);
    //             if (UtilsNew.isNotUndefined(countObj.field)) {
    //                 obj.nestedField = countObj.field.name;
    //                 for (let nestedCountObj of countObj.field.buckets) {
    //                     if (UtilsNew.isUndefined(series[nestedCountObj.value])) {
    //                         series[nestedCountObj.value] = [];
    //                     }
    //                     // It is important to push 'index' as we need to take care of the missing values
    //                     series[nestedCountObj.value].push({index: i, count: nestedCountObj.count});
    //                 }
    //             } else {
    //                 data.push(countObj.count);
    //             }
    //         }
    //
    //         if (Object.keys(series).length > 0) {
    //             for (let key in series) {
    //                 let data = [];
    //                 for (let countIndex of series[key]) {
    //                     data[countIndex.index] = countIndex.count;
    //                 }
    //                 for (let i = 0; i < data.length; i++) {
    //                     if (UtilsNew.isUndefined(data[i])) {
    //                         data[i] = 0; // Setting '0' for missing fields
    //                     }
    //                 }
    //                 obj.series.push({name: key, data: data});
    //             }
    //         } else {
    //             obj.series.push({name: field.name, data: data});
    //         }
    //         params = obj;
    //     } else if (this.facetResults[id].category === "range") {
    //         let range = this.facetResults[id];
    //         let obj = {
    //             name: range.name,
    //             title: this.fieldNamesMap[range.name] || range.name,
    //             categories: [],
    //             series: [],
    //         };
    //         let data = [];
    //         let start = Number(range.start);
    //         for (let rangeCount of range.counts) {
    //             if (Math.round(start) !== start) {
    //                 start = Number(start.toFixed(1));
    //             }
    //             let end = Number(start + range.gap);
    //             if (Math.round(end) !== end) {
    //                 end = Number(end.toFixed(1));
    //             }
    //             obj.categories.push(start + "-" + end);
    //             data.push(rangeCount);
    //             start = end;
    //         }
    //         obj.series.push({name: range.name, data: data});
    //         params = obj;
    //     }
    //     return params;
    // }
    //
    // _getPieData(id) {
    //     let field = this.facetResults[id];
    //     let pieData = {
    //         name: field.name,
    //         title: this.fieldNamesMap[field.name],
    //         series: []
    //     };
    //     let data = [];
    //     for (let countObj of field.counts) {
    //         data.push({name: countObj.value, y: countObj.count});
    //     }
    //     pieData.series.push({
    //         name: field.name,
    //         colorByPoint: true,
    //         data: data
    //     });
    //
    //     return pieData;
    // }
    //
    // _getDonutData(id) {
    //     let field = this.facetResults[id];
    //     let fields = field.name.split("-");
    //     let title = [];
    //     if (fields.length > 1) {
    //         for (let name of fields) {
    //             title.push(this.fieldNamesMap[name]);
    //         }
    //     } else {
    //         title.push(this.fieldNamesMap[field.name]);
    //     }
    //     let donutData = {
    //         name: field.name,
    //         title: title.join(" - "),
    //         series: []
    //     };
    //
    //     let colors = Highcharts.getOptions().colors;
    //     let categories = [];
    //     let data = [];
    //     for (let i = 0; i < field.counts.length; i++) {
    //         let fieldObj = field.counts[i];
    //         categories.push(fieldObj.value);
    //         let subField = fieldObj.field;
    //         let subCategories = [];
    //         let subData = [];
    //         for (let countObj of subField.counts) {
    //             subCategories.push(countObj.value);
    //             subData.push(countObj.count);
    //         }
    //         data.push({
    //             y: fieldObj.count,
    //             color: colors[i],
    //             drilldown: {
    //                 name: subField.name,
    //                 categories: subCategories,
    //                 data: subData,
    //                 color: colors[i]
    //             }
    //         });
    //     }
    //     let levelOneData = [];
    //     let levelTwoData = [];
    //
    //     // Build the data arrays
    //     for (let i = 0; i < data.length; i++) {
    //         // add level one data
    //         levelOneData.push({
    //             name: categories[i],
    //             y: data[i].y,
    //             color: data[i].color
    //         });
    //
    //         // add level two data
    //         let drillDataLen = data[i].drilldown.data.length;
    //         for (let j = 0; j < drillDataLen; j++) {
    //             let brightness = 0.2 - (j / drillDataLen) / 5;
    //             levelTwoData.push({
    //                 name: data[i].drilldown.categories[j],
    //                 y: data[i].drilldown.data[j],
    //                 color: Highcharts.Color(data[i].color).brighten(brightness).get()
    //             });
    //         }
    //     }
    //
    //     let [levelOneField, levelTwoField] = field.name.split("-");
    //     donutData.series.push({
    //         name: levelOneField,
    //         data: levelOneData,
    //         size: '60%',
    //         dataLabels: {
    //             formatter: function () {
    //                 return this.y > 5 ? this.point.name : null;
    //             },
    //             color: '#ffffff',
    //             distance: -30
    //         }
    //     });
    //     donutData.series.push({
    //         name: levelTwoField,
    //         data: levelTwoData,
    //         size: '80%',
    //         innerSize: '60%',
    //         dataLabels: {
    //             formatter: function () {
    //                 // display only if larger than 1
    //                 return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y : null;
    //             }
    //         }
    //     });
    //     return donutData;
    // }

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

    checkField(category) {
        return category === "field";
    }

    subFieldExists(field) {
        return UtilsNew.isNotEmpty(field);
    }

    fieldExists(countObj) {
        return UtilsNew.isNotUndefined(countObj.field);
    }

    countSubFields(countObj) {
        return countObj.field.counts.length + 1;
    }

    _isValidField(item) {
        for (let field of this._config.fields) {
            if (field.value == item.value) {
                return false;
            }
        }
        return true;
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    /*
    onQueryFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;

        this.fetchVariants();

        this.requestUpdate();
    }
*/
    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant facet", e.detail);
        //TODO FIXME! study prop have to be wiped off. use studies instead
        this.preparedQuery = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        //this.requestUpdate();
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        this.preparedQuery = {...this.query};
    }

    getDefaultConfig() {
        return {
            title: "Aggregation Stats",
            active: false,
            populationFrequencies: true,
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
                        name: "CADD Raw", value: "caddRaw", default: ""
                    },
                    {
                        name: "CADD Scaled", value: "caddScaled", default: ""
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
                    <i class="fas fa-chart-bar" aria-hidden="true"></i>&nbsp;${this._config.title}
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
                        <div role="tabpanel" class="tab-pane active" id="facet_tab">
                
                            <div class="">
                                <label>Select a Term or Range Facet</label>
                                <select id="${this._prefix}FacetField" class="form-control ${this._prefix}FilterSelect bootstrap-select" @change="${this.onFacetFieldChange}" multiple>
                                    <optgroup label="Terms Facet">
                                            ${this._config.fields.terms && this._config.fields.terms.map(item => html`
                                                <option value="${item.value}" data-facettype="term">${item.name}</option>
                                            `)}
                                    </optgroup>
                                    <optgroup label="Range Facet">
                                        ${this._config.fields.ranges ? html`
                                            <option disabled>CONSERVATION & DELETERIOUSNESS</option>
                                            ${this._config.fields.ranges.map(item => html`
                                                <option value="${item.value}" data-range="${item.default}" data-facettype="range">${item.name}</option>
                                            `)}
                                        ` : null}
                                        ${this._config.populationFrequencies ? html`
                                            <option disabled>POPULATION FREQUENCIES</option>
                                            ${this.populationFrequencies.studies.map(study => html`
                                                ${study.populations.map(population => html`
                                                    <option value="popFreq__${study.id}__${population.id}"  data-range="[0..1]:0.1" data-facettype="range">${study.id}_${population.id}</option>
                                                `)}
                                           `)}
                                        ` : null}
                                    </optgroup>
                                </select>
                            </div>
                            
                            <div class="facet-list-container panel-group">
                                ${Object.entries(this.selectedFacet).map(facet => html`
                                    <div class="container-fluid facet-row-container">
                                        <div class="row ">
                                            <div class="panel panel-default filter-section">
                                                <div class="panel-heading" role="tab" id="${this._prefix}Heading">
                                                    <h4 class="panel-title">
                                                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                                            href="#${this._prefix}${facet[0]}" aria-expanded="true" aria-controls="${this._prefix}">
                                                            <p class="subsection-content">${facet[0]}</p>
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="${this._prefix}${facet[0]}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="${this._prefix}Heading">
                                                    <div class="panel-body">
                                                        <div class="row facet-row">
                                                            <div class="col-md-6">
                                                                <input type="text" class="form-control subsection-content" id="${facet[0]}_text" data-id="${facet[0]}" @input="${this.onFacetTextChange}" .value="${facet[1].value || ""}" placeholder="Include values or set range" />
                                                            </div>
                                                            <div class="col-md-6">
                                                                <select-field-filter .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" @filterChange="${e => this.onFacetFnChange(facet[0], e.detail.value[0])}"></select-field-filter>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- nested facet -->
                                                        <div class="row facet-row nested">
                                                            <div class="col-md-12">
                                                                <label for="${facet[0]}_text">Nested Facet (optional)</label>
                                                           
                                                                <select id="${this._prefix}${facet[0]}NestedFacetField" class="form-control ${this._prefix}FilterSelect bootstrap-select" data-parent-facet="${facet[0]}" @change="${this.onNestedFacetFieldChange}">
                                                                    <option value="none">Select nested facet...</option>
                                                                    <optgroup label="Terms Facet">
                                                                            ${this._config.fields.terms && this._config.fields.terms.map(item => html`
                                                                                <option value="${item.value}" data-facettype="term">${item.name}</option>
                                                                            `)}
                                                                    </optgroup>
                                                                    <optgroup label="Range Facet">
                                                                        ${this._config.fields.ranges ? html`
                                                                            <option disabled>CONSERVATION & DELETERIOUSNESS</option>
                                                                            ${this._config.fields.ranges.map(item => html`
                                                                                <option value="${item.value}" data-range="${item.default}" data-facettype="range">${item.name}</option>
                                                                            `)}
                                                                        ` : null}
                                                                        ${this._config.populationFrequencies ? html`
                                                                            <option disabled>POPULATION FREQUENCIES</option>
                                                                            ${this.populationFrequencies.studies.map(study => html`
                                                                                ${study.populations.map(population => html`
                                                                                    <option value="popFreq__${study.id}__${population.id}" data-range="[0..1]:0.1" data-facettype="range">${study.id}_${population.id}</option>
                                                                                `)}
                                                                           `)}
                                                                        ` : null}
                                                                    </optgroup>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="row facet-row nested">
                                                            <div class="col-md-6">
                                                                <!-- <label for="${facet[0]}_text">Include values or set range</label> -->
                                                                <input type="text" class="form-control subsection-content" .disabled="${!(facet[1].nested && facet[1].nested.facet)}" id="${facet[0]}_Nested_text" @input="${this.onNestedFacetTextChange}" data-parent-facet="${facet[0]}" placeholder="Include values or set range"/>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <select-field-filter .disabled="${!(facet[1].nested && facet[1].nested.facet)}" .data="${["Range", "Avg", "Percentile"]}" .value="${"Range"}" id="${facet[0]}_NestedFnSelect" data-nested-facet="${facet[0]}" @filterChange="${e => this.onNestedFacetFnChange(facet[0], e.detail.value)}"></select-field-filter>
                                                            </div>
                                                        </div>
                                                        <!-- /nested facet -->
                                                     </div>
                                                </div>
                                            </div>
                    
                                        </div>
                                    </div>
                                `)}
                            </div>
                
                        </div>
                        <div role="tabpanel" class="tab-pane" id="filters_tab">
                            <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                                        .opencgaClient="${this.opencgaClient}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .populationFrequencies="${this.populationFrequencies}"
                                                        .consequenceTypes="${this.consequenceTypes}"
                                                        .query="${this.query}"
                                                        .config="${this._config.filter}"
                                                        .searchButton="${false}"
                                                        style="font-size: 12px"
                                                        @queryChange="${this.onQueryFilterChange}"
                                                        @querySearch="${this.onQueryFilterSearch}">
                            </opencga-variant-filter>
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

                        <!-- RESULTS - Facet Plots -->
                        <div id="loading" style="display: none">
                            <loading-spinner></loading-spinner>
                        </div>
                        ${this.errorState ? html`
                            <div id="error" style="">
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
                        

                        <!--<h4>Total Number of Variants : {{totalVariants}}</h4>-->
                        <!--<template is="dom-repeat" items="{{results}}" id="resultsDiv">-->
                            <!--<h3>{{item.title}}</h3>-->
                            <!--<div class="btn-group" style="float: right">-->
                                <!--<span class="btn btn-primary plots active" on-click="onHistogramChart">-->
                                    <!--<i class="fa fa-bar-chart" style="padding-right: 5px" title="Bar Chart" data-id="{{item.name}}"></i>-->
                                <!--</span>-->
                                <!--<template is="dom-if" if="{{item.renderPieChart}}">-->
                                    <!--<span class="btn btn-primary plots" on-click="onPieChart">-->
                                        <!--<i class="fa fa-pie-chart" style="padding-right: 5px" title="Pie Chart" data-id="{{item.name}}"></i>-->
                                    <!--</span>-->
                                <!--</template>-->
                                <!--<span class="btn btn-primary plots" on-click="onTabularView">-->
                                    <!--<i class="fa fa-table" style="padding-right: 5px" title="Tabular View" data-id="{{item.name}}"></i>-->
                                <!--</span>-->
                            <!--</div>-->
                            <!--<div id="${this._prefix}{{item.name}}Plot"></div>-->

                            <!--&lt;!&ndash;Table&ndash;&gt;-->
                            <!--<br>-->
                            <!--<table class="table table-bordered" id="${this._prefix}{{item.name}}Table" style="display: none;">-->

                                <!--&lt;!&ndash; Facet Field Table &ndash;&gt;-->
                                <!--<template is="dom-if" if="{{checkField(item.category)}}">-->
                                    <!--<thead class="table-header bg-primary">-->
                                    <!--<tr>-->
                                        <!--<th>{{item.title}}</th>-->
                                        <!--<template is="dom-if" if="{{subFieldExists(item.subField)}}">-->
                                            <!--<th>{{item.subField}}</th>-->
                                        <!--</template>-->
                                        <!--<th>Number of Variants</th>-->
                                    <!--</tr>-->
                                    <!--</thead>-->
                                    <!--<tbody>-->
                                    <!--<template is="dom-repeat" items="{{item.counts}}" as="count">-->
                                        <!--<template is="dom-if" if="{{fieldExists(count)}}">-->
                                            <!--<tr>-->
                                                <!--<td rowspan$="{{countSubFields(count)}}">{{count.value}}</td>-->
                                            <!--</tr>-->

                                            <!--<template is="dom-repeat" items="{{count.field.counts}}" as="subFieldCount">-->
                                                <!--<tr>-->
                                                    <!--<td>{{subFieldCount.value}}</td>-->
                                                    <!--<td>{{subFieldCount.count}}</td>-->
                                                <!--</tr>-->
                                            <!--</template>-->
                                        <!--</template>-->

                                        <!--<template is="dom-if" if="{{!fieldExists(count)}}">-->
                                            <!--<tr>-->
                                                <!--<td>{{count.value}}</td>-->
                                                <!--<td>{{count.count}}</td>-->
                                            <!--</tr>-->
                                        <!--</template>-->
                                    <!--</template>-->
                                    <!--</tbody>-->
                                <!--</template>-->

                                <!--&lt;!&ndash; Facet Range Table &ndash;&gt;-->
                                <!--<template is="dom-if" if="{{!checkField(item.category)}}">-->
                                    <!--<thead class="table-header bg-primary">-->
                                    <!--<tr>-->
                                        <!--<th>Range</th>-->
                                        <!--<th>Number of Variants</th>-->
                                    <!--</tr>-->
                                    <!--</thead>-->
                                    <!--<tbody>-->
                                    <!--<template is="dom-repeat" items="{{item.data}}" as="data">-->
                                        <!--<tr>-->
                                            <!--<td>{{data.range}}</td>-->
                                            <!--<td>{{data.count}}</td>-->
                                        <!--</tr>-->
                                    <!--</template>-->
                                    <!--</tbody>-->
                                <!--</template>-->
                            <!--</table>-->
                            <!--<br>-->
                        <!--</template>-->
                    </div>
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
        ` : html`
            <span style="text-align: center"><h3>No public projects available to browse. Please login to continue</h3></span>
        `}
    `;
    }

}


customElements.define("opencga-variant-facet", OpencgaVariantFacet);
