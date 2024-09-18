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
import "../forms/select-token-filter.js";

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
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    onFilterChange(value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
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
                @filterChange="${e => this.onFilterChange(e.detail.value)}">
            </select-token-filter>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            disablePagination: true,
            source: (params, success, failure) => {
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

                const page = params?.data?.page || 1;
                // 'queryField' is the name of the REST parameter to filter documents, normally this will be the same as 'distinctFields'.
                // But in some cases it can be different. For example, 'disorders' and 'disorders.id'
                const attr = params?.data?.term ? {[this.queryField]: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (page - 1) * this._config.limit,
                    ...attr
                };

                // The exact name of the field, see the example above about 'disorders' and 'disorders.id'
                RESOURCES[this.resource].distinct(this.distinctFields, filters)
                    .then(response => {
                        if (params?.data?.term) {
                            const term = params.data.term.toUpperCase();
                            response.responses[0].results = response.responses[0].results.filter(item => {
                                return item.toUpperCase().includes(term);
                            });
                        }
                        success(response);
                    })
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

}

customElements.define("catalog-distinct-autocomplete", CatalogDistinctAutocomplete);
