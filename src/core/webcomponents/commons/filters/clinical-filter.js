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
import "../../commons/filters/select-field-filter.js";
import "../../commons/filters/checkbox-field-filter.js";

export default class ClinicalFilter extends LitElement {

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
            clinical: {
                type: String
            },
            clinicalSignificance: {
                type: String
            },
            clinicalConfirmedStatus: {
                type: Boolean
            },
            clinicalAccessions: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

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

        this.query[field] = e.detail.value;
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
            <div style="margin: 10px 0px">
                <span>Select Clinical database</span>
                <div style="padding: 2px 0px">
                    <select-field-filter multiple
                                         .data="${this._config.clinicalDatabases}"
                                         .value=${this.clinical} 
                                         @filterChange="${e => this.filterChange(e, "clinical")}">
                    </select-field-filter>
                </div>
            </div>
            
            <div style="margin: 15px 0px">
                <span>Select Clinical Significance</span>
                <div style="padding: 2px 0px">
                    <select-field-filter multiple
                                         .data=${CLINICAL_SIGNIFICANCE}
                                         .value=${this.clinicalSignificance}
                                         @filterChange="${e => this.filterChange(e, "clinicalSignificance")}">
                    </select-field-filter>
                </div>
            </div>

            <div style="margin: 15px 0px">
                <span>Check Status</span>
                <div style="padding: 2px 0px">
                    <checkbox-field-filter .data="${["Confirmed"]}"
                                           .value=${this.clinicalConfirmedStatus === true || this.clinicalConfirmedStatus === "true" ? "Confirmed" : null}
                                           @filterChange="${e => this.filterChange(e, "clinicalConfirmedStatus")}">
                    </checkbox-field-filter>
                </div>
            </div>
            
            <div style="margin: 15px 0px">
                <span>Search ClinVar or Cosmic Accessions</span>
                <div style="padding: 2px 0px">
                    <textarea id="${this._prefix}ClinVarTextarea"
                              class="form-control clearable ${this._prefix}FilterTextInput"
                              placeholder="${this._config.placeholder}"
                              rows="2"
                              name="clinvar"
                              @keyup="${e => this.filterChange(e, "clinvar")}"></textarea>
                </div>
            </div>`;
    }

}

customElements.define("clinical-filter", ClinicalFilter);
