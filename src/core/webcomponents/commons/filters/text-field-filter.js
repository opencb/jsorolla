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

export default class TextFieldFilter extends LitElement {

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
            value: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "tff-" + Utils.randomString(6) + "_";
    }

    /*set value(val) {
        let oldVal = this._value;
        this._value = val;
        this.requestUpdate('value', oldVal);
    }*/

    updated(_changedProperties) {
        if (_changedProperties.has("value")) {
            if (this.value) {
                this.querySelector("#" + this._prefix + "-input").value = this.value;
            } else {
                this.querySelector("#" + this._prefix + "-input").value = "";
            }
        }
    }

    filterChange(e) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.target.value || null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div id="${this._prefix}-wrapper" class="subsection-content form-group">
                <input type="text" id="${this._prefix}-input" class="form-control input-sm ${this._prefix}FilterTextInput" placeholder="${this.placeholder}" @input="${this.filterChange}">
            </div>
        `;
    }

}

customElements.define("text-field-filter", TextFieldFilter);
