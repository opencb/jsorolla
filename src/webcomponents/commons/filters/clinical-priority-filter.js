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
import UtilsNew from "../../../core/utilsNew.js";
import "../forms/select-field-filter.js";

export default class ClinicalPriorityFilter extends LitElement {

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
            priorities: {
                type: Array
            },
            priority: {
                type: String
            },
            placeholder: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    // update(changedProperties) {
    //     if (changedProperties.has("priority")) {
    //     }
    //     super.update(changedProperties);
    // }

    filterChange(e) {
        e.stopPropagation();
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            priorities: ["URGENT", "HIGH", "MEDIUM", "LOW"],
            multiple: true
        };
    }

    render() {
        return html`
            <select-field-filter
                .placeholder="${this.placeholder}"
                ?multiple="${this._config.multiple}"
                .data="${UtilsNew.isEmptyArray(this.priorities) ? this._config.priorities : this.priorities}"
                .value=${this.priority}
                multiple
                @filterChange="${e => this.filterChange(e)}">
            </select-field-filter>
        `;
    }

}

customElements.define("clinical-priority-filter", ClinicalPriorityFilter);
