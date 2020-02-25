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
import Utils from "./../../../../utils.js";
import UtilsNew from "../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "../variableSets/opencga-annotation-filter.js";
import "../opencga-date-filter.js";
import "../../../commons/filters/text-field-filter.js";
import "../../../commons/filters/select-field-filter.js";


export default class OpencgaCohortFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
                // observer: "updateVariableSets"
            },
            opencgaClient: {
                type: Object
            },
            cohorts: {
                type: Array
            },
            query: {
                type: Object
            },
            search: {
                type: Object
            },
            variableSets: {
                type: Array
            },
            variables: {
                type: Array
            },
            minYear: {
                type: Number
            },
            compact: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }


    _init() {
        // super.ready();
        this._prefix = "osf-" + Utils.randomString(6) + "_";

        const _years = [];
        const fullDate = new Date();
        const limitYear = fullDate.getFullYear();
        for (let year = this.minYear; year <= limitYear; year++) {
            _years.push(year);
        }
        // This change triggers the polymer dom-repeat
        this.years = _years;


        // Init arrays for Date selector
        const _yearsToSearch = [];
        for (let year = limitYear, i = 0; i < 5; year--, i++) {
            _yearsToSearch.push(year);
        }
        this.yearsToSearch = _yearsToSearch;

        this.monthToSearch = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const _days = [];
        for (let i = 1; i <= 31; i++) {
            _days.push(i);
        }
        this.daysToSearch = _days;

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

        this.dateFilterConfig = {
            recentDays: 10
        };

        this.minYear = 1920;
        this.query = {};
        this.preparedQuery = {};
        this.searchButton = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
    }

    firstUpdated(_changedProperties) {
        // Decrease the button and font size of the selectpicker component
        // const annotationDiv = $(`#${this._prefix}-type-div`);
        // Add the class to the select picker buttons
        // annotationDiv.find(".selectpicker").selectpicker("setStyle", "btn-sm", "add");
        // Add the class to the lists
        // annotationDiv.find("ul > li").addClass("small");
    }

    onSearch() {
        this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
    }

    addAnnotation(e) {
        if (typeof this._annotationFilter === "undefined") {
            this._annotationFilter = {};
        }
        const split = e.detail.value.split("=");
        this._annotationFilter[split[0]] = split[1];

        const _query = {};
        Object.assign(_query, this.query);
        const annotations = [];
        for (const key in this._annotationFilter) {
            annotations.push(`${key}=${this._annotationFilter[key]}`);
        }
        _query["annotation"] = annotations.join(";");

        this._reset = false;
        // this.set("query", _query);
        this.query = _query;
        this._reset = true;
    }

    onDateChanged(e) {
        const query = {};
        Object.assign(query, this.query);
        if (UtilsNew.isNotEmpty(e.detail.date)) {
            query["creationDate"] = e.detail.date;
        } else {
            delete query["creationDate"];
        }

        this._reset = false;
        // this.set("query", _query);
        this.query = _query;
        this._reset = true;
    }

    queryObserver() {
        if (this._reset) {
            console.log("queryObserver: calling to 'renderQueryFilters()'", this.query);
            this.preparedQuery = this.query;
            // renderQueryFilters shouldn't be necessary anymore
            // this.renderQueryFilters();
            this.requestUpdate();
        } else {
            this._reset = true;
        }
    }

    renderQueryFilters() {
        // Empty everything before rendering
        this._clearHtmlDom();

        this._checkAnnotations();

        // Cohort
        if (UtilsNew.isNotUndefined(this.query.name)) {
            PolymerUtils.setValue(this._prefix + "CohortName", this.query.name);
        }
    }

    onFilterChange(key, value) {
        console.log("filterChange", {[key]: value});
        if (value && value !== "") {
            this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
        } else {
            console.log("deleting", key, "from preparedQuery");
            delete this.preparedQuery[key];
            this.preparedQuery = {...this.preparedQuery};
        }
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
    }

    notifyQuery(query) {
        this.dispatchEvent(new CustomEvent("queryChange", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
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

    _createSection(section) {
        const htmlFields = section.fields && section.fields.length && section.fields.map(subsection => this._createSubSection(subsection));
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        let content = "";
        switch (subsection.id) {
            case "id":
            case "samples":
                content = html`<text-field-filter placeholder="${subsection.placeholder}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></text-field-filter>`;
                break;
            case "annotations":
                if (!this.variableSet || !this.variableSet.length) return;
                content = html`<opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                      .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                      entity="COHORT"
                                                      .config="${this.annotationFilterConfig}"
                                                      @filterannotation="${this.addAnnotation}">
                           </opencga-annotation-filter>`;
                break;
            case "type":
                content = html`<select-field-filter ?multiple="${subsection.multiple}" .data="${subsection.allowedValues}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></select-field-filter>`;
                break;
            case "date":
                content = html`<opencga-date-filter .config="${this.dateFilterConfig}" @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}"></opencga-date-filter>`;
                break;
            default:
                console.error("Filter component not found");
        }
        return html`
                    <div class="form-group">
                        <div class="browser-subsection" id="${subsection.id}">${subsection.name}
                            ${subsection.description ? html`
                                <div class="tooltip-div pull-right">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}${subsection.id}Tooltip"></i></a>
                                </div>` : null }
                        </div>
                        <div id="${this._prefix}${subsection.id}" class="subsection-content">
                            ${content}
                         </div>
                    </div>
                `;
    }

    addAnnotationFilter(e) {
        const _query = {};
        const annotations = [];
        let annotationTextInputElements = PolymerUtils.getElementsByClassName(this._prefix + "AnnotationTextInput");
        for (const annot of annotationTextInputElements) {
            if (annot.value !== "") {
                annotations.push(annot.dataset.variableName + "=" + annot.value);
            }
        }

        annotationTextInputElements = PolymerUtils.getElementsByClassName(this._prefix + "AnnotationSelect");
        for (const annot of annotationTextInputElements) {
            if (annot.value !== "") {
                annotations.push(annot.dataset.variableName + "=" + annot.value);
            }
        }

        _query.annotation = annotations.join(",");

        this._reset = false;
        // this.set("query", _query);
        this.query = _query;
        this._reset = true;
    }

    _getDateFilter(e) {
        const year = PolymerUtils.getElementById(this._prefix + "YearSelect").value;
        const month = PolymerUtils.getElementById(this._prefix + "MonthSelect").value;
        let day = PolymerUtils.getElementById(this._prefix + "DaySelect").value;
        let date;
        if (month === "any") {
            date = "~^" + year + "*";
        } else {
            let monthIndex = this.monthToSearch.indexOf(month) + 1;
            if (monthIndex < 10) {
                monthIndex = "0" + monthIndex;
            }
            if (day === "any") {
                date = "~^" + year + monthIndex + "*";
            } else {
                if (day < 10) {
                    day = "0" + day;
                }
                date = "~^" + year + monthIndex + day + "*";
            }
        }
        return date;
    }

    updateVariableSets() {
        this.variables = [];
        const _this = this;
        this.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
            .then(function(response) {
                _this.variableSets = response.response[0].result[0].variableSets;
                // debugger
                if (_this.variableSets.length > 0) {
                    _this.variables = _this.variableSets[0].variables; // setting first one by default
                    _this.filteredVariables = {
                        variableSet: _this.variableSets[0].id,
                        variables: []
                    };
                } else {
                    // _this.variableSets = [{name: "none"}];
                    _this.variableSets = [];
                }
            })
            .catch(function() {
                console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study);
            });
    }

    renderVariableTemplate() {
        const myTemplate = PolymerUtils.getElementById(this._prefix + "VariableTemplate");
        if (UtilsNew.isNotNull(myTemplate)) {
            myTemplate.render();
        }
    }

    variableSelected(e) {
        this.variable = e.target.dataVariable;
        if (UtilsNew.isUndefined(this.variable) || Object.getOwnPropertyNames(this.variable).length === 0) {
            return;
        }
        this._isCategorical = false;
        this._isText = false;
        this._isNumerical = false;
        this._isBoolean = false;
        this._isObject = false;
        if (this.variable.type.toLowerCase() === "categorical") {
            this._isCategorical = true;
        } else if (this.variable.type.toLowerCase() === "text") {
            this._isText = true;
        } else if (this.variable.type.toLowerCase() === "numeric") {
            this._isNumerical = true;
        } else if (this.variable.type.toLowerCase() === "boolean") {
            this._isBoolean = true;
        } else if (this.variable.type.toLowerCase() === "object") {
            this._isObject = true;
        }
        // TODO Refactor
        $(e.target.dataTarget).modal("show");
    }

    updateCompactFilter(e) {
        let myFilter = {};
        if (this.variable.type.toLowerCase() === "categorical") {
            const allValues = [];
            // TODO Refactor
            const selected = $("input[name='" + this._prefix + "Categorical']:checked");
            for (let i = 0; i < selected.length; i++) {
                allValues.push(selected[i].value);
            }
            myFilter = {
                name: this.variable.name,
                value: allValues.join()
            };
        } else if (this.variable.type.toLowerCase() === "text") {
            // TODO Refactor
            const value = $("input[name='" + this._prefix + "Text']");
            myFilter = {
                name: this.variable.name,
                value: value.value
            };
            value.value = "";
        } else if (this.variable.type.toLowerCase() === "numeric") {
            // TODO Refactor
            const value = $("input[name='" + this._prefix + "Numerical']");
            myFilter = {
                name: this.variable.name,
                value: value.value
            };
            value.value = "";
        } else if (this.variable.type.toLowerCase() === "boolean") {
            this._isBoolean = true;
        } else if (this.variable.type.toLowerCase() === "object") {
            this._isObject = true;
        }
        this.query[myFilter.name] = myFilter.value;
        this.query = Object.assign({}, this.query);
        this.fire("opencga-filter-added", myFilter);
    }

    variablesChanged() {
        this._areVariablesEmpty = (this.variables.length === 0);
    }

    checkVarType(myVar, type) {
        return (myVar.type === type);
    }

    checkCatType(myVar, type, lowerLimit, upperLimit) {
        return (myVar.type === type && myVar.allowedValues.length >= lowerLimit && myVar.allowedValues.length < upperLimit);
    }

    checkYears(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        PolymerUtils.innerHTML(this._prefix + "_errorDiv_birthYear", "");
        PolymerUtils.innerHTML(this._prefix + "_errorDiv_testYear", "");
        let currentElement = PolymerUtils.getElementById(e.target.id);
        const identifier = e.target.id;
        let pairElement = "";
        let divSuffix = "";
        let message = "";
        if (identifier.search("birthYear") !== -1) { // Birth year element raises the event -> check Test year
            pairElement = PolymerUtils.getElementById(this._prefix + "testYear");
            divSuffix = "birthYear";
            message = "Year of Birth must be prior to year of Test";
        } else { // Year of test element raises the event -> swap elements and check the birth year
            currentElement = PolymerUtils.getElementById(this._prefix + "birthYear");
            pairElement = PolymerUtils.getElementById(e.target.id);
            divSuffix = "testYear";
            message = "Year of Test must be posterior to year of Birth";
        }

        if (PolymerUtils.querySelectorAll("option:selected", pairElement) !== "" &&
            (parseInt(PolymerUtils.querySelectorAll("option:selected", currentElement).textContent) > parseInt(PolymerUtils.querySelectorAll("option:selected", pairElement).textContent))) { // Year of birth cannot be lower than Year of test
            PolymerUtils.innerHTML(this._prefix + "_errorDiv_" + divSuffix, message);
        }
    }

    checkType(str1, str2) {
        return str1.search(str2) !== -1;
    }

    _filterVariable(variable) {
        for (let i = 0; i < this.filteredVariables.variables.length; i++) {
            if (variable.name === this.filteredVariables.variables[i].name) {
                return false;
            }
        }
        if (UtilsNew.isNotUndefined(this.searchVariable) &&
            variable.name.toLowerCase().indexOf(this.searchVariable.toLowerCase()) === -1) {
            return false;
        }
        return true;
    }

    _sortVariables(a, b) {
        if (a.rank < b.rank) {
            return -1;
        }
        return 1;
    }

    _changeMode(e) {
        this.compact = !this.compact;
    }

    _checkAnnotations() {
        if (typeof this._annotationFilter !== "undefined") {
            const annotations = this.query["annotation"];
            this._annotationFilter = {};
            if (typeof annotations !== "undefined") {
                const splitAnnotations = annotations.split(";");
                for (const i in splitAnnotations) {
                    const splitAnnotation = splitAnnotations[i].split("=");
                    this._annotationFilter[splitAnnotation[0]] = splitAnnotation[1];
                }
            }
        }
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");
        // Uncheck checkboxes
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterCheckBox", "checked", false);
        // Set first option and make it active
        PolymerUtils.setAttributeByClassName(this._prefix + "FilterSelect", "selectedIndex", 0);
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterSelect", "disabled");
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterRadio", "checked", false);
        PolymerUtils.setAttributeByClassName(this._prefix + "FilterRadio", "disabled", true);

        // TODO Refactor
        $("." + this._prefix + "FilterRadio").filter("[value=\"or\"]").prop("checked", true);
    }

    isVisible(myVar) {
        if (UtilsNew.isNotUndefinedOrNull(this.config) && UtilsNew.isNotUndefinedOrNull(this.config.variableSet)) {
            const excludeArray = this.config.variableSet.exclude;
            for (const index in excludeArray) {
                if (excludeArray[index].webComponent === this.localName) {
                    return (!(excludeArray[index].variable.indexOf(myVar.name)!== -1));
                } else {
                    return true;
                }
            }
        }
        return true;
    }

    render() {
        return html`
        <style include="jso-styles">

            span + span {
                margin-left: 10px;
            }

            div.block {
                overflow: hidden;
            }

            div.block label {
                width: 80px;
                display: block;
                float: left;
                text-align: left;
                font-weight: normal;
            }

            select + select {
                margin-left: 10px;
            }

            select + input {
                margin-left: 10px;
            }

            .subsection-content {
                margin: 5px 5px;
            }
        </style>

        ${this.searchButton ? html`
            <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
            </div>
            ` : null}

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
            <div class="">
                ${this.config.sections && this.config.sections.length ? this.config.sections.map( section => this._createSection(section)) : html`No filter has been configured.`}
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-cohort-filter", OpencgaCohortFilter);
