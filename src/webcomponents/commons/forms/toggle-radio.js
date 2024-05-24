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

/**
 *  Usage:
 * <toggle-radio .value="true" .onText="YES" .offText="NO"></toggle-radio>
 */
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
            value: {
                type: Boolean
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = {...this.getDefaultConfig()};
    }

    update(changedProperties) {
        if (changedProperties.has("value")) {
            this._value = this.value;
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    filterChange(val) {
        LitUtils.dispatchCustomEvent(this, "filterChange", val === "ON");
    }

    render() {
        return html`
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" ?checked="${this.value}"
                    name="inlineRadioOptions" id="${this._prefix}onToggle" value="ON"
                    @click="${() => this.filterChange("ON")}"
                    ?disabled="${this._config.disabled}">
                <label class="form-check-label" for="${this._prefix}onToggle">${this._config.onText}</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio"
                    @click="${() => this.filterChange("OFF")}" ?checked="${!this.value}"
                    name="inlineRadioOptions" id="${this._prefix}offToggle" value="OFF" ?disabled="${this._config.disabled}">
                <label class="form-check-label" for="${this._prefix}offToggle">${this._config.offText}</label>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            onText: "ON",
            offText: "OFF",
            disabled: false
        };
    }

}

customElements.define("toggle-radio", ToggleRadio);
