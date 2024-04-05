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
import "../../commons/forms/select-field-filter.js";
import "../../commons/forms/checkbox-field-filter.js";

export default class ClinicalAnnotationFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinical: {
                type: String
            },
            clinicalSignificance: {
                type: String
            },
            clinicalConfirmedStatus: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.query = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("clinical")) {
            this.query.clinical = this.clinical;
        }
        if (changedProperties.has("clinicalSignificance")) {
            this.query.clinicalSignificance = this.clinicalSignificance;
        }
        if (changedProperties.has("clinicalConfirmedStatus")) {
            this.query.clinicalConfirmedStatus = this.clinicalConfirmedStatus;
        }
        super.update(changedProperties);
    }

    filterChange(e, field) {
        e.stopPropagation();

        if (field !== "clinicalConfirmedStatus") {
            this.query[field] = e.detail.value;
        } else {
            this.query[field] = e.detail.value === "Confirmed";
        }

        const event = new CustomEvent("filterChange", {
            detail: this.query
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            placeholder: "RCV000058226",
            clinicalDatabases: [
                {id: "clinvar", name: "ClinVar"},
                {id: "cosmic", name: "Cosmic"}
            ]
        };
    }

    render() {
        return html`
            <div class="mb-2">
                <label class="form-label">
                    Select Clinical Database
                </label>
                <div data-cy="clinical-db">
                    <select-field-filter
                        .data="${this._config.clinicalDatabases}"
                        .value=${this.clinical}
                        .config="${{multiple: true}}"
                        @filterChange="${e => this.filterChange(e, "clinical")}">
                    </select-field-filter>
                </div>
            </div>

            <div class="mb-2">
                <label class="form-label">
                    Select Clinical Significance
                </label>
                <div data-cy="clinical-significance">
                    <select-field-filter
                        .data=${CLINICAL_SIGNIFICANCE}
                        .value=${this.clinicalSignificance}
                        .config="${{multiple: true}}"
                        @filterChange="${e => this.filterChange(e, "clinicalSignificance")}">
                    </select-field-filter>
                </div>
            </div>

            <div class="mb-2">
                <label class="form-label">
                    Check Status
                </label>
                <div class="clinical-status">
                    <checkbox-field-filter
                        .data="${["Confirmed"]}"
                        .value=${this.clinicalConfirmedStatus === true || this.clinicalConfirmedStatus === "true" ? "Confirmed" : null}
                        @filterChange="${e => this.filterChange(e, "clinicalConfirmedStatus")}">
                    </checkbox-field-filter>
                </div>
            </div>`;
    }

}

customElements.define("clinical-annotation-filter", ClinicalAnnotationFilter);
