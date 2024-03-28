/*
 * Copyright 2015-2016 OpenCB
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
import {classMap} from "lit/directives/class-map.js";
import LitUtils from "../utils/lit-utils.js";
import "../forms/checkbox-field-filter.js";

export default class VariantTypeFilter extends LitElement {

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
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        this.type = e.detail.value;
        LitUtils.dispatchCustomEvent(this, "filterChange", this.type);
    }

    onToggleAll() {
        this.setAll = !this.setAll;
        this.type = this.setAll ?
            this._config.types?.map(t => t?.id ?? t).join(",") :
            null;
        LitUtils.dispatchCustomEvent(this, "filterChange", this.type);
    }

    getDefaultConfig() {
        return {
            types: VARIANT_TYPES, // it can be either an array of strings or array of objects {id, name}
            layout: "vertical"
        };
    }

    render() {
        return html`
            <div class="mb-3">
                <button class="btn btn-xs btn-light" type="button" @click=${this.onToggleAll}>
                    ${this.setAll ? "Deselect" : "Select"} all
                </button>
            </div>
            <!-- Rodiel 26-06-23 NOTE:  -->
            <!-- it seems that the bs3 version never worked class="horizontal" -->
            <!-- Will it be necessary to create one for bs5?  -->
            <!-- <div class="${classMap({inline: this._config.layout === "horizontal"})}"> -->
                <checkbox-field-filter
                    .value="${this.type}"
                    .data="${this._config.types}"
                    .disabled="${this.disabled}"
                    @filterChange="${e => this.filterChange(e)}">
                </checkbox-field-filter>
            <!-- </div> -->
        `;
    }

}

customElements.define("variant-type-filter", VariantTypeFilter);
