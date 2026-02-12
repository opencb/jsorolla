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

        this._searchQuery = "";
        this._results = [];
        this._loading = false;
        this._open = false;
        this._focusedIndex = -1;
        this._selectedItems = [];
    }

    update(changedProperties) {
        if (changedProperties.has("value") || changedProperties.has("values")) {
            this.updateSelectedValues();
        }
        super.update(changedProperties);
    }

    updateSelectedValues() {
        if (this.values && this.values.length > 0) {
            this._selectedItems = [...this.values];
        } else if (this.value) {
            const ids = this.value.split(",").filter(id => !!id);
            this._selectedItems = ids.map(id => {
                const existing = this._selectedItems?.find(item => item.id === id);
                return existing || {id: id, name: id};
            });
        } else {
            this._selectedItems = [];
        }
    }

    addToken(text) {
        const item = {id: text, name: text};
        if (this.multiple) {
            if (!this._selectedItems.find(i => i.id === item.id)) {
                this._selectedItems.push(item);
            }
        } else {
            this._selectedItems = [item];
        }
        this._searchQuery = "";
        this._open = false;
        this.notifyChange();
        this.requestUpdate();
    }

    onRemoveTokenClick(e, index) {
        e.stopPropagation();
        this.removeToken(index);
    }

    removeToken(index) {
        this._selectedItems.splice(index, 1);
        this.notifyChange();
        this.requestUpdate();
    }

    notifyChange() {
        const selection = this._selectedItems.map(item => item.id).join(",");
        LitUtils.dispatchCustomEvent(this, "filterChange", selection, {
            data: this._selectedItems
        }, null, {bubbles: false, composed: false});
    }

    onContainerClick(e) {
        this.renderRoot.querySelector("input").focus();
    }

    onInputChange(e) {
        this._searchQuery = e?.target?.value || "";
        this._results = [];
        this._loading = true;
        this._open = true;
        this.requestUpdate();

        const params = {
            data: {
                q: this._searchQuery
            }
        };

        this.fetch(params,
            (response) => {
                this._results = response.getResults ? response.getResults() : response;
                this._loading = false;
                this._focusedIndex = -1;
                this.requestUpdate();
            },
            (error) => {
                console.error("Fetch error:", error);
                this._loading = false;
                this.requestUpdate();
            }
        );
    }

    onInputFocus(e) {
        this._focused = true;
        // Trigger initial fetch when focused
        this.onInputChange();
    }

    onInputBlur(e) {
        this._focused = false;
        setTimeout(() => {
            this._open = false;
            this.requestUpdate();
        }, 200);
    }

    onKeyDown(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            this._focusedIndex = Math.min(this._focusedIndex + 1, this._results.length - 1);
            this._open = true;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (this._focusedIndex >= 0 && this._results[this._focusedIndex]) {
                this.onItemClick(e, this._results[this._focusedIndex]);
            } else if (this.editable && this._searchQuery) {
                this.addToken(this._searchQuery);
            }
        } else if (e.key === "Escape") {
            this._open = false;
        } else if (e.key === "Backspace" && !this._searchQuery && this._selectedItems.length > 0) {
            this.removeToken(this._selectedItems.length - 1);
        }
        this.requestUpdate();
    }

    onItemClick(e, item) {
        if (this.multiple) {
            if (!this._selectedItems.find(i => i.id === item.id)) {
                this._selectedItems.push(item);
            }
        } else {
            this._selectedItems = [item];
        }
        this._searchQuery = "";
        this._open = false;
        this.notifyChange();
        this.requestUpdate();
    }

    renderToken(item, index) {
        return html`
            <span class="badge d-flex align-items-center bg-primary me-1 mb-1 p-2">
                ${item.name || item.id}
                <i class="fas fa-times ms-2 cursor-pointer" @click="${e => this.onRemoveTokenClick(e, index)}"></i>
            </span>
        `;
    }

    render() {
        return html`
            <div class="token-dropdown position-relative">
                <div 
                    class="token-dropdown-container d-flex flex-wrap align-items-center form-control bg-white h-auto py-1 px-2"
                    @click="${e => this.onContainerClick(e)}">
                    
                    ${this._selectedItems?.map((item, index) => this.renderToken(item, index))}
                    
                    <input 
                        type="text" 
                        class="border-0 outline-none flex-grow-1 p-1"
                        style="outline: none; min-width: 100px;"
                        .value="${this._searchQuery}"
                        placeholder="${this._selectedItems?.length > 0 ? "" : this.placeholder}"
                        @input="${e => this.onInputChange(e)}"
                        @keydown="${e => this.onKeyDown(e)}"
                        @focus="${e => this.onInputFocus(e)}"
                        @blur="${e => this.onInputBlur(e)}"
                        ?disabled="${this.disabled}"
                    />
                </div>

                <div class="dropdown-menu w-100 ${this._open ? "show" : ""}" style="max-height: 300px; overflow-y: auto;">
                    ${this._loading ? html`<div class="dropdown-item disabled text-muted">Loading...</div>` : nothing}
                    ${!this._loading && this._results.length === 0 && this._searchQuery ? html`
                        <div class="dropdown-item disabled text-muted">No results found</div>
                    ` : nothing}
                    ${this._results.map((item, index) => html`
                        <button 
                            type="button"
                            class="dropdown-item ${index === this._focusedIndex ? "active" : ""}" 
                            @click="${e => this.onItemClick(e, item)}">
                            ${item.name || item.id}
                        </button>
                    `)}
                </div>
            </div>
        `;
    }

}

customElements.define("token-dropdown", TokenDropdown);
