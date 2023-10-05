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
    }

    #initResourcesConfig() {
        this.RESOURCES = {
            "PHENOTYPE": {
                category: "feature",
                subcategory: "ontology",
                operation: "search",
                searchField: "id,name",
                getSearchField: term => {
                    return /^[^:\s]+:/.test(term) ? "id": "name";
                },
                placeholder: "Start typing...",
                queryParams: {},
                // Pre-process the results of the query if needed.
            },
            "GENE": {
                // CAUTION: In feature-filter.js L71, we are autocompleting: xref, ids, gene, geneName.
                category: "feature",
                subcategory: "gene",
                operation: "search",
                // searchField is a query param referring one of the endpoints fields
                searchField: "name",
                getSearchField: term => term.startsWith("ENSG0") ? "id" : "name",
                valueField: "name",
                placeholder: "Start typing...",
                queryParams: {},
                // CAUTION: query params depends on the resource/operation (i.e. search, info) used
                //  Q1: Is this component intended to use only the "search" operation?
                //  N1: Not all the entities in Cellbase have the search operation
                //  N2: I.e for the subcategory/resource Gene, we are currently using the operations:
                //      - /startsWith: in feature-filter.js
                //      - /info: in disease-panel-create.js, this.cellbaseClient.getGeneClient("", "info", "");
                // Query params:
                query: {},
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
            // queryResult: true, // Could solve issue in select-token-filter.js, #templateResultsDefault()
        }));
    }

    // Templating one option of dropdown
    #formatResult(option) {
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
        this._config = this.getDefaultConfig();
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
    }

    onFilterChange(e) {
        const value = e.detail.value;
        delete e.detail.data.selected;
        LitUtils.dispatchCustomEvent(this, "filterChange", value, {
            data: e.detail.data,
        });
    }

    render() {
        if (!this.resource) {
            return html`Resource not provided`;
        }

        return html`
            <select-token-filter
                .value="${this.value}"
                .keyObject="${this.RESOURCES[this.resource].valueField || "id"}"
                .classes="${this.classes}"
                .config="${this._config}"
                @filterChange="${e => this.onFilterChange(e)}">
            </select-token-filter>
        `;
    }

    getDefaultConfig() {
        // const searchField = this.searchField || this.RESOURCES[this.resource].searchField || "";
        // const searchFields = searchField ? searchField.split(",").map(s => s.trim()) : null;
        return {
            disabled: false,
            multiple: false,
            freeTag: true,
            // searchField: searchField,
            limit: 10,
            maxItems: 0, // No limit set
            minimumInputLength: 3, // Only start searching when the user has input 3 or more characters
            placeholder: this.RESOURCES[this.resource].placeholder,
            fields: this.RESOURCES[this.resource].fields,
            // TODO Vero: change name to fetch
            source: async (params, success, failure) => {
                const page = params?.data?.page || 1;
                const queryParams = {
                    ...this.defaultQueryParams,
                    ...this.RESOURCES[this.resource].queryParams,
                    skip: (page - 1) * this._config.limit,
                };
                const options = {};
                // let queries = [];
                if (params?.data?.term) {
                    const currentSearchField = this.RESOURCES[this.resource].getSearchField(params.data.term);
                    console.log("Current search field: ", currentSearchField);
                    const queryParamsField = {
                        [`${currentSearchField}`]: `~/${params?.data?.term}/i`,
                        ...queryParams,
                    };
                    try {
                        const response = await this.cellbaseClient.get(
                            this.RESOURCES[this.resource].category,
                            this.RESOURCES[this.resource].subcategory,
                            "",
                            this.RESOURCES[this.resource].operation,
                            queryParamsField,
                            options);
                        success(response);
                    } catch (error) {
                        console.log(error);
                    }
                }
                /*
                    if (searchFields) {
                        queries = searchFields.map(searchField => {
                            const queryParamsField = {
                                [`${searchField}`]: `~/${params?.data?.term}/i`,
                                ...queryParams,
                            };
                            return this.cellbaseClient
                                .get(this.RESOURCES[this.resource].category,
                                    this.RESOURCES[this.resource].subcategory,
                                    "",
                                    this.RESOURCES[this.resource].operation,
                                    queryParamsField,
                                    options);
                        });
                    }
                }
                Promise.all(queries)
                    .then(response => success(response))
                    .catch(error => {
                        // TODO Vero 20230928: manage failure
                        console.log(error);
                    });
                     */
            },
            filterResults: results => this.#filterResults(results),
            formatResult: result => this.#formatResult(result),
            formatSelection: result => result[this._config.searchField],
        };
    }

}

customElements.define("cellbase-search-autocomplete", CellbaseSearchAutocomplete);
