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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-token-filter.js";
import UtilsNew from "../../../core/utils-new";

export default class CellbaseSearchAutocomplete extends LitElement {

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
                type: Object
            },
            resource: {
                type: String,
            },
            cellbaseClient: {
                type: Object,
            },
            classes: {
                type: String
            },
            config: {
                type: Object
            },
            searchField: {
                type: String,
            },
        };
    }

    #init() {
        this.RESOURCES = {};
        this.endpoint = {};
        this.defaultQueryParams = {
            limit: 10,
            count: false,
        };
        this.#initResourcesConfig();
        this.searchField = "";
    }

    #initResourcesConfig() {
        this.RESOURCES = {
            "PHENOTYPE": {
                category: "feature",
                subcategory: "ontology",
                operation: "search",
                getSearchField: term => /^[^:\s]+:/.test(term) ? "id": "name",
                placeholder: "Start typing a phenotype ID or name...",
                queryParams: {},
                // Pre-process the results of the query if needed.
            },
            "DISORDER": {
                category: "feature",
                subcategory: "ontology",
                operation: "search",
                getSearchField: term => /^[^:\s]+:/.test(term) ? "id": "name",
                placeholder: "Start typing a disorder ID or name ...",
                queryParams: {},
                // Pre-process the results of the query if needed.
            },
            "GENE": {
                // CAUTION: In feature-filter.js L71, we are autocompleting: xref, ids, gene, geneName.
                category: "feature",
                subcategory: "gene",
                operation: "search",
                getSearchField: term => {
                    // FIXME: Query gene by id is not working! Temporarily returning ALWAYS name
                    // return term.startsWith("ENSG0") ? "id" : "name";
                    return term.startsWith("ENSG0") ? "name" : "name";
                },
                valueField: "name",
                placeholder: "Start typing an ensemble gene ID or name...",
                queryParams: {
                    exclude: "transcripts,annotation",
                }, // CAUTION: query params depends on the resource/operation (i.e. search, info) used
            },
            "VARIANT": {},
            "PROTEIN": {},
            "TRANSCRIPT": {},
            "VARIATION": {},
            "REGULATORY": {},
        };
    }

    // Filter the fields that can be used to fill the form automatically
    #filterResults(results) {
        return results.map(item => ({
            id: item.id,
            name: item.name,
            source: item.source,
            description: item.description,
            text: item.name || item.id,
        }));
    }

    // Templating one option of dropdown
    // TODO Vero: Style with default bootstrap
    #viewResultStyle() {
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

    #viewResult(option) {
        return option.name ? $(`
            <div class="result-wrapper">
                <div class="result-name-wrapper">
                    <div class="result-source">${option.source}</div>
                    <div class="result-source-name">${option.name}</div>
                </div>
                <div class="dropdown-item-extra">${option.id || "-"}</div>
            </div>
        `) : $(`
            <span>${option.text}</span>
        `);
    }

    update(changedProperties) {
        if (changedProperties.has("resource")) {
            this.resourceObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    resourceObserver() {
        if (this.resource) {
            this.resource.toUpperCase();
        }
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
    }

    onFilterChange(e) {
        const value = e.detail.value;
        const data = e.detail.data.selected ? e.detail.data : {};
        if (!UtilsNew.isEmpty(data)) {
            // 1. To remove internal keys from select2 that are not part of the data model.
            const internalKeys = ["selected", "text"];
            internalKeys.forEach(key => delete data[key]);
            // 2. To filter out entries with undefined values
            Object.keys(data).forEach(key => typeof data[key] === "undefined" && delete data[key]);
        }
        // 3. To dispatch event with value autocompleted and data filtered
        LitUtils.dispatchCustomEvent(this, "filterChange", value, {
            data: data,
        });
    }

    render() {
        if (!this.resource) {
            return html`Resource not provided`;
        }

        return html`
            <select-token-filter
                .keyObject="${this.RESOURCES[this.resource].valueField || "id"}"
                .classes="${this.classes}"
                .config="${this._config}"
                @filterChange="${e => this.onFilterChange(e)}">
            </select-token-filter>
        `;
    }

    getDefaultConfig() {
        return {
            disabled: false,
            multiple: false,
            freeTag: false,
            limit: 10,
            maxItems: 0, // No limit set
            minimumInputLength: 3, // Only start searching when the user has input 3 or more characters
            placeholder: this.RESOURCES[this.resource].placeholder,
            filterResults: this.#filterResults,
            viewResultStyle: this.#viewResultStyle,
            viewResult: this.#viewResult,
            viewSelection: result => result[this.searchField],
            // TODO Vero: change name to fetch
            source: async (params, success, failure) => {
                const page = params?.data?.page || 1;
                const queryParams = {
                    ...this.defaultQueryParams,
                    ...this.RESOURCES[this.resource].queryParams,
                    skip: (page - 1) * this._config.limit,
                };
                if (params?.data?.term) {
                    // Get the query param field. It will vary with the text typed by the user according to a regex
                    this.searchField = this.RESOURCES[this.resource].getSearchField(params.data.term);
                    // Set the query params
                    const queryParamsField = {
                        [this.searchField]: `~/${params?.data?.term}/i`,
                        ...queryParams,
                    };
                    // Query cellbase with the appropriate resource params
                    try {
                        const response = await this.cellbaseClient.get(
                            this.RESOURCES[this.resource].category,
                            this.RESOURCES[this.resource].subcategory,
                            "",
                            this.RESOURCES[this.resource].operation,
                            queryParamsField);
                        success(response);
                    } catch (error) {
                        // TODO Vero 20230928: manage failure
                        console.log(error);
                    }
                }
            },
        };
    }

}

customElements.define("cellbase-search-autocomplete", CellbaseSearchAutocomplete);
