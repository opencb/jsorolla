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
import "../../commons/forms/select-field-filter.js";

export default class ClinicalAnalystFilter extends LitElement {

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
            analyst: {
                type: String
            },
            analysts: {
                type: Array
            },
            placeholder: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            classes: {
                type: String
            },
            disabled: {
                type: Boolean
            },
        };
    }

    _init() {
        this.analysts = [];
        this.multiple = true;
        this.disabled = false;
    }

    filterChange(e) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value,
                query: {
                    analysts: e.detail.value
                }
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.analysts}"
                .value="${this.analyst}"
                .config="${{
                    multiple: this.multiple,
                    disabled: this.disabled,
                    placeholder: this.placeholder
                }}"
                .classes="${this.classes}"
                @filterChange="${e => this.filterChange(e)}">
            </select-field-filter>
        `;
    }

}

customElements.define("clinical-analyst-filter", ClinicalAnalystFilter);
