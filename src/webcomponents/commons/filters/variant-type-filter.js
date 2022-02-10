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

    // TODO Remove this code since it does not seem necessary.
    // connectedCallback() {
    //     super.connectedCallback();
    //     this._config = {...this.getDefaultConfig(), ...this.config};
    // }

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

    onSelectAll() {
        this.type = this._config.types?.join(",");
        LitUtils.dispatchCustomEvent(this, "filterChange", this.type);
    }

    getDefaultConfig() {
        return {
            types: VARIANT_TYPES,
            layout: "vertical"
        };
    }

    render() {
        return html`
            <style>
                variant-type-filter .inline li {
                    display: inline-block;
                    margin-right: 10px;
                }
            </style>

            <div style="margin-bottom: 10px">
                <button type="button" class="btn btn-xs btn-default" @click=${this.onSelectAll}>
                    Select All
                </button>
            </div>
            <div class="${classMap({inline: this._config.layout === "horizontal"})}">
                <checkbox-field-filter
                    .value="${this.type}"
                    .data="${this._config.types}"
                    .disabled="${this.disabled}"
                    @filterChange="${e => this.filterChange(e)}">
                </checkbox-field-filter>
            </div>
        `;
    }

}

customElements.define("variant-type-filter", VariantTypeFilter);
