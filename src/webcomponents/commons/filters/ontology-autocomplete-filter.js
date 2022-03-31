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
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";

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
            source: {
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

    #init() {
        this.ontologyConfig = {
            root: "https://ws.zettagenomics.com/cellbase/webservices/rest/v5/hsapiens/feature/ontology",
            search: "/search",
        };
    }

    update(_changedProperties) {
        if (_changedProperties.has("source") || _changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(_changedProperties);
    }

    onFilterChange(value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            fields: item => ({
                name: item?.name,
                id: item?.id,
                IRI: BioinfoUtils.getOboLink(this.item?.id)
            }),
            // * enables copy/paste of multiple terms
            freeTag: true,
            select2Config: {
                maximumSelectionLength: 100,
                tokenSeparators: this._config?.separator ?? [","],
                ajax: {
                    transport: async (params, success, failure) => {
                        const _params = params;
                        _params.data.page = params.data.page || 1;
                        const term = _params?.data?.term ? _params.data.term : "";
                        try {
                            const fetchGoOntologies = await fetch(`${this.ontologyConfig.root}${this.ontologyConfig.search}?id=^${term}` +
                            "&limit=" + this._config.limit + `&source=${this.source}`);
                            const goOntologies = await fetchGoOntologies.json();
                            const results = goOntologies.responses[0].results;
                            const data = results.map(term => ({name: term.name, id: term.id}));
                            success(data);
                        } catch (e) {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
                            failure(e);
                        }
                    },
                    processResults: (response, params) => {
                        const _params = params;
                        _params.page = _params.page || 1;
                        return {
                            results: response,
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

customElements.define("ontology-autocomplete-filter", OntologyAutocompleteFilter);
