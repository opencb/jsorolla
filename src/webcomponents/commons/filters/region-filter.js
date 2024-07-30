/*
 * Copyright 2015-2024 OpenCB
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


import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";


export default class RegionFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            region: {
                type: String
            },
            // Note: commented as it is not used at the moment, but it could be a good idea to check region is valid.
            // cellbaseClient: {
            //     type: Object
            // },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.separator = ",";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        // Process the textarea: remove newline chars, empty chars, leading/trailing commas
        const _region = e.target.value
            .trim()
            .replace(/\r?\n/g, this.separator)
            .replace(/\s/g, "")
            .split(this.separator)
            .filter(Boolean)
            .join(this.separator);

        LitUtils.dispatchCustomEvent(this, "filterChange", _region);
    }

    render() {
        return html`
            <textarea id="${this._prefix}LocationTextarea"
                      name="location"
                      .value="${this.region || ""}"
                      rows="${this._config.rows}"
                      placeholder="${this._config.placeholder}"
                      class="form-control clearable ${this._prefix}FilterTextInput"
                      @input="${e => this.filterChange(e)}">
            </textarea>
        `;
    }

    getDefaultConfig() {
        return {
            rows: 3,
            placeholder: "1:1-100000,3:444-55555,..."
        };
    }

}

customElements.define("region-filter", RegionFilter);
