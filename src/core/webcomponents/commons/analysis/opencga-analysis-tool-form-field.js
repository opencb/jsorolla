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
                // [fieldId]: value,
                param: fieldId,
                value: value
            },
            bubbles: true,
            composed: true
        }));
    }

    renderField() {
        let field = this.config;
        switch (field.type) {
            case "category":
                return html`<select-field-filter ?multiple="${field.multiple}" ?disabled=${this.config.disabled} ?required=${this.config.required} .data="${field.allowedValues}" .value="${field.defaultValue}" maxOptions="2" @filterChange="${e => this.onFilterChange(field.id, e.detail.value)}"></select-field-filter>`;
            case "string":
                return html`<text-field-filter placeholder="${field.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${field.defaultValue || ""}" @filterChange="${e => this.onFilterChange(field.id, e.detail.value)}"></text-field-filter>`;
            case "number":
                const [min = "", max = ""] = field.allowedValues || [];
                return html`<div id="${this._prefix}-wrapper" class="subsection-content form-group">
                                <input type="number" min=${min} max=${max} step="0.01" .disabled=${this.config.disabled} ?required=${this.config.required} value="${field.defaultValue || ""}" id="${this._prefix}-input-${field.id}" class="input form-control input-sm ${this._prefix}FilterTextInput" placeholder="${field.placeholder || ""}" @input="${e => this.onFilterChange(field.id, e.target.value)}">
                            </div>`;
            case "COHORT_FILTER":
                return html`<cohort-id-autocomplete .config="${field}" .opencgaSession="${this.opencgaSession}" .value="${field.defaultValue}" @filterChange="${e => this.onFilterChange("cohort", e.detail.value)}"></cohort-id-autocomplete>`;
            case "SAMPLE_FILTER":
                return html`<sample-id-autocomplete .config="${field}" .opencgaSession="${this.opencgaSession}" .value="${field.defaultValue}" @filterChange="${e => this.onFilterChange("sample", e.detail.value)}"></sample-id-autocomplete>`;
            case "FAMILY_FILTER":
                return html`<family-id-autocomplete .config="${field}" .opencgaSession="${this.opencgaSession}" .value="${field.defaultValue}" @filterChange="${e => this.onFilterChange("family", e.detail.value)}"></family-id-autocomplete>`;
            default:
                console.warn("field type "+field.type+" not implemented. String type fallback");
                return html`<text-field-filter placeholder="${field.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${field.defaultValue || ""}" @filterChange="${e => this.onFilterChange(field.id, e.detail.value)}"></text-field-filter>`;
        }
    }

    render() {
            // <div class="${this.config.colspan ? "col-md-" + this.config.colspan : "col-md-6"}">
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
