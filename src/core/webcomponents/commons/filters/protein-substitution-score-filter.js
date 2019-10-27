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

export default class ProteinSubstitutionScoreFilter extends LitElement {

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

    _init() {
        this._prefix = "pssf-" + Utils.randomString(6) + "_";
    }

    //TODO refactor
    firstUpdated(_changedProperties) {
        if (this.query && this.query["protein_substitution"]) {
            let pss = this.query["protein_substitution"].split(new RegExp("[,;]"));
            if (pss.length > 0) {
                for (let i = 0; i < pss.length; i++) {
                    if (pss[i].startsWith("sift")) {
                        let value = pss[i].split("sift")[1];
                        if (value.startsWith("<") || value.startsWith(">")) {
                            PolymerUtils.setValue(this._prefix + "SiftInput", value.split(/[<=>]+/)[1]);
                            PolymerUtils.setValue(this._prefix + "SiftOperator", value.split(/[-0-9.]+/)[0]);
                        } else {
                            PolymerUtils.setValue(this._prefix + "SiftValues", value.split("==")[1]);
                        }
                        this.querySelector("#" + this._prefix + "SiftInput").disabled = !(value.startsWith("<") || value.startsWith(">"));
                        this.querySelector("#" + this._prefix + "SiftOperator").disabled = !(value.startsWith("<") || value.startsWith(">"));
                    } else if (pss[i].startsWith("polyphen")) {
                        let value = pss[i].split("polyphen")[1];
                        if (value.startsWith("<") || value.startsWith(">")) {
                            PolymerUtils.setValue(this._prefix + "PolyphenInput", value.split(/[<=>]+/)[1]);
                            PolymerUtils.setValue(this._prefix + "PolyphenOperator", value.split(/[-0-9.]+/)[0]);
                        } else {
                            PolymerUtils.setValue(this._prefix + "PolyphenValues", value.split("==")[1]);
                        }
                        this.querySelector("#" + this._prefix + "PolyphenInput").disabled = !(value.startsWith("<") || value.startsWith(">"));
                        this.querySelector("#" + this._prefix + "PolyphenOperator").disabled = !(value.startsWith("<") || value.startsWith(">"));
                    }
                }
            }
            if (pss.length === 2) {
                $("input:radio[name=pss]").attr("disabled", false);
                if (this.query["protein_substitution"].includes(";")) {
                    $("input:radio[name=pss][value=and]").prop("checked", true);
                }
            }
        }
    }

    checkScore(e) {
        let inputElement = $("#" + this._prefix + e.target.name + "Input");
        let operatorElement = $("#" + this._prefix + e.target.name + "Operator");
        if (e.target.value === "score") {
            inputElement.prop("disabled", false);
            operatorElement.prop("disabled", false);
        } else {
            inputElement.val("");
            operatorElement.val("<");
            inputElement.prop("disabled", true);
            operatorElement.prop("disabled", true);
        }
        this.filterChange();
    }

    //TODO refactor
    filterChange(e) {
        let pss = [];
        let protein_substitution;
        let numFilters = 0;
        let subsScores = ["Sift", "Polyphen"];
        subsScores.forEach((subsScore) => {
            let dropdownValues = PolymerUtils.getElementById(this._prefix + subsScore + "Values");
            let textboxInput = PolymerUtils.getElementById(this._prefix + subsScore + "Input");
            let operator = PolymerUtils.getElementById(this._prefix + subsScore + "Operator");
            if (dropdownValues !== null && dropdownValues.value === "score" && UtilsNew.isNotEmpty(textboxInput.value)) {
                pss.push(subsScore.toLowerCase() + operator.value + textboxInput.value);
                numFilters++;
            } else if (dropdownValues !== null && dropdownValues.value !== "score") {
                pss.push(subsScore.toLowerCase() + "==" + dropdownValues.value);
                numFilters++;
            }
        });
        // If both Sift and Polyphen are selected then we activate the AND/OR control
        if (numFilters === 2) {
            $("input:radio[name=pss]").attr("disabled", false);
        }
        if (pss.length > 0) {
            let filter = $("input:radio[name=pss]:checked").val();
            if (filter === "and") {
                protein_substitution = pss.join(";");
            } else {
                protein_substitution = pss.join(",");
            }
        }
        console.log("filterChange", protein_substitution);
        let event = new CustomEvent("filterChange", {
            detail: {
                value: protein_substitution
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div style="padding-top: 10px">
                <span style="padding-left: 0px;">SIFT</span>
                <div class="row">
                    <div class="col-md-5" style="padding-right: 5px">
                        <select name="Sift" id="${this._prefix}SiftValues"
                                class="${this._prefix}FilterSelect form-control input-sm options" @change="${this.checkScore}">
                            <option value="score" selected>Score...</option>
                            <option value="tolerated">Tolerated</option>
                            <option value="deleterious">Deleterious</option>
                        </select>
                    </div>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="siftOperator" id="${this._prefix}SiftOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">                            
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input id="${this._prefix}SiftInput" name="Sift" type="number" value=""
                               class="${this._prefix}FilterTextInput form-control input-sm" @input="${this.filterChange}">
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 15px">
                <span style="padding-top: 10px;padding-left: 0px;">Polyphen</span>
                <div class="row">
                    <div class="col-sm-5" style="padding-right: 5px">
                        <select name="Polyphen" id="${this._prefix}PolyphenValues"
                                class="${this._prefix}FilterSelect form-control input-sm options" @change="${this.checkScore}">
                            <option value="score" selected>Score...</option>
                            <option value="benign">Benign</option>
                            <option value="unknown">Unknown</option>
                            <option value="possibly damaging">Possibly damaging</option>
                            <option value="probably damaging">Probably damaging</option>
                            <option value="possibly damaging,probably damaging">Possibly & Probably damaging</option>
                        </select>
                    </div>
                    <div class="col-sm-3" style="padding: 0px 5px">
                        <select name="polyphenOperator" id="${this._prefix}PolyphenOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-sm-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PolyphenInput" name="Polyphen" @input="${this.filterChange}">
                    </div>
                </div>
            
                <form style="padding-top: 15px">
                    <label style="font-weight: normal;">Logical Operator</label>
                    <input type="radio" name="pss" id="${this._prefix}pssOrRadio" value="or" class="${this._prefix}FilterRadio"
                           checked disabled style="margin-left: 10px" @change="${this.filterChange}"> OR<br>
                    <input type="radio" name="pss" id="${this._prefix}pssAndRadio" value="and"
                           class="${this._prefix}FilterRadio" disabled style="margin-left: 102px" @change="${this.filterChange}"> AND
                    <br>
                </form>
                <br>
            </div>
            `;
    }
}

customElements.define("protein-substitution-score-filter", ProteinSubstitutionScoreFilter);
