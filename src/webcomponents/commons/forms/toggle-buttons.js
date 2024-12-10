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

export default class ToggleButtons extends LitElement {

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
                type: Array
            },
            value: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            classes: {
                type: String
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.classes = "";
    }

    filterChange(BtnName) {
        LitUtils.dispatchCustomEvent(this, "filterChange", BtnName);
    }

    renderButtonItem(item) {
        const value = item?.id || item;
        return html`
            <input
                type="radio"
                name="${this._prefix}BtnRadio"
                id="${this._prefix}BtnRadio${value}"
                class="btn-check ${this.classes}"
                .checked="${value === this.value}"
                .disabled="${this.disabled || item?.disabled}"
                @click="${() => this.filterChange(value)}">
            <label class="btn btn-outline-primary" for="${this._prefix}BtnRadio${value}">
                ${item?.name ?? item?.text ?? item?.id ?? item}
            </label>
        `;
    }

    render() {
        return html`
            <div class="btn-group" role="group">
                ${(this.data || []).map(item => this.renderButtonItem(item))}
            </div>
        `;
    }

}

customElements.define("toggle-buttons", ToggleButtons);
