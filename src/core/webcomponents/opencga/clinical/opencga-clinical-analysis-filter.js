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

/*
<link rel="import" href="../catalog/opencga-date-filter.html">
*/


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
                value: {},
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
        this.prefix = "osf-" + Utils.randomString(6);

        this.minYear = 1920;

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

        this.dateFilterConfig = {
            recentDays: 10
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.onQueryUpdate();
        }
    }

    onSearch() {
        this.search = Object.assign({}, this.query);
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
        this.set("query", query);
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

        // ClinicalAnalysis
        if (UtilsNew.isNotUndefined(this.query.id)) {
            PolymerUtils.setValue(`${this.prefix}-analysis-input`, this.query.id);
        }

        // Family
        if (UtilsNew.isNotUndefined(this.query.family)) {
            PolymerUtils.setValue(`${this.prefix}-family-input`, this.query.family);
        }

        // Proband
        if (UtilsNew.isNotUndefined(this.query.proband)) {
            PolymerUtils.setValue(`${this.prefix}-proband-input`, this.query.proband);
        }

        // Sample
        if (UtilsNew.isNotUndefined(this.query.sample)) {
            PolymerUtils.setValue(`${this.prefix}-sample-input`, this.query.sample);
        }

        // Priority
        if (UtilsNew.isNotUndefined(this.query.priority)) {
            $(`#${this.prefix}-analysis-priority-select`).selectpicker("val", this.query.priority.split(","));
        }

        // Type
        if (UtilsNew.isNotUndefined(this.query.type)) {
            $(`#${this.prefix}-analysis-type-select`).selectpicker("val", this.query.type.split(","));
        }
    }

    calculateFilters(e) {
        const _query = {};

        const name = PolymerUtils.getValue(`${this.prefix}-analysis-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.id = name;
        }

        const family = PolymerUtils.getValue(`${this.prefix}-family-input`);
        if (UtilsNew.isNotEmpty(family)) {
            _query.family = family;
        }

        const proband = PolymerUtils.getValue(`${this.prefix}-proband-input`);
        if (UtilsNew.isNotEmpty(proband)) {
            _query.proband = proband;
        }

        const samples = PolymerUtils.getValue(`${this.prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(samples)) {
            _query.sample = samples;
        }

        const priority = $(`#${this.prefix}-analysis-priority-select`).selectpicker("val");
        if (UtilsNew.isNotEmpty(priority)) {
            _query.priority = priority.join(",");
        }

        const type = $(`#${this.prefix}-analysis-type-select`).selectpicker("val");
        if (UtilsNew.isNotEmpty(type)) {
            _query.type = type.join(",");
        }

        // keep date filters
        if (UtilsNew.isNotEmpty(this.query.creationDate)) {
            _query.creationDate = this.query.creationDate;
        }

        // To prevent to call renderQueryFilters we set this to false
        this._reset = false;
        this.set("query", _query);
        this._reset = true;
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this.prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this.prefix + "FilterTextInput", "disabled");

        $(`#${this.prefix}ClinicalAnalysisSelection .selectpicker`).selectpicker("val", "");
    }

    render() {
        return html`
        <template>
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
            <button type="button" class="btn btn-lg btn-primary" style="width: 100%" on-click="onSearch">
                <i class="fa fa-search" aria-hidden="true" style="padding: 0px 5px"></i> Search
            </button>
        </div>

        <div class="panel-group" id="{{prefix}}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">

            <!-- ClinicalAnalysis field attributes -->
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="{{prefix}}ClinicalAnalysisSelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#{{prefix}}Accordion"
                           href="#{{prefix}}ClinicalAnalysisSelection" aria-expanded="true" aria-controls="{{prefix}}ClinicalAnalysisSelection">
                            Clinical Analysis
                        </a>
                    </h4>
                </div>

                <div id="{{prefix}}ClinicalAnalysisSelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="{{prefix}}ClinicalAnalysisSelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Clinical Analysis ID
                            </div>
                            <div id="{{prefix}}-name" class="subsection-content form-group">
                                <input type="text" id="{{prefix}}-analysis-input" class$="form-control input-sm {{prefix}}FilterTextInput"
                                       placeholder="CA-1234,CA-2345..." on-keyup="calculateFilters">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Family ID
                            </div>
                            <div id="{{prefix}}-family" class="subsection-content form-group">
                                <input type="text" id="{{prefix}}-family-input" class$="form-control input-sm {{prefix}}FilterTextInput"
                                       placeholder="FAM123, FAM124..." on-keyup="calculateFilters">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Proband ID
                            </div>
                            <div id="{{prefix}}-proband" class="subsection-content form-group">
                                <input type="text" id="{{prefix}}-proband-input" class$="form-control input-sm {{prefix}}FilterTextInput"
                                       placeholder="LP-1234, LP-2345..." on-keyup="calculateFilters">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Sample ID
                            </div>
                            <div id="{{prefix}}-sample" class="subsection-content form-group">
                                <input type="text" id="{{prefix}}-sample-input" class$="form-control input-sm {{prefix}}FilterTextInput"
                                       placeholder="HG01879, HG01880, HG01881..." on-keyup="calculateFilters">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Priority
                            </div>
                            <div id="{{prefix}}-analysis-priority" class="subsection-content form-group">
                                <select id="{{prefix}}-analysis-priority-select" class="selectpicker" multiple
                                        on-change="calculateFilters" data-width="100%">
                                    <option>URGENT</option>
                                    <option>HIGH</option>
                                    <option>MEDIUM</option>
                                    <option>LOW</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Analysis type
                            </div>
                            <div id="{{prefix}}-analysis-type" class="subsection-content form-group">
                                <select id="{{prefix}}-analysis-type-select" class="selectpicker" multiple
                                        on-change="calculateFilters" data-width="100%">
                                    <option>SINGLE</option>
                                    <option>DUO</option>
                                    <option>TRIO</option>
                                    <option>FAMILY</option>
                                    <option>AUTO</option>
                                    <option>MULTISAMPLE</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection" id="{{prefix}}-date">Date
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="{{prefix}}-date-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="{{prefix}}-date-content" class="subsection-content">
                                <opencga-date-filter config="{{dateFilterConfig}}" on-datechanged="onDateChanged"></opencga-date-filter>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </template>
        `;
    }

}

customElements.define("opencga-clinical-analysis-filter", OpencgaClinicalAnalysisFilter);

