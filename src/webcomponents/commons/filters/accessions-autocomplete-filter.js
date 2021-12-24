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
import "../../commons/forms/select-token-filter.js";
import UtilsNew from "../../../core/utilsNew.js";
import LitUtils from "../utils/lit-utils.js";
import NotificationUtils from "../utils/notification-utils.js";

export default class AccessionsAutocompleteFilter extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            ontologyFilter: {
                type: String
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

        this.ebiConfig = {
            root: "https://www.ebi.ac.uk/ols/api",
            tree: {
                "hp": ["/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0012823",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040279",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000005",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0040006",
                    "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FHP_0000118",
                    /* "/ontologies/hp/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FUPHENO_0001002"*/],
                "go": ["/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0008150",
                    "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0005575",
                    "/ontologies/go/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FGO_0003674"],
            },
            search: "/search",
        };
    }

    update(_changedProperties) {
        if (_changedProperties.has("ontologyFilter") || _changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(_changedProperties);
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
            fields: item => {
                return {
                    name: item.label,
                    id: item.id,
                    IRI: item.iri,
                };
            },
            freeTag: true, // enables copy/paste of multiple terms
            select2Config: {
                maximumSelectionLength: 100,
                // NOTE some labels in HPO has commas. We ignore that at the moment and keep using "," and ";" as separators, otherwise the operators OR and AND won't work.
                tokenSeparators: this._config?.separator ?? [","],
                ajax: {
                    transport: async (params, success, failure) => {
                        const _params = params;
                        _params.data.page = params.data.page || 1;
                        const q = _params?.data?.term ? _params.data.term : "";
                        try {
                            const request = await fetch(this.ebiConfig.root + this.ebiConfig.search + "?q=*" + q + "*&ontology=" + this.config.ontologyFilter + "&rows=" + this._config.limit + "&queryFields=label,obo_id");
                            const json = await request.json();
                            const results = json.response.docs.map(i => ({text: i.obo_id, id: i.obo_id, iri: i.iri, label: i.label}));
                            success(results);
                        } catch (e) {
                            // console.error(e);
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
                            failure(e);
                        }
                    },
                    processResults: (response, params) => {
                        const _params = params;
                        _params.page = _params.page || 1;
                        return {
                            results: response,
                            /* pagination: {
                                more: (_params.page * this._config.limit) < restResponse.getResponse().numMatches
                            }*/
                        };
                    }
                },
            }
        };
    }

    render() {
        return html`
            <select-token-filter
                    .config=${this._config}
                    .value="${this.value}"
                    @filterChange="${e => this.onFilterChange(e.detail.value)}">
            </select-token-filter>
        `;
    }

}

customElements.define("accessions-autocomplete-filter", AccessionsAutocompleteFilter);
