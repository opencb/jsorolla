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

import {LitElement, html} from "/web_modules/lit-element.js";

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
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gaf-" + Utils.randomString(6) + "_";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("query")) {
            if (this.query["go"]) {
                this.querySelector("#" + this._prefix + "GeneOntologyTextarea").value = this.query["go"];
                let q = this.query["go"].replace(/\r?\n/g, ",").replace(/\s/g, "");
                this.selectedTerms = q.split(",");
            } else {
                this.selectedTerms = [];
                this.querySelector("#" + this._prefix + "GeneOntologyTextarea").value = "";
            }
        }
    }

    filterChange() {
        let go;
        const inputTextArea = this.querySelector("#" + this._prefix + "GeneOntologyTextarea");
        if (inputTextArea && inputTextArea.value) {
            go = inputTextArea.value.trim();
            go = go.replace(/\r?\n/g, ",").replace(/\s/g, "");
        }
        console.log("filterChange", go || null);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: go || null
            }
        });
        this.dispatchEvent(event);
    }

    onClickOkModal(e) {
        this.selectedTerms = e.detail.result;
        this.querySelector("#" + this._prefix + "GeneOntologyTextarea").value = e.detail.result.join(","); //join by comma no matter the operator (in textarea only)
        this.filterChange();
        $("#" + this._prefix + "ontologyModal").modal("hide");
    }

    onOntologyModalOpen(e) {
        console.log("onOntologyModalOpen variant-filter", e.detail);
        // modal window from variant-modal-ontology
        this.openHPO = false;
        this.ontologyTerm = "GO";
        this.ontologyFilter = "go";
        this.requestUpdate();
        $("#" + this._prefix + "ontologyModal").modal("show");
        //this.openModal = true;
    }

    render() {
        return html`
            <textarea id="${this._prefix}GeneOntologyTextarea" class="form-control clearable ${this._prefix}FilterTextInput"
                                rows="3" name="geneOntology" placeholder="GO:0000145" @input="${this.filterChange}"></textarea>
            <span class="input-group-addon btn btn-primary searchingSpan" id="${this._prefix}buttonOpenGoAccesions" @click="${this.onOntologyModalOpen}">
                <strong style="color: white">Add GO Term</strong>
                <i class="fa fa-search searchingButton" aria-hidden="true"></i>
            </span>
            
            <variant-modal-ontology _prefix=${this._prefix}
                                ontologyFilter="${this.ontologyFilter}"
                                term="${this.ontologyTerm}"
                                .selectedTerms="${this.selectedTerms}"
                                @clickOkModal="${this.onClickOkModal}">
            </variant-modal-ontology>
        `;
    }

}

customElements.define("go-accessions-filter", GoAccessionsFilter);
