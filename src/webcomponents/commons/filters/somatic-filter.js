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


export default class SomaticFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            placeholder: {
                type: String
            },
            value: {
                type: String
            }
        };
    }

    createRenderRoot() {
        return this;
    }

    _init() {
        this._prefix = "tff-" + UtilsNew.randomString(6) + "_";
    }

    /* set value(val) {
        let oldVal = this._value;
        this._value = val;
        this.requestUpdate('value', oldVal);
    }*/

    updated(_changedProperties) {
        if (_changedProperties.has("value")) {
            if (this.value) {
                this.querySelector(`input[value='${this.value}']`).checked = true;
            } else {
                $("input", this).prop("checked", false);
            }
        }
    }

    filterChange(e) {
        console.log("filterChange", e.target.value);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.target.value === "none" ? null : e.target.value
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <!-- TODO: Is it form necessary -->
            <form id="${this._prefix}-somatic" class="somatic-filter">
                <!-- TODO: Is it fieldset necessary -->
                <fieldset>
                    <div class="form-check form-check-inline">
                        <input class="${this._prefix}FilterRadio form-check-input" id="${this._prefix}-somatic-option-none"
                            type="radio" name="${this._prefix}-somatic-options" value="none"
                            @change="${this.filterChange}" checked>
                        <label class="form-check-label" for="${this._prefix}-somatic-option-none">
                            <span>None</span>
                        </label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="${this._prefix}FilterRadio form-check-input" id="${this._prefix}-somatic-option-true"
                            type="radio" name="${this._prefix}-somatic-options" value="True"
                            @change="${this.filterChange}">
                        <label class="form-check-label" for="${this._prefix}-somatic-option-true">
                            <span>True</span>
                        </label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="${this._prefix}FilterRadio form-check-input" id="${this._prefix}-somatic-option-false"
                            type="radio" name="${this._prefix}-somatic-options" value="False"
                            @change="${this.filterChange}">
                        <label class="form-check-label" for="${this._prefix}-somatic-option-false">
                            <span>False</span>
                        </label>
                    </div>
                </fieldset>
            </form>
        `;
    }

}

customElements.define("somatic-filter", SomaticFilter);
