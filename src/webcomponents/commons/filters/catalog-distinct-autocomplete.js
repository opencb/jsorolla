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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/token-dropdown.js";

export default class CatalogDistinctAutocomplete extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            value: {
                type: Object
            },
            distinctFields: {
                type: String,
            },
            queryField: {
                type: String,
            },
            resource: {
                type: String,
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    onFetch(params, success, failure) {
        const RESOURCES = {
            "SAMPLE": this.opencgaSession.opencgaClient.samples(),
            "INDIVIDUAL": this.opencgaSession.opencgaClient.individuals(),
            "FAMILY": this.opencgaSession.opencgaClient.families(),
            "CLINICAL_ANALYSIS": this.opencgaSession.opencgaClient.clinical(),
            "DISEASE_PANEL": this.opencgaSession.opencgaClient.panels(),
            "JOB": this.opencgaSession.opencgaClient.jobs(),
            "FILE": this.opencgaSession.opencgaClient.files(),
            "COHORT": this.opencgaSession.opencgaClient.cohorts(),
            "WORKFLOW": this.opencgaSession.opencgaClient.workflows(),
        };

        const query = params?.query || "";
        // 'queryField' is the name of the REST parameter to filter documents, normally this will be the same as 'distinctFields'.
        // But in some cases it can be different. For example, 'disorders' and 'disorders.id'
        const attr = query ? {[this.queryField]: "~/" + query + "/i"} : null;
        const filters = {
            study: this.opencgaSession.study.fqn,
            limit: this._config.limit,
            count: false,
            ...attr
        };

        // The exact name of the field, see the example above about 'disorders' and 'disorders.id'
        RESOURCES[this.resource].distinct(this.distinctFields, filters)
            .then(response => {
                let results = response.getResults();
                if (query) {
                    const term = query.toUpperCase();
                    results = results.filter(item => {
                        return item.toUpperCase().includes(term);
                    });
                }

                // preprocessResults logic
                results = results.filter(r => !!r);
                if (results.length > 0 && typeof results[0] === "string") {
                    results = results.map(s => ({id: s, name: s}));
                }

                success(results);
            })
            .catch(error => failure(error));
    }

    onFilterChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "filterChange", event.detail.value);
    }

    render() {
        if (!this.resource || !this.opencgaSession) {
            return html`Resource not provided`;
        }

        return html`
            <token-dropdown
                .value="${this.value}"
                .placeholder="${this._config.placeholder}"
                .fetch="${(params, success, failure) => this.onFetch(params, success, failure)}"
                ?disabled="${this._config.disabled}"
                ?editable="${this._config.editable || this._config.freeTag}"
                ?multiple="${this._config.multiple}"
                @filterChange="${event => this.onFilterChange(event)}">
            </token-dropdown>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            disabled: false,
            editable: false,
            freeTag: false,
            multiple: true,
            placeholder: "Start typing",
        };
    }

}

customElements.define("catalog-distinct-autocomplete", CatalogDistinctAutocomplete);
