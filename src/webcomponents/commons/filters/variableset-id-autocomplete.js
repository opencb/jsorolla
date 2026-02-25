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
import "../forms/token-dropdown.js";

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
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    onFilterChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "filterChange", event.detail.value);
    }

    onFetch(params, success, failure) {
        const queryTerm = params?.query || "";
        this.opencgaSession.opencgaClient.studies()
            .variableSets(this.opencgaSession.study.fqn, {
                id: "",
            })
            .then(response => {
                let results = response.getResults();
                if (queryTerm) {
                    const term = queryTerm.toUpperCase();
                    results = results.filter(v => v.id.toUpperCase().includes(term));
                }
                success(results.map(v => ({id: v.id, name: v.id})));
            })
            .catch(error => failure(error));
    }

    render() {
        return html`
            <token-dropdown
                .value="${this.value}"
                .placeholder="${this._config.placeholder}"
                .fetch="${(params, success, failure) => this.onFetch(params, success, failure)}"
                ?disabled="${this._config.disabled}"
                ?editable="${this._config.editable}"
                @filterChange="${event => this.onFilterChange(event)}">
            </token-dropdown>
        `;
    }

    getDefaultConfig() {
        return {
            placeholder: "Search by VariableSet ID...",
            limit: 10,
            disabled: false,
            editable: false,
        };
    }

}

customElements.define("variableset-id-autocomplete", VariableSetIdAutocomplete);
