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
import "../../forms/select-token-filter.js";

// Nacho 20-04-2022 - DEPRECATED: use new disorder-autocomplete now.
export default class DisorderIdFamiliesAutocomplete extends LitElement {

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
            limit: 10,
            /* fields: item => ({
                name: item
            }),*/
            source: (params, success, failure) => {
                const page = params?.data?.page || 1;
                const disorders = params?.data?.term ? {disorders: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (page - 1) * this._config.limit,
                    ...disorders
                };
                this.opencgaSession.opencgaClient.families().distinct("disorders.id", filters)
                    .then(response => {
                        // TODO filtering clientside in all filters that use distinct endpoints
                        // const r = response.getResults().filter(r => r.toLowerCase().startsWith(params?.data?.term?.toLowerCase() ?? ""));
                        // response.responses[0].results = r;
                        // response.responses[0].numMatches = r.length
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

customElements.define("disorder-id-families-autocomplete", DisorderIdFamiliesAutocomplete);
