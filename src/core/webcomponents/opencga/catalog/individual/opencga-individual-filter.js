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
import "../../../commons/filters/text-field-filter.js";
import "../../../commons/filters/select-field-filter.js";

export default class OpencgaIndividualFilter extends LitElement {

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
            },
            opencgaClient: {
                type: Object
            },
            individuals: {
                type: Array,
                notify: true //TODO check notify
            },
            query: {
                type: Object,
                value: {},
                notify: true,
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
        }
    }

    _init() {
        // super.ready();
        this._prefix = "osf-" + Utils.randomString(6) + "_";

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
        this.searchButton = true

    }

    connectedCallback() {
        super.connectedCallback();
        this.preparedQuery = {...this.query} // propagates here the iva-app query object
    }

    updated(changedProperties) {
        if(changedProperties.has("query")) {
            this.queryObserver();
        }
        if(changedProperties.has("variables")) {
            this.variablesChanged();
        }
    }

    onSearch() {
        //this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
    }

    addAnnotation(e) {
        if (typeof this._annotationFilter === "undefined") {
            this._annotationFilter = {};
        }
        let split = e.detail.value.split("=");
        this._annotationFilter[split[0]] = split[1];

        let _query = {};
        Object.assign(_query, this.query);
        let annotations = [];
        for (let key in this._annotationFilter) {
            annotations.push(`${key}=${this._annotationFilter[key]}`)
        }
        _query['annotation'] = annotations.join(";");

        this._reset = false;
        this.query = _query;
        this._reset = true;
    }

    onDateChanged(e) {
        let query = {};
        Object.assign(query, this.query);
        if (UtilsNew.isNotEmpty(e.detail.date)) {
            query["creationDate"] = e.detail.date;
        } else {
            delete query["creationDate"];
        }

        this._reset = false;
        this.query = _query;
        this._reset = true;
    }

    queryObserver() {
        if (this._reset) {
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'", this.query);
            this.preparedQuery = this.query;
            //renderQueryFilters shouldn't be necessary anymore
            //this.renderQueryFilters();
            this.requestUpdate()
        } else {
            this._reset = true;
        }
    }
    renderQueryFilters() {
        // Empty everything before rendering
        this._clearHtmlDom();

        // Individual
        if (UtilsNew.isNotUndefined(this.query.id)) {
            PolymerUtils.setValue(`${this._prefix}-individual-input`, this.query.id);
        }

        // Samples
        if (UtilsNew.isNotUndefined(this.query.samples)) {
            PolymerUtils.setValue(`${this._prefix}-sample-input`, this.query.samples);
        }

        // Phenotypes
        if (UtilsNew.isNotUndefined(this.query.phenotypes)) {
            PolymerUtils.setValue(`${this._prefix}-phenotypes-input`, this.query.phenotypes);
        }

        // Ethnicity
        if (UtilsNew.isNotUndefined(this.query.ethnicity)) {
            PolymerUtils.setValue(`${this._prefix}-ethnicity-input`, this.query.ethnicity);
        }

        // Disorder
        if (UtilsNew.isNotUndefined(this.query.disorders)) {
            PolymerUtils.setValue(`${this._prefix}-disorder-input`, this.query.disorders);
        }

        // Sex
        if (UtilsNew.isNotUndefined(this.query.sex)) {
            $(`#${this._prefix}-individual-sex-select`).selectpicker('val', this.query.sex.split(","));
        }

        // Karyotypic sex
        if (UtilsNew.isNotUndefined(this.query.karyotypicSex)) {
            $(`#${this._prefix}-individual-karyotypicsex-select`).selectpicker('val', this.query.karyotypicSex.split(","));
        }

        // Affectation status
        if (UtilsNew.isNotUndefined(this.query.affectationStatus)) {
            $(`#${this._prefix}-affectation-status-select`).selectpicker('val', this.query.affectationStatus.split(","));
        }

        // Life status
        if (UtilsNew.isNotUndefined(this.query.lifeStatus)) {
            $(`#${this._prefix}-life-status-select`).selectpicker('val', this.query.lifeStatus.split(","));
        }
    }

    onFilterChange(key, value) {
        console.log("filterChange", {[key]:value});
        if (value && value !== "") {
            this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
        } else {
            console.log("deleting", key, "from preparedQuery")
            delete this.preparedQuery[key];
            this.preparedQuery = {...this.preparedQuery};
        }
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate()
    }

    notifyQuery(query) {
        this.dispatchEvent(new CustomEvent("queryChange", {
            detail: {
                query: query,
            },
            bubbles: true,
            composed: true
        }));
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

    /** @deprecated
     *
     * */
    calculateFilters(e) {
        let _query = {};

        let name = PolymerUtils.getValue(`${this._prefix}-individual-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.id = name;
        }

        let samples = PolymerUtils.getValue(`${this._prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(samples)) {
            _query.samples = samples;
        }

        let phenotypes = PolymerUtils.getValue(`${this._prefix}-phenotypes-input`);
        if (UtilsNew.isNotEmpty(phenotypes)) {
            _query.phenotypes = phenotypes;
        }

        let ethnicity = PolymerUtils.getValue(`${this._prefix}-ethnicity-input`);
        if (UtilsNew.isNotEmpty(ethnicity)) {
            _query.ethnicity = ethnicity;
        }

        let disorder = PolymerUtils.getValue(`${this._prefix}-disorder-input`);
        if (UtilsNew.isNotEmpty(disorder)) {
            _query.disorders = disorder;
        }

        let sex = $(`#${this._prefix}-individual-sex-select`).selectpicker('val');
        if (UtilsNew.isNotEmpty(sex)) {
            _query.sex = sex.join(",");
        }

        let karyotypic = $(`#${this._prefix}-individual-karyotypicsex-select`).selectpicker('val');
        if (UtilsNew.isNotEmpty(karyotypic)) {
            _query.karyotypicSex = karyotypic.join(",");
        }

        let affectation = $(`#${this._prefix}-affectation-status-select`).selectpicker('val');
        if (UtilsNew.isNotEmpty(affectation)) {
            _query.affectationStatus = affectation.join(",");
        }

        let lifeStatus = $(`#${this._prefix}-life-status-select`).selectpicker('val');
        if (UtilsNew.isNotEmpty(lifeStatus)) {
            _query.lifeStatus = lifeStatus.join(",");
        }

        // keep annotation filter
        if (UtilsNew.isNotEmpty(this.query.annotation)) {
            _query.annotation = this.query.annotation;
        }

        // keep date filters
        if (UtilsNew.isNotEmpty(this.query.creationDate)) {
            _query.creationDate = this.query.creationDate;
        }

        // To prevent to call renderQueryFilters we set this to false
        this._reset = false;
        this.query = _query;
        this._reset = true;
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", 'value', '');
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", 'disabled');

        $(`#${this._prefix}IndividualSelection .selectpicker`).selectpicker('val','');
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
        </style>

        ${this.searchButton ? html`
            <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
            </div>
            ` : null}

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">

            <!-- Individual field attributes -->
            <div class="">
                <!--<div class="panel-heading" role="tab" id="${this._prefix}IndividualSelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}IndividualSelection" aria-expanded="true" aria-controls="${this._prefix}IndividualSelection">
                            Individual
                        </a>
                    </h4>
                </div> -->

                <div id="${this._prefix}IndividualSelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}IndividualSelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Individual ID
                            </div>
                            <div id="${this._prefix}-name" class="subsection-content form-group">
                                <text-field-filter placeholder="LP-1234,LP-2345..." .value="${this.preparedQuery.id}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Sample ID
                            </div>
                            <div id="${this._prefix}-sample" class="subsection-content form-group">
                                <text-field-filter placeholder="HG01879, HG01880, HG01881..." .value="${this.preparedQuery.samples}" @filterChange="${e => this.onFilterChange("samples", e.detail.value)}"></text-field-filter>
                                <!--<input type="text" id="${this._prefix}-sample-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="HG01879, HG01880, HG01881..." @input="${this.calculateFilters}"> -->
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Sex
                            </div>
                            <div id="${this._prefix}-individual-sex" class="subsection-content form-group">
                                <!--<select id="${this._prefix}-individual-sex-select" class="selectpicker" multiple
                                        @change="${this.calculateFilters}" data-width="100%">
                                    <option>MALE</option>
                                    <option>FEMALE</option>
                                    <option>UNKNOWN</option>
                                    <option>UNDETERMINED</option>
                                </select>-->
                                
                                <select-field-filter multiple .data="${['MALE','FEMALE','UNKNOWN','UNDETERMINED']}" .value="${this.preparedQuery.sex}" @filterChange="${e => this.onFilterChange("sex", e.detail.value)}"></select-field-filter>
                                
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Karyotypic Sex
                            </div>
                            <div id="${this._prefix}-individual-karyotypicsex" class="subsection-content form-group">
                                <!--<select id="${this._prefix}-individual-karyotypicsex-select" class="selectpicker" multiple
                                        @change="${this.calculateFilters}" data-width="100%">
                                    <option>UNKNOWN</option>
                                    <option>XX</option>
                                    <option>XY</option>
                                    <option>XO</option>
                                    <option>XXY</option>
                                    <option>XXX</option>
                                    <option>XXYY</option>
                                    <option>XXXY</option>
                                    <option>XXXX</option>
                                    <option>XYY</option>
                                    <option>OTHER</option>
                                </select> -->
                                <select-field-filter multiple .data="${['UNKNOWN','XX','XY','XO','XXY','XXX','XXYY','XXXY','XXXX','XYY','OTHER']}" .value="${this.preparedQuery.karyotypicSex}" @filterChange="${e => this.onFilterChange("karyotypicSex", e.detail.value)}"></select-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Ethnicity
                            </div>
                            <div id="${this._prefix}-ethnicity" class="subsection-content form-group">
                                <!--<input type="text" id="${this._prefix}-ethnicity-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="White caucasian,asiatic..." @input="${this.calculateFilters}"> -->
                                <text-field-filter placeholder="White caucasian,asiatic..." .value="${this.preparedQuery.ethnicity}" @filterChange="${e => this.onFilterChange("ethnicity", e.detail.value)}"></text-field-filter>

                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Disorder
                            </div>
                            <div id="${this._prefix}-disorder" class="subsection-content form-group">
                                <!--<input type="text" id="${this._prefix}-disorder-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Intellectual disability,Arthrogryposis..." @input="${this.calculateFilters}"> -->
                                <text-field-filter placeholder="Intellectual disability,Arthrogryposis..." .value="${this.preparedQuery.disorders}" @filterChange="${e => this.onFilterChange("disorders", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Affectation Status
                            </div>
                            <div id="${this._prefix}-affectation-status" class="subsection-content form-group">
                                <!--<select id="${this._prefix}-affectation-status-select" class="selectpicker" multiple
                                        @change="${this.calculateFilters}" data-width="100%">
                                    <option>CONTROL</option>
                                    <option>AFFECTED</option>
                                    <option>UNAFFECTED</option>
                                    <option>UNKNOWN</option>
                                </select> -->
                                <select-field-filter multiple .data="${['CONTROL','AFFECTED','UNAFFECTED','UNKNOWN']}" .value="${this.preparedQuery.affectationStatus}" @filterChange="${e => this.onFilterChange("affectationStatus", e.detail.value)}"></select-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Life Status
                            </div>
                            <div id="${this._prefix}-life-status" class="subsection-content form-group">
                                <!--<select id="${this._prefix}-life-status-select" class="selectpicker" multiple
                                        @change="${this.calculateFilters}" data-width="100%">
                                    <option>ALIVE</option>
                                    <option>ABORTED</option>
                                    <option>DECEASED</option>
                                    <option>UNBORN</option>
                                    <option>STILLBORN</option>
                                    <option>MISCARRIAGE</option>
                                    <option>UNKNOWN</option>
                                </select> -->
                                <select-field-filter multiple .data="${['ALIVE','ABORTED','DECEASED','UNBORN','STILLBORN','MISCARRIAGE','UNKNOWN']}" .value="${this.preparedQuery.lifeStatus}" @filterChange="${e => this.onFilterChange("lifeStatus", e.detail.value)}"></select-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Phenotypes
                            </div>
                            <div id="${this._prefix}-phenotypes" class="subsection-content form-group">
                                <!--<input type="text" id="${this._prefix}-phenotypes-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Full-text search, e.g. *melanoma*" @input="${this.calculateFilters}"> -->
                                <text-field-filter placeholder="Full-text search, e.g. *melanoma*" .value="${this.preparedQuery.phenotypes}" @filterChange="${e => this.onFilterChange("phenotypes", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-annotationss">Individual Annotations
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-annotations-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-annotations" class="subsection-content">
                                <opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                           .opencgaClient="${this.opencgaClient}"
                                                           .config="${this.annotationFilterConfig}"
                                                           entity="INDIVIDUAL"
                                                           @filterannotation="${this.addAnnotation}">
                                </opencga-annotation-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-date">Date
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-date-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-date-content" class="subsection-content">
                                <opencga-date-filter .config="${this.dateFilterConfig}" @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}"></opencga-date-filter>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("opencga-individual-filter", OpencgaIndividualFilter);
