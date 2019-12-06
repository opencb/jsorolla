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

export default class HpoAccessionsFilter extends LitElement {

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
        this._prefix = "hpof-" + Utils.randomString(6) + "_";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("query")) {
            if (this.query["annot-hpo"]) {
                this.querySelector("#" + this._prefix + "HumanPhenotypeOntologyTextarea").value = this.query["annot-hpo"];

                //parse operator
                if (this.query["annot-hpo"].split(",").length > 2) {
                    let operator;
                    // TODO create an Util function getOperator(str) to discriminate the operator in a query filter string
                    const or = this.query["annot-hpo"].split(",");
                    const and = this.query["annot-hpo"].split(";");
                    if (or.length >= and.length) {
                        operator = "or";
                    } else {
                        operator = "and";
                    }
                    $("input:radio[value=" + operator + "]").attr("disabled", false);
                    $("input:radio[value=" + operator + "]").checked = true;
                    this.selectedTerms = this.query["annot-hpo"].split(operator);
                } else {
                    //disable radio buttons if there are less than 2 values
                    $("input:radio").attr("disabled", true);
                }
            } else {
                this.selectedTerms = [];
                this.querySelector("#" + this._prefix + "HumanPhenotypeOntologyTextarea").value = "";
                $("input:radio").attr("disabled", true);
            }
        }
    }

    filterChange(e) {
        let annotHpo;
        const inputTextArea = this.querySelector("#" + this._prefix + "HumanPhenotypeOntologyTextarea");
        if (inputTextArea && inputTextArea.value) {
            const hpoValues = inputTextArea.value.split(",");
            if (UtilsNew.isNotEmptyArray(hpoValues)) {
                $("input:radio[name=hpoRadio]").attr("disabled", false);
                const filter = $("input:radio[name=hpoRadio]:checked").val();
                if (filter === "and") {
                    annotHpo = hpoValues.join(";");
                } else {
                    annotHpo = hpoValues.join(",");
                }
            }
        }

        console.log("filterChange", annotHpo);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: annotHpo || null
            }
        });
        this.dispatchEvent(event);
    }

    onClickOkModal(e) {
        this.selectedTerms = e.detail.result;
        this.querySelector("#" + this._prefix + "HumanPhenotypeOntologyTextarea").value = e.detail.result.join(","); //join by comma no matter the operator (in textarea only)
        this.filterChange();
        $("#" + this._prefix + "ontologyModal").modal("hide");

    }

    // from variant-filter
    openModal(e) {
        console.log("onOntologyModalOpen variant-filter", e.detail);
        // modal window from variant-modal-ontology
        this.openHPO = true;
        this.ontologyTerm = "HPO";
        this.ontologyFilter = "hp";
        this.requestUpdate();
        $("#" + this._prefix + "ontologyModal").modal("show");
    }

    render() {
        return html`
            <textarea id="${this._prefix}HumanPhenotypeOntologyTextarea"
                      class="form-control clearable ${this._prefix}FilterTextInput"
                      rows="3" name="hpo" placeholder="HP:0000001, HP:3000079" @input="${this.filterChange}"></textarea>
            <button class="btn btn-primary ripple full-width" id="${this._prefix}buttonOpenHpoAccesions" @click="${this.openModal}">
                <i class="fa fa-search searchingButton" aria-hidden="true"></i>
                Add HPO Term
            </button>
            <form style="padding-top: 15px">
                <label style="font-weight: normal;">Logical Operator</label>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoOrRadio" value="or" class="${this._prefix}FilterRadio"
                       checked style="margin-left: 10px" @change="${this.filterChange}"> OR<br>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoAndRadio" value="and"
                       class="${this._prefix}FilterRadio" style="margin-left: 102px" @change="${this.filterChange}"> AND <br>
            </form>
            
            <variant-modal-ontology _prefix=${this._prefix}
                                ontologyFilter="${this.ontologyFilter}"
                                term="${this.ontologyTerm}"
                                .selectedTerms="${this.selectedTerms}"
                                @clickOkModal="${this.onClickOkModal}">
            </variant-modal-ontology>
        `;
    }

}

customElements.define("hpo-accessions-filter", HpoAccessionsFilter);
