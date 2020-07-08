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
import PolymerUtils from "../../PolymerUtils.js";

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
            }
        };
    }

    _init() {
        this._prefix = "cvaf-" + UtilsNew.randomString(6) + "_";
        this.placeholder = "RCV000058226";
        this._config = this.getDefaultConfig();

    }

    updated(_changedProperties) {
        if (_changedProperties.has("clinvar")) {
            this.querySelector("#" + this._prefix + "ClinVarTextarea").value = this.clinvar || "";
        }
    }

    clinVarChange(e) {
        const textArea = e.target.value;
        this._clinVar = textArea?.trim()?.replace(/\r?\n/g, ",").replace(/\s/g, "");
        this.filterChange();
    }

    clinicalSignificanceChange(e) {
        this.clinicalSignificance = e.detail.value;
        this.filterChange()
    }

    filterChange(e,field) {
        console.log("field", field);
        console.log()
        let _clinvar;
        if (field === "clinvar") {
            const textArea = e.target.value;
            this._clinVar = textArea?.trim()?.replace(/\r?\n/g, ",").replace(/\s/g, "");

        } else if (field === "clinicalSignificance"){
            this.clinicalSignificance = e.detail.value;

        }
        e.stopPropagation();

        //console.log(this.clinVar, this.clinicalSignificance)

        const event = new CustomEvent("filterChange", {
            detail: {
                value: {
                    clinvar: this._clinVar || null,
                    clinicalSignificance: this.clinicalSignificance || null
                }
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            clinicalSignificanceValues: {
                BB: "Benign",
                LB: "Likely benign",
                US: "Uncertain significance",
                LP: "Likely pathogenic",
                PP: "Pathogenic"
            }
        };
    }

    render() {
        return html`
            <div class="form-group">
                <select-field-filter multiple .data="${Object.entries(this._config.clinicalSignificanceValues).map( ([code, label]) => ({id: code, name: label}))}" .value=${this.clinicalSignificance} @filterChange="${e => this.filterChange(e, "clinicalSignificance")}"></select-field-filter>
            </div>
            <div class="form-group">
                <textarea id="${this._prefix}ClinVarTextarea" class="form-control clearable ${this._prefix}FilterTextInput" rows="3" name="clinvar" placeholder="${this.placeholder}" @keyup="${e => this.filterChange(e, "clinvar")}"></textarea>
            </div>`;
    }

}

customElements.define("clinvar-accessions-filter", ClinvarAccessionsFilter);
