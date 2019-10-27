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

export default class HpoAccessionsFilter extends LitElement {

    constructor() {
        super()

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
        this._prefix = "hpof-" + Utils.randomString(6) + "_";
    }

    firstUpdated(_changedProperties) {
        if (this.query && typeof this.query["annot-hpo"] !== "undefined") {
            PolymerUtils.setValue(this._prefix + "HumanPhenotypeOntologyTextarea", this.query["annot-hpo"]);
        }
    }

    filterChange(e) {
        let annot_hpo;
        let inputTextArea = PolymerUtils.getElementById(this._prefix + "HumanPhenotypeOntologyTextarea");
        if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
            let hpoValues = inputTextArea.value.split(",");
            if (UtilsNew.isNotEmptyArray(hpoValues)) {
                $("input:radio[name=hpoRadio]").attr("disabled", false);
                let filter = $("input:radio[name=hpoRadio]:checked").val();
                if (filter === "and") {
                    annot_hpo = hpoValues.join(";");
                } else {
                    annot_hpo = hpoValues.join(",");
                }
            }
            // _filters["annot-hpo"] = inputTextArea.value;
        }

        console.log("filterChange", annot_hpo);
        let event = new CustomEvent('filterChange', {
            detail: {
                value: annot_hpo
            }
        });
        this.dispatchEvent(event);
    }

    openModalHpo() {
        this.openHPO = true;
        this.ontologyTerm = "HPO";
        this.selectedTermsOntology = this.selectedTermsHPO;
        this.ontologyFilter = "hp";
        this.openModalOntology();
    }

    openModalOntology() {
        $("#ontologyModal").modal("show");
    }

    render() {
        return html`
            <textarea id="${this._prefix}HumanPhenotypeOntologyTextarea"
                      class="form-control clearable ${this._prefix}FilterTextInput"
                      rows="3" name="hpo" placeholder="HP:0000001, HP:3000079" @keyup="${this.filterChange}"></textarea>
            <span class="input-group-addon btn btn-primary searchingSpan" id="${this._prefix}buttonOpenHpoAccesions"
                  @click="${this.openModalHpo}">
                                    <strong style="color: white">Add HPO Term</strong>
                                    <i class="fa fa-search searchingButton" aria-hidden="true"></i>
                                </span>
            <form style="padding-top: 15px">
                <label style="font-weight: normal;">Logical Operator</label>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoOrRadio" value="or" class="${this._prefix}FilterRadio"
                       checked style="margin-left: 10px" @change="${this.filterChange}"> OR<br>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoAndRadio" value="and"
                       class="${this._prefix}FilterRadio" style="margin-left: 102px" @change="${this.filterChange}"> AND <br>
            </form>
        `;
    }
}

customElements.define('hpo-accessions-filter', HpoAccessionsFilter);
