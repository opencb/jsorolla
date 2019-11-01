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
import {switchWidget} from '/src/styles/styles.js'

export default class ConservationFilter extends LitElement {

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
        this._prefix = "ff-" + Utils.randomString(6) + "_";
    }

    firstUpdated(_changedProperties) {
        if (this.query && typeof this.query.conservation !== "undefined") {
            let fields = this.query.conservation.split(new RegExp("[,;]"));
            for (let i = 0; i < fields.length; i++) {
                let source = fields[i].split(/[<=>]+/)[0];
                switch (source) {
                case "phylop":
                    PolymerUtils.setValue(this._prefix + "PhylopInput", fields[i].split(/[<=>]+/)[1]);
                    PolymerUtils.setValue(this._prefix + "PhylopOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                    break;
                case "phastCons":
                    PolymerUtils.setValue(this._prefix + "PhastconsInput", fields[i].split(/[<=>]+/)[1]);
                    PolymerUtils.setValue(this._prefix + "PhastconsOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                    break;
                case "gerp":
                    PolymerUtils.setValue(this._prefix + "GerpInput", fields[i].split(/[<=>]+/)[1]);
                    PolymerUtils.setValue(this._prefix + "GerpOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                    break;
                }
            }
        }
    }

    //TODO refactor
    filterChange(e) {
        let arr = {"Phylop": "phylop", "Phastcons": "phastCons", "Gerp": "gerp"};
        let conserArr = [];
        let conservation;
        for (let key of Object.keys(arr)) {
            let inputTextArea = PolymerUtils.getElementById(this._prefix + key + "Input");
            if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
                let operator = PolymerUtils.getElementById(this._prefix + key + "Operator");
                conserArr.push(arr[key] + operator.value + inputTextArea.value);
            }
        }
        // Disable OR/AND logical operator
        if (conserArr.length > 1) {
            $("input:radio[name=conservation]").attr("disabled", false);
        } else {
            $("input:radio[name=conservation]").attr("disabled", true);
        }
        if (conserArr.length > 0) {
            let filter = $("input:radio[name=conservation]:checked").val();
            if (filter === "and") {
                conservation = conserArr.join(";");
            } else {
                conservation = conserArr.join(",");
            }
        }
        console.log("filterChange", conservation);
        let event = new CustomEvent('filterChange', {
            detail: {
                value: conservation ? conservation : null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`

            <style>
                ${switchWidget}
            </style>  
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px"> PhyloP</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="phylopOperator" id="${this._prefix}PhylopOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">                            
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PhylopInput" name="phylop" @input="${this.filterChange}">
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px">PhastCons</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="phastconsOperator" id="${this._prefix}PhastconsOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">                            
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PhastconsInput" name="phastCons" @input="${this.filterChange}">
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px">Gerp</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="gerpOperator" id="${this._prefix}GerpOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}GerpInput" name="gerp" @input="${this.filterChange}">
                    </div>
                </div>
              
                <!-- <form style="padding-top: 15px">
                        <label style="font-weight: normal;">Logical Operator</label>
                        <input type="radio" name="conservation" id="${this._prefix}conservationOrRadio" value="or"
                               class="${this._prefix}FilterRadio" checked disabled style="margin-left: 10px"
                               @change="${this.filterChange}"> OR<br>
                        <input type="radio" name="conservation" id="${this._prefix}conservationAndRadio" value="and"
                               class="${this._prefix}FilterRadio" disabled style="margin-left: 102px" @change="${this.filterChange}"> AND<br>
                    </form>
                -->
   
                <div class="switch-container">
                    <div class="rating-toggle-container">
                        <label style="font-weight: normal;">Logical Operator</label>
                        <form class="flex-center">
                            <input id="${this._prefix}conservationOrRadio" name="conservation" type="radio" value="or"
                                   class="radio-or ${this._prefix}FilterRadio" checked disabled
                                   @change="${this.filterChange}"/>
                            <input id="${this._prefix}conservationAndRadio" name="conservation" type="radio" value="and"
                                   class="radio-and ${this._prefix}FilterRadio" disabled @change="${this.filterChange}"/>
                            <label for="${this._prefix}conservationOrRadio"
                                   class="rating-label rating-label-or">OR</label>
                            <div class="rating-toggle"></div>
                            <div class="toggle-rating-pill"></div>
                            <label for="${this._prefix}conservationAndRadio"
                                   class="rating-label rating-label-and">AND</label>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('conservation-filter', ConservationFilter);
