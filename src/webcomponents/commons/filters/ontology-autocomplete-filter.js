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
import "../../commons/forms/select-token-filter.js";
import LitUtils from "../utils/lit-utils.js";
import NotificationUtils from "../utils/notification-utils.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
// FIXME remove in CellBase v5
import {CellBaseClient} from "../../../core/clients/cellbase/cellbase-client.js";


export default class OntologyAutocompleteFilter extends LitElement {

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

    update(_changedProperties) {
        if (_changedProperties.has("source") || _changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(_changedProperties);
    }

    onFilterChange(value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
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

    getDefaultConfig() {
        return {
            limit: 10,
            fields: item => ({
                name: item?.name,
                id: item?.id,
                IRI: BioinfoUtils.getOboLink(item?.id)
            }),
            // * enables copy/paste of multiple terms
            freeTag: true,
            maximumSelectionLength: 100,
            tokenSeparators: this._config?.separator ?? [","],
            ajax: {
                transport: async (params, success, failure) => {
                    const _params = params;
                    _params.data.page = params.data.page || 1;
                    const query = {
                        id: `^${_params?.data?.term ? _params.data.term : ""}`,
                        limit: this._config.limit,
                        source: this._config.ontologyFilter
                    };
                    try {
                        // FIXME to support old cellbase v4
                        let fetchGoOntologies;
                        if (this.cellbaseClient?._config?.version === "v4") {
                            const cellbaseClient = new CellBaseClient({host: "https://ws.opencb.org/cellbase-5.0.0/", version: "v5"});
                            fetchGoOntologies = await cellbaseClient.get("feature", "ontology", undefined, "search", query, {});
                        } else {
                            fetchGoOntologies = await this.cellbaseClient.get("feature", "ontology", undefined, "search", query, {});
                        }
                        const results = fetchGoOntologies.responses[0].results;
                        const data = results.map(ontology => ({name: ontology.name, id: ontology.id}));
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
        };
    }

}

customElements.define("ontology-autocomplete-filter", OntologyAutocompleteFilter);
