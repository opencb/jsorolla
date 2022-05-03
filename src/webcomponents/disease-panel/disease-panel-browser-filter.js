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
import "../commons/filters/catalog-distinct-autocomplete.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/forms/date-filter.js";
import "../commons/forms/text-field-filter.js";
import "../commons/forms/section-filter.js";

export default class DiseasePanelBrowserFilter extends LitElement {

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
            cellbaseClient: {
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
        this._prefix = UtilsNew.randomString(8);

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
            // this.variablesChanged()
        }
    }

    // TODO review
    // this is used only in case of Search button inside filter component.
    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    queryObserver() {
        this.preparedQuery = this.query || {};
        this.requestUpdate();
    }

    onFilterChange(key, value) {
        if (key instanceof Object && value instanceof Object) {
            for (const k of Object.keys(key)) {
                const v = value[k];
                if (v && v !== "") {
                    this.preparedQuery = {...this.preparedQuery, ...{[k]: v}};
                } else {
                    delete this.preparedQuery[k];
                    this.preparedQuery = {...this.preparedQuery};
                }
            }
        } else {
            if (value && value !== "") {
                this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
            } else {
                delete this.preparedQuery[key];
                this.preparedQuery = {...this.preparedQuery};
            }
        }
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
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

    notifyQuery(query) {
        this.dispatchEvent(new CustomEvent("queryChange", {
            detail: {
                query: query
            }
        }));
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            }
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
                        .resource="${"DISEASE_PANEL"}"
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
                        .queryField="${"disorders.id"}"
                        .distinctField="${"disorders.id"}"
                        .resource="${"DISEASE_PANEL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>`;
                break;
            case "genes":
                content = html`
                    <!-- <feature-filter
                        .opencgaSession="\${this.opencgaSession}"
                        .query=\${this.preparedQuery}
                        @filterChange="\${e => this.onFilterChange("genes", e.detail.value)}">
                    </feature-filter> -->
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"genes.id"}"
                        .distinctField="${"genes.id"}"
                        .resource="${"DISEASE_PANEL"}"
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>`;
                break;
            case "region":
                content = html`
                    <region-filter
                        .cellbaseClient="${this.cellbaseClient}"
                        .region="${this.preparedQuery.region}"
                        @filterChange="${e => this.onFilterChange("regions", e.detail.value)}">
                    </region-filter>`;
                break;
            case "categories":
                content = html`
                    <!-- <select-token-filter-static
                        .config=\${subsection}
                        .value="\${this.preparedQuery[subsection.id]}"
                        @filterChange="\${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </select-token-filter-static> -->
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"categories.name"}"
                        .distinctField="${"categories.name"}"
                        .resource="${"DISEASE_PANEL"}"
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                `;
                break;
            case "tags":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .queryField="${"tags"}"
                        .distinctField="${"tags"}"
                        .resource="${"DISEASE_PANEL"}"
                        .config="${subsection}"
                        .opencgaSession="${this.opencgaSession}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>`;
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
                        </div>` : null
                    }
                </div>
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${content}
                </div>
            </div>`;
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

customElements.define("disease-panel-browser-filter", DiseasePanelBrowserFilter);
