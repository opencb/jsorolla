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
import "../variableSets/opencga-annotation-filter.js";
import "../opencga-date-filter.js";

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
                type: Array,
                notify: true
            },
            query: {
                type: Object,
                notify: true
            },
            search: {
                type: Object,
                notify: true
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

        this.query = {};
        this.minYear = 1920;

    }

    updated(changedProperties) {
        if (changedProperties.has("onQueryUpdate")) {
            this.query();
        }
        if (changedProperties.has("variablesChanged")) {
            this.variables();
        }
    }

    connectedCallback() {

        // Decrease the button and font size of the selectpicker component
        const annotationDiv = $(`#${this._prefix}-type-div`);
        // Add the class to the select picker buttons
        annotationDiv.find(".selectpicker").selectpicker("setStyle", "btn-sm", "add");
        // Add the class to the lists
        annotationDiv.find("ul > li").addClass("small");
    }

    onSearch() {
        this.search = Object.assign({}, this.query);
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

    onQueryUpdate() {
        if (this._reset) {
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'");
            this.renderQueryFilters();
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

    calculateFilters(e) {
        const _query = {};

        const name = PolymerUtils.getValue(`${this._prefix}-cohort-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.id = name;
        }

        const sample = PolymerUtils.getValue(`${this._prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(sample)) {
            _query.samples = sample;
        }

        // keep annotation filter
        if (UtilsNew.isNotEmpty(this.query.annotation)) {
            _query.annotation = this.query.annotation;
        }

        // keep date filters
        if (UtilsNew.isNotEmpty(this.query.creationDate)) {
            _query.creationDate = this.query.creationDate;
        }

        const type = $(`#${this._prefix}-type`).selectpicker("val");
        if (type !== "All") {
            _query.type = type;
        }

        // To prevent to call renderQueryFilters we set this to false
        this._reset = false;
        // this.set("query", _query);
        this.query = _query;
        this._reset = true;
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

            .browser-subsection {
                font-size: 1.35rem;
                font-weight: bold;
                padding: 5px 0px;
                color: #444444;
                border-bottom: 1px solid rgba(221, 221, 221, 0.8);
            }

            .subsection-content {
                margin: 5px 5px;
            }
        </style>

        <div style="width: 60%;margin: 0 auto">
            <button type="button" class="btn btn-primary" style="width: 100%" @click="${this.onSearch}">
                <i class="fa fa-search" aria-hidden="true" style="padding: 0px 5px"></i>
                Search
            </button>
        </div>
        <br>

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">

            <!-- Cohort field attributes -->
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="${this._prefix}CohortSelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}CohortSelection" aria-expanded="true" aria-controls="${this._prefix}CohortSelection">
                            Cohort
                        </a>
                    </h4>
                </div>

                <div id="${this._prefix}CohortSelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}CohortSelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Id
                            </div>
                            <div id="${this._prefix}-name" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-cohort-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="healthy, cancer..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Samples
                            </div>
                            <div id="${this._prefix}-sample" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-sample-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="HG01879, HG01880, HG01881..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-annotationss">Cohort annotations
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-annotations-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-annotations" class="subsection-content">
                                <opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                           .opencgaClient="${this.opencgaClient}"
                                                           .config="${this.annotationFilterConfig}"
                                                           entity="COHORT"
                                                           @filterannotation="${this.addAnnotation}">
                                </opencga-annotation-filter>
                            </div>
                        </div>

                        <div class="form-group" id="${this._prefix}-type-div">
                            <div class="browser-subsection">Type
                            </div>
                            <select class="selectpicker" id="${this._prefix}-type" @change="${this.calculateFilters}"
                                    on-dom-change="renderDomRepeat" data-width="100%">
                                <option data-value="All" selected>All</option>
                                <option data-value="CASE_CONTROL">CASE_CONTROL</option>
                                <option data-value="CASE_SET">CASE_SET</option>
                                <option data-value="CONTROL_SET">CONTROL_SET</option>
                                <option data-value="PAIRED">PAIRED</option>
                                <option data-value="PAIRED_TUMOR">PAIRED_TUMOR</option>
                                <option data-value="AGGREGATE">AGGREGATE</option>
                                <option data-value="TIME_SERIES">TIME_SERIES</option>
                                <option data-value="FAMILY">FAMILY</option>
                                <option data-value="TRIO">TRIO</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-date">Date
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-date-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-date-content" class="subsection-content">
                                <opencga-date-filter config="${this.dateFilterConfig}" @datechanged="${this.onDateChanged}">
                                </opencga-date-filter>
                            </div>
                        </div>

                        <!--&lt;!&ndash;<div class="form-group">&ndash;&gt;-->
                            <!--&lt;!&ndash;<label class="label-opencga-cohort-filter">Cohort name</label>&ndash;&gt;-->
                            <!--&lt;!&ndash;<input type="text" id="${this._prefix}CohortName" class="form-control ${this._prefix}FilterTextInput"&ndash;&gt;-->
                                   <!--&lt;!&ndash;placeholder="HG01879, HG01880, HG01881..." on-keyup="calculateFilters">&ndash;&gt;-->
                        <!--&lt;!&ndash;</div>&ndash;&gt;-->

                        <!--<div class="form-group">-->

                            <!--&lt;!&ndash;<opencga-date-filter></opencga-date-filter>&ndash;&gt;-->

                            <!--<label class="label-opencga-cohort-filter">Patient Filters</label>-->
                            <!--<br>-->
                            <!--&lt;!&ndash;<input type="checkbox" name="selectionButtons" id="controls" value="controls"&ndash;&gt;-->
                            <!--&lt;!&ndash;class="${this._prefix}FilterRadio" on-change="calculateFilters"&ndash;&gt;-->
                            <!--&lt;!&ndash;style="padding-left: 20px"> Controls&ndash;&gt;-->
                            <!--<span style="padding-top: 10px">Individual ID</span>-->
                            <!--<input type="text" id="${this._prefix}PatientName" class="form-control ${this._prefix}FilterTextInput"-->
                                   <!--placeholder="Smith, Grant ..." on-keyup="calculateFilters">-->

                            <!--<span style="padding-top: 10px">HPO</span>-->
                            <!--<input type="text" id="${this._prefix}PatientHpo" class="form-control ${this._prefix}FilterTextInput"-->
                                   <!--placeholder="HP:000145" on-keyup="calculateFilters">-->

                            <!--<span style="padding-top: 10px">Diagnosis</span>-->
                            <!--<input type="text" id="${this._prefix}PatientDiagnosis" class="form-control ${this._prefix}FilterTextInput"-->
                                   <!--placeholder="Smith, Grant ..." on-keyup="calculateFilters">-->
                        <!--</div>-->
                    </div>
                </div>
            </div>

            <!--&lt;!&ndash; Cohort characteristics &ndash;&gt;-->
            <!--<div class="panel panel-default">-->
                <!--<div class="panel-heading" role="tab" id="${this._prefix}CohortGeneralFilterHeading">-->
                    <!--<h4 class="panel-title">-->
                        <!--<a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"-->
                           <!--href="#${this._prefix}CohortGeneralFilter" aria-expanded="true"-->
                           <!--aria-controls="${this._prefix}CohortGeneralFilter">-->
                            <!--Cohort Characteristics-->
                            <!--<div style="float: right" class="tooltip-div">-->
                                <!--<a data-toggle="tooltip" title="Generic cohort filters">-->
                                    <!--<i class="fa fa-info-circle" aria-hidden="true"></i>-->
                                <!--</a>-->
                            <!--</div>-->
                        <!--</a>-->
                    <!--</h4>-->
                <!--</div>-->
                <!--<div id="${this._prefix}CohortGeneralFilter" class="panel-collapse collapse in" role="tabpanel"-->
                     <!--aria-labelledby="${this._prefix}CohortGeneralFilterHeading">-->

                    <!--<div class="panel-body">-->
                        <!--<opencga-annotation-filter opencga-session="${this.opencgaSession}"-->
                                                   <!--opencga-client="${this.opencgaClient}"-->
                                                   <!--on-filterannotation="addAnnotation">-->
                        <!--</opencga-annotation-filter>-->
                    <!--</div>-->
                <!--</div>-->
            <!--</div>-->

        </div>
        `;
    }

}

customElements.define("opencga-cohort-filter", OpencgaCohortFilter);
