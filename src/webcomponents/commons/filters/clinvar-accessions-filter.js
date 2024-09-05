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
import UtilsNew from "../../../core/utils-new.js";

export default class ClinvarAccessionsFilter extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            placeholder: {
                type: String
            },
            clinvar: {
                type: Object
            },
            clinicalSignificance: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8) + "_";
        this.placeholder = "RCV000058226";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinvar")) {
            this.querySelector("#" + this._prefix + "ClinVarTextarea").value = this.clinvar || "";
        }
    }

    // clinVarChange(e) {
    //     const textArea = e.target.value;
    //     this._clinVar = textArea?.trim()?.replace(/\r?\n/g, ",").replace(/\s/g, "");
    //     this.filterChange();
    // }
    //
    // clinicalSignificanceChange(e) {
    //     this.clinicalSignificance = e.detail.value;
    //     this.filterChange();
    // }

    filterChange(e, field) {
        if (field === "clinvar") {
            const textArea = e.target.value;
            this._clinVar = textArea?.trim()?.replace(/\r?\n/g, ",").replace(/\s/g, "");
        } else if (field === "clinicalSignificance") {
            this.clinicalSignificance = e.detail.value;
        }

        e.stopPropagation();
        const value = {};
        if (this._config.clinvar) {
            value.clinvar = this._clinVar || null;
        }
        value.clinicalSignificance = this.clinicalSignificance || null;
        const event = new CustomEvent("filterChange", {
            detail: {value}
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            clinvar: true,
            clinicalSignificanceValues: {
                benign: "Benign",
                likely_benign: "Likely benign",
                uncertain_significance: "Uncertain significance",
                likely_pathogenic: "Likely pathogenic",
                pathogenic: "Pathogenic"
            }
        };
    }

    render() {
        return html`
            <div class="form-group">
                <select-field-filter
                    .data="${Object.entries(this._config.clinicalSignificanceValues).map(([code, label]) => ({id: code, name: label}))}"
                    .value="${this.clinicalSignificance}"
                    .config="${{multiple: true}}"
                    @filterChange="${e => this.filterChange(e, "clinicalSignificance")}">
                </select-field-filter>
            </div>
            ${this._config.clinvar ? html`
                <div class="form-group">
                    <textarea
                        id="${this._prefix}ClinVarTextarea"
                        class="form-control clearable ${this._prefix}FilterTextInput"
                        rows="3"
                        name="clinvar"
                        placeholder="${this.placeholder}"
                        @keyup="${e => this.filterChange(e, "clinvar")}">
                    </textarea>
                </div>` : null
        }`;
    }

}

customElements.define("clinvar-accessions-filter", ClinvarAccessionsFilter);
