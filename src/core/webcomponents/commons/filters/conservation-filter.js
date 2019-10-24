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

export default class ConservationFilter extends LitElement {

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
        this._prefix = "ff-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("conservationFilter change", e.target);
        let event = new CustomEvent('conservationFilterChange', {
            detail: {
                conservationFilter: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    updateQueryFilters(){
        console.log("TODO implement&refactor from opencga-variant-filter");
    }

    render() {
        return html`
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px"> PhyloP</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="phylopOperator" id="${this._prefix}PhylopOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.updateQueryFilters}">
                            <option value="<"><</option>
                            <option value="<="><=</option>
                            <option value=">" selected>></option>
                            <option value=">=">>=</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="text" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PhylopInput" name="phylop" @keyup="${this.updateQueryFilters}">
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px">PhastCons</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="phastconsOperator" id="${this._prefix}PhastconsOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.updateQueryFilters}">
                            <option value="<"><</option>
                            <option value="<="><=</option>
                            <option value=">" selected>></option>
                            <option value=">=">>=</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="text" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}PhastconsInput" name="phastCons" @keyup="${this.updateQueryFilters}">
                    </div>
                </div>
            </div>
            
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px">Gerp</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="gerpOperator" id="${this._prefix}GerpOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.updateQueryFilters}">
                            <option value="<"><</option>
                            <option value="<="><=</option>
                            <option value=">" selected>></option>
                            <option value=">=">>=</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="text" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}GerpInput" name="gerp" @keyup="${this.updateQueryFilters}">
                    </div>
                </div>
            
                <form style="padding-top: 15px">
                    <label style="font-weight: normal;">Logical Operator</label>
                    <input type="radio" name="conservation" id="${this._prefix}conservationOrRadio" value="or"
                           class="${this._prefix}FilterRadio" checked disabled style="margin-left: 10px"
                           @change="${this.updateQueryFilters}"> OR<br>
                    <input type="radio" name="conservation" id="${this._prefix}conservationAndRadio" value="and"
                           class="${this._prefix}FilterRadio" disabled style="margin-left: 102px" @change="${this.updateQueryFilters}"> AND<br>
                </form>
            </div>
        `;
    }
}

customElements.define('conservation-filter', ConservationFilter);