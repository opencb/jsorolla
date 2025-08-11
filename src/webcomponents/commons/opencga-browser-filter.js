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

import {LitElement, html, nothing} from "lit";
import "./filters-toolbar.js";
import "./filters/catalog-search-autocomplete.js";
import "./filters/catalog-distinct-autocomplete.js";
import "./forms/date-filter.js";
import "./forms/date-picker.js";
import "./forms/text-field-filter.js";
import "./filters/somatic-filter.js";
import "./forms/select-field-filter.js";
import "./forms/select-token-filter-static.js";
import "../opencga/catalog/variableSets/opencga-annotation-filter-modal.js";

export default class OpencgaBrowserFilter extends LitElement {

    constructor() {
        super();

        this.#init();

    }
    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            toolId: {
                type: String,
            },
            resource: {
                type: String
            },
            preparedQuery: {
                type: Object,
            },
            executedQuery: {
                type: Object,
            },
            variableSets: {
                type: Array
            },
            variables: {
                type: Array
            },
            searchActive: {
                type: Boolean,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        // Make sure some filters point the right RESOURCE
        this.filterToResource = {
            "fileIds": "FILE",
            "sample": "SAMPLE",
            "samples": "SAMPLE",
            "sampleIds": "SAMPLE",
            "individualId": "INDIVIDUAL",
            "family": "FAMILY",
            "familyIds": "FAMILY",
            "members": "INDIVIDUAL",
            "cohortIds": "COHORT",
            "jobId": "JOB",
            "input": "FILE",
            "output": "FILE",
            "directory": "DIRECTORY",
            "workflow": "WORKFLOW",
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
            "internalStatus": "internal.status.id",
        };
    }

    renderFilter(subsection, onFilterChange, preparedQuery, opencgaSession) {
        let content = nothing;
        const id = subsection.id === "priority" ? `${this.resource.toLowerCase()}_${subsection.id}` : subsection.id;

        switch (id) {
            case "id":
            case "name":
            case "fileIds":
            case "samples":
            case "sample":
            case "sampleIds":
            case "individualId":
            case "father":
            case "mother":
            case "family":
            case "familyIds":
            case "members":
            case "cohortIds":
            case "jobId":
            case "input":
            case "output":
            case "directory":
            case "workflow":
                content = html`
                    <catalog-search-autocomplete
                        .value="${preparedQuery[subsection.id]}"
                        .resource="${this.filterToResource[subsection.id] || this.resource}"
                        .opencgaSession="${opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
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
            case "internalStatus":
                content = html`
                    <catalog-distinct-autocomplete
                        .value="${preparedQuery[subsection.id]}"
                        .queryField="${subsection.id}"
                        .distinctFields="${this.filterToDistinctField[subsection.id]}"
                        .resource="${this.resource}"
                        .opencgaSession="${opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-distinct-autocomplete>
                `;
                break;
            case "affectationStatus":
            case "lifeStatus":
            case "bioformat":
            case "internalVariantIndexStatus":
            // case "internalStatus":
            case "visited":
            case "job_priority":
            case "visibility":
                content = html`
                    <select-field-filter
                        .value="${preparedQuery[subsection.id]}"
                        .data="${subsection.allowedValues}"
                        .config="${{
                            multiple: subsection?.multiple
                        }}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
                    </select-field-filter>
                `;
                break;
            case "path":
                content = html`
                    <text-field-filter
                        .value="${preparedQuery[subsection.id]}"
                        .config="${{
                            placeholder: subsection?.placeholder
                        }}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
                    </text-field-filter>
                `;
                break;
            case "annotations":
                content = html`
                    <opencga-annotation-filter-modal
                        .opencgaSession="${opencgaSession}"
                        .opencgaClient="${opencgaSession.opencgaClient}"
                        .resource="${this.resource}"
                        .selectedVariablesText="${preparedQuery.annotation}"
                        @annotationChange="${e => onFilterChange("annotation", e.detail.value)}">
                    </opencga-annotation-filter-modal>
                `;
                break;
            case "somatic":
                content = html`
                    <somatic-filter
                        .value="${preparedQuery.somatic}"
                        @filterChange="${e => onFilterChange("somatic", e.detail.value)}">
                    </somatic-filter>
                `;
                break;
            case "clinical_analysis_priority":
                content = html`
                    <clinical-priority-filter
                        .priority="${preparedQuery[subsection.id]}"
                        .priorities="${Object.values(opencgaSession.study.internal?.configuration?.clinical?.priorities ?? [])}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
                    </clinical-priority-filter>
                `;
                break;
            case "status":
                content = html`
                    <clinical-status-filter
                        .status="${preparedQuery[subsection.id]}"
                        .statuses="${opencgaSession.study.internal?.configuration?.clinical?.status || []}"
                        .multiple="${true}"
                        @filterChange="${e => onFilterChange(subsection.id, e.detail.value)}">
                    </clinical-status-filter>
                `;
                break;
            case "region":
                content = html`
                    <region-filter
                        .cellbaseClient="${opencgaSession.cellbaseClient}"
                        .region="${preparedQuery.region}"
                        @filterChange="${e => onFilterChange("regions", e.detail.value)}">
                    </region-filter>
                `;
                break;
            case "date":
            case "creationDate":
                content = html`
                    <date-picker
                        .filterDate="${preparedQuery.creationDate}"
                        @filterChange="${e => onFilterChange("creationDate", e.detail.value)}">
                    </date-picker>
                `;
                break;
            case "dueDate":
                content = html`
                    <date-picker
                        .filterDate="${preparedQuery.dueDate}"
                        @filterChange="${e => onFilterChange("dueDate", e.detail.value)}">
                    </date-picker>
                `;
                break;
            case "noteType":
                // Josemi Note 2024-12-11: the 'type' id is associated with the cohort's type and uses catalog-distinct-autocomplete
                // but for the note's type, we need to use select-field-filter as we have a fixed set of values
                content = html`
                    <select-field-filter
                        .value="${this.preparedQuery.type}"
                        .data="${subsection.allowedValues || []}"
                        .config="${{
                            multiple: subsection?.multiple
                        }}"
                        @filterChange="${e => onFilterChange("type", e.detail.value)}">
                    </select-field-filter>
                `;
                break;
            default:
                console.error("Filter component not found: ", id);
        }

        return content;
    }

    render() {
        return html`
            <filters-toolbar
                .opencgaSession="${this.opencgaSession}"
                .toolId="${this.toolId}"
                .resource="${this.resource}"
                .preparedQuery="${this.preparedQuery || {}}"
                .executedQuery="${this.executedQuery || {}}"
                .searchActive="${this.searchActive}"
                .renderFilter="${(section, onFilterChange, preparedQuery, opencgaSession) => this.renderFilter(section, onFilterChange, preparedQuery, opencgaSession)}"
                .config="${this.config}">
            </filters-toolbar>
        `;
    }

}

customElements.define("opencga-browser-filter", OpencgaBrowserFilter);
