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
import "../catalog/opencga-date-filter.js";

export default class OpencgaClinicalAnalysisFilter extends LitElement {

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
            analyses: {
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
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    onSearch() {
        //this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
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
        //this.set("query", query);
        this.query = query;
        this._reset = true;
    }

    queryObserver() {
        if (this._reset) {
            console.log("queryObserver: calling to 'renderQueryFilters()'", this.query);
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

        // ClinicalAnalysis
        if (UtilsNew.isNotUndefined(this.query.id)) {
            PolymerUtils.setValue(`${this._prefix}-analysis-input`, this.query.id);
        }

        // Family
        if (UtilsNew.isNotUndefined(this.query.family)) {
            PolymerUtils.setValue(`${this._prefix}-family-input`, this.query.family);
        }

        // Proband
        if (UtilsNew.isNotUndefined(this.query.proband)) {
            PolymerUtils.setValue(`${this._prefix}-proband-input`, this.query.proband);
        }

        // Sample
        if (UtilsNew.isNotUndefined(this.query.sample)) {
            PolymerUtils.setValue(`${this._prefix}-sample-input`, this.query.sample);
        }

        // Priority
        if (UtilsNew.isNotUndefined(this.query.priority)) {
            $(`#${this._prefix}-analysis-priority-select`).selectpicker("val", this.query.priority.split(","));
        }

        // Type
        if (UtilsNew.isNotUndefined(this.query.type)) {
            $(`#${this._prefix}-analysis-type-select`).selectpicker("val", this.query.type.split(","));
        }
    }

    calculateFilters(e) {
        const _query = {};

        const name = PolymerUtils.getValue(`${this._prefix}-analysis-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.id = name;
        }

        const family = PolymerUtils.getValue(`${this._prefix}-family-input`);
        if (UtilsNew.isNotEmpty(family)) {
            _query.family = family;
        }

        const proband = PolymerUtils.getValue(`${this._prefix}-proband-input`);
        if (UtilsNew.isNotEmpty(proband)) {
            _query.proband = proband;
        }

        const samples = PolymerUtils.getValue(`${this._prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(samples)) {
            _query.sample = samples;
        }

        const priority = $(`#${this._prefix}-analysis-priority-select`).selectpicker("val");
        if (UtilsNew.isNotEmpty(priority)) {
            _query.priority = priority.join(",");
        }

        const type = $(`#${this._prefix}-analysis-type-select`).selectpicker("val");
        if (UtilsNew.isNotEmpty(type)) {
            _query.type = type.join(",");
        }

        // keep date filters
        if (UtilsNew.isNotEmpty(this.query.creationDate)) {
            _query.creationDate = this.query.creationDate;
        }

        // To prevent to call renderQueryFilters we set this to false
        this._reset = false;
        //this.set("query", _query);
        this.query = _query;
        this._reset = true;
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

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");

        $(`#${this._prefix}ClinicalAnalysisSelection .selectpicker`).selectpicker("val", "");
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

        <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
        </div>

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">

            <!-- ClinicalAnalysis field attributes -->
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="${this._prefix}ClinicalAnalysisSelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}ClinicalAnalysisSelection" aria-expanded="true" aria-controls="${this._prefix}ClinicalAnalysisSelection">
                            Clinical Analysis
                        </a>
                    </h4>
                </div>

                <div id="${this._prefix}ClinicalAnalysisSelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}ClinicalAnalysisSelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Clinical Analysis ID
                            </div>
                            <div id="${this._prefix}-name" class="subsection-content form-group">
                                <text-field-filter placeholder="CA-1234,CA-2345..." .value="${this.preparedQuery.id}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Family ID
                            </div>
                            <div id="${this._prefix}-family" class="subsection-content form-group">
                                <text-field-filter placeholder="FAM123, FAM124..." .value="${this.preparedQuery.family}" @filterChange="${e => this.onFilterChange("family", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Proband ID
                            </div>
                            <div id="${this._prefix}-proband" class="subsection-content form-group">
                                <text-field-filter placeholder="LP-1234, LP-2345..." .value="${this.preparedQuery.proband}" @filterChange="${e => this.onFilterChange("proband", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Sample ID
                            </div>
                            <div id="${this._prefix}-sample" class="subsection-content form-group">
                                <text-field-filter placeholder="HG01879, HG01880, HG01881..." .value="${this.preparedQuery.sample}" @filterChange="${e => this.onFilterChange("sample", e.detail.value)}"></text-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Priority
                            </div>
                            <div id="${this._prefix}-analysis-priority" class="subsection-content form-group">
                                <select-field-filter multiple .data="${['URGENT','HIGH','MEDIUM','LOW']}" .value="${this.preparedQuery.priority}" @filterChange="${e => this.onFilterChange("priority", e.detail.value)}"></select-field-filter>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Analysis type
                            </div>
                            <div id="${this._prefix}-analysis-type" class="subsection-content form-group">
                                <select-field-filter multiple .data="${['SINGLE','DUO','TRIO','FAMILY','AUTO','MULTISAMPLE']}" .value="${this.preparedQuery.type}" @filterChange="${e => this.onFilterChange("type", e.detail.value)}"></select-field-filter>
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

customElements.define("opencga-clinical-analysis-filter", OpencgaClinicalAnalysisFilter);

