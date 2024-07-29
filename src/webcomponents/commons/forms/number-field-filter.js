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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "./select-field-filter.js";

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
                type: Object
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
            },
            comparators: {
                type: String
            },
            allowedValues: {
                type: String
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.state = {
            comparator: "<"
        };
        this.defaultComparators = [
            {id: "<", name: "<"},
            {id: "<=", name: "<="},
            {id: "=", name: "="},
            {id: ">", name: ">"},
            {id: ">=", name: ">="},
        ];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("value")) {
            if (this.value) {
                const [, comparator, value] = this.value.match(/(<=?|>=?|=)(-?\d*\.?\d+)/);
                this.state = {comparator, value};
            } else {
                this.state = {
                    comparator: this._config.values[0].id,
                    value: null
                };
            }
        }
        super.update(changedProperties);
    }

    filterChange(e, key, value) {
        e.stopPropagation();

        if (key === "comparator") {
            this.state.comparator = value;
        } else if (key === "value") {
            this.state.value = value;
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                comparator: this.state.comparator,
                numValue: this.state.value,
                value: this.state.value ? (this.state.comparator ?? "") + this.state.value : null
            },
            // bubbles: true,
            // composed: true
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        const wantedComparators = (this.comparators || "<,<=,=,>=,>").split(",");
        return {
            layout: [3, 4, 5], // in case the label is not needed the expected value of the first element is 0
            comparator: true,
            comparatorForceSelection: true,
            values: this.defaultComparators.filter(item => {
                return wantedComparators.includes(item.id);
            }),
        };
    }

    render() {
        return html`
            <div class="row g-2" data-cy="number-field-filter-wrapper-${this.label ?? ""}">
                ${this.label ? html`
                        <label class="col-md-${this._config.layout[0]} col-sm-2 col-form-label"
                            data-bs-toggle="tooltip" data-placement="top" title="${this.label}">
                            ${this.label}
                        </label>` : nothing
                }

                ${this._config.comparator ? html`
                    <div class="col-md-${this._config.layout[1]}">
                        <select-field-filter
                            .data="${this._config.values}"
                            .value="${this.state.comparator}"
                            .config="${{
                                liveSearch: false
                            }}"
                            @filterChange="${e => this.filterChange(e, "comparator", e.detail.value)}">
                        </select-field-filter>
                    </div>` : nothing
                }

                ${this.allowedValues?.length > 0 ? html`
                    <div class="col-md-${this._config.layout[2]}">
                        <select-field-filter
                            .data="${this.allowedValues}"
                            .value="${this.state.value ?? ""}"
                            .config="${{
                                placeholder: "Select ...",
                                liveSearch: false,
                            }}"
                            @filterChange="${e => this.filterChange(e, "value", e.detail.value)}">
                        </select-field-filter>
                    </div>` : html`
                    <div class="col-md-${this._config.layout[2]}">
                        <input  type="${this.type ?? "number"}"
                            class="form-control ${this._prefix}FilterTextInput"
                            data-field="value"
                            .min="${this.min ?? false}"
                            .max="${this.max ?? false}"
                            .step="${this.step ?? false}"
                            .value="${this.state.value ?? ""}"
                            @input="${e => this.filterChange(e, "value", e.target.value)}">
                    </div>`
                }
            </div>
        `;
    }

}

customElements.define("number-field-filter", NumberFieldFilter);
