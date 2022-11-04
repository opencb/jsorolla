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
import "../../forms/select-token-filter.js";

// Rodiel 06-05-2022 - DEPRECATED: use catalog-distinct-autocomplete now.
export default class PhenotypeNameAutocomplete extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    endpoint(resource) {
        return {
            INDIVIDUAL: this.opencgaSession.opencgaClient.individuals(),
            SAMPLE: this.opencgaSession.opencgaClient.samples(),
            FAMILY: this.opencgaSession.opencgaClient.families(),
        }[resource] || this.opencgaSession.opencgaClient.samples();
    }

    onFilterChange(key, value) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            limit: 9999,
            /* fields: item => ({
                name: item
            }),*/
            // direct select2 configuration
            select2Config: {
                // enables free tokenisation as phenotypes field actually perform a full-text search (while the autocomplete works in IDs only)
                tags: true
            },
            source: (params, success, failure) => {
                // const page = params?.data?.page || 1;
                const phenotypes = params?.data?.term ? {phenotypes: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    // limit: this._config.limit,
                    count: false,
                    // skip: (page - 1) * this._config.limit,
                    // include: "id,proband",
                    ...phenotypes
                };
                this.endpoint(this._config.resource).distinct("phenotypes.name", filters)
                    .then(response => {
                        if (params?.data?.term) {
                            const term = params.data.term.toUpperCase();
                            // eslint-disable-next-line no-param-reassign
                            response.responses[0].results = response.responses[0].results.filter(item => {
                                return item.toUpperCase().includes(term);
                            });
                        }
                        success(response);
                    })
                    .catch(error => failure(error));
            },
        };
    }

    render() {
        return html`
            <select-token-filter
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .value="${this.value}"
                @filterChange="${e => this.onFilterChange("id", e.detail.value)}">
            </select-token-filter>
        `;
    }

}

customElements.define("phenotype-name-autocomplete", PhenotypeNameAutocomplete);
