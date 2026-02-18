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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";
import "../variant-modal-ontology.js";
import "./ontology-autocomplete-filter.js";


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
        this._config = this.getDefaultConfig();
    }

    onFilterChange(event) {
        event.stopPropagation();
        let selectedTerms = event.detail?.value;
        if (selectedTerms) {
            const selectedTermsCount = selectedTerms.split(this._config.separator);
            if (selectedTermsCount.length > this._config.maxSelectedTerms) {
                selectedTerms = selectedTerms.slice(0, 99).join(this._config.separator);
            }
        }

        // dispatch the filter change event
        LitUtils.dispatchCustomEvent(this, "filterChange", selectedTerms || "");
    }

    openModal() {
        const ontologyModal = new bootstrap.Modal(`#GO_ontologyModal`);
        ontologyModal.show();
    }

    render() {
        const selectedGoTermsCount = (this.go || "").split(this._config.separator).filter(Boolean).length;
        return html`
            ${selectedGoTermsCount > this._config.maxSelectedTerms ? html`
                <div class="alert alert-warning">
                    <i class="fa fa-exclamation-triangle"></i>
                    <span>${selectedGoTermsCount} GO terms selected. Only the first ${this._config.maxSelectedTerms} will be taken into account.</span>
                </div>
            ` : nothing}
            <div class="mb-1">
                <ontology-autocomplete-filter
                    .cellbaseClient="${this.cellbaseClient}"
                    .value="${this.go}"
                    .config="${this._config}"
                    @filterChange="${event => this.onFilterChange(event)}">
                </ontology-autocomplete-filter>
            </div>
            <div class="d-grid">
                <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2" id="${this._prefix}buttonOpenGoAccesions" @click="${this.openModal}">
                    <i class="fa fa-search"></i>
                    <span>Browse GO Terms</span>
                </button>
            </div>
            <variant-modal-ontology
                .cellbaseClient="${this.cellbaseClient}"
                .selectedTerms="${this.go}"
                .config="${this._config}"
                @filterChange="${event => this.onFilterChange(event)}">
            </variant-modal-ontology>
        `;
    }

    getDefaultConfig() {
        return {
            placeholder: "GO:0000145",
            source: "GO",
            separator: ",",
            maxSelectedTerms: 100,
        };
    }

}

customElements.define("go-accessions-filter", GoAccessionsFilter);
