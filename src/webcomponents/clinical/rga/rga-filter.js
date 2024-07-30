/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/forms/text-field-filter.js";
import "../../commons/forms/checkbox-field-filter.js";
import "../../commons/filters/feature-filter.js";
import "../../commons/filters/variant-type-filter.js";
import "../../commons/filters/cohort-stats-filter.js";
import "../../commons/filters/consequence-type-select-filter.js";
import "../../commons/filters/clinvar-accessions-filter.js";
import "../../commons/filters/population-frequency-filter.js";
import "../../commons/filters/region-filter.js";
import "../../commons/forms/select-field-filter.js";

export default class RgaFilter extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    _init() {
        // super.ready();
        this._prefix = "rga-" + UtilsNew.randomString(6) + "_";
        this.query = {};
        this.preparedQuery = {};
        this.searchButton = true;
        this.allowedPopFrequencies = "0,0.0001,0.0005,0.001,0.005,0.01,0.05,1";
    }

    connectedCallback() {
        super.connectedCallback();
        // this._config = {...this.getDefaultConfig(), ...this.config};
        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    firstUpdated(_changedProperties) {
        // super.firstUpdated(_changedProperties);
        UtilsNew.initTooltip(this);
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        /* if (changedProperties.has("opencgaSession")) {
        }*/
        UtilsNew.initTooltip(this);

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
                query: query,
            }
        }));
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query,
            },
        }));
    }

    _createSection(section) {
        const htmlFields = section.filters?.length ? section.filters.map(subsection => this._createSubSection(subsection)) : "";
        return this.config.sections.length > 1 ? html`<section-filter .config="${section}" .filters="${htmlFields}">` : htmlFields;
    }

    /* @deprecated
     */
    rgaIndividualFilter(subsection) {
        const config = {
            addButton: false,
            fields: item => ({
                name: item.id,
            }),
            dataSource: (query, process) => {
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: 20,
                    count: false,
                    include: "id",
                    id: "~^" + query.toUpperCase(),
                };
                this.opencgaSession.opencgaClient.individuals().search(filters).then(restResponse => {
                    const results = restResponse.getResults();
                    process(results.map(config.fields));
                });
            },
        };
        return html`
            <select-field-filter
                .opencgaSession="${this.opencgaSession}"
                .config=${config}
                .value="${this.preparedQuery[subsection.id]}"
                @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
            </select-field-filter>`;
    }

    _createSubSection(subsection) {
        let content = "";
        switch (subsection.id) {
            case "variants":
                content = html`
                    <text-field-filter
                        placeholder="${subsection.placeholder}"
                        .value="${this.preparedQuery[subsection.id]}"
                        .separator="${",;"}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </text-field-filter>`;
                break;
            case "geneName":
                content = html`
                    <feature-filter
                        placeholder="${subsection.placeholder}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .query="${this.preparedQuery}"
                        .separator="${",;"}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </feature-filter>`;
                break;
            case "cohort":
                content = html`
                    <cohort-stats-filter .
                        opencgaSession="${this.opencgaSession}"
                        .onlyCohortAll=${true}
                        .cohortStatsAlt="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </cohort-stats-filter>`;
                break;
            case "populationFrequency":
                content = html`
                    <population-frequency-filter
                        .populationFrequencies="${POPULATION_FREQUENCIES}"
                        .allowedFrequencies=${this.allowedPopFrequencies}
                        ?onlyPopFreqAll="${subsection.onlyPopFreqAll}"
                        .populationFrequencyAlt="${this.preparedQuery[subsection.id]}"
                        .config="${{comparators: [{id: "<", name: "<"}, {id: ">=", name: "&#8804;"}]}}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </population-frequency-filter>`;
                break;
            case "type":
                content = html`
                    <variant-type-filter
                        .type="${this.preparedQuery[subsection.id]}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </variant-type-filter>`;
                break;
            case "consequenceType":
                content = html`
                    <consequence-type-select-filter
                        .ct="${this.preparedQuery[subsection.id]}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </consequence-type-select-filter>`;
                break;
            case "clinicalSignificance":
                content = html`
                    <clinvar-accessions-filter
                        .config="${{clinvar: false}}"
                        .clinicalSignificance="${this.preparedQuery[subsection.id]}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e?.detail?.value?.clinicalSignificance)}">
                </clinvar-accessions-filter>`;
                break;
            case "numParents":
                content = html`
                    <checkbox-field-filter
                        .value="${this.preparedQuery[subsection.id]}"
                        .data="${subsection.allowedValues}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </checkbox-field-filter>`;
                break;
            case "knockoutType":
                content = html`
                    <select-field-filter
                        .data="${subsection.allowedValues}"
                        .value="${this.preparedQuery[subsection.id]}"
                        .config="${{
                            liveSearch: false,
                            multiple: true
                        }}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </select-field-filter>`;
                break;
            case "probandOnly":
                content = html`
                    <div class="form-horizontal">
                        <div class="from-group form-inline">
                            <input class="magic-radio" type="radio" name="${subsection.id}" id="${this._prefix + subsection.id}yes" ?checked=${subsection.value === "yes"} value="yes"
                                   @change="${e => this.onFilterChange(subsection.id, "yes")}"><label class="magic-horizontal-label" for="${this._prefix + subsection.id}yes"> Yes </label>
                            <input class="magic-radio" type="radio" name="${subsection.id}" id="${this._prefix + subsection.id}no" ?checked=${subsection.value === "no"} value="no"
                                   @change="${e => this.onFilterChange(subsection.id, "no")}"> <label class="magic-horizontal-label" for="${this._prefix + subsection.id}no"> No </label>
                        </div>
                    </div>
                `;
                break;
            case "region":
                content = html`
                    <region-filter
                        .cellbaseClient="${this.cellbaseClient}"
                        .region="${this.preparedQuery.region}"
                        @filterChange="${e => this.onFilterChange("region", e.detail.value)}">
                    </region-filter>`;
                break;
            case "individualId":
                content = html`
                    <catalog-search-autocomplete
                        .value="${this.preparedQuery[subsection.id]}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${subsection}"
                        @filterChange="${e => this.onFilterChange(subsection.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
                // content = this.rgaIndividualFilter(subsection);
                break;
            default:
                console.error("Filter component not found", subsection?.id);
        }
        return html`
            <div class="mb-3">
                <label class="form-label fw-bold" id="${subsection.id}">${subsection.name}
                    ${subsection.tooltip ? html`
                        <a tooltip-title="${subsection.name}" tooltip-text="${subsection.tooltip}">
                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>
                        ` : null}
                </label>
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${content}
                </div>
            </div>
        `;
    }

    render() {
        return html`${this.searchButton ? html`
            <div class="d-grid gap-2 mb-3 cy-search-button-wrapper">
                <button type="button" class="btn btn-primary" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> Search
                </button>
            </div>
        ` : null}

        <div class="d-grid gap-1 mb-3" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
            ${this.config?.sections?.length ? this.config.sections.map(section => this._createSection(section)) : html`No filter has been configured.`}
        </div>
        `;
    }

}

customElements.define("rga-filter", RgaFilter);
