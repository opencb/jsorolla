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

import {LitElement, html} from '/web_modules/lit-element.js';

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
        }
    }

    _init(){
        this._prefix = "gaf-" + Utils.randomString(6) + "_";
    }

    firstUpdated(_changedProperties) {
        if (this.query && typeof this.query["go"] !== "undefined") {
            PolymerUtils.setValue(this._prefix + "GeneOntologyTextarea", this.query["go"]);
        }
    }

    filterChange(e) {
        let go;
        let inputTextArea = PolymerUtils.getElementById(this._prefix + "GeneOntologyTextarea");
        if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
            go = inputTextArea.value.trim();
            go = go.replace(/\r?\n/g, ",").replace(/\s/g, "");
        }
        console.log("filterChange", go || null);
        let event = new CustomEvent('filterChange', {
            detail: {
                value: go || null
            }
        });
        this.dispatchEvent(event);
    }


    /*openModalOntology() {
        //modal in variant-modal-ontology component
        $("#ontologyModal").modal("show");
    }*/

    onOntologyModal() {
        console.log("onOntologyModal")
       /* this.openHPO = false;
        this.ontologyTerm = "GO";
        this.selectedTermsOntology = this.selectedTermsGO;
        this.ontologyFilter = "go";*/
        let event = new CustomEvent('ontologyModal', {
            detail: {
                openHPO: false,
                ontologyTerm: "GO",
                selectedTermsOntology: this.selectedTermsGO,
                ontologyFilter: "go"
            }
        });
        this.dispatchEvent(event);

    }

    render() {
        return html`
            <textarea id="${this._prefix}GeneOntologyTextarea" class="form-control clearable ${this._prefix}FilterTextInput"
                                rows="3" name="geneOntology" placeholder="GO:0000145" @keyup="${this.filterChange}">
            </textarea>
            <span class="input-group-addon btn btn-primary searchingSpan" id="${this._prefix}buttonOpenGoAccesions" @click="${this.onOntologyModal}">
                <strong style="color: white">Add GO Term</strong>
                <i class="fa fa-search searchingButton" aria-hidden="true"></i>
            </span>
        `;
    }
}

customElements.define('go-accessions-filter', GoAccessionsFilter);
