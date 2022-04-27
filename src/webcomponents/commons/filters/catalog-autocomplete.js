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
import "../forms/select-token-filter.js";
import UtilsNew from "../../../core/utilsNew.js";


export default class CatalogAutocomplete extends LitElement {

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
            searchField: {
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
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
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
            limit: 10,
            source: (params, success, failure) => {
                const resources = {
                    "DISEASE_PANEL": this.opencgaSession.opencgaClient.panels(),
                    "INDIVIDUAL": this.opencgaSession.opencgaClient.individuals(),
                    "SAMPLE": this.opencgaSession.opencgaClient.samples(),
                    "FAMILY": this.opencgaSession.opencgaClient.families(),
                    "CLINICAL_ANALYSIS": this.opencgaSession.opencgaClient.clinical(),
                };

                const page = params?.data?.page || 1;
                const attr = params?.data?.term ? {[this.queryField]: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (page - 1) * this._config.limit,
                    ...attr
                };

                // this.opencgaSession.opencgaClient.panels().distinct(this._config.field, filters)
                resources[this.resource].distinct(this.searchField, filters)
                    .then(response => success(response))
                    .catch(error => failure(error));

            },
            preprocessResults(results) {
                // if results come with null, emtpy or undefined it'll removed.
                const resultsCleaned = results.filter(r => r);
                if (resultsCleaned.length) {
                    if ("string" === typeof resultsCleaned[0]) {
                        return resultsCleaned.map(s => ({id: s}));
                    }
                }
                return resultsCleaned;
            }
        };
    }

    render() {

        if (!this.resource) {
            return html`resource not provided`;
        }

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

customElements.define("catalog-autocomplete", CatalogAutocomplete);
