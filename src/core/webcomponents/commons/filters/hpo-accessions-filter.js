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
        this._prefix = "hpof-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("HpoAccessionsFilter change", e.target);
        let event = new CustomEvent('HpoAccessionsFilterChange', {
            detail: {
                caddFilter: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    updateQueryFilters(){
        console.log("TODO implement&refactor from opencga-variant-filter");
    }

    openModalHpo(){
        console.log("TODO implement&refactor from opencga-variant-filter");
    }


    render() {
        return html`
            <textarea id="${this._prefix}HumanPhenotypeOntologyTextarea"
                      class="form-control clearable ${this._prefix}FilterTextInput"
                      rows="3" name="hpo" placeholder="HP:0000001, HP:3000079" @keyup="${this.updateQueryFilters}"></textarea>
            <span class="input-group-addon btn btn-primary searchingSpan" id="${this._prefix}buttonOpenHpoAccesions"
                  @click="${this.openModalHpo}">
                                    <strong style="color: white">Add HPO Term</strong>
                                    <i class="fa fa-search searchingButton" aria-hidden="true"></i>
                                </span>
            <form style="padding-top: 15px">
                <label style="font-weight: normal;">Logical Operator</label>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoOrRadio" value="or" class="${this._prefix}FilterRadio"
                       checked style="margin-left: 10px" @change="${this.updateQueryFilters}"> OR<br>
                <input type="radio" name="hpoRadio" id="${this._prefix}hpoAndRadio" value="and"
                       class="${this._prefix}FilterRadio" style="margin-left: 102px" @change="${this.updateQueryFilters}"> AND <br>
            </form>
        `;
    }
}

customElements.define('kpo-accessions-filter', HpoAccessionsFilter);