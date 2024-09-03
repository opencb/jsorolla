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
import UtilsNew from "../../../core/utils-new.js";
import "../variant-modal-ontology.js";
import "./ontology-autocomplete-filter.js";
import NotificationUtils from "../utils/notification-utils.js";


export default class GoAccessionsFilter extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            go: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.selectedTerms = "";
        this._config = this.getDefaultConfig();
    }

    update(_changedProperties) {
        if (_changedProperties.has("go")) {
            this.selectedTerms = this.go;
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
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                    message: `${arr.length} has been selected. Only the first 100 will be taken into account.`,
                });
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

    openModal() {
        const ontologyModal = new bootstrap.Modal(`#GO_ontologyModal`);
        ontologyModal.show();
    }

    getDefaultConfig() {
        return {
            placeholder: "GO:0000145",
            ontologyFilter: "GO"
        };
    }

    render() {
        return html`
            <ontology-autocomplete-filter
                .cellbaseClient="${this.cellbaseClient}"
                .value="${this.selectedTerms}"
                .config="${this._config}"
                @filterChange="${this.onFilterChange}">
            </ontology-autocomplete-filter>
            <div class="d-grid">
                <button class="btn btn-primary full-width" id="${this._prefix}buttonOpenGoAccesions" @click="${this.openModal}">
                    <i class="fa fa-search" aria-hidden="true"></i> Browse GO Terms
                </button>
            </div>
            <variant-modal-ontology
                .config="${this._config}"
                .cellbaseClient="${this.cellbaseClient}"
                .selectedTerms="${this.selectedTerms}"
                @filterChange="${this.onFilterChange}">
            </variant-modal-ontology>
        `;
    }

}

customElements.define("go-accessions-filter", GoAccessionsFilter);
