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
import LitUtils from "../utils/lit-utils.js";
import "../forms/token-dropdown.js";

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
            queryParams: {
                type: Object,
            },
        };
    }

    #init() {
        this.RESOURCES = {};
        this.endpoint = {};
        this.#initResourcesConfig();
        this.searchField = "";
        this.queryParams = {};
    }

    #initResourcesConfig() {
        this.RESOURCES = {
            "PHENOTYPE": {
                category: "feature",
                subcategory: "ontology",
                operation: "search",
                getSearchField: term => /^[^:\s]+:/.test(term) ? "id" : "name",
                placeholder: "Start typing a phenotype ID or name...",
                queryParams: {},
            },
            "DISORDER": {
                category: "feature",
                subcategory: "ontology",
                operation: "search",
                getSearchField: term => /^[^:\s]+:/.test(term) ? "id" : "name",
                placeholder: "Start typing a disorder ID or name ...",
                queryParams: {},
            },
            "GENE": {
                category: "feature",
                subcategory: "gene",
                operation: "search",
                getSearchField: term => {
                    // FIXME: Query gene by id is not working! Temporarily returning ALWAYS name
                    return "name";
                },
                valueField: "name",
                placeholder: "Start typing an ensemble gene ID or name...",
                queryParams: {
                    exclude: "transcripts,annotation",
                },
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

    async onFetch(params, success, failure) {
        const queryTerm = params?.query || "";
        // if (!queryTerm) {
        //     return success([]);
        // }

        const queryParams = {
            limit: 10,
            count: false,
            ...this.RESOURCES[this.resource].queryParams,
            ...this.queryParams,
        };

        // Get the query param field. It will vary with the text typed by the user according to a regex
        this.searchField = this.RESOURCES[this.resource].getSearchField(queryTerm);
        // Set the query params
        const queryParamsField = {
            [this.searchField]: `~/${queryTerm}/i`,
            ...queryParams,
        };

        try {
            const response = await this.cellbaseClient.get(
                this.RESOURCES[this.resource].category,
                this.RESOURCES[this.resource].subcategory,
                "",
                this.RESOURCES[this.resource].operation,
                queryParamsField
            );
            const results = this.#filterResults(response.responses[0].results);
            success(results);
        } catch (error) {
            console.error(error);
            failure(error);
        }
    }

    renderItem(item) {
        return html`
            <div class="d-flex flex-column my-1">
                <div class="d-flex align-items-center">
                    ${item.source ? html`
                        <span class="badge bg-danger me-2 small lh-1">${item.source}</span>
                    ` : nothing}
                    <span class="fw-bold">${item.name || item.id}</span>
                </div>
                <div class="small text-secondary">${item.id || "-"}</div>
            </div>
        `;
    }

    render() {
        if (!this.resource) {
            return html`Resource not provided`;
        }

        return html`
            <token-dropdown
                .value="${this.value}"
                .field="${this.RESOURCES[this.resource].valueField || "id"}"
                .placeholder="${this._config.placeholder}"
                .multiple="${this._config.multiple}"
                .fetch="${(params, success, failure) => this.onFetch(params, success, failure)}"
                .renderItem="${item => this.renderItem(item)}"
                ?disabled="${this._config.disabled}"
                ?editable="${this._config.freeTag}">
            </token-dropdown>
        `;
    }

    getDefaultConfig() {
        return {
            disabled: false,
            multiple: false,
            freeTag: false,
            limit: 10,
            placeholder: this.RESOURCES[this.resource].placeholder,
        };
    }

}

customElements.define("cellbase-search-autocomplete", CellbaseSearchAutocomplete);
