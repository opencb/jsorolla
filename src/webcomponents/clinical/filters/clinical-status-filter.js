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
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/select-field-filter.js";

export default class ClinicalStatusFilter extends LitElement {

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
            status: {
                type: String,
            },
            statuses: {
                type: Array,
            },
            placeholder: {
                type: String,
            },
            multiple: {
                type: Boolean,
            },
            forceSelection: {
                type: Boolean,
            },
            classes: {
                type: String,
            },
            disabled: {
                type: Boolean,
            },
        };
    }

    _init() {
        this.multiple = true;
        this.disabled = false;
        this.forceSelection = false;
    }

    update(changedProperties) {
        if (changedProperties.has("status")) {
            this.statusObject = this.statuses?.find(status => status.id === this.status);
        }
        if (changedProperties.has("statuses")) {
            this.uniqueStatuses = [...new Set(Object.values(this.statuses).map(status => status.id))];
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        LitUtils.dispatchCustomEvent(this, "filterChange", e.detail.value, {
            query: {
                status: e.detail.value
            }
        }, null, {bubbles: false, composed: false});
    }

    render() {
        return html`
            <select-field-filter
                .data="${this.uniqueStatuses}"
                .value="${this.status}"
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
            ${!this.multiple && this.statusObject?.description ? html`
                <span class="form-text">${this.statusObject.description}</span>` : null
            }
        `;
    }

}

customElements.define("clinical-status-filter", ClinicalStatusFilter);
