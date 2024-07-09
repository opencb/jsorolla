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
import LitUtils from "../utils/lit-utils.js";

export default class ToggleSwitch extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            value: {
                type: Boolean
            },
            onText: {
                type: String
            },
            offText: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            classes: {
                type: String,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.classes = "";
    }

    onFilterChange(val) {
        LitUtils.dispatchCustomEvent(this, "filterChange", val);
    }

    render() {
        return html`
            <fieldset .disabled="${this.disabled}">
                <div class="btn-group" role="group">
                    <input
                        class="btn-check"
                        type="radio"
                        .checked="${this.value}"
                        name="${this._prefix}BtnRadio"
                        id="${this._prefix}onBtnRadio"
                        @click=${() => this.onFilterChange(true)}>
                    <label class="btn btn-outline-primary ${this.classes}" for="${this._prefix}onBtnRadio">
                        ${this.onText || "ON"}
                    </label>
                    <input
                        type="radio"
                        class="btn-check"
                        .checked="${!this.value}"
                        name="${this._prefix}BtnRadio"
                        id="${this._prefix}offBtnRadio"
                        @click=${() => this.onFilterChange(false)}>
                    <label class="btn btn-outline-primary ${this.classes}" for="${this._prefix}offBtnRadio">
                        ${this.offText || "OFF"}
                    </label>
                </div>
            </fieldset>
        `;
    }

}

customElements.define("toggle-switch", ToggleSwitch);
