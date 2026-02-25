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
import "../../commons/forms/token-dropdown.js";
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
        this._value = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("query")) {
            if (this.query.xref) {
                this._value = this.query.xref;
            } else if (this.query.ids) {
                this._value = this.query.ids;
            } else if (this.query.gene) {
                this._value = this.query.gene;
            } else if (this.query.geneName) {
                this._value = this.query.geneName;
            } else {
                this._value = null;
            }
        }
        super.update(changedProperties);
    }

    onFilterChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "filterChange", event.detail.value);
    }

    async onFetch(params, success, failure) {
        try {
            const queryTerm = params?.query?.toUpperCase();
            let restResponse;

            if (this.cellbaseClient) {
                if (queryTerm) {
                    restResponse = await this.cellbaseClient.get("feature", "gene", queryTerm, "startsWith", {
                        limit: this._config.limit,
                    });
                } else {
                    restResponse = await this.cellbaseClient.get("feature", "gene", "search", "", {
                        limit: this._config.limit,
                    });
                }

                const results = restResponse.responses[0].results.map(feature => ({
                    id: feature.id,
                    name: feature.name,
                }));
                success(results);
            } else {
                // Genes belong to Disease Panels
                const query = {
                    study: this.opencgaSession.study.fqn,
                    include: "genes",
                    limit: this._config.limit,
                    skip: 0
                };

                if (queryTerm) {
                    restResponse = await this.opencgaSession.opencgaClient.panels().search({
                        ...query,
                        genes: `~/^${queryTerm}/i`,
                    });
                } else {
                    restResponse = await this.opencgaSession.opencgaClient.panels().search(query);
                }

                const results = restResponse.getResults().flatMap(panel => (panel.genes || []).map(gene => ({
                    id: gene.id,
                    name: gene.name,
                })));
                success(results);
            }
        } catch (e) {
            failure(e);
        }
    }

    renderItem(item) {
        return html`
            <div class="d-flex flex-column my-1">
                <span class="fw-bold">${item.name}</span>
                <span class="small text-secondary">${item.id}</span>
            </div>
        `;
    }

    render() {
        if (this.cellbaseClient) {
            return html`
                <token-dropdown
                    .value="${this._value}"
                    .placeholder="${this._config.placeholder}"
                    .fetch="${(params, success, failure) => this.onFetch(params, success, failure)}"
                    .renderItem="${item => this.renderItem(item)}"
                    ?disabled="${this._config.disabled}"
                    ?editable="${this._config.freeTag}"
                    @filterChange="${event => this.onFilterChange(event)}">
                </token-dropdown>
            `;
        } else {
            return html`
                <text-field-filter
                    .value="${this._value}"
                    .config=${this._config}
                    @filterChange="${e => this.onFilterChange(e.detail.value)}">
                </text-field-filter>
            `;
        }
    }

    getDefaultConfig() {
        return {
            limit: 10,
            freeTag: true,
            placeholder: "Start typing",
        };
    }

}

customElements.define("feature-filter", FeatureFilter);
