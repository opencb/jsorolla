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
import UtilsNew from "../../../core/utilsNew.js";
import "../variant-modal-ontology.js";
import "./accessions-autocomplete-filter.js";
import {NotificationQueue} from "../../../core/NotificationQueue";


export default class GoAccessionsFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            go: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gaf-" + UtilsNew.randomString(6) + "_";
        this.selectedTerms = "";
        this.ontologyTerm = "GO";
        this.ontologyFilter = "go";
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(_changedProperties) {
        if (_changedProperties.has("go")) {
            // this.selectedTerms = this.go ? this.go.split(/[,;]/) : [];
            this.selectedTerms = this.go;
            // this.requestUpdate();
        }
        super.update(_changedProperties);
    }

    onFilterChange(e) {
        console.log("filterChange", e || null);
        let terms = e.detail?.value;
        this.warnMessage = null;
        if (terms) {
            const arr = terms.split(/[;,]/);
            if (arr.length > 100) {
                console.log("more than 100 terms");
                this.warnMessage = html`<i class="fa fa-exclamation-triangle fa-2x"></i><span></span>`;
                new NotificationQueue().push("Warning", `${arr.length} has been selected. Only the first 100 will be taken into account.`, "warning");
                terms = arr.slice(0, 99).join(",");
            }
        }

        this.selectedTerms = terms;
        this.requestUpdate();

        const event = new CustomEvent("filterChange", {
            detail: {
                value: terms ?? null
            }
        });
        this.dispatchEvent(event);
    }

    openModal(e) {
        $("#go_ontologyModal").modal("show");
    }

    getDefaultConfig() {
        return {
            placeholder: "GO:0000145",
            ontologyFilter: "go",
            ebiConfig: {
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
            }
        };
    }

    render() {
        return html`
            <accessions-autocomplete-filter .ontologyFilter="go" .value="${this.selectedTerms}" .config="${this._config}" @filterChange="${this.onFilterChange}"></accessions-autocomplete-filter>

            <button class="btn btn-primary ripple full-width" id="${this._prefix}buttonOpenGoAccesions" @click="${this.openModal}">
                <i class="fa fa-search" aria-hidden="true"></i>  Browse GO Terms
            </button>

            <variant-modal-ontology term="GO"
                                    .config="${this._config}"
                                    .selectedTerms="${this.selectedTerms}"
                                    @filterChange="${this.onFilterChange}">
            </variant-modal-ontology>
        `;
    }

}

customElements.define("go-accessions-filter", GoAccessionsFilter);
