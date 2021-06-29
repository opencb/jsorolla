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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";

/**
 * Select2 version
 */

export default class SelectTokenFilter2 extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
            placeholder: {
                type: String
            },
            resource: {
                type: String
            },
            value: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "tk-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        $("#" + this._prefix).select2({
            multiple: true
            });

    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        if (_changedProperties.has("value")) {

        }

    }

    filterChange(e) {

    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    render() {
        return html`
            
        <div class="">
            <select class="${this._prefix}">
                <option value="AB">AB</option>
                <option value="BC">BC</option>
            </select>
        </div>
        `;
    }

}

customElements.define("select-token-filter2", SelectTokenFilter2);
