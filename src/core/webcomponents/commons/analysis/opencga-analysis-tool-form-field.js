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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../filters/select-field-filter.js";
import "../filters/text-field-filter.js";
import "../filters/cohort-id-autocomplete.js";
import "../filters/sample-id-autocomplete.js";
import "../filters/family-id-autocomplete.js";


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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oatff-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
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

    renderField() {
        let fieldConfig = this.config;
        switch (fieldConfig.type) {
            case "category":
                return html`<select-field-filter ?multiple="${fieldConfig.multiple}" ?disabled=${this.config.disabled} ?required=${this.config.required} .data="${fieldConfig.allowedValues}" .value="${fieldConfig.defaultValue}" maxOptions="2" @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}"></select-field-filter>`;
            case "string":
                return html`<text-field-filter placeholder="${fieldConfig.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${fieldConfig.defaultValue || ""}" @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}"></text-field-filter>`;
            case "number":
                const [min = "", max = ""] = fieldConfig.allowedValues || [];
                return html`<div id="${this._prefix}-wrapper" class="subsection-content form-group">
                                <input type="number" min=${min} max=${max} step="0.01" .disabled=${this.config.disabled} ?required=${this.config.required} value="${fieldConfig.defaultValue || ""}" id="${this._prefix}-input-${fieldConfig.id}" class="form-control input-sm ${this._prefix}FilterTextInput" placeholder="${fieldConfig.placeholder || ""}" @input="${e => this.onFilterChange(fieldConfig.id, e.target.value)}">
                            </div>`;
            case "boolean":
                return html`<div class="form-horizontal">
                                <div class="from-group form-inline">
                                    <input class="magic-radio" type="radio" name="${fieldConfig.id}" id="${fieldConfig.id}yes" ?checked=${fieldConfig.value === "yes"} value="yes" @change="${e => this.onFilterChange(fieldConfig.id, "yes")}"><label class="magic-horizontal-label" for="${fieldConfig.id}yes"> Yes </label>
                                    <input class="magic-radio" type="radio" name="${fieldConfig.id}" id="${fieldConfig.id}no" ?checked=${fieldConfig.value === "no"} value="no" @change="${e => this.onFilterChange(fieldConfig.id, "yes")}"> <label class="magic-horizontal-label" for="${fieldConfig.id}no"> No </label>
                                </div>
                            </div>`;
            case "SAMPLE_FILTER":
                return html`<sample-id-autocomplete .config="${fieldConfig}" .opencgaSession="${this.opencgaSession}" .value="${fieldConfig.defaultValue}" @filterChange="${e => this.onFilterChange("sample", e.detail.value)}"></sample-id-autocomplete>`;
            case "INDIVIDUAL_FILTER":
                return html`<individual-id-autocomplete .config="${fieldConfig}" .opencgaSession="${this.opencgaSession}" .value="${fieldConfig.defaultValue}" @filterChange="${e => this.onFilterChange("individual", e.detail.value)}"></individual-id-autocomplete>`;
            case "COHORT_FILTER":
                return html`<cohort-id-autocomplete .config="${fieldConfig}" .opencgaSession="${this.opencgaSession}" .value="${fieldConfig.defaultValue}" @filterChange="${e => this.onFilterChange("cohort", e.detail.value)}"></cohort-id-autocomplete>`;
            case "FAMILY_FILTER":
                return html`<family-id-autocomplete .config="${fieldConfig}" .opencgaSession="${this.opencgaSession}" .value="${fieldConfig.defaultValue}" @filterChange="${e => this.onFilterChange("family", e.detail.value)}"></family-id-autocomplete>`;
            case "CLINICAL_ANALYSIS_FILTER":
                return html`<clinical-analysis-id-autocomplete .config="${fieldConfig}" .opencgaSession="${this.opencgaSession}" .value="${fieldConfig.defaultValue}" @filterChange="${e => this.onFilterChange("sample", e.detail.value)}"></clinical-analysis-id-autocomplete>`;
            default:
                console.warn("field type "+fieldConfig.type+" not implemented. String type fallback");
                return html`<text-field-filter placeholder="${fieldConfig.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${fieldConfig.defaultValue || ""}" @filterChange="${e => this.onFilterChange(fieldConfig.id, e.detail.value)}"></text-field-filter>`;
        }
    }

    render() {
        let width = "480px";
        let padding = "2px 20px";
        if (this.config.type === "category" || this.config.type === "string" || this.config.type === "number") {
            width = "320px";
            padding = "4px 20px";
        }

        return html`
            <div style="padding: ${padding}; width: ${width}">
                <label>${this.config.title ? this.config.title : this.config.id}</label>
                <div id="${this.config.id}-wrapper">
                    ${this.renderField()}
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-analysis-tool-form-field", OpencgaAnalysisToolFormField);
