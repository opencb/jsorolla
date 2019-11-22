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

// todo check functionality (and notify usage)
import {LitElement, html} from "/web_modules/lit-element.js";
import "../variableSets/opencga-annotation-filter.js";
import "../opencga-date-filter.js";

export default class OpencgaFileFilter extends LitElement {

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
            files: {
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
        this._prefix = "osf-" + Utils.randomString(6);

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
        if (changedProperties.has("query")) {
            this.onQueryUpdate();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
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
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'");
            this.renderQueryFilters();
        } else {
            this._reset = true;
        }
    }

    renderQueryFilters() {
        // Empty everything before rendering
        this._clearHtmlDom();

        // File name
        if (UtilsNew.isNotUndefined(this.query.name)) {
            PolymerUtils.setValue(`${this._prefix}-name-input`, this.query.name);
        }

        // File path
        if (UtilsNew.isNotUndefined(this.query.path)) {
            PolymerUtils.setValue(`${this._prefix}-path-input`, this.query.path);
        }

        // Sample
        if (UtilsNew.isNotUndefined(this.query.samples)) {
            PolymerUtils.setValue(`${this._prefix}-sample-input`, this.query.samples);
        }

        // File format
        if (UtilsNew.isNotUndefined(this.query.format)) {
            PolymerUtils.setValue(`${this._prefix}-format-input`, this.query.format);
        }

        // File bioformat
        if (UtilsNew.isNotUndefined(this.query.bioformat)) {
            PolymerUtils.setValue(`${this._prefix}-bioformat-input`, this.query.bioformat);
        }
        this.requestUpdate();
    }

    calculateFilters(e) {
        const _query = {};

        const name = PolymerUtils.getValue(`${this._prefix}-name-input`);
        if (UtilsNew.isNotEmpty(name)) {
            _query.name = name;
        }

        const path = PolymerUtils.getValue(`${this._prefix}-path-input`);
        if (UtilsNew.isNotEmpty(path)) {
            _query.path = path;
        }

        const sample = PolymerUtils.getValue(`${this._prefix}-sample-input`);
        if (UtilsNew.isNotEmpty(sample)) {
            _query.samples = sample;
        }

        const format = PolymerUtils.getValue(`${this._prefix}-format-input`);
        if (UtilsNew.isNotEmpty(format)) {
            _query.format = format;
        }

        const bioformat = PolymerUtils.getValue(`${this._prefix}-bioformat-input`);
        if (UtilsNew.isNotEmpty(bioformat)) {
            _query.bioformat = bioformat;
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
    }

    isNotEmpty(myArray) {
        return UtilsNew.isNotEmptyArray(myArray);
    }

    render() {
        return html`
        <style include="jso-styles">
            .label-opencga-file-filter {
                padding-top: 10px;
            }
            span + span {
                margin-left: 10px;
            }

            .browser-ct-scroll {
                /*max-height: 450px;*/
                /*overflow-y: scroll;*/
                overflow-x: scroll;
            }

            .browser-ct-tree-view,
            .browser-ct-tree-view * {
                padding: 0;
                margin: 0;
                list-style: none;
            }

            .browser-ct-tree-view li ul {
                margin: 0 0 0 22px;
            }

            .browser-ct-tree-view * {
                vertical-align: middle;
            }

            .browser-ct-tree-view {
                /*font-size: 14px;*/
            }

            .browser-ct-tree-view input[type="checkbox"] {
                cursor: pointer;
            }

            .browser-ct-item {
                white-space: nowrap;
                display: inline
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

            span.searchingSpan{
                background-color: #286090;
            }
            .searchingButton{
                color: #fff;
            }
            .notbold{
                font-weight: normal;
            }
            .bootstrap-select {
                width: 100%!important;
            }
        </style>

        <div style="width: 60%;margin: 0 auto">
            <button type="button" class="btn btn-lg btn-primary" style="width: 100%" @click="${this.onSearch}">
                <i class="fa fa-search" aria-hidden="true" style="padding: 0px 5px"></i> Search
            </button>
        </div>
        <!--<br>-->

        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">

            <!-- File field attributes -->
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="${this._prefix}FileSelectionHeading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}FileSelection" aria-expanded="true" aria-controls="${this._prefix}FileSelection">
                            File
                        </a>
                    </h4>
                </div>

                <div id="${this._prefix}FileSelection" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}FileSelectionHeading">
                    <div class="panel-body">

                        <div class="form-group">
                            <div class="browser-subsection">Name
                            </div>
                            <div id="${this._prefix}-name" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-name-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="accepted_hits.bam, phenotypes.vcf..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Path
                            </div>
                            <div id="${this._prefix}-path" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-path-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="genomes/resources/files/..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Sample
                            </div>
                            <div id="${this._prefix}-sample" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-sample-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="HG01879, HG01880, HG01881..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Format
                            </div>
                            <div id="${this._prefix}-format" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-format-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="BAM,VCF..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Bioformat
                            </div>
                            <div id="${this._prefix}-bioformat" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}-bioformat-input" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="ALIGNMENT,VARIANT..." @input="${this.calculateFilters}">
                            </div>
                        </div>

                        ${this.isNotEmpty(this.variableSets) ? html`
                            <div class="form-group">
                                <div class="browser-subsection" id="${this._prefix}-annotationss">File annotations
                                    <div style="float: right" class="tooltip-div">
                                        <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-annotations-tooltip"></i></a>
                                    </div>
                                </div>
                                <div id="${this._prefix}-annotations" class="subsection-content">
                                    <opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                               .config="${this.annotationFilterConfig}"
                                                               entity="FILE"
                                                               @filterannotation="${this.addAnnotation}">
                                    </opencga-annotation-filter>
                                </div>
                            </div>
                        ` : null}
                        
                        <div class="form-group">
                            <div class="browser-subsection" id="${this._prefix}-date">Date
                                <div style="float: right" class="tooltip-div">
                                    <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}-date-tooltip"></i></a>
                                </div>
                            </div>
                            <div id="${this._prefix}-date-content" class="subsection-content">
                                <opencga-date-filter .config="${this.dateFilterConfig}" @datechanged="${this.onDateChanged}"></opencga-date-filter>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
        `;
    }

}

customElements.define("opencga-file-filter", OpencgaFileFilter);
