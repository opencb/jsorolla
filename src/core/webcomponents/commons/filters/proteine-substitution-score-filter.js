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

export default class ProteineSubstitutionScore extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "pssf-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("ProteineSubstitutionScore change", e.target);
        let event = new CustomEvent('proteineSubstitutionScoreChance', {
            detail: {
                proteineSubstitutionScore: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    checkScore(){
        console.log("TODO implement&refactor from opencga-variant-filter");
    }

    updateQueryFilters(){
        console.log("TODO implement&refactor from opencga-variant-filter");
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
                                @change="${this.updateQueryFilters}">
                            <option value="<"><</option>
                            <option value="<="><=</option>
                            <option value=">" selected>></option>
                            <option value=">=">>=</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input id="${this._prefix}SiftInput" name="Sift" type="text" value=""
                               class="${this._prefix}FilterTextInput form-control input-sm" @keyup="${this.updateQueryFilters}">
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
                                @change="${this.updateQueryFilters}">
                            <option value=">" selected>></option>
                            <option value=">=">>=</option>
                            <option value="<"><</option>
                            <option value="<="><=</option>
                        </select>
                    </div>
                    <div class="col-sm-4" style="padding-left: 5px">
                        <input type="text" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PolyphenInput" name="Polyphen" @keyup="${this.updateQueryFilters}">
                    </div>
                </div>
            
                <form style="padding-top: 15px">
                    <label style="font-weight: normal;">Logical Operator</label>
                    <input type="radio" name="pss" id="${this._prefix}pssOrRadio" value="or" class="${this._prefix}FilterRadio"
                           checked disabled style="margin-left: 10px" @change="${this.updateQueryFilters}"> OR<br>
                    <input type="radio" name="pss" id="${this._prefix}pssAndRadio" value="and"
                           class="${this._prefix}FilterRadio" disabled style="margin-left: 102px" @change="${this.updateQueryFilters}"> AND
                    <br>
                </form>
                <br>
            </div>
        `;
    }
}

customElements.define('proteine-substitution-score', ProteineSubstitutionScore);