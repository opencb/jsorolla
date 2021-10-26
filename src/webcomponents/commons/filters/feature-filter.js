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
import UtilsNew from "../../../core/utilsNew.js";
import "../../commons/forms/select-token-filter.js";


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
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "feaf-" + UtilsNew.randomString(6) + "_";
        this.separator = ",";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        // XRefs, Gene and Variant Ids
        if (_changedProperties.has("query")) {
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
                    if (params?.data?.term) {
                        restResponse = await this.cellbaseClient.get("feature", "id", params?.data?.term?.toUpperCase(), "starts_with", {limit: this._config.limit}, {});
                    } else {
                        restResponse = await this.cellbaseClient.get("feature", "gene", "search", "", {limit: this._config.limit}, {});
                    }
                    success(restResponse);
                } catch (e) {
                    failure(e);
                }
            },
            /* remap results coming from opencga. config.fields fn works for the dropdown, at a different stage. */
            preprocessResults(results) {
                return results.map(s => ({
                    id: s.name, // force selected gene (token) to be the name not the id.
                    name: s.name,
                    _id: s.id,
                }));

            }
        };
    }

    render() {
        return html`<select-token-filter .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange(e.detail.value)}"></select-token-filter>`;
    }

}

customElements.define("feature-filter", FeatureFilter);
