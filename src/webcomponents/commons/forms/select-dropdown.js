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
            searchPlaceholder: {
                type: String,
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
            renderItem: {
                type: Function,
            },
            className: {
                type: String,
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
        this.searchPlaceholder = "Search...";
        this.forceSelection = false;
        this.selectAll = false;
        this._normalizedValues = [];
        this._searchQuery = "";
    }

    update(changedProperties) {
        if (changedProperties.has("values")) {
            this.valuesObserver();
        }
        super.update(changedProperties);
    }

    valuesObserver() {
        this._normalizedValues = (this.values || []).map(item => {
            // 1. if item is a string or a number, return {id: item}
            if (typeof item === "string" || typeof item === "number") {
                return {
                    id: `${item}`,
                };
            }
            // 2. if item is an object with values, return it with normalized values
            if (item?.values && Array.isArray(item.values)) {
                return {
                    ...item,
                    values: item.values.map(value => {
                        return (typeof value === "string" || typeof value === "number") ? {id: `${value}`} : value;
                    }),
                };
            }
            // 3. return item as is
            return item;
        });
    }

    onClear(e) {
        e.stopPropagation();
        this.value = "";
        this.requestUpdate();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    onSelectAllClick(e) {
        const selectableItems = this.getAllItems().filter(item => !item.disabled);
        if (e.target.checked) {
            // Select all enabled items
            this.value = selectableItems.map(item => item.id).join(",");
        } else {
            // Deselect all
            this.value = this.forceSelection && selectableItems.length > 0 ? selectableItems[0].id : "";
        }

        this.requestUpdate();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    onSearchInput(e) {
        this._searchQuery = e.target.value.toLowerCase();
        this.requestUpdate();
    }

    onItemClick(e, item) {
        if (item.disabled) {
            return;
        }
        const selectedValues = this.getSelectedValues();
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

    getFilteredValues() {
        return (this._normalizedValues || []).map(item => {
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
        return (this._normalizedValues || []).reduce((acc, item) => {
            if (item.values && Array.isArray(item.values)) {
                return [...acc, ...item.values.filter(v => !v.separator)];
            }
            if (item.separator) {
                return acc;
            }
            return [...acc, item];
        }, []);
    }

    getSelectedValues() {
        // 1. check if the value is a string
        if (this.value && typeof this.value === "string") {
            return this.value.split(",").filter(Boolean);
        }
        // 2. check if value is a number
        if (typeof this.value === "number") {
            return [this.value.toString()];
        }
        // 3. other case
        return [];
    }

    getDisplayText(selectedItems = []) {
        // Button text: if nothing selected, show placeholder. If one item, show name. If multiple, show count.
        if (selectedItems.length === 1) {
            return selectedItems[0].name || selectedItems[0].id;
        } else if (selectedItems.length > 1) {
            return `${selectedItems.length} items selected`;
        }
        return this.placeholder || "Select an option...";
    }

    renderItemTemplate(item) {
        const isSelected = this.getSelectedValues().includes(item.id);
        let content;
        if (typeof this.renderItem === "function") {
            content = this.renderItem(item, isSelected);
        } else {
            content = html`
                <div class="fw-bold text-wrap ${item?.className || ""}">
                    ${item.name || item.id}
                </div>
                ${item.description ? html`
                    <div class="small text-wrap text-muted">${item.description}</div>
                ` : nothing}
            `;
        }

        return html`
            <a class="dropdown-item cursor-pointer ${isSelected ? "bg-primary-subtle" : ""} ${item.disabled ? "disabled" : ""}" @click="${e => this.onItemClick(e, item)}">
               <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        ${content}
                    </div>
                    ${isSelected ? html`
                        <i class="fas fa-check"></i>
                    ` : nothing}
               </div>
            </a>
        `;
    }

    renderSeparator() {
        return html`
            <hr class="dropdown-divider">
        `;
    }

    renderGroup(group, isLast = false) {
        return html`
            <div class="d-flex flex-column gap-1">
                <h6 class="dropdown-header fw-bold">
                    ${group.name || group.id}
                </h6>
                ${group.values?.map(item => {
                    if (item.separator) {
                        return this.renderSeparator();
                    }
                    return this.renderItemTemplate(item);
                })}
            </div>
            ${!isLast ? html`
                <hr class="dropdown-divider">
            ` : nothing}
        `;
    }

    render() {
        const selectedValues = this.getSelectedValues();
        const allItems = this.getAllItems();
        const selectableItems = allItems.filter(item => !item.disabled);
        const selectedItems = allItems.filter(v => selectedValues.includes(v.id));
        const filteredValues = this.getFilteredValues();

        return html`
            <div class="select-dropdown dropdown input-group ${this.className || ""}">
                <div class="dropdown-menu w-100" aria-labelledby="${this._prefix}DropdownButton">
                    ${this.search ? html`
                        <div class="input-group p-2">
                            <span class="input-group-text bg-white">
                                <i class="fas fa-search"></i>
                            </span>
                            <input
                                type="text"
                                class="form-control border-start-0"
                                placeholder="${this.searchPlaceholder}"
                                .value="${this._searchQuery}"
                                @input="${event => this.onSearchInput(event)}">
                        </div>
                    ` : nothing}
                    <div class="dropdown-list overflow-y-auto" style="max-height:25rem;">
                        ${filteredValues.length > 0 ? html`
                            <div class="d-flex flex-column gap-1">
                                ${filteredValues.map((item, index) => {
                                    if (item.separator) {
                                        return this.renderSeparator();
                                    }
                                    if (item.values && Array.isArray(item.values)) {
                                        return this.renderGroup(item, index === filteredValues.length - 1);
                                    }
                                    return this.renderItemTemplate(item);
                                })}
                            </div>
                        ` : html`
                            <div class="dropdown-item disabled text-center">No results found</div>
                        `}
                    </div>
                </div>
                <div
                    class="form-select flex-grow-1 d-flex align-items-center rounded-start"
                    id="${this._prefix}DropdownButton"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    data-bs-reference="parent"
                    aria-expanded="false"
                    ?disabled="${this.disabled}">
                    <span class="flex-grow-1 text-start text-truncate">
                        ${this.getDisplayText(selectedItems)}
                    </span>
                </div>
                ${!this.forceSelection && selectedValues.length > 0 ? html`
                    <span class="input-group-text bg-white cursor-pointer" @click="${event => this.onClear(event)}">
                        <i class="fas fa-times"></i>
                    </span>
                ` : nothing}
                ${this.selectAll ? html`
                    <div class="input-group-text bg-white">
                        <input
                            type="checkbox"
                            class="form-check-input mt-0"
                            id="${this._prefix}SelectAllCheckbox"
                            .checked="${selectableItems.length > 0 && selectedItems.length === selectableItems.length}"
                            .indeterminate="${selectedItems.length > 0 && selectedItems.length < selectableItems.length}"
                            @change="${event => this.onSelectAllClick(event)}">
                        <label class="form-check-label small fw-bold ps-2" for="${this._prefix}SelectAllCheckbox">
                            All
                        </label>
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("select-dropdown", SelectDropdown);
