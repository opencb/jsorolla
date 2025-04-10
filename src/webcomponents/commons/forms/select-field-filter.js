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

export default class SelectFieldFilter extends LitElement {

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
            // NOTE value (default Values) can be either a single value as string or a comma separated list (in case of multiple=true we support array of strings)
            // value are items selected by default
            value: {
                type: String
            },
            // the expected format is either an array of string or an array of objects {id, name}
            data: {
                type: Object
            },
            classes: {
                type: String
            },
            size: {
                type: Number,
            },
            selectedTextFormat: {
                type: String,
            },
            separator: {
                type: String,
            },
            forceSelection: {
                type: Boolean,
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.data = [];
        this.classes = "";
        this._config = this.getDefaultConfig();
    }

    firstUpdated() {
        this.select = $("#" + this._prefix);
        if (this._config?.multiple) {
            this.customAdapter();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("data") || changedProperties.has("config")) {
            this.loadData();
        }

        if (changedProperties.has("value")) {
            this.loadValueSelected();
        }

        if (typeof this.select.data("select2")?.$selection !== "undefined" && changedProperties.has("classes")) {
            // For update select style
            if (this.classes === "selection-updated") {
                this.select.data("select2").$selection.addClass(this.classes);
            } else {
                this.select.data("select2").$selection.removeClass("selection-updated");
            }
        }
    }

    loadData() {
        if (!this.data || this.data.length === 0) {
            return;
        }

        this.select.empty();
        const options = this.data.map(item => this.getOptions(item));

        const selectConfig = {
            ...this._config,
            theme: "bootstrap-5",
            dropdownParent: document.querySelector(`#${this._prefix}`).parentElement,
            selectionCssClass: this._config?.selectionClass ? this.config?.selectionClass : "",
            multiple: !!this._config?.multiple,
            placeholder: this._config?.placeholder ?? "Select an option",
            allowClear: !this.forceSelection,
            disabled: this._config?.disabled ?? false,
            width: "80%",
            data: options,
            tokenSeparator: this._config?.separator,
            closeOnSelect: !this._config?.multiple,
            templateResult: e => this.optionsFormatter(e),
            ...this._config?.liveSearch ? {} : {minimumResultsForSearch: Infinity}, // To hide search box
        };

        const searchBox = this._config?.liveSearch && this._config?.multiple ? {dropdownAdapter: $.fn.select2.amd.require("CustomDropdownAdapter")} : {};
        const selectAdapter = this._config?.multiple ? {
            templateSelection: data => {
                const items = Array.from(data.all).filter(opt => opt.text !== "" && typeof opt.text !== "undefined");
                return `Selected ${data.selected.length} out of ${items.length}`;
            },
            // Make selection-box similar to single select
            selectionAdapter: $.fn.select2.amd.require("CustomSelectionAdapter"),
            ...searchBox
        } : {};

        this.select.select2({...selectConfig, ...selectAdapter})
            .on("select2:select", e => this.filterChange(e))
            .on("select2:unselect", e => this.filterChange(e));

        if (this.value) {
            // temporal solution for now to load selected values
            this.loadValueSelected();
        }

        // Clear select
        if (UtilsNew.isEmpty(this.value)) {
            this.select.val(null).trigger("change");
        }

    }

    customAdapter() {
        $.fn.select2.amd.define("CustomSelectionAdapter", [
            "select2/utils",
            "select2/selection/multiple",
            "select2/selection/placeholder",
            "select2/selection/eventRelay",
            "select2/selection/single",
        ], (Utils, MultipleSelection, Placeholder, EventRelay, SingleSelection) => {

            // Decorates MultipleSelection with Placeholder
            let adapter = Utils.Decorate(MultipleSelection, Placeholder);
            // Decorates adapter with EventRelay - ensures events will continue to fire
            // e.g. selected, changed
            adapter = Utils.Decorate(adapter, EventRelay);

            adapter.prototype.render = function () {
                // Use selection-box from SingleSelection adapter
                // This implementation overrides the default implementation
                const $selection = SingleSelection.prototype.render.call(this);
                return $selection;
            };

            adapter.prototype.update = function (data) {
                // copy and modify SingleSelection adapter
                this.clear();

                const $rendered = this.$selection.find(".select2-selection__rendered");
                const noItemsSelected = data.length === 0;
                let formatted = "";

                if (noItemsSelected) {
                    formatted = this.options.get("placeholder") || "";
                } else {
                    const itemsData = {
                        selected: data || [],
                        all: this.$element.find("option") || []
                    };
                    // Pass selected and all items to display method
                    // which calls templateSelection
                    formatted = this.display(itemsData, $rendered);
                }

                $rendered.empty().append(formatted);
                $rendered.prop("title", formatted);
            };

            return adapter;
        });

        $.fn.select2.amd.define("CustomDropdownAdapter", [
            "select2/utils",
            "select2/dropdown",
            "select2/dropdown/attachBody",
            "select2/dropdown/attachContainer",
            "select2/dropdown/search",
            "select2/dropdown/minimumResultsForSearch",
            "select2/dropdown/closeOnSelect",
        ], (Utils, Dropdown, AttachBody, AttachContainer, Search, MinimumResultsForSearch, CloseOnSelect) => {

            // Decorate Dropdown with Search functionalities
            const dropdownWithSearch = Utils.Decorate(Dropdown, Search);
            dropdownWithSearch.prototype.render = function () {
                // Copy and modify default search render method
                const $rendered = Dropdown.prototype.render.call(this);
                // Add ability for a placeholder in the search box
                const placeholder = this.options.get("placeholderForSearch") || "";
                const $search = $(
                    `<span class="select2-search select2-search--dropdown">
                        <input class="select2-search__field" placeholder="${placeholder}" type="search"
                        tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off"
                        spellcheck="false" role="textbox"/>
                    </span>`
                );

                this.$searchContainer = $search;
                this.$search = $search.find("input");

                $rendered.prepend($search);
                return $rendered;
            };

            // Decorate the dropdown+search with necessary containers
            let adapter = Utils.Decorate(dropdownWithSearch, AttachContainer);
            adapter = Utils.Decorate(adapter, AttachBody);

            return adapter;
        });
    }

    optionsFormatter(item) {
        // optgroup elements
        if (typeof item.children !== "undefined") {
            return $(`
                <hr class="m-0 mb-2"/>
                <span class='fw-bold text-secondary'>
                    <small>${item.text}</small>
                </span>
            `);
        }

        if (typeof item.text === "undefined" || item.text === "") {
            return $(`<hr class="mt-0 mb-1">`);
        }

        return $(`
            <div class="d-flex justify-content-between align-items-center py-1">
                <span>${item.text}</span>
                <i class="fas fa-check d-none"></i>
            </div>
        `);
    }

    loadValueSelected() {
        let val = "";
        if (this.value && this._config?.multiple) {
            val = Array.isArray(this.value) ? this.value : this.value.split(",");
        } else {
            val = UtilsNew.isNotUndefinedOrNull(this.value) ? this.value : "";
        }
        this.select.val(val);
        this.select.trigger("change");
    }

    transformData(data) {
        // id, name;
        let _data = [];
        if (data) {
            _data = data?.map(({name, ...props}) => ({...props, text: name}));
            console.log("Output transform: ", _data);
        }
    }

    getOptions(item) {
        if (!UtilsNew.isObject(item)) {
            return {
                id: item,
                text: item
            };
        }

        if (item.fields && item.fields.length > 0) {
            return {
                text: item?.id || item?.name,
                children: item.fields.map(opt => ({id: opt.id, text: opt?.name || opt?.id}))
            };
        }

        return {
            id: item.id,
            text: item?.name || item?.id,
            selected: item.selected ?? false,
            disabled: item.disabled ?? false
        };
    }

    filterChange(e) {
        const disabled = Object.values(e.target.options)
            .filter(data => data.disabled === true)
            .map(data => {
                if (data.selected) {
                    return data.value;
                }
            });

        const selection = Array.isArray(this.select.select2("data")) ?
            [...this.select.select2("data").map(el => el.id), ...disabled] :
            this.select.select2("data").map(el => el.id);

        let val = "";
        if (selection && selection.length) {
            if (this._config?.multiple) {
                val = selection.join(",");
            }
        }
        LitUtils.dispatchCustomEvent(this, "filterChange", selection.join(","),
        {}, null, {bubbles: false, composed: false});
    }

    selectAll(e) {
        if (e.currentTarget.checked) {
            if (this.data[0].fields) {
                this.value = this.data.map(data => data.fields).flat().map(data => data.id ?? data.name);
            } else {
                this.value = this.data.map(data => data.id ?? data.name);
            }
        } else {
            if (this.data[0].fields) {
                this.value = this.data.map(data => data.fields).flat().filter(data => data.disabled === true).map(data => data.id ?? data.name);
            } else {
                this.value = this.data.filter(data => data.disabled === true).map(data => data.id ?? data.name);
            }
        }

        // Notify to event to allow parent components to react
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value?.length > 0 ? this.value.join(",") : "", {
            data: this.data,
        }, null, {bubbles: false, composed: false});
    }

    renderShowSelectAll() {
        return html`
            <span class="input-group-text rounded-start-0">
                <input class="form-check-input mt-0" id="${this._prefix}-all-checkbox" type="checkbox" aria-label="..." @click=${this.selectAll}>
                <span class="fw-bold ms-1">All</span>
            </span>
        `;
    }

    renderStyle() {
        return html`
            <style>
                .select-field-filter .select2-results__options {
                    max-height: 600px !important;
                }

                .select-field-filter .select2-results__option--selected {
                    background-color: #fff !important;
                    color: #000 !important;
                }
                .select-field-filter .select2-results__option--selected:hover {
                    background-color: #e9ecef !important;
                }
                .select-field-filter .select2-results__option--selected i.fa-check {
                    display: inline-block !important;
                }
                .select-field-filter .select2-results__group {
                    display: block;
                    padding: 6px 4px !important;
                }
            </style>
        `;
    }

    render() {
        return html`
            ${this.renderStyle()}
            <div class="input-group mb-1 select-field-filter">
                <select
                    class="form-select"
                    id="${this._prefix}"
                    @change="${this.filterChange}">
                </select>
                ${this.all ? this.renderShowSelectAll() : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            separator: [","],
            multiple: false,
            selectionClass: "",
            all: false,
            required: false,
            liveSearch: false,
            classes: "",
            showSelectAll: false,
            limit: 10,
            disablePagination: false,
            minimumInputLength: 0,
            maxItems: 0, // maxOptions
            disabled: false,
            placeholder: "Select option(s)",
            freeTag: false,
            tags: false
        };
    }

}

customElements.define("select-field-filter", SelectFieldFilter);
