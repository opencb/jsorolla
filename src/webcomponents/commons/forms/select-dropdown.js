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
            forceSelection: {
                type: Boolean,
            },
            selectAll: {
                type: Boolean,
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
        this.forceSelection = false;
        this.selectAll = false;
    }

    onClear(e) {
        e.stopPropagation();
        this.value = "";
        this.requestUpdate();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    onSelectAllClick(e) {
        const allItems = this.getAllItems();
        if (e.target.checked) {
            // Select all
            this.value = allItems.map(item => item.id).join(",");
        } else {
            // Deselect all
            this.value = this.forceSelection && allItems.length > 0 ? allItems[0].id : "";
        }

        this.requestUpdate();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
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
                if (this.forceSelection && selectedValues.length === 1) {
                    return;
                }
                selectedValues.splice(index, 1);
            } else {
                selectedValues.push(item.id);
            }
        } else {
            // Single selection
            if (index !== -1) {
                if (this.forceSelection) {
                    return;
                }
                selectedValues.splice(index, 1);
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

    renderSeparator() {
        return html`
            <hr class="dropdown-divider">
        `;
    }

    renderGroup(group) {
        return html`
            <div>
                <h6 class="dropdown-header fw-bold">
                    ${group.name || group.id}
                </h6>
                ${group.values?.map(item => {
                    if (item.separator) {
                        return this.renderSeparator();
                    }
                    return this.renderItem(item);
                })}
            </div>
        `;
    }

    getFilteredValues() {
        return this.values.map(item => {
            if (item.separator) {
                return this._searchQuery ? null : item;
            }
            if (item.values && Array.isArray(item.values)) {
                const subFilteredValues = item.values.filter(subItem => {
                    if (subItem.separator) {
                        return !this._searchQuery;
                    }
                    if (!this.search || !this._searchQuery) {
                        return true;
                    }
                    if (this.searchFn) {
                        return this.searchFn(subItem, this._searchQuery);
                    }
                    return (subItem.name || "").toLowerCase().includes(this._searchQuery) ||
                        (subItem.id || "").toLowerCase().includes(this._searchQuery);
                });
                if (subFilteredValues.length > 0) {
                    return {...item, values: subFilteredValues};
                }
            } else {
                if (!this.search || !this._searchQuery) {
                    return item;
                }
                const match = this.searchFn ? this.searchFn(item, this._searchQuery) :
                    (item.name || "").toLowerCase().includes(this._searchQuery) ||
                    (item.id || "").toLowerCase().includes(this._searchQuery);
                if (match) {
                    return item;
                }
            }
            return null;
        }).filter(item => item !== null);
    }

    getAllItems() {
        return (this.values || []).reduce((acc, item) => {
            if (item.values && Array.isArray(item.values)) {
                return [...acc, ...item.values.filter(v => !v.separator)];
            }
            if (item.separator) {
                return acc;
            }
            return [...acc, item];
        }, []);
    }

    render() {
        const selectedValues = this.value ? this.value.split(",") : [];
        const allItems = this.getAllItems();
        const selectedItems = allItems.filter(v => selectedValues.includes(v.id));

        // Button text: if nothing selected, show placeholder. If one item, show name. If multiple, show count.
        let buttonText = this.placeholder;
        if (selectedItems.length === 1) {
            buttonText = selectedItems[0].name || selectedItems[0].id;
        } else if (selectedItems.length > 1) {
            buttonText = `${selectedItems.length} items selected`;
        }

        const filteredValues = this.getFilteredValues();

        return html`
            <div class="${this.selectAll ? "input-group" : ""}">
                <div class="dropdown flex-grow-1">
                    <div
                        class="btn btn-light dropdown-toggle w-100 d-flex align-items-center ${this.selectAll ? "rounded-end-0" : ""}"
                        id="${this._prefix}DropdownButton"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        aria-expanded="false"
                        ?disabled="${this.disabled}">
                        <span class="flex-grow-1 text-start text-truncate">${buttonText}</span>
                        ${!this.forceSelection && selectedValues.length > 0 ? html`
                            <i class="fas fa-times me-2 cursor-pointer opacity-50-hover" @click="${e => this.onClear(e)}"></i>
                        ` : nothing}
                    </div>
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
                                ${filteredValues.map(item => {
                                    if (item.separator) {
                                        return this.renderSeparator();
                                    }
                                    if (item.values && Array.isArray(item.values)) {
                                        return this.renderGroup(item);
                                    }
                                    return this.renderItem(item);
                                })}
                            ` : html`
                                <div class="dropdown-item disabled text-center">No results found</div>
                            `}
                        </div>
                    </div>
                </div>
                ${this.selectAll ? html`
                    <div class="input-group-text">
                        <input
                            type="checkbox"
                            class="form-check-input mt-0"
                            id="${this._prefix}SelectAllCheckbox"
                            .checked="${allItems.length > 0 && selectedItems.length === allItems.length}"
                            .indeterminate="${selectedItems.length > 0 && selectedItems.length < allItems.length}"
                            @change="${e => this.onSelectAllClick(e)}">
                        <label class="form-check-label small fw-bold ms-1" for="${this._prefix}SelectAllCheckbox">
                            All
                        </label>
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("select-dropdown", SelectDropdown);
