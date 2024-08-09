/**
 * Copyright 2015-2023 OpenCB
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
import LitUtils from "../utils/lit-utils.js";

export default class ToggleRadio extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Array,
            },
            value: {
                type: Boolean,
            },
            disabled: {
                type: Boolean,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
    }

    onFilterChange(value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    render() {
        return (this.data || []).map(item => {
            // Allowed values for data property
            // 1. Array of objects: [{id: "", name: ""}, ...]
            // 2. Array of values: ["ON", "OFF"]
            const value = item?.id ?? item;
            return html`
                <div class="form-check form-check-inline">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="inlineRadioOptions"
                        id="${this._prefix}Toggle${value}"
                        value="${value}"
                        .checked="${this.value === value}"
                        .disabled="${this.disabled || item?.disabled}"
                        @click="${() => this.onFilterChange(value)}">
                    <label class="form-check-label" for="${this._prefix}Toggle${value}">
                        ${item?.name ?? item?.text ?? item?.id ?? item}
                    </label>
                </div>
            `;
        });
    }

}

customElements.define("toggle-radio", ToggleRadio);
