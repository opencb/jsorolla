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

export default class IndividualIdAutocomplete extends LitElement {

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
            fields: item => ({
                "name": item.id
            }),
            source: async (params, success, failure) => {
                const _params = params;
                _params.data.page = params.data.page || 1;
                const id = _params?.data?.term ? {id: "~^" + _params?.data?.term?.toUpperCase()} : "";
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: true,
                    skip: (_params.data.page - 1) * this._config.limit,
                    include: "id",
                    ...id
                };
                try {
                    const restResponse = await this.opencgaSession.opencgaClient.individuals().search(filters);
                    success(restResponse);
                } catch (e) {
                    failure(e);
                }
            },
        };
    }

    render() {
        return html`
            <select-token-filter .opencgaSession="${this.opencgaSession}" .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></select-token-filter>
        `;
    }

}

customElements.define("individual-id-autocomplete", IndividualIdAutocomplete);
