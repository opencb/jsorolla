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

        // initialize params and success/error callbacks
        const params = {
            query: this._searchQuery || "",
        };
        const successCallback = (results = []) => {
            this._results = results;
            this._loading = false;
            this._focusedIndex = -1;
            this.requestUpdate();
        };
        const errorCallback = (error) => {
            console.error("Fetch error:", error);
            this._loading = false;
            this.requestUpdate();
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
        this.fetchResults(event?.target?.value || "");
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
        this.addToken(item[this.field] || item);
    }

    renderToken(value) {
        return html`
            <span class="badge d-flex align-items-center bg-primary me-1 mb-1 p-2">
                <span>${value}</span>
                <i class="fas fa-times ms-2 cursor-pointer" @click="${e => this.onRemoveTokenClick(e, value)}"></i>
            </span>
        `;
    }

    renderResultItem(item, index, isFocused) {
        return html`
            <a class="dropdown-item cursor-pointer ${isFocused ? "bg-primary-subtle" : ""}" @click="${e => this.onItemClick(e, item)}">
                <span>${item.name || item.id}</span>
            </a>
        `;
    }

    render() {
        const selectedValues = this.getSelectedValues();

        return html`
            <div class="token-dropdown position-relative">
                <div class="d-flex flex-wrap align-items-center form-control bg-white h-auto py-1 px-2" @click="${e => this.onContainerClick(e)}">
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
                <div class="dropdown-menu w-100 ${this._open ? "show" : ""}" style="max-height: 300px; overflow-y: auto;">
                    ${this._loading ? html`
                        <div class="dropdown-item disabled text-muted">Loading...</div>
                    ` : nothing}
                    ${!this._loading && this._results.length === 0 && this._searchQuery ? html`
                        <div class="dropdown-item disabled text-muted">No results found</div>
                    ` : nothing}
                    ${this._results.map((item, index) => {
                        return this.renderResultItem(item, index, this._focusedIndex === index);
                    })}
                </div>
            </div>
        `;
    }

}

customElements.define("token-dropdown", TokenDropdown);
