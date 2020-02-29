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

    queryObserver() {
        if (this._reset) {
            console.log("onQueryUpdate: calling to 'renderQueryFilters()'", this.query);
            this.preparedQuery = this.query;
            // renderQueryFilters shouldn't be necessary anymore
            // this.renderQueryFilters();
            this.requestUpdate();
        } else {
            this._reset = true;
        }
    }

    onSearch() {
        // this.search = {...this.query};
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
            case "members":
            case "phenotypes":
                content = html`<text-field-filter placeholder="${subsection.placeholder}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></text-field-filter>`;
                break;
            case "annotations":
                content = html`<opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                      .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                      entity="FAMILY"
                                                      .config="${this.annotationFilterConfig}"
                                                      @filterannotation="${this.addAnnotation}">
                           </opencga-annotation-filter>`;
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

customElements.define("opencga-family-filter", OpencgaFamilyFilter);
