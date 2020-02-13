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
            protein_substitution: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "pssf-" + Utils.randomString(6) + "_";
    }

    //TODO proper refactor
    updated(_changedProperties) {
        if (_changedProperties.has("protein_substitution")) {
            if (this.protein_substitution) {
                let pss = this.protein_substitution.split(new RegExp("[,;]"));
                console.log("PSS", pss);
                if (pss.length > 0) {
                    let sift = pss.find(el => el.startsWith("sift"));
                    if (sift) {
                        let value = sift.split("sift")[1];
                        if (value.startsWith("<") || value.startsWith(">")) {
                            this.querySelector("#" + this._prefix + "SiftInput").value = value.split(/[<=>]+/)[1];
                            //PolymerUtils.setValue(this._prefix + "SiftInput", value.split(/[<=>]+/)[1]);
                            this.querySelector("#" + this._prefix + "SiftOperator").value = value.split(/[-0-9.]+/)[0];
                            //PolymerUtils.setValue(this._prefix + "SiftOperator", value.split(/[-0-9.]+/)[0]);
                        } else {
                            //PolymerUtils.setValue(this._prefix + "SiftValues", value.split("==")[1]);
                            this.querySelector("#" + this._prefix + "SiftValues").value = value.split("==")[1];
                        }
                        this.querySelector("#" + this._prefix + "SiftInput").disabled = !(value.startsWith("<") || value.startsWith(">"));
                        this.querySelector("#" + this._prefix + "SiftOperator").disabled = !(value.startsWith("<") || value.startsWith(">"));
                    } else {
                        //PolymerUtils.setValue(this._prefix + "SiftInput", "");
                        this.querySelector("#" + this._prefix + "SiftInput").value = "";
                    }

                    let polyphen = pss.find(el => el.startsWith("polyphen"));
                    if (polyphen) {
                        let value = polyphen.split("polyphen")[1];
                        if (value.startsWith("<") || value.startsWith(">")) {
                            this.querySelector("#" + this._prefix + "PolyphenInput").value = value.split(/[<=>]+/)[1];
                            this.querySelector("#" + this._prefix + "PolyphenOperator").value = value.split(/[-0-9.]+/)[0];
                        } else {
                            this.querySelector("#" + this._prefix + "PolyphenValues").value = value.split("==")[1];
                        }
                        this.querySelector("#" + this._prefix + "PolyphenInput").disabled = !(value.startsWith("<") || value.startsWith(">"));
                        this.querySelector("#" + this._prefix + "PolyphenOperator").disabled = !(value.startsWith("<") || value.startsWith(">"));
                    } else {
                        this.querySelector("#" + this._prefix + "PolyphenInput").value = "";
                    }
                    /*for (let i = 0; i < pss.length; i++) {
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
                    }*/
                }
                if (pss.length === 2) {
                    $("input:radio[name=pss]").attr("disabled", false);
                    if (this.protein_substitution.includes(";")) {
                        $("input:radio[name=pss][value=and]").prop("checked", true);
                    }
                } else {
                    $("input:radio[name=pss]").attr("disabled", true);
                }
            } else {
                $("." + this._prefix + "FilterTextInput").val("");
                $("." + this._prefix + "FilterTextInput").prop("disabled", false);
                $("." + this._prefix + "FilterRadio").prop("checked", false);
                $("." + this._prefix + "FilterRadio").filter("[value=or]").prop("checked", true);
                $("." + this._prefix + "FilterRadio").prop("disabled", true);
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
        } else {
            $("input:radio[name=pss]").attr("disabled", true);
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
                
                <!-- <div class="switch-container">
                    <div class="rating-toggle-container">
                        <label style="font-weight: normal;">Logical Operator</label>
                        <form class="flex-center">
                            <input id="${this._prefix}pssOrRadio" name="pss" type="radio" value="or"
                                   class="radio-or ${this._prefix}FilterRadio" checked disabled
                                   @change="${this.filterChange}"/>
                            <input id="${this._prefix}pssAndRadio" name="pss" type="radio" value="and"
                                   class="radio-and ${this._prefix}FilterRadio" disabled @change="${this.filterChange}"/>
                            <label for="${this._prefix}pssOrRadio"
                                   class="rating-label rating-label-or">OR</label>
                            <div class="rating-toggle"></div>
                            <div class="toggle-rating-pill"></div>
                            <label for="${this._prefix}pssAndRadio"
                                   class="rating-label rating-label-and">AND</label>
                        </form>
                    </div>
                </div> -->
                
                <fieldset class="switch-toggle-wrapper">
                    <label style="font-weight: normal;">Logical Operator</label>
                    <div class="switch-toggle text-white alert alert-light">
                        <input id="${this._prefix}pssOrRadio" name="pss" type="radio" value="or"
                                   class="radio-or ${this._prefix}FilterRadio" checked disabled
                                   @change="${this.filterChange}"/>
                            <label for="${this._prefix}pssOrRadio"
                                   class="rating-label rating-label-or">OR</label>
                        <input id="${this._prefix}pssAndRadio" name="pss" type="radio" value="and"
                                   class="radio-and ${this._prefix}FilterRadio" disabled @change="${this.filterChange}"/>
                            <label for="${this._prefix}pssAndRadio"
                                   class="rating-label rating-label-and">AND</label>
                        <a class="btn btn-primary ripple btn-small"></a>
                    </div>
                </fieldset>
                
                <br>
            </div>
            `;
    }

}

customElements.define("protein-substitution-score-filter", ProteinSubstitutionScoreFilter);
