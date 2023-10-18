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

export default class SelectFieldFilter2 extends LitElement {

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
            title: {
                type: String
            },
            placeholder: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            all: {
                type: Boolean
            },
            disabled: {
                type: Boolean
            },
            required: {
                type: Boolean
            },
            maxOptions: {
                type: Number
            },
            liveSearch: {
                type: Boolean
            },
            forceSelection: {
                type: Boolean
            },
            classes: {
                type: String
            },
            size: {
                type: Number,
            },
            separator: {
                type: String,
            },
            // the expected format is either an array of string or an array of objects {id, name}
            data: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        // $.fn.selectpicker.Constructor.BootstrapVersion = "5";
        this.multiple = false;
        this.all = false;
        this.data = [];
        this.classes = "";
        this.elm = this._prefix + "selectpicker";
        this.size = 20; // Default size
        this.separator = ","; // Default separator
    }

    firstUpdated() {
        this.select = $("#" + this._prefix);
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.loadData();
        }

        if (changedProperties.has("value") || changedProperties.has("disabled")) {
            this.loadValueSelected();
        }
    }

    loadData() {
        if (this.data) {
            const options = [];
            this.select.empty();
            this.data.forEach(item => {
            // if exist children options
                if (item?.fields && item?.fields.length > 0) {
                    options.push({
                        text: item.id,
                        children: item.fields.map(opt => ({id: opt.id, text: opt.name}))
                    });
                } else {
                    options.push({
                    id: item.id,
                    text: item.name,
                });
                }
            });
            this.select.select2({
                theme: "bootstrap-5",
                selectionCssClass: "select2--small",
                tags: this._config?.freeTag ?? false,
                multiple: this.multiple,
                separator: this.separator,
                placeholder: this.placeholder || "Select option(s)",
                disabled: this.disabled,
                width: "80%",
                data: options,
                tokenSeparator: this.tokenSeparator,
                selectOnClose: false,
                templateResult: e => this.optionsFormatter(e),
            })
                .on("select2:select", e => this.filterChange(e))
                .on("select2:unselect", e => this.filterChange(e));

            this.querySelector("span.select2-search.select2-search--inline").style = "display: none";
        }
    }

    optionsFormatter(item) {
        // optgroup elements
        if (typeof item.children != "undefined") {
            return $(`
                <span class='fw-bold fs-6 text-dark'>${item.text}</span>
            `);
        }
        return $(`
            <small>${item.text}</small>
        `);
    }

    loadValueSelected() {
        let val = "";
        if (this.value && this.multiple) {
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

    filterChange(e) {
        const disabled = Object.values(e.target.options)
            .filter(data => data.disabled === true)
            .map(data => {
                if (data.selected) {
                    return data.value;
                }
            });

        const selection = Array.isArray(this.select.select2("data"))?
            [...this.select.select2("data").map(el => el.id), ...disabled] :
            this.select.select2("data").map(el => el.id);

        let val = "";
        if (selection && selection.length) {
            if (this.multiple) {
                val = selection.join(",");
            }
        }
        LitUtils.dispatchCustomEvent(this, "filterChange", selection.join(","));
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
        return html `
            <span class="input-group-text rounded-start-0">
                <input class="form-check-input mt-0" id="${this._prefix}-all-checkbox" type="checkbox" aria-label="..." @click=${this.selectAll}>
                <span class="fw-bold ms-1">All</span>
            </span>
        `;
    }

    render() {
        return html`
            <div class="input-group mb-1">
                <select
                    class="form-select"
                    id="${this._prefix}"
                    ?disabled="${this.disabled}"
                    @change="${this.filterChange}">
                </select>
                ${this.all ? this.renderShowSelectAll() : nothing}
            </div>`;
    }

    getDefaultConfig() {
        return {

        };
    }

}

customElements.define("select-field-filter2", SelectFieldFilter2);
