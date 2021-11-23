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
import "../../commons/forms/select-token-filter.js";


export default class PhenotypeNameAutocomplete extends LitElement {

    constructor() {
        super();
    }

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
        }[resource];
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
            resource: "INDIVIDUAL",
            limit: 10,
            /* fields: item => ({
                name: item
            }),*/
            // direct select2 configuration
            select2Config: {
                // enables free tokenisation as phenotypes field actually perform a full-text search (while the autocomplete works in IDs only)
                tags: true
            },
            source: async (params, success, failure) => {
                const _params = params;
                _params.data.page = params.data.page || 1;
                const phenotypes = _params?.data?.term ? {phenotypes: "~^" + _params?.data?.term} : "";
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (_params.data.page - 1) * this._config.limit,
                    // include: "id,proband",
                    ...phenotypes
                };
                try {
                    const restResponse = await this.endpoint(this._config.resource).distinct("phenotypes.name", filters);
                    success(restResponse);
                } catch (e) {
                    failure(e);
                }
            },
        };
    }

    render() {
        return html`
            <select-token-filter
                    .opencgaSession="${this.opencgaSession}"
                    .config=${this._config}
                    .value="${this.value}"
                    @filterChange="${e => this.onFilterChange("id", e.detail.value)}">
            </select-token-filter>
        `;
    }

}

customElements.define("phenotype-name-autocomplete", PhenotypeNameAutocomplete);
