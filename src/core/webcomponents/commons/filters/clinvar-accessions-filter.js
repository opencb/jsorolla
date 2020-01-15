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
            }
        };
    }

    _init() {
        this._prefix = "cvaf-" + Utils.randomString(6) + "_";
        this.placeholder = "RCV000058226";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("clinvar")) {
            this.querySelector("#" + this._prefix + "ClinVarTextarea").value = this.clinvar || "";
        }
    }

    filterChange(e) {
        let _clinvar;
        const inputTextArea = PolymerUtils.getElementById(this._prefix + "ClinVarTextarea");
        if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
            _clinvar = inputTextArea.value.trim();
            _clinvar = _clinvar.replace(/\r?\n/g, ",").replace(/\s/g, "");
        }
        console.log("filterChange", _clinvar);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: _clinvar || null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`<textarea id="${this._prefix}ClinVarTextarea" class="form-control clearable ${this._prefix}FilterTextInput" rows="3" name="clinvar" placeholder="${this.placeholder}" @keyup="${this.filterChange}"></textarea>`;
    }

}

customElements.define("clinvar-accessions-filter", ClinvarAccessionsFilter);
