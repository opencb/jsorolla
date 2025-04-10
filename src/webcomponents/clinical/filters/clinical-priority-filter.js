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
            priority: {
                type: String
            },
            priorities: {
                type: Array
            },
            placeholder: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            forceSelection: {
                type: Boolean,
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
        this.priorities = [];
        this.multiple = true;
        this.disabled = false;
        this.forceSelection = false;
    }

    update(changedProperties) {
        if (changedProperties.has("priority")) {
            this.priorityObject = this.priorities?.find(priority => priority.id === this.priority);
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value,
                query: {
                    priority: e.detail.value
                }
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.priorities}"
                .value=${this.priority}
                .forceSelection="${this.forceSelection}"
                .config="${{
                    placeholder: this.placeholder,
                    multiple: this.multiple,
                    liveSearch: false,
                    disabled: this.disabled,
                }}"
                .classes="${this.classes}"
                @filterChange="${e => this.filterChange(e)}">
            </select-field-filter>

            <!-- Only show description when one single values is expected -->
            ${!this.multiple && this.priorityObject?.description ? html`
                <span class="form-text">${this.priorityObject.description}</span>` : null
            }
        `;
    }

}

customElements.define("clinical-priority-filter", ClinicalPriorityFilter);
