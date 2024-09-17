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
import LitUtils from "./utils/lit-utils.js";
import "./filters/catalog-search-autocomplete.js";
import "./filters/catalog-distinct-autocomplete.js";
import "./forms/date-filter.js";
import "./forms/date-picker.js";
import "./opencga-facet-view.js";
import "./forms/text-field-filter.js";
import "./filters/somatic-filter.js";
import "./forms/section-filter.js";
import "./forms/select-field-filter.js";
import "./forms/select-token-filter-static.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-modal.js";

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
            cellbaseClient: {
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
            "sample": "SAMPLE",
            "sampleIds": "SAMPLE",
            "individualId": "INDIVIDUAL",
            "members": "INDIVIDUAL",
            "family": "FAMILY",
            "jobId": "JOB",
            "workflow": "WORKFLOW",
            "input": "FILE",
            "output": "FILE",
        };

        // Select the right distinct field to be displayed
        this.filterToDistinctField = {
            "phenotypes": "phenotypes.id,phenotypes.name",
            "disorders": "disorders.id,disorders.name",
            "ethnicity": "ethnicity.id",
            "proband": "proband.id",
            "tool": "tool.id",
            "genes": "genes.id",
            "categories": "categories.name",
            "source": "source.name",
            "format": "format",
            "tags": "tags",
            "sex": "sex.id",
            "karyotypicSex": "karyotypicSex",
            "type": "type",
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

    update(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        // if (changedProperties.has("variables")) {
        //     this.variablesChanged()
        // }
        super.update(changedProperties);
    }

    // TODO review, this is used only in case of Search button inside filter component.
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
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query: query});
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {query: query});
    }

    _createSection(section) {
        const htmlFields = section.filters?.length ? section.filters.map(subsection => this._createSubSection(subsection)) : "";
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    _createSubSection(subsection) {
        // Prevent empty filters section when a subsection is undefined
        if (!subsection?.id) {
            console.error("Filter definition error", subsection);
            return "";
        }

        let content = "";

        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            const id = subsection.id === "priority" ? `${this.resource.toLowerCase()}_${subsection.id}`: subsection.id;
            switch (id) {
                case "id":
                case "name":
                case "fileIds":
                case "father":
                case "mother":
                case "samples":
                case "sample":
                case "sampleIds":
                case "individualId":
                case "members":
                case "family":
                case "input":
                case "jobId":
                case "workflow":
                case "output":
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
                case "directory": // Temporal Solution
                    content = html`
                        <catalog-search-autocomplete
                            .value="${this.preparedQuery[subsection.id]}"
                            resource="DIRECTORY"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${subsection}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </catalog-search-autocomplete>
                    `;
                    break;
                case "phenotypes":
                case "disorders":
                case "ethnicity":
                case "proband":
                case "tool":
                case "categories":
                case "genes":
                case "format":
                case "tags":
                case "source":
                case "sex":
                case "karyotypicSex":
                case "type":
                    content = html`
                        <catalog-distinct-autocomplete
                            .value="${this.preparedQuery[subsection.id]}"
                            .queryField="${subsection.id}"
                            .distinctFields="${this.filterToDistinctField[subsection.id]}"
                            .resource="${this.resource}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${subsection}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </catalog-distinct-autocomplete>
                    `;
                    break;
                case "affectationStatus":
                case "lifeStatus":
                case "bioformat":
                case "internalVariantIndexStatus":
                case "internalStatus":
                case "visited":
                case "job_priority":
                    content = html`
                        <select-field-filter
                            .value="${this.preparedQuery[subsection.id]}"
                            .data="${subsection.allowedValues}"
                            .config="${{
                                multiple: subsection?.multiple
                            }}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </select-field-filter>
                    `;
                    break;
                case "path":
                    content = html`
                        <text-field-filter2
                            .value="${this.preparedQuery[subsection.id]}"
                            .config="${{
                                placeholder: subsection?.placeholder
                            }}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </text-field-filter2>
                    `;
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
                case "clinical_analysis_priority":
                    content = html`
                        <clinical-priority-filter
                            .priority="${this.preparedQuery[subsection.id]}"
                            .priorities="${Object.values(this.opencgaSession.study.internal?.configuration?.clinical?.priorities ?? [])}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </clinical-priority-filter>
                    `;
                    break;
                case "status":
                    content = html`
                        <clinical-status-filter
                            .status="${this.preparedQuery[subsection.id]}"
                            .statuses="${Object.values(this.opencgaSession.study.internal?.configuration?.clinical?.status)?.flat()}"
                            .multiple="${true}"
                            @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                        </clinical-status-filter>
                    `;
                    break;
                case "region":
                    content = html`
                        <region-filter
                            .cellbaseClient="${this.cellbaseClient}"
                            .region="${this.preparedQuery.region}"
                            @filterChange="${e => this.onFilterChange("regions", e.detail.value)}">
                        </region-filter>
                    `;
                    break;
                case "date":
                case "creationDate":
                    content = html`
                        <date-picker
                            .filterDate="${this.preparedQuery.creationDate}"
                            @filterChange="${e => this.onFilterChange("creationDate", e.detail.value)}">
                        </date-picker>
                    `;
                    break;
                case "dueDate":
                    content = html`
                        <date-picker
                            .filterDate="${this.preparedQuery.dueDate}"
                            @filterChange="${e => this.onFilterChange("dueDate", e.detail.value)}">
                        </date-picker>
                    `;
                    break;
                default:
                    console.error("Filter component not found: ", id);
            }
        }

        if (content) {
            return html`
                <div class="mb-3">
                    <label class="form-label fw-bold" id="${subsection.id}">${subsection.name}</label>
                        ${subsection.description ? html`
                            <a tooltip-title="${subsection.name}" tooltip-text="${subsection.description}">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                            </a>
                        ` : null}
                    <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                        ${content}
                    </div>
                </div>
            `;
        } else {
            return "";
        }
    }

    render() {
        return html`
            ${this.config?.searchButton ? html`
                <div class="d-grid gap-2 mb-3 cy-search-button-wrapper">
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

customElements.define("opencga-browser-filter", OpencgaBrowserFilter);
