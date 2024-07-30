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
import "../../commons/forms/select-field-filter.js";

export default class ClinicalFlagFilter extends LitElement {

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
            flag: {
                type: String
            },
            flags: {
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
        this.flags = [];
        this.multiple = true;
        this.disabled = false;
    }

    update(changedProperties) {
        if (changedProperties.has("flag")) {
            this.flagObject = this.flags?.find(flag => flag.id === this.flag);
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value,
                query: {
                    flags: e.detail.value
                }
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.flags}"
                .value="${this.flag}"
                .config="${{
                    placeholder: this.placeholder,
                    multiple: this.multiple,
                    disabled: this.disabled,
                }}"
                .classes="${this.classes}"
                @filterChange="${e => this.filterChange(e)}">
            </select-field-filter>

            <!-- Only show description when one single values is expected -->
            ${!this.multiple && this.flagObject?.description ? html`
                <span class="d-block text-secondary" style="padding: 0px 5px">${this.flagObject.description}</span>` : null
            }
        `;
    }

}

customElements.define("clinical-flag-filter", ClinicalFlagFilter);
