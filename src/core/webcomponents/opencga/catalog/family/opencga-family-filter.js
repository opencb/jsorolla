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

export default class OpencgaFamilyFilter extends LitElement {

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
            families: {
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

        this.minYear = 1920;

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

        this.dateFilterConfig = {
            recentDays: 10
        };

        this.query = {};
        this.preparedQuery = {};
        this.searchButton = true
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
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

    onSearch() {
        //this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
    }

    addAnnotation(e) {
        if (typeof this._annotationFilter === "undefined") {
            this._annotationFilter = {};
        }
        const split = e.detail.value.split("=");
        this._annotationFilter[split[0]] = split[1];

        const _query = {...this.query};
        const annotations = [];
        for (const key in this._annotationFilter) {
            annotations.push(`${key}=${this._annotationFilter[key]}`);
        }
        _query["annotation"] = annotations.join(";");

        this._reset = false;
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
        this.query = query;
        this._reset = true;
    }

    onQueryUpdate() {
        if (this._reset) {
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'", this.query);
            this.renderQueryFilters();
        } else {
            this._reset = true;
        }
    }

    renderQueryFilters() {
        // Empty everything before rendering
        this._clearHtmlDom();

        // Family
        if (UtilsNew.isNotUndefined(this.query.id)) {
            PolymerUtils.setValue(`${this._prefix}-family-input`, this.query.id);
        }

        // Members
        if (UtilsNew.isNotUndefined(this.query.members)) {
            PolymerUtils.setValue(`${this._prefix}-members-input`, this.query.members);
        }

        // Samples
        // if (UtilsNew.isNotUndefined(this.query.samples)) {
        //     PolymerUtils.setValue(`${this._prefix}-sample-input`, this.query.samples);
        // }

        // Phenotypes
        if (UtilsNew.isNotUndefined(this.query.phenotypes)) {
            PolymerUtils.setValue(`${this._prefix}-phenotypes-input`, this.query.phenotypes);
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

    calculateFilters(e) {
        const _query = {};

        const name = PolymerUtils.getValue(`${this._prefix}-family-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.id = name;
        }

        // let samples = PolymerUtils.getValue(`${this._prefix}-samples-input`);
        // if (UtilsNew.isNotEmpty(samples)) {
        //     _query.samples = samples;
        // }

        const members = PolymerUtils.getValue(`${this._prefix}-members-input`);
        if (UtilsNew.isNotEmpty(members)) {
            _query.members = members;
        }

        const phenotypes = PolymerUtils.getValue(`${this._prefix}-phenotypes-input`);
        if (UtilsNew.isNotEmpty(phenotypes)) {
            _query.phenotypes = phenotypes;
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
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");

        $(`#${this._prefix}FamilySelection .selectpicker`).selectpicker("val", "");
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

        ${this.searchButton ? html`
            <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
            </div>
            ` : null}

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">

            <!-- Family field attributes -->
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="${this._prefix}FamilySelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}FamilySelection" aria-expanded="true" aria-controls="${this._prefix}FamilySelection">
                            Family
                        </a>
                    </h4>
                </div>

                <div id="${this._prefix}FamilySelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}FamilySelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Family id
                            </div>
                            <div id="${this._prefix}-name" class="subsection-content form-group">
                                <text-field-filter placeholder="FAM-1234,FAM-2345..." .value="${this.preparedQuery.id}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></text-field-filter>
                               <!-- <input type="text" id="${this._prefix}-family-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="FAM-1234,FAM-2345..." @keyup="${this.calculateFilters}"> -->
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Members
                            </div>
                            <div id="${this._prefix}-members" class="subsection-content form-group">
                                <text-field-filter placeholder="LP-1234,LP-2345..." .value="${this.preparedQuery.members}" @filterChange="${e => this.onFilterChange("members", e.detail.value)}"></text-field-filter>
                                <!--<input type="text" id="${this._prefix}-members-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="LP-1234,LP-2345..." @keyup="${this.calculateFilters}"> -->
                            </div>
                        </div>

                        <!--<div class="form-group">-->
                            <!--<div class="browser-subsection">Samples-->
                            <!--</div>-->
                            <!--<div id="${this._prefix}-sample" class="subsection-content form-group">-->
                                <!--<input type="text" id="${this._prefix}-sample-input" class="form-control input-sm ${this._prefix}FilterTextInput"-->
                                       <!--placeholder="HG01879, HG01880, HG01881..." on-keyup="calculateFilters">-->
                            <!--</div>-->
                        <!--</div>-->

                        <div class="form-group">
                            <div class="browser-subsection">Phenotypes
                            </div>
                            <div id="${this._prefix}-phenotypes" class="subsection-content form-group">
                                <text-field-filter placeholder="Full-text search, e.g. *melanoma*" .value="${this.preparedQuery.phenotypes}" @filterChange="${e => this.onFilterChange("phenotypes", e.detail.value)}"></text-field-filter>
                                <!--<input type="text" id="${this._prefix}-phenotypes-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Full-text search, e.g. *melanoma*" @keyup="${this.calculateFilters}"> -->
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-annotationss">Family Annotations
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-annotations-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-annotations" class="subsection-content">
                                <opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                           .opencgaClient="${this.opencgaClient}"
                                                           .config="${this.annotationFilterConfig}"
                                                           entity="FAMILY"
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
                                <!-- <opencga-date-filter .config="${this.dateFilterConfig}" @datechanged="${this.onDateChanged}"></opencga-date-filter> -->
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

customElements.define("opencga-family-filter", OpencgaFamilyFilter);
