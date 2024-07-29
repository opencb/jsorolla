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
                type: String,
            },
            placeholder: {
                type: String,
            },
            disabled: {
                type: Boolean,
            },
            required: {
                type: Boolean,
            },
            rows: {
                type: Number,
            },
            classes: {
                type: String,
            },
            separator: {
                type: String,
            },
            type: {
                type: String,
            },
            min: {
                type: Number,
            },
            max: {
                type: Number,
            },
            step: {
                type: Number,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(9);
        this.rows = 1;
        this.type = "text";
        this.min = undefined;
        this.max = undefined;
        this.step = 1;
        this.separator = ",";
        this.classes = "";

    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            this.querySelector("#" + this._prefix + "-input").value = this.value ? this.value : "";
        }
    }

    applySeparator(e) {
        let value;
        if (this.separator) {
            value = e.target.value ?
                e.target.value.trim()
                    // .replace(/\s/g, "") // this prevents using values with more than 1 word (e.g. "Cardiovascular disorders")
                    .split((new RegExp(`[${this.separator}]`)))
                    .filter(Boolean)
                    .join(this.separator) :
                null;
        } else {
            value = e.target.value ?? null;
        }

        return value;
    }

    filterChange(e) {
        let value = e.target.value || "";
        if (this.separator) {
            value = value.trim()
                // .replace(/\s/g, "") // this prevents using values with more than 1 word (e.g. "Cardiovascular disorders")
                .split((new RegExp(`[${this.separator}]`)))
                .filter(Boolean)
                .join(this.separator);
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            },
            bubbles: false,
            composed: true
        });
        this.dispatchEvent(event);
    }

    blurChange(e) {
        const value = this.applySeparator(e);
        const event = new CustomEvent("blurChange", {
            detail: {
                value: value
            },
            bubbles: false,
            composed: true
        });
        this.dispatchEvent(event);
    }

    render() {
        const rows = this.rows ? this.rows : 1;
        const placeholder = (this.placeholder && this.placeholder !== "undefined") ? this.placeholder : "";

        return html`
            <div id="${this._prefix}-wrapper" class="ms-0">
                ${rows === 1 ? html`
                    <input
                        type="${this.type || "text"}"
                        id="${this._prefix}-input"
                        class="form-control ${this.classes}"
                        min="${this.min}"
                        max="${this.max}"
                        step="${this.step}"
                        ?disabled="${this.disabled}"
                        ?required="${this.required}"
                        placeholder="${placeholder}"
                        @blur="${this.blurChange}"
                        @input="${this.filterChange}">
                ` : html`
                    <textarea
                        id="${this._prefix}-input"
                        rows="${rows}"
                        class="form-control ${this.classes}"
                        ?disabled="${this.disabled}"
                        ?required="${this.required}"
                        placeholder="${placeholder}"
                        @blur="${this.blurChange}"
                        @input="${this.filterChange}">
                    </textarea>
                `}
            </div>
        `;
    }

}

customElements.define("text-field-filter", TextFieldFilter);
