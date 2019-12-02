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
                const q = this.query["go"].replace(/\r?\n/g, ",").replace(/\s/g, "");
                this.selectedTerms = q.split(",");
            } else {
                this.selectedTerms = [];
                this.querySelector("#" + this._prefix + "GeneOntologyTextarea").value = "";
            }
        }
    }

    filterChange() {
        const inputTextArea = PolymerUtils.getElementById(this._prefix + "GeneOntologyTextarea");
        const go_message = this.querySelector("#" + this._prefix + "GeneOntologyMonitor");
        if (inputTextArea && inputTextArea.value) {
            // Process the textarea: remove newline chars, empty chars, leading/trailing commas
            let _go = inputTextArea.value.trim()
                .replace(/\r?\n/g, ",")
                .replace(/\s/g, "")
                .split(",")
                .filter(_ => _);
            console.log("_go", _go)
            console.log("LENGTH", _go.length)
            if (_go.length < 100) {
                go_message.innerHTML = "";
                go_message.style.display = "none";
                _go = _go.join(",");
            } else {
                const msg = `${_go.length} has been selected. Only the first 100 will be taken into account.`;
                // NotificationUtils.showNotify(msg, "WARNING");
                go_message.style.display = "block";
                go_message.innerHTML = `<i class="fa fa-exclamation-triangle fa-2x"></i><span>${msg}</span>`;
                _go = _go.slice(0, 99).join(",");
            }
            console.log("filterChange", _go || null);
            const event = new CustomEvent("filterChange", {
                detail: {
                    value: _go || null
                }
            });
            this.dispatchEvent(event);
        }
    }

    onClickOkModal(e) {
        this.selectedTerms = e.detail.result;
        this.querySelector("#" + this._prefix + "GeneOntologyTextarea").value = e.detail.result.join(","); // join by comma no matter the operator (in textarea only)
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
        // this.openModal = true;
    }

    render() {
        return html`
            <style>
            .geneOntologyMonitor {
                padding: 10px;
                font-weight: bold;
                display: none;
                text-align: center;
            }

            .geneOntologyMonitor span {
                display: block;
            }
            </style>
            <textarea id="${this._prefix}GeneOntologyTextarea" class="form-control clearable ${this._prefix}FilterTextInput"
                                rows="3" name="geneOntology" placeholder="GO:0000145" @input="${this.filterChange}"></textarea>
            <span class="input-group-addon btn btn-primary searchingSpan" id="${this._prefix}buttonOpenGoAccesions" @click="${this.onOntologyModalOpen}">
                <strong style="color: white">Add GO Term</strong>
                <i class="fa fa-search searchingButton" aria-hidden="true"></i>
            </span>
            <p class="bg-warning geneOntologyMonitor" id="${this._prefix}GeneOntologyMonitor"></p>

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
