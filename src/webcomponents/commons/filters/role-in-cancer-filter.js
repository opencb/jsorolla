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
import LitUtils from "../utils/lit-utils";

export default class RoleInCancerFilter extends LitElement {

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
            roleInCancer: {
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
        LitUtils.dispatchCustomEvent(this, "filterChange", e.detail.value);
    }

    render() {
        return html`
            <select-field-filter
                .data="${this._config.rolesInCancer}"
                .value=${this.roleInCancer}
                .config="${{
                    multiple: this._config.multiple,
                    disabled: this.disabled,
                    liveSearch: false
                }}"
                @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

    getDefaultConfig() {
        return {
            multiple: true,
            rolesInCancer: ROLE_IN_CANCER
        };
    }

}

customElements.define("role-in-cancer-filter", RoleInCancerFilter);
