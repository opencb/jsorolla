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
            value: {
                type: String
            },
            placeholder: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            required: {
                type: Boolean
            },
            rows: {
                type: Number
            }
        };
    }

    _init() {
        this._prefix = "tff-" + UtilsNew.randomString(6);

        this.rows = 1;
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            this.querySelector("#" + this._prefix + "-input").value = this.value ? this.value : "";
        }
    }

    filterChange(e) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.target.value || null
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    render() {
        let rows = this.rows ? this.rows : 1;
        let placeholder = (this.placeholder && this.placeholder !== "undefined") ? this.placeholder : "";
        return html`
            <div id="${this._prefix}-wrapper" class="form-group" style="margin-left: 0px">
                ${rows === 1 
                    ? html`
                        <input type="text" id="${this._prefix}-input" class="form-control" 
                                ?disabled=${this.disabled} ?required=${this.required} placeholder="${placeholder}" @input="${this.filterChange}">` 
                    : html`
                        <textarea id="${this._prefix}-input" rows=${rows} class="form-control" 
                                ?disabled=${this.disabled} ?required=${this.required} placeholder="${placeholder}" @input="${this.filterChange}">`
                }
            </div>
        `;
    }

}

customElements.define("text-field-filter", TextFieldFilter);
