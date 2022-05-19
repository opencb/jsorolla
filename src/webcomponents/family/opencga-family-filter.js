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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-modal.js";
import "../commons/forms/date-filter.js";
import "../commons/filters/family-id-autocomplete.js";
import "../commons/filters/disorder-autocomplete.js";

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        // super.ready();
        this._prefix = "osf-" + UtilsNew.randomString(6) + "_";


        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm"
        };

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
    }

    queryObserver() {
        console.log("queryObserver()", this.query);
        this.preparedQuery = this.query || {};
        this.requestUpdate();
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    onAnnotationChange(e) {
        if (e.detail.value) {
            this.preparedQuery.annotation = e.detail.value;
        } else {
            delete this.preparedQuery.annotation;
        }
        this.preparedQuery = {...this.preparedQuery};
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
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
        const htmlFields = section.filters?.length ? section.filters.map(subsection => this._createSubSection(subsection)) : "";
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        let content = "";
        switch (subsection.id) {
            case "id":
                content = html`
                    <family-id-autocomplete
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </family-id-autocomplete>`;
                break;
            case "members":
                content = html`
                    <individual-id-autocomplete
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </individual-id-autocomplete>`;
                break;
            case "disorders":
                content = html`
                    <disorder-autocomplete
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        .resource=${"FAMILY"}
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </disorder-autocomplete>
                    `;
                break;
            case "phenotypes":
                content = html`
                    <phenotype-name-autocomplete
                        .config="${{...subsection, resource: "FAMILY"}}"
                        .opencgaSession="${this.opencgaSession}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </phenotype-name-autocomplete>`;
                break;
            case "annotations":
                content = html`
                    <opencga-annotation-filter-modal
                        .opencgaSession="${this.opencgaSession}"
                        resource="FAMILY"
                        .config="${this.annotationFilterConfig}"
                        .selectedVariablesText="${this.preparedQuery.annotation}"
                        @annotationChange="${this.onAnnotationChange}">
                    </opencga-annotation-filter-modal>`;
                break;
            case "date":
                content = html`<date-filter .creationDate="${this.preparedQuery.creationDate}" @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}"></date-filter>`;
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
                        <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
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
        this.query = _query;
    }

    render() {
        return html`
            ${this.config?.searchButton ? html`
                <div class="search-button-wrapper">
                    <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                        <i class="fa fa-search" aria-hidden="true"></i> Search
                    </button>
                </div>
                ` : null}

            <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
                ${this.config?.sections?.length ? this.config.sections.map(section => this._createSection(section)) : html`No filter has been configured.`}
            </div>
        `;
    }

}

customElements.define("opencga-family-filter", OpencgaFamilyFilter);
