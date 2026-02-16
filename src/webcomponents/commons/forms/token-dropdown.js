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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";

export default class TokenDropdown extends LitElement {

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
                type: String
            },
            values: {
                type: Array
            },
            placeholder: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            editable: {
                type: Boolean
            },
            disabled: {
                type: Boolean
            },
            fetch: {
                type: Object
            },
            field: {
                type: String,
            },
            separator: {
                type: String,
            },
            renderItem: {
                type: Function,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.value = "";
        this.values = [];
        this.placeholder = "Search...";
        this.multiple = true;
        this.editable = false;
        this.disabled = false;
        this.field = "id";
        this.separator = ",";

        this._searchQuery = "";
        this._results = [];
        this._loading = false;
        this._open = false;
        this._focusedIndex = -1;
        this._debounceTimer = null;
        this._requestCount = 0;
    }

    getSelectedValues() {
        return (this.value || "").split(this.separator).filter(Boolean);
    }

    addToken(value) {
        if (this.multiple) {
            const selectedValues = this.getSelectedValues();
            if (!selectedValues.includes(value)) {
                selectedValues.push(value);
                this.value = selectedValues.join(this.separator);
            }
        } else {
            this.value = value;
        }
        // this._searchQuery = "";
        // this._open = false;
        // this.requestUpdate();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    removeToken(value) {
        const newValues = this.getSelectedValues().filter(selectedValue => {
            return selectedValue !== value;
        });
        this.value = newValues.join(this.separator);
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
    }

    fetchResults(query = "") {
        this._searchQuery = query || "";
        this._results = []; // reset results
        this._loading = true;
        this._open = true;
        this.requestUpdate();

        // Increment request count to track current request
        this._requestCount++;
        const currentRequest = this._requestCount;

        // initialize params and success/error callbacks
        const params = {
            query: this._searchQuery || "",
        };

        const successCallback = (results = []) => {
            // Only update results if this is the most recent request
            if (currentRequest === this._requestCount) {
                this._results = results;
                this._loading = false;
                this._focusedIndex = -1;
                this.requestUpdate();
            }
        };

        const errorCallback = (error) => {
            // Only update state if this is the most recent request
            if (currentRequest === this._requestCount) {
                console.error("Fetch error:", error);
                this._loading = false;
                this.requestUpdate();
            }
        };

        // run the provided fetch method
        this.fetch(params, successCallback, errorCallback);
    }

    onRemoveTokenClick(event, value) {
        event.stopPropagation();
        this.removeToken(value);
    }

    onContainerClick(e) {
        this.renderRoot.querySelector("input").focus();
    }

    onInputChange(event) {
        const query = event?.target?.value || "";
        this._searchQuery = query;

        // Clear existing debounce timer
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        // debounce the fetch call
        this._debounceTimer = setTimeout(() => {
            this.fetchResults(query);
            this._debounceTimer = null;
        }, 300);
    }

    onInputFocus(e) {
        this._focused = true;
        this.onInputChange();
    }

    onInputBlur(e) {
        this._focused = false;
        setTimeout(() => {
            this._open = false;
            this._searchQuery = ""; // reset search query
            this.requestUpdate();
        }, 200);
    }

    onKeyDown(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this._focusedIndex = Math.min(this._focusedIndex + 1, this._results.length - 1);
            this._open = true;
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
            this._open = true;
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (this._focusedIndex >= 0 && !!this._results[this._focusedIndex]) {
                this.onItemClick(event, this._results[this._focusedIndex]);
            } else if (this.editable && !!this._searchQuery) {
                this.addToken(this._searchQuery);
            }
        } else if (event.key === "Escape") {
            this._open = false;
        } else if (event.key === "Backspace" && !this._searchQuery) {
            const selectedValues = this.getSelectedValues();
            if (selectedValues.length > 0) {
                this.removeToken(selectedValues[selectedValues.length - 1]);
            }
        }
        this.requestUpdate();
    }

    onItemClick(event, item) {
        event.stopPropagation();
        const value = item[this.field] || item;
        if (this.getSelectedValues().includes(value)) {
            this.removeToken(value);
        } else {
            this.addToken(value);
        }
    }

    renderToken(value) {
        return html`
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-secondary text-truncate" style="max-width: 120px;">
                    <span title="${UtilsNew.escapeHtml(value)}">${value}</span>
                </button>
                <button type="button" class="btn btn-secondary" @click="${event => this.onRemoveTokenClick(event, value)}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    renderResultItem(item, index) {
        const isActive = this.getSelectedValues().includes(item[this.field] || item);
        const isFocused = this._focusedIndex === index;
        let content = nothing;

        if (typeof this.renderItem === "function") {
            content = this.renderItem(item, isActive);
        } else {
            content = html`
                <span>${item.name || item.id}</span>
            `;
        }

        return html`
            <a class="dropdown-item cursor-pointer ${isFocused || isActive ? "bg-primary-subtle" : ""}" @click="${e => this.onItemClick(e, item)}">
                <div class="d-flex w-full align-items-center justify-between gap-2">
                    <div class="text-wrap flex-grow-1">
                        ${content}
                    </div>
                    ${isActive ? html`
                        <i class="fas fa-check"></i>
                    ` : nothing}
                </div>
            </a>
        `;
    }

    render() {
        const selectedValues = this.getSelectedValues();

        return html`
            <div class="token-dropdown position-relative">
                <div class="d-flex gap-1 flex-wrap align-items-center form-control bg-white h-auto py-1 px-2" @click="${e => this.onContainerClick(e)}">
                    ${selectedValues?.map(value => this.renderToken(value))}
                    <input 
                        type="text" 
                        class="border-0 outline-none flex-grow-1 p-1"
                        style="outline: none; min-width: 100px;"
                        placeholder="${selectedValues?.length > 0 ? "" : this.placeholder}"
                        .value="${this._searchQuery}"
                        ?disabled="${this.disabled}"
                        @input="${e => this.onInputChange(e)}"
                        @keydown="${e => this.onKeyDown(e)}"
                        @focus="${e => this.onInputFocus(e)}"
                        @blur="${e => this.onInputBlur(e)}"
                    />
                </div>
                <div class="dropdown-menu w-100 ${this._open ? "show" : ""}">
                    ${this._loading ? html`
                        <div class="dropdown-item disabled text-muted">Loading...</div>
                    ` : nothing}
                    ${!this._loading && this._results.length === 0 && this._searchQuery ? html`
                        <div class="dropdown-item disabled text-muted">No results found</div>
                    ` : nothing}
                    <div class="overflow-y-auto" style="max-height: 300px;">
                        <div class="d-flex flex-column gap-1">
                            ${this._results.map((item, index) => this.renderResultItem(item, index))}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("token-dropdown", TokenDropdown);
