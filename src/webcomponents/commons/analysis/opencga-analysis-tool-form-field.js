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
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-field-filter.js";
import "../forms/text-field-filter.js";
import "../filters/population-frequency-filter.js";
import "../filters/clinvar-accessions-filter.js";
import "../forms/checkbox-field-filter.js";
import "../filters/catalog-search-autocomplete.js";

export default class OpencgaAnalysisToolFormField extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    onFilterChange(fieldId, value) {
        this.dispatchEvent(new CustomEvent("fieldChange", {
            detail: {
                param: fieldId,
                value: value
            },
            bubbles: true,
            composed: true
        }));
    }

    // TODO bind with this.data!
    renderField() {
        const fieldConfig = this.config;
        switch (fieldConfig.type) {
            case "category":
                return html`
                    <select-field-filter
                        .data="${fieldConfig.allowedValues}"
                        .value="${fieldConfig.defaultValue}"
                        .config="${{
                            multiple: fieldConfig.multiple,
                            disabled: fieldConfig.disabled,
                            required: fieldConfig.required
                        }}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </select-field-filter>
                `;
            case "string":
                return html`
                    <text-field-filter
                        placeholder="${fieldConfig.placeholder || ""}"
                        ?disabled="${this.config.disabled}"
                        ?required="${this.config.required}"
                        .value="${fieldConfig.defaultValue || ""}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </text-field-filter>
                `;
            case "number":
                const [min = "", max = ""] = fieldConfig.allowedValues || [];
                return html`
                    <div id="${this._prefix}-wrapper" class="subsection-content form-group">
                        <input type="number" min=${min} max=${max} step="0.01"
                        .disabled=${this.config.disabled}
                        ?required=${this.config.required} value="${fieldConfig.defaultValue || ""}"
                        id="${this._prefix}-input-${fieldConfig.id}" class="form-control input-sm ${this._prefix}FilterTextInput"
                        placeholder="${fieldConfig.placeholder || ""}" @input="${e => this.onFilterChange(fieldConfig.id, e.target.value)}">
                    </div>
                `;
            case "checkbox":
                return html`
                    <checkbox-field-filter
                        .value="${fieldConfig.value}"
                        .data="${fieldConfig.allowedValues}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </checkbox-field-filter>
                `;
            case "boolean":
                return html`
                    <div class="form-horizontal">
                        <div class="from-group form-inline">
                            <input class="magic-radio" type="radio" name="${fieldConfig.id}"
                            id="${this._prefix + fieldConfig.id}yes" ?checked=${fieldConfig.value === "yes"}
                            value="yes" @change="${e => this.onFilterChange(fieldConfig.id, "yes")}">
                                <label class="magic-horizontal-label" for="${this._prefix + fieldConfig.id}yes"> Yes </label>
                            <input class="magic-radio" type="radio" name="${fieldConfig.id}"
                            id="${this._prefix + fieldConfig.id}no" ?checked=${fieldConfig.value === "no"}
                            value="no" @change="${e => this.onFilterChange(fieldConfig.id, "yes")}">
                                <label class="magic-horizontal-label" for="${this._prefix + fieldConfig.id}no"> No </label>
                        </div>
                    </div>
                `;
            case "CLINVAR_ACCESSION_FILTER":
                return html`
                    <clinvar-accessions-filter
                        .config="${{clinvar: false}}"
                        .clinicalSignificance="${fieldConfig.value}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e?.detail?.value?.clinicalSignificance)}">
                    </clinvar-accessions-filter>
                `;
            case "COHORT_FREQUENCY_FILTER":
                return html`
                    <cohort-stats-filter
                        .opencgaSession="${this.opencgaSession}"
                        .onlyCohortAll="${true}"
                        .cohortStatsAlt="${fieldConfig.value}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </cohort-stats-filter>
                `;
            case "POPULATION_FREQUENCY_FILTER":
                return html`
                    <population-frequency-filter
                        .populationFrequencyAlt="${fieldConfig.value}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </population-frequency-filter>
                `;
            case "CONSEQUENCE_TYPE_FILTER":
                return html`
                    <consequence-type-select-filter
                        .ct="${fieldConfig.value}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </consequence-type-select-filter>
                `;
            case "VARIANT_TYPE_FILTER":
                return html`
                    <variant-type-filter
                        .type="${fieldConfig.value}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </variant-type-filter>
                `;
            case "SAMPLE_FILTER":
                return html`
                    <catalog-search-autocomplete
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        .resource="${"SAMPLE"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
            case "GENE_FILTER":
                return html`
                    <feature-filter
                        .config="${fieldConfig}"
                        .cellbaseClient="${this.cellbaseClient}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </feature-filter>`;
            case "INDIVIDUAL_FILTER":
                return html`
                    <catalog-search-autocomplete
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        .resource="${"INDIVIDUAL"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                    `;
            case "COHORT_FILTER":
                return html`
                    <catalog-search-autocomplete
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        .resource="${"COHORT"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
            case "FAMILY_FILTER":
                return html`
                    <catalog-search-autocomplete
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        .resource="${"FAMILY"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
            case "CLINICAL_ANALYSIS_FILTER":
                return html`
                    <catalog-search-autocomplete
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        .resource="${"CLINICAL_ANALYSIS"}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${fieldConfig}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </catalog-search-autocomplete>
                `;
            default:
                console.warn("field type "+fieldConfig.type+" not implemented. String type fallback");
                return html`
                    <text-field-filter
                        .value="${fieldConfig.value ?? fieldConfig.defaultValue}"
                        placeholder="${fieldConfig.placeholder || ""}"
                        ?disabled="${this.config.disabled}"
                        ?required="${this.config.required}"
                        @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}">
                    </text-field-filter>
                `;
        }
    }

    render() {
        let width = "550px";
        let padding = "2px 20px";
        if (this.config.type === "category" || this.config.type === "string" || this.config.type === "number") {
            width = "320px";
            padding = "4px 20px";
        }

        return html`
            <div class="row opencga-analysis-tool-form-field">
                ${this.config.title ? html`<label class="fw-bold form-label">${this.config.title}</label>` : nothing}
                ${this.config.tooltip ? html`
                    <div class="tooltip-div pull-right">
                        <a tooltip-title="Info" tooltip-text="${this.config.tooltip}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                    </div>
                ` : nothing}
                <div class="col-md-6" id="${this.config.id}-wrapper">
                    ${this.renderField()}
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-analysis-tool-form-field", OpencgaAnalysisToolFormField);
