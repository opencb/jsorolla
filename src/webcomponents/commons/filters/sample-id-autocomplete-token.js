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

import {LitElement, html} from "/web_modules/lit-element.js";
import "../forms/select-token-filter2.js";


export default class SampleIdAutocompleteToken extends LitElement {

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
            placeholder: "",
            limit: 10,
            addButton: false,
            fields: item => ({
                "name": item.id,
                "Individual ID": item?.individualId
            }),
            source: async (params, success, failure) => {
                params.data.page = params.data.page || 1;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: true,
                    skip: (params.data.page - 1) * this._config.limit,
                    include: "id,individualId",
                    id: "~^" + params?.data?.term?.toUpperCase()
                };
                try {
                    const restResponse = await this.opencgaSession.opencgaClient.samples().search(filters);
                    success(restResponse);
                } catch (e) {
                    failure(e);
                }
            },
        };
    }

    render() {
        return html`
            <select-token-filter2 .opencgaSession="${this.opencgaSession}" .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></select-token-filter2>
        `;
    }

}

customElements.define("sample-id-autocomplete-token", SampleIdAutocompleteToken);
