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
        this._prefix = "tff-" + Utils.randomString(6) + "_";
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
                value: e.target.value || null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <form id="${this._prefix}-somatic" class="subsection-content form-group">
               
            <fieldset>
                <div class="switch-toggle alert text-white alert-light">
                    <input id="${this._prefix}-somatic-option-none"
                                   class="form-group-sm ${this._prefix}FilterRadio"
                                   type="radio" name="${this._prefix}-somatic-options" value=""
                                   @change="${this.filterChange}" checked>
                    <label for="${this._prefix}-somatic-option-none"><span class="small">None</span></label>
            
                    <input id="${this._prefix}-somatic-option-true"
                                                   class="form-group-sm ${this._prefix}FilterRadio"
                                                   type="radio" name="${this._prefix}-somatic-options" value="True"
                                                   @change="${this.filterChange}">
                    <label for="${this._prefix}-somatic-option-true"><span class="small">True</span></label>
                
                    <input id="${this._prefix}-somatic-option-false"
                                                   class="form-group-sm ${this._prefix}FilterRadio"
                                                   type="radio" name="${this._prefix}-somatic-options" value="False"
                                                   @change="${this.filterChange}">
                    <label for="${this._prefix}-somatic-option-false"><span class="small">False</span></label>
            
                    <a class="btn btn-primary ripple"></a>
                </div>
            </fieldset>
              
            </form>
        `;
    }

}

customElements.define("somatic-filter", SomaticFilter);
