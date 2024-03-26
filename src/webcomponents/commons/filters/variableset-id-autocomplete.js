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
import LitUtils from "../utils/lit-utils.js";


export default class VariableSetIdAutocomplete extends LitElement {

    constructor() {
        super();
        this.#init();
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

    #init() {
        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    variableSetIdObserver() {
        if (this.opencgaSession) {
            let error;
            this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn, {id: ""})
                .then(response => {
                    const variableSets = response.responses[0].results;
                    this.variableSetIds = variableSets.map(variableSet => variableSet.id);
                })
                .catch(reason => {
                    this.variableSetIds = [];
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this.requestUpdate();
                });
        }
    }

    onFilterChange(key, value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    getDefaultConfig() {
        return {
            placeholder: "Search by VariableSet ID...",
            limit: 10,
            fields: item => ({
                "name": item.id,
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
                this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn, {id: ""})
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

customElements.define("variableset-id-autocomplete", VariableSetIdAutocomplete);
