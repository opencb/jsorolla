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


export default class NumberFieldFilter extends LitElement {

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
            type: {
                type: String
            },
            config: {
                type: String
            },
            value: {
                type: String
            },
            label: {
                type: String
            },
            placeholder: {
                type: String
            },
            min: {
                type: String
            },
            max: {
                type: String
            },
            step: {
                type: String
            }
        }
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.state = {
            comparator: "<"
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            if (this.value) {
                const [, comparator, value] = this.value.match(/(<=?|>=?|=)(-?\d*\.?\d+)/);
                this.state = {comparator, value};
            } else {
                this.state = {
                    comparator: "<",
                    value: null
                };
            }
            this.requestUpdate();
        }
    }

    filterChange(e) {
        e.stopPropagation();
        let field = e.target.dataset.field;
        this.state[field] = e.target.value;
        const event = new CustomEvent("filterChange", {
            detail: {
                comparator: this.state.comparator,
                numValue: this.state.value,
                value: this.state.value ? (this.state.comparator ?? "") + this.state.value : null
            },
            //bubbles: true,
            //composed: true
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            layout: [4, 4, 4], // in case the label is not needed the expected value of the first element is 0
            comparator: true,
            values: ["=", "<", "<=", ">", ">="]
        };
    }

    render() {
        return html`
            <style>
                .number-field-filter {
                    margin: 5px 0px;
                }              
                .number-field-filter > div:not(:first-child) {
                    padding: 0px 10px
                }
            </style>
            
            <div class="number-field-filter form-group">
                ${this.label ? html`<div class="col-md-${this._config.layout[0]} control-label" data-toggle="tooltip" data-placement="top" title="${this.label}">
                        ${this.label}
                    </div>` : null}
                ${this._config.comparator ? html`<div class="col-md-${this._config.layout[1]}">
                    <select id="${this._prefix}Comparator" name="${this._prefix}Comparator"
                            class="form-control input-sm ${this._prefix}FilterSelect"
                            @change="${this.filterChange}" data-field="comparator">
                        <option .selected="${this.state.comparator === "="}" value="=">=</option>
                        <option .selected="${this.state.comparator === "<"}" value="<">&lt;</option>
                        <option .selected="${this.state.comparator === "<="}" value="<=">&le;</option>
                        <option .selected="${this.state.comparator === ">"}" value=">">&gt;</option>
                        <option .selected="${this.state.comparator === ">="}" value=">=">&ge;</option>
                    </select>
                </div>` : null}
                <div class="col-md-${this._config.layout[2]}">
                    <input  type="${this.type ?? "number"}"
                            .min="${this.min ?? false}"
                            .max="${this.max ?? false}"
                            .step="${this.step ?? false}"
                            data-field="value"
                            value="${this.state.value ?? ""}"
                            class="form-control input-sm ${this._prefix}FilterTextInput"
                            @input="${this.filterChange}">
                </div>
            </div>
        `;
    }

}

customElements.define("number-field-filter", NumberFieldFilter);
