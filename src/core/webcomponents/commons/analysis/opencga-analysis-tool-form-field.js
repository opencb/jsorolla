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
import Utils from "./../../../utils.js";
import "../filters/select-field-filter.js";
import "../filters/text-field-filter.js";
import "../filters/cohort-stats-filter.js";

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
        this._prefix = "oatff-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
    }

    fieldChange(fieldId, value) {
        //console.log("fieldId, value", fieldId, value)
        this.dispatchEvent(new CustomEvent("fieldChange", {
            detail: {
                [fieldId]: value
            },
            bubbles: true,
            composed: true
        }));
    }

    renderField(field) {
        // console.log(field)
        switch (field.type) {
            case "category":
                return html`<select-field-filter id="${field.id}" ?multiple="${field.multiple}" ?disabled=${this.config.disabled} ?required=${this.config.required} .data="${field.allowedValues}" .value="${field.defaultValue}" maxOptions="2" @filterChange="${e => this.fieldChange(field.id, e.detail.value)}"></select-field-filter>`;
            case "string":
                return html`<text-field-filter placeholder="${field.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${field.defaultValue || ""}" @filterChange="${e => this.fieldChange(field.id, e.detail.value)}"></text-field-filter>`;
            case "number":
                const [min = "", max = ""] = field.allowedValues || [];
                return html`<div id="${this._prefix}-wrapper" class="subsection-content form-group">
                                <input type="number" min=${min} max=${max} step="0.01" .disabled=${this.config.disabled} ?required=${this.config.required} value="${field.defaultValue || ""}" id="${this._prefix}-input-${field.id}" class="input form-control input-sm ${this._prefix}FilterTextInput" placeholder="${field.placeholder || ""}" @input="${e => this.fieldChange(field.id, e.target.value)}">
                            </div>`;
            case "COHORT_FILTER":
                return html`<cohort-filter .opencgaSession="${this.opencgaSession}" .cohorts="${{"reference_grch37":{"1kG_phase3":[{"id":"ALL","name":"All"},{"id":"MXL","name":"Mexican"}],"EXAC":[{"id":"ALL","name":"All"}]},"GRCH37":{"platinum":[{"id":"ALL","name":"ALL"}]},"exomes_grch37":{"corpasome":[{"id":"ALL","name":"ALL"}]}}}" ._cohorts="${ {"corpasome":[{"id":"ALL","name":"ALL"}]} }" .cohortStatsAlt="${[]}" @filterChange="${e => this.fieldChange("cohort", e.detail.value)}"> </cohort-filter>`;
            case "SAMPLE-FILTER":
                return html`<sample-filter ?enabled="${true}" .opencgaSession="${this.opencgaSession}" .clinicalAnalysis="${this.clinicalAnalysis}" .query="${this.query}" @sampleFilterChange="${e => this.fieldChange(e.detail.value)}"></sample-filter>`
            default:
                console.warn("field type "+field.type+" not implemented. String type fallback");
                return html`<text-field-filter placeholder="${field.placeholder || ""}" ?disabled=${this.config.disabled} ?required=${this.config.required} .value="${field.defaultValue || ""}" @filterChange="${e => this.fieldChange(field.id, e.detail.value)}"></text-field-filter>`;
        }
    }
    render() {
        return html`
            <div class="${this.config.colspan ? "col-md-" + this.config.colspan : "col-md-12"}">
                ${this.config.title || this.config.id}
                <div id="${this.config.id}-wrapper">
                    ${this.renderField(this.config)}
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-analysis-tool-form-field", OpencgaAnalysisToolFormField);
