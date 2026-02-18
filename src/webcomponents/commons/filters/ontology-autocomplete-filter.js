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
import NotificationUtils from "../utils/notification-utils.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import "../forms/token-dropdown.js";

export default class OntologyAutocompleteFilter extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            value: {
                type: Object
            },
            cellbaseClient: {
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

    async onFetch(params, success, failure) {
        const query = {
            limit: this._config.limit,
            source: (this._config.source || "").toLowerCase(),
        };

        // include id in search params if user has typed something
        if (params?.query) {
            query.id = `~/${params.query}/`;
        }

        try {
            const fetchGoOntologies = await this.cellbaseClient.get("feature", "ontology", undefined, "search", query, {});
            const results = fetchGoOntologies.responses[0].results;
            const data = results.map(ontology => ({
                name: ontology.name,
                id: ontology.id,
                IRI: BioinfoUtils.getOboLink(ontology.id),
            }));
            success(data);
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            failure(error);
        }
    }

    render() {
        return html`
            <token-dropdown
                .value="${this.value}"
                .placeholder="${this._config.placeholder}"
                .fetch="${(params, success, failure) => this.onFetch(params, success, failure)}"
                ?disabled="${this._config.disabled}"
                ?editable="${this._config.freeTag}"
                @filterChange="${event => this.onFilterChange(event)}">
            </token-dropdown>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            freeTag: true,
            placeholder: "Start typing",
            maximumSelectionLength: 100,
            source: "GO",
        };
    }

}

customElements.define("ontology-autocomplete-filter", OntologyAutocompleteFilter);
