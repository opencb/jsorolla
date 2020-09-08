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
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-dynamic.js";
import "../commons/filters/opencga-date-filter.js";
import "../commons/filters/text-field-filter.js";
import "../commons/filters/select-field-filter.js";
import "../commons/filters/cohort-id-autocomplete.js";


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
            },
            cohorts: {
                type: Array
            },
            query: {
                type: Object
            },
            variableSets: {
                type: Array
            },
            variables: {
                type: Array
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
        this._prefix = "osf-" + UtilsNew.randomString(6) + "_";

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

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        UtilsNew.initTooltip(this);
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("variables")) {
            this.variablesChanged();
        }
        if (changedProperties.has("opencgaSession")) {
            //this.updateVariableSets();
        }
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    onAnnotationChange(e) {
        if (e.detail.value) {
            this.preparedQuery.annotation = e.detail.value
        } else {
            delete this.preparedQuery.annotation
        }
        this.preparedQuery = {...this.preparedQuery};
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
    }

    queryObserver() {
        console.log("queryObserver()", this.query);
        this.preparedQuery = this.query || {};
        this.requestUpdate();
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
                content = html`<cohort-id-autocomplete .config="${subsection}" .opencgaSession="${this.opencgaSession}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></cohort-id-autocomplete>`;
                break;
            case "samples":
                content = html`<sample-id-autocomplete .config="${subsection}" .opencgaSession="${this.opencgaSession}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></sample-id-autocomplete>`;
                break;
            case "annotations":
                content = html`<opencga-annotation-filter-modal .opencgaSession="${this.opencgaSession}"
                                                      .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                      resource="COHORT"
                                                      .config="${this.annotationFilterConfig}"
                                                      .selectedVariablesText="${this.preparedQuery.annotation}"
                                                      @annotationChange="${this.onAnnotationChange}">
                        </opencga-annotation-filter-modal>`;
                break;
            case "type":
                content = html`<select-field-filter ?multiple="${subsection.multiple}" .data="${subsection.allowedValues}" .value="${this.preparedQuery[subsection.id]}" @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}"></select-field-filter>`;
                break;
            case "date":
                content = html`<opencga-date-filter .config="${this.dateFilterConfig}" .creationDate="${this.preparedQuery.creationDate}" @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}"></opencga-date-filter>`;
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

    updateVariableSets() {
        this.variables = [];
        const _this = this;
        this.opencgaSession.opencgaClient.studies().info(this.opencgaSession.study.id, {include: "variableSets"})
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
                _this.requestUpdate();
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

    variablesChanged() {
        this._areVariablesEmpty = (this.variables.length === 0);
    }

    render() {
        return html`${this.searchButton ? html`
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
