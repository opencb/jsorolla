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
import LitUtils from "./utils/lit-utils.js";
import "./filters/catalog-search-autocomplete.js";
import "./filters/catalog-distinct-autocomplete.js";
import "./forms/date-filter.js";
import "./opencga-facet-view.js";
import "./forms/text-field-filter.js";
import "./filters/somatic-filter.js";
import "./forms/section-filter.js";
import "./forms/select-token-filter-static.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter.js";

export default class OpencgaBrowserFilter extends LitElement {

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
            resource: {
                type: String
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

        // Make sure some filters point the right RESOURCE
        this.filterToResource = {
            "fileIds": "FILE",
            "samples": "SAMPLE",
            "individualId": "INDIVIDUAL",
            "members": "INDIVIDUAL"
        };

        // Select the right distinct field to be displayed
        this.filterToDistinctField = {
            "phenotypes": "phenotypes.name",
            "disorders": "disorders.name",
            "ethnicity": "ethnicity.id"
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);

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
        if (value && value !== "") {
            this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
        } else {
            delete this.preparedQuery[key];
            this.preparedQuery = {...this.preparedQuery};
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
        // this.dispatchEvent(new CustomEvent("queryChange", {
        //     detail: {
        //         query: query
        //     }
        // }));
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query: query});
    }

    notifySearch(query) {
        // this.dispatchEvent(new CustomEvent("querySearch", {
        //     detail: {
        //         query: query
        //     }
        // }));
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query: query});
    }

    _createSection(section) {
        const htmlFields = section.filters?.length ? section.filters.map(subsection => this._createSubSection(subsection)) : "";
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        let content = "";

        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            switch (subsection.id) {
                case "id":
                case "fileIds":
                case "father":
                case "mother":
                case "samples":
                case "individualId":
                case "members":
                    content = html`
                        <catalog-search-autocomplete
                            .value="${this.preparedQuery[subsection.id]}"
                            .resource="${this.filterToResource[subsection.id] || this.resource}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${subsection}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </catalog-search-autocomplete>
                    `;
                    break;
                case "phenotypes":
                case "disorders":
                case "ethnicity":
                    content = html`
                        <catalog-distinct-autocomplete
                            .value="${this.preparedQuery[subsection.id]}"
                            .queryField="${subsection.id}"
                            .distinctField="${this.filterToDistinctField[subsection.id]}"
                            .resource="${this.resource}"
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
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .resource="${this.resource}"
                            .config="${this.annotationFilterConfig}"
                            .selectedVariablesText="${this.preparedQuery.annotation}"
                            @annotationChange="${this.onAnnotationChange}">
                        </opencga-annotation-filter-modal>
                    `;
                    break;
                case "somatic":
                    content = html`
                        <somatic-filter
                            .value="${this.preparedQuery.somatic}"
                            @filterChange="${e => this.onFilterChange("somatic", e.detail.value)}">
                        </somatic-filter>
                    `;
                    break;
                case "date":
                    content = html`
                        <date-filter
                            .creationDate="${this.preparedQuery.creationDate}"
                            @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}">
                        </date-filter>
                    `;
                    break;
                default:
                    console.error("Filter component not found");
            }
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

customElements.define("opencga-browser-filter", OpencgaBrowserFilter);
