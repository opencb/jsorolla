/**
 * Copyright 2015-present OpenCB
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
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import "../forms/select-field-filter.js";

export default class ACMGFilter extends LitElement {

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
            acmg: {
                type: Array,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    filterChange(e) {
        const value = (e.detail.value || "").split(",").filter(v => !!v);
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    render() {
        return html`
            <select-field-filter
                ?multiple="${this._config.multiple}"
                ?liveSearch=${this._config.liveSearch}
                .data="${this._config.data}"
                .value=${this.acmg || []}
                @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

    getDefaultConfig() {
        return {
            multiple: true,
            liveSearch: false,
            data: ACMG,
        };
    }

}

customElements.define("acmg-filter", ACMGFilter);
