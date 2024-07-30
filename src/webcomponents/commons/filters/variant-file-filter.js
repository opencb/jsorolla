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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-field-filter.js";

export default class VariantFileFilter extends LitElement {

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
            files: {
                type: Array
            },
            value: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    filterChange(e) {
        // select-field-filter already emits a bubbled filterChange event.
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {};
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.files}"
                .value="${this.value}"
                .config="${{
                    multiple: true,
                    liveSearch: false,
                }}"
                @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

}

customElements.define("variant-file-filter", VariantFileFilter);
