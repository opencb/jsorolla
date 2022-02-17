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

    update(changedProperties) {
        if (changedProperties.has("value")) {
            console.log(this.value);
        }
        super.update(changedProperties);
    }

    getDefaultConfig() {
        return {
            multiple: false,
            limit: 10,
            placeholder: "Start typing...",
            fields: item => ({
                "name": item.id
            }),
            source: (params, success, failure) => {
                const page = params?.data?.page || 1;
                const id = params?.data?.term ? {id: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: true,
                    skip: (page - 1) * this._config.limit,
                    include: "id",
                    ...id
                };
                this.opencgaSession.opencgaClient.individuals().search(filters)
                    .then(response => success(response))
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

customElements.define("individual-id-autocomplete", IndividualIdAutocomplete);
