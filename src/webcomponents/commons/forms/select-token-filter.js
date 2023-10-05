/**
 * Copyright 2015-2019 OpenCB
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
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/file-upload.js";

/**
 * Token filter. Select2 version with opencga dynamic datasource
 *
 */
export default class SelectTokenFilter extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            value: {
                type: String
            },
            keyObject: {
                type: String,
            },
            classes: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        // Optional property that specifies the object key that will be dispatched as selected value.
        // If not specified, the default value will be "id"
        this.keyObject = "id";
    }

    firstUpdated() {
        this.select = $("#" + this._prefix);
        this.select.select2({
            separator: this._config.separator ?? [","],
            tags: this._config.freeTag ?? true, // Feature "Tagging": Dynamically create new options from text input by the user.
            multiple: this._config.multiple ?? true,
            // https://select2.org/appearance#container-width
            width: this._config.width ?? "style",
            allowClear: this._config.allowClear ?? true,
            disabled: this._config.disabled ?? false,
            placeholder: this._config.placeholder,
            minimumInputLength: this._config.minimumInputLength,
            maximumSelectionLength: this._config.maxItems || 0,
            ajax: {
                // Todo: rename source => fetch
                transport: async (params, success, failure) => this._config.source(params, success, failure),
                // NOTE processResults() expects a RestResponse instance, override the whole ajax() method in case of external data source (not Opencga)
                processResults: (restResponse, params) => {
                    // 1. Results
                    // FIXME: find example with duplicated result by id. Remove duplicates
                    let results = (restResponse.constructor === Array) ?
                        [].concat(...restResponse.map(response => response.getResults())) :
                        restResponse.getResults();
                    results = this._config.filterResults?.(results) ?? this._config.preprocessResults(results);
                    // 2. Pagination
                    const _params = params;
                    _params.page = _params.page || 1;
                    const more = !this._config.disablePagination && (_params.page * this._config.limit) < results.numMatches;
                    return {
                        // Pre-process results before displaying
                        results: results,
                        pagination: {
                            more: more,
                        }
                    };
                }
            },
            // Customisation of each result appearance to be displayed in the dropdown
            templateResult: item => {
                if (item.loading) {
                    return $(`
                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
                        <span>${item.text}</span>
                    `);
                }
                try {
                    return this._config.formatResult?.(item) ?? this.#templateResultsDefault(item);
                } catch (e) {
                    console.error(e);
                }
            },
            // Customisation of the selected result
            templateSelection: item => {
                return this._config.formatSelection?.(item) ?? item.id ?? item.text;
            },
            ...this._config
        })
            .on("select2:select", e => {
                this.filterChange(e);
            })
            .on("select2:unselect", e => {
                this.filterChange(e);
            });
    }

    #templateResultsDefault(item) {
        // Item can be:
        //  - Text typed. item: {id: "text typed", text: "text typed"}
        //  - Rest api result: item: {id: "", name: "", description: "", etc.}
        //  - Array of strings, item is a string (i.e. Individual, phenotype filter)
        // QUESTION: A way for distinguishing  from result:
        //  - this._config.freeTag
        //  - name === undefined => Weak condition
        // If free text response has been configured (tags=true),
        // one of the items to process will be the text typed.
        // If name is not defined it means tags=true,
        // this._config.fields() mapper function is defined but the user is typing a non existing word (in data source).
        // This avoids printing `undefined` in dropdown.
        try {
            const {name, ...rest} = this._config.fields(item) ?? item.id;
            // return item.queryResult ? $(`
            return item.name ? $(`
                <span>${item.name}</span>
                ${(rest ? Object.entries(rest)
                .map(([label, value]) => `
                        <p class="dropdown-item-extra">
                            <label>${label}</label> ${value || "-"}
                        </p>`)
                .join("") : "")}
            `) : item.id;
        } catch (e) {
            console.error(e);
        }
    }

    update(changedProperties) {
        if (changedProperties.has("value")) {
            if (this._config?.showSelectAll && !this.value) {
                this.clearAllCheckbox();
            }
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("classes")) {
            if (this.classes) {
                this.select.data("select2").$selection.addClass(this.classes);
            } else {
                this.select.data("select2").$selection.removeClass("");
            }
        }

        if (changedProperties.has("value")) {
            // manual addition of <option> elements is needed when tags=true in select2. We do it in any case.
            this.select.empty();
            if (UtilsNew.isNotEmpty(this.value) && this._config?.separatorRegex) {
                // const valuesMatched = this.value?.match(this._config?.separatorRegex);
                const valuesMatched = UtilsNew.splitByRegex(this.value, this._config?.separatorRegex);
                this.addOptions(UtilsNew.isNotEmpty(valuesMatched) ? valuesMatched : "");
            } else {
                const regExpSeparators = new RegExp("[" + this._config.separator.join("") + "]");
                this.addOptions(UtilsNew.isNotEmpty(this.value) ? this.value?.split(regExpSeparators) : "");
            }
        }
    }

    clearAllCheckbox() {
        const selectElm = document.querySelector("#" + this._prefix);
        const allChekbox = document.querySelector(`#${this._prefix}-all-checkbox`);
        this.select.empty();
        selectElm.disabled = false;
        allChekbox.checked = false;
    }

    toggleDisabled() {
        const selectElm = document.querySelector("#" + this._prefix);
        this.select.empty();
        let ids = "";
        if (!selectElm.disabled) {
            this.addOptions(["all"]);
            ids = "all";
        }
        selectElm.disabled = !selectElm.disabled;
        // Notify to the form
        LitUtils.dispatchCustomEvent(this, "filterChange", ids);
    }

    addOptions(ids) {
        if (ids) {
            const _ids = [...new Set(ids)];
            for (const id of _ids) {
                // Create a DOM Option and pre-select by default
                const newOption = new Option(id, id, true, true);
                // Append it to the select
                this.select.append(newOption).trigger("change");
            }
            this.select.trigger("change");
        } else {
            this.select.val(null).trigger("change");
        }
    }

    fileUploaded(e) {
        if (e.detail.value) {
            const list = e.detail.value.join(",");
            // TODO this.value could be a string separated by other chars than commas
            this.value = this.value ? this.value + "," + list : list;
        }
    }

    filterChange(e) {
        // join by "," only as the operator (, or ;) is not a concern of this component.
        // this component only needs to split by all separators (defined in config) in updated() fn,
        // but it doesn't need to reckon which one is being used at the moment (some tokens can contain commas (e.g. in HPO))
        const data = this.select.select2("data") || [];
        // FIXME: selection is always propagating the id but we are using now
        //  autocomplete in fields like name.
        // const selection = data.map(el => el.id).join(",");
        const selection = data.map(el => el[this.keyObject]).join(",");
        LitUtils.dispatchCustomEvent(this, "filterChange", selection, {
            data: e.params?.data || [],
        });
    }

    toggleFileUpload() {
        $(`#${this._prefix}-select-wrapper .file-drop-area`).collapse("toggle");
    }

    renderShowSelectAll() {
        return html`
            <span class="input-group-addon">
                <input id="${this._prefix}-all-checkbox" type="checkbox" aria-label="..." style="margin: 0 5px" @click=${this.toggleDisabled}>
                <span style="font-weight: bold">All</span>
            </span>`;
    }

    renderStyle() {
        return html `
            <style>
                .result-wrapper {
                    display: flex;
                    flex-direction: column;
                }
                .result-name-wrapper {
                    display: flex;
                    align-items: center;
                }
                .result-source {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                    font-size: 10px;
                    padding: 2px 4px;
                    color: white;
                    background-color: #d91c5e;
                    border: 1px solid #d91c5e;
                    border-radius: 2px;
                }
            </style>
        `;
    }

    render() {
        if (this._config?.fileUpload) {
            return html`
                <form>
                    <div id="${this._prefix}-select-wrapper">
                        <div class="input-group">
                            <select class="form-control"  id="${this._prefix}" @change="${this.filterChange}"></select>
                            <span class="input-group-addon file-upload-toggle" @click="${this.toggleFileUpload}">
                                <i class="fas fa-upload"></i>
                            </span>
                        </div>
                        <file-upload @filterChange="${this.fileUploaded}"></file-upload>
                    </div>
                </form>
            `;
        } else {
            // TODO Vero: (1) Make style configurable, remove from here, (2) Default bootstrap
            return html`
                ${this.renderStyle()}
                <div>
                    <div class="input-group">
                        <select
                            class="form-control"
                            id="${this._prefix}"
                            ?disabled="${this._config.disabled}"
                            @change="${this.filterChange}">
                        </select>
                        ${this._config.showSelectAll ? this.renderShowSelectAll() : nothing}
                    </div>
                </div>
            `;
        }
    }

    getDefaultConfig() {
        return {
            separator: [","],
            // separatorRegex: /[^,]+/g, comma
            separatorRegex: /(?:(?!,\S).)+/g, // comma without space
            showSelectAll: false,
            limit: 10,
            disablePagination: false,
            minimumInputLength: 0,
            maxItems: 0,
            disabled: false,
            placeholder: "Start typing",
            freeTag: false,
            fileUpload: false,
            source: () => {
                throw new Error("Data source not defined");
            },
            fields: item => ({
                "name": item.id,
            }),
            /* remap results coming from opencga */
            preprocessResults(results) {
                if (results.length) {
                    if ("string" === typeof results[0]) {
                        return results.map(s => ({id: s}));
                    }
                }
                return results;
            }
        };
    }

}

customElements.define("select-token-filter", SelectTokenFilter);
