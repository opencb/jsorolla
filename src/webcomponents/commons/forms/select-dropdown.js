/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";

export default class SelectDropdown extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            value: {
                type: String,
            },
            values: {
                type: Array,
            },
            multiple: {
                type: Boolean,
            },
            disabled: {
                type: Boolean,
            },
            placeholder: {
                type: String,
            },
            search: {
                type: Boolean,
            },
            searchFn: {
                type: Function,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.values = [];
        this.value = "";
        this.multiple = false;
        this.disabled = false;
        this.placeholder = "Select an option...";
        this.search = false;
        this._searchQuery = "";
    }

    onSearchInput(e) {
        this._searchQuery = e.target.value.toLowerCase();
        this.requestUpdate();
    }

    onItemClick(e, item) {
        const selectedValues = this.value ? this.value.split(",") : [];
        const index = selectedValues.indexOf(item.id);

        if (this.multiple) {
            if (index > -1) {
                selectedValues.splice(index, 1);
            } else {
                selectedValues.push(item.id);
            }
        } else {
            // Single selection
            if (index !== -1) {
                // If already selected, do nothing or deselect? Usually single select deselects if it's the same,
                // but standard dropdowns just keep it selected. Let's keep it simple:
                // if it's already selected, we don't change anything unless it's a new selection.
            } else {
                selectedValues[0] = item.id;
            }
        }

        this.value = selectedValues.join(",");
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    renderItem(item) {
        const selectedValues = this.value ? this.value.split(",") : [];
        const isSelected = selectedValues.includes(item.id);
        return html`
            <div @click="${e => this.onItemClick(e, item)}">
                <a class="dropdown-item cursor-pointer d-flex justify-content-between align-items-center ${isSelected ? "active" : ""}">
                    <div>
                        <div class="fw-bold">${item.name || item.id}</div>
                        ${item.description ? html`
                            <small class="text-muted">${item.description}</small>
                        ` : nothing}
                    </div>
                    ${isSelected ? html`
                        <i class="fas fa-check"></i>
                    ` : nothing}
                </a>
            </div>
        `;
    }

    render() {
        const selectedValues = this.value ? this.value.split(",") : [];
        const selectedItems = this.values.filter(v => selectedValues.includes(v.id));

        // Button text: if nothing selected, show placeholder. If one item, show name. If multiple, show count.
        let buttonText = this.placeholder;
        if (selectedItems.length === 1) {
            buttonText = selectedItems[0].name || selectedItems[0].id;
        } else if (selectedItems.length > 1) {
            buttonText = `${selectedItems.length} items selected`;
        }

        const filteredValues = this.values.filter(item => {
            if (!this.search || !this._searchQuery) {
                return true;
            }
            if (this.searchFn) {
                return this.searchFn(item, this._searchQuery);
            }
            return (item.name || "").toLowerCase().includes(this._searchQuery) ||
                (item.id || "").toLowerCase().includes(this._searchQuery);
        });

        return html`
            <div class="dropdown">
                <button
                    class="btn btn-light dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                    type="button"
                    id="${this._prefix}DropdownButton"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                    ?disabled="${this.disabled}">
                    <span>${buttonText}</span>
                </button>
                <div class="dropdown-menu w-100" aria-labelledby="${this._prefix}DropdownButton">
                    ${this.search ? html`
                        <div class="p-2">
                            <input
                                type="text"
                                class="form-control"
                                placeholder="Search..."
                                .value="${this._searchQuery}"
                                @input="${this.onSearchInput}">
                        </div>
                    ` : nothing}
                    <div class="dropdown-list">
                        ${filteredValues.length > 0 ? html`
                            ${filteredValues.map(item => this.renderItem(item))}
                        ` : html`
                            <div class="dropdown-item disabled text-center">No results found</div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("select-dropdown", SelectDropdown);
