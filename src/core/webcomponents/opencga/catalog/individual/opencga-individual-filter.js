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
import UtilsNew from "./../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "../variableSets/opencga-annotation-filter.js";
import "../opencga-date-filter.js";
import "../../../commons/filters/text-field-filter.js";
import "../../../commons/filters/select-field-filter.js";
import "../../../commons/filters/individual-id-autocomplete.js";


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

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this._initTooltip();
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
    }

    onSearch() {
        // this.search = {...this.query};
        this.notifySearch(this.preparedQuery);
    }

    _initTooltip() {
        // TODO move to Utils
        $("a[tooltip-title]", this).each(function() {
            $(this).qtip({
                content: {
                    title: $(this).attr("tooltip-title"),
                    text: $(this).attr("tooltip-text")
                },
                position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
                show: {delay: 200},
                hide: {fixed: true, delay: 300}
            });
        });
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
        this.query = _query;
        this._reset = true;
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

    /**
     * @deprecated
    * */
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
            $(`#${this._prefix}-individual-sex-select`).selectpicker("val", this.query.sex.split(","));
        }

        // Karyotypic sex
        if (UtilsNew.isNotUndefined(this.query.karyotypicSex)) {
            $(`#${this._prefix}-individual-karyotypicsex-select`).selectpicker("val", this.query.karyotypicSex.split(","));
        }

        // Affectation status
        if (UtilsNew.isNotUndefined(this.query.affectationStatus)) {
            $(`#${this._prefix}-affectation-status-select`).selectpicker("val", this.query.affectationStatus.split(","));
        }

        // Life status
        if (UtilsNew.isNotUndefined(this.query.lifeStatus)) {
            $(`#${this._prefix}-life-status-select`).selectpicker("val", this.query.lifeStatus.split(","));
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
                content = html`<individual-id-autocomplete .config="${subsection}" .opencgaSession="${this.opencgaSession}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></individual-id-autocomplete>`
                break;
            case "samples":
                content = html`<sample-id-autocomplete .config="${subsection}" .opencgaSession="${this.opencgaSession}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></sample-id-autocomplete>`
                break;
            case "ethnicity":
            case "disorder":
            case "phenotypes":
                content = html`<text-field-filter placeholder="${subsection.placeholder}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></text-field-filter>`;
                break;
            case "sex":
            case "karyotypicSex":
            case "affectationStatus":
            case "lifeStatus":
                content = html`<select-field-filter ?multiple="${subsection.multiple}" .data="${subsection.allowedValues}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></select-field-filter>`;
                break;
            case "annotations":
                content = html`<opencga-annotation-filter .opencgaSession="${this.opencgaSession}"
                                                      .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                      entity="INDIVIDUAL"
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
                                    <a tooltip-title="${subsection.name}" tooltip-text="${subsection.description}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                                </div>` : null }
                        </div>
                        <div id="${this._prefix}${subsection.id}" class="subsection-content">
                            ${content}
                         </div>
                    </div>
                `;
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");

        $(`#${this._prefix}IndividualSelection .selectpicker`).selectpicker("val", "");
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
                    ${this.config.sections && this.config.sections.length ? this.config.sections.map(section => this._createSection(section)) : html`No filter has been configured.`}
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-individual-filter", OpencgaIndividualFilter);
