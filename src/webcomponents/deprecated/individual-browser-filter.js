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
import "../opencga/catalog/variableSets/opencga-annotation-filter.js";
import "../commons/forms/text-field-filter.js";
import "../commons/forms/select-field-filter.js";
import "../commons/filters/catalog-distinct-autocomplete.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/forms/date-filter.js";

// Rodiel 09-05-2022 - DEPRECATED: opencga-browser support filters by config or use opencga-browser-filter.
export default class IndividualBrowserFilter extends LitElement {

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
                type: Object,
            },
            query: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.annotationFilterConfig = {
            class: "small",
            buttonClass: "btn-sm",
            inputClass: "input-sm",
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
                query: query,
            },
            bubbles: true,
            composed: true,
        }));
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query,
            },
            bubbles: true,
            composed: true,
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
            case "father":
            case "mother":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>`;
                break;
            case "samples":
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
            case "disorders":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"disorders"}"
                        .distinctField="${"disorders.name"}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>`;
                break;
            case "phenotypes":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"phenotypes"}"
                        .distinctField="${"phenotypes.name"}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                    `;
                break;
            case "ethnicity":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"ethnicity"}"
                        .distinctField="${"ethnicity"}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                `;
                break;
            case "sex":
            case "karyotypicSex":
            case "affectationStatus":
            case "lifeStatus":
                content = html`
                    <select-field-filter
                        ?multiple="${subsection.multiple}"
                        .data="${subsection.allowedValues}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </select-field-filter>`;
                break;
            case "annotations":
                content = html`
                    <opencga-annotation-filter-modal
                        .opencgaSession="${this.opencgaSession}"
                        resource="INDIVIDUAL"
                        .config="${this.annotationFilterConfig}"
                        .selectedVariablesText="${this.preparedQuery.annotation}"
                        @annotationChange="${this.onAnnotationChange}">
                    </opencga-annotation-filter-modal>`;
                break;
            case "date":
                content = html`
                    <date-filter
                        .creationDate="${this.preparedQuery.creationDate}"
                        @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}">
                    </date-filter>`;
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
                        </div>` : null}
                </div>
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${content}
                </div>
            </div>
        `;
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

customElements.define("individual-browser-filter", IndividualBrowserFilter);
