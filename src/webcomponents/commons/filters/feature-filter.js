/*
 * Copyright 2015-2024 OpenCB
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
import "../../commons/forms/text-field-filter.js";

export default class FeatureFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this.separator = ",";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

    }

    updated(changedProperties) {
        // TODO temp solution to handle CB being not available https://github.com/opencb/jsorolla/issues/426
        if (changedProperties.has("cellbaseClient")) {
            this.cellbaseClient.getMeta("about").then(() => {
                this.cellbaseAvailable = true;
            }).catch(()=> {
                this.cellbaseAvailable = false;
            }).finally(()=> {
                this.requestUpdate();
            });
        }
        // XRefs, Gene and Variant Ids
        if (changedProperties.has("query")) {
            if (this.query.xref) {
                this.value = this.query.xref;
            } else if (this.query.ids) {
                this.value = this.query.ids;
            } else if (this.query.gene) {
                this.value = this.query.gene;
            } else if (this.query.geneName) {
                this.value = this.query.geneName;
            } else {
                this.value = null;
            }
            this.requestUpdate();
        }
    }

    onFilterChange(value) {
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
            freeTag: true,
            fields: item => {
                // item is the object from the list from `preprocessResults()`
                return {
                    id: item._id,
                    name: item.name,
                };
            },
            source: async (params, success, failure) => {
                try {
                    let restResponse;
                    if (this.cellbaseClient) {
                        if (params?.data?.term) {
                            if (this.cellbaseClient.getConfig()?.version?.startsWith("v5")) {
                                restResponse = await this.cellbaseClient.get("feature", "gene", params?.data?.term?.toUpperCase(), "startsWith", {
                                    limit: this._config.limit,
                                }, {});
                            } else {
                                restResponse = await this.cellbaseClient.get("feature", "id", params?.data?.term?.toUpperCase(), "starts_with", {
                                    limit: this._config.limit,
                                }, {});
                            }
                        } else {
                            restResponse = await this.cellbaseClient.get("feature", "gene", "search", "", {limit: this._config.limit}, {});
                        }
                    } else {
                    // Genes belong to Disease Panels
                        const query = {
                            study: this.opencgaSession.study.fqn,
                            include: "genes",
                            limit: this._config.limit,
                            skip: 0
                        };
                        if (params?.data?.term) {
                            restResponse = await this.opencgaSession.opencgaClient.panels().search({...query, genes: `~/^${params?.data?.term}/i`});
                        } else {
                            restResponse = await this.opencgaSession.opencgaClient.panels().search(query);
                        }
                    }
                    success(restResponse);
                } catch (e) {
                    failure(e);
                }
            },
            /* remap results coming from opencga. config.fields fn works for the dropdown, at a different stage. */
            preprocessResults: results => {
                if (this.cellbaseClient) {
                    return results.map(s => ({
                        id: s.name, // force selected gene (token) to be the name not the id.
                        name: s.name,
                        _id: s.id,
                    }));
                }
                return results.flatMap(s => s.genes.map(gen => {
                    return {
                        id: gen.name,
                        name: gen.name,
                        _id: gen.id,
                    };
                })
                );
            }
        };
    }

    render() {
        if (this.cellbaseAvailable) {
            return html`
                <select-token-filter
                    .config=${this._config}
                    .value="${this.value}"
                    @filterChange="${e => this.onFilterChange(e.detail.value)}">
                </select-token-filter>`;
        } else {
            return html`
                <text-field-filter
                        .value="${this.value}"
                        .config=${this._config}
                        @filterChange="${e => this.onFilterChange(e.detail.value)}">
                </text-field-filter>`;
        }
    }

}

customElements.define("feature-filter", FeatureFilter);
