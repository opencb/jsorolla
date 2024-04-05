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
import UtilsNew from "../../core/utils-new.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-dynamic.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-modal.js";
import "../commons/forms/date-picker.js.js";
import "../commons/forms/text-field-filter.js";
import "../commons/forms/select-field-filter.js";
import "../commons/filters/catalog-distinct-autocomplete";
import "../commons/filters/catalog-search-autocomplete.js";

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
            query: {
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

    onSearch() {
        // this.search = {...this.query};
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
        const htmlFields = section.filters?.length ? section.filters.map(subsection => this._createSubSection(subsection)) : "";
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        let content = "";
        switch (subsection.id) {
            case "name":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"FILE"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
                break;
            case "sampleIds":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"SAMPLE"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
                break;
            case "directory":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"path"}"
                        .distinctFields="${"path"}"
                        .resource="${"FILE"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                `;
                break;
            case "path":
                content = html`
                    <text-field-filter
                        placeholder="${subsection.placeholder}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </text-field-filter>
                `;
                break;
            case "format":
            case "bioformat":
            case "internal.variant.index.status.id":
                content = html`
                    <select-field-filter
                        .value="${this.preparedQuery[subsection.id]}"
                        .config="${{multiple: true}}"
                        .data="${subsection.allowedValues}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </select-field-filter>
                `;
                break;
            case "annotations":
                content = html`
                    <opencga-annotation-filter-modal
                        .opencgaSession="${this.opencgaSession}"
                        resource="FILE"
                        .config="${this.annotationFilterConfig}"
                        .selectedVariablesText="${this.preparedQuery.annotation}"
                        @annotationChange="${this.onAnnotationChange}">
                    </opencga-annotation-filter-modal>
                `;
                break;
            case "date":
                content = html`
                    <date-picker
                        .filterDate="${this.preparedQuery.creationDate}"
                        @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}">
                    </date-picker>
                `;
                break;
            default:
                console.error("Filter component not found");
        }

        return html`
            <div class="form-group">
                <div class="browser-subsection" id="${subsection.id}">${subsection.name}
                    ${subsection.description ? html`
                        <a tooltip-title="${subsection.name}" tooltip-text="${subsection.description}">
                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>
                        ` : null }
                </div>
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${content}
                </div>
            </div>
                `;
    }

    isNotEmpty(myArray) {
        return UtilsNew.isNotEmptyArray(myArray);
    }

    render() {
        return html`
            ${this.config?.searchButton ? html`
                <div class="search-button-wrapper">
                    <button type="button" class="btn btn-primary" @click="${this.onSearch}">
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

customElements.define("file-filter", OpencgaFileFilter);
