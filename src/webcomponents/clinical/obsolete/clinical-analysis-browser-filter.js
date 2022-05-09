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
import UtilsNew from "../../../core/utilsNew.js";
import "../../commons/forms/date-filter.js";
import "../filters/clinical-priority-filter.js";
import "../filters/clinical-status-filter.js";
import "../../commons/filters/catalog-distinct-autocomplete.js";
import "../../commons/filters/catalog-search-autocomplete.js";

// Rodiel 09-05-2022 - DEPRECATED: opencga-browser support filters by config or use opencga-browser-filter.
export default class ClinicalAnalysisBrowserFilter extends LitElement {

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
        this.query = {};
        this.preparedQuery = {};
    }

    connectedCallback() {
        super.connectedCallback();
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
            case "id":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"CLINICAL_ANALYSIS"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
                break;
            case "proband":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"proband"}"
                        .distinctField="${"proband.id"}"
                        .resource="${"CLINICAL_ANALYSIS"}"
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                `;
                break;
            case "family":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"FAMILY"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                    `;
                break;
            case "sample":
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
            case "priority":
                content = html`
                    <clinical-priority-filter
                        .priorities="${Object.values(this.opencgaSession.study.internal?.configuration?.clinical?.priorities ?? [])}"
                        .priority="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </clinical-priority-filter>`;
                break;
            case "status":
                content = html`
                    <clinical-status-filter
                        .status="${this.preparedQuery[subsection.id]}"
                        .statuses="${Object.values(this.opencgaSession.study.internal?.configuration?.clinical?.status)?.flat()}"
                        .multiple=${true}
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </clinical-status-filter>`;
                break;
            case "type":
                content = html`
                    <select-field-filter
                        .multiple="${subsection.multiple}"
                        .data="${subsection.params.allowedValues}"
                        .value="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </select-field-filter>`;
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
            ${this.searchButton ? html`
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

customElements.define("clinical-analysis-browser-filter", ClinicalAnalysisBrowserFilter);

