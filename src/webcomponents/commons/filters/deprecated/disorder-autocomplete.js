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
import LitUtils from "../../utils/lit-utils";

// Rodiel 02-05-2022 - DEPRECATED: use new catalog-distinct-autocomplete now.
export default class DisorderAutocomplete extends LitElement {

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
            resources: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("resources") || changedProperties.has("config")) {
            // getDefaultConfig uses 'resources'
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    filterResults(response, term) {
        if (term) {
            // eslint-disable-next-line no-param-reassign
            term = term.toUpperCase();
            // eslint-disable-next-line no-param-reassign
            response.responses[0].results = response.responses[0].results.filter(item => {
                return item.toUpperCase().includes(term);
            });
        }
        return response;
    }

    onFilterChange(key, value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
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

    getDefaultConfig() {
        return {
            limit: 9999,
            source: (params, success, failure) => {
                // Prepare query params
                // const page = params?.data?.page || 1;
                const disorders = params?.data?.term ? {disorders: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    // limit: this._config.limit,
                    count: false,
                    // skip: (page - 1) * this._config.limit,
                    ...disorders
                };

                // Execute query
                switch (this.resource?.toUpperCase()) {
                    case "INDIVIDUAL":
                        this.opencgaSession.opencgaClient.individuals().distinct("disorders.id", filters)
                            .then(response => success(this.filterResults(response, params?.data?.term)))
                            .catch(error => failure(error));
                        break;
                    case "FAMILY":
                        this.opencgaSession.opencgaClient.families().distinct("disorders.id", filters)
                            .then(response => success(this.filterResults(response, params?.data?.term)))
                            .catch(error => failure(error));
                        break;
                    case "CLINICAL_ANALYSIS":
                        this.opencgaSession.opencgaClient.clinical().distinct("disorder.id", filters)
                            .then(response => success(this.filterResults(response, params?.data?.term)))
                            .catch(error => failure(error));
                        break;
                    default:
                        console.error("");
                        break;
                }
            },
        };
    }

}

customElements.define("disorder-autocomplete", DisorderAutocomplete);
