/**
 * Copyright 2015-2021 OpenCB
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


import {LitElement, html} from "lit";
import "../../commons/tool-header.js";
import "../../commons/forms/text-field-filter.js";
import LitUtils from "../../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
// DEPRECATED
export default class VariableTypeValue extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            type: {
                type: String
            },
            values: {
                type: Array
            }
        };
    }

    _init() {
        this.values = [];
        this.nameValue = "";
    }

    onClearForm(e) {
        console.log("OnClear form ", this.nameValue);
        this.nameValue = "";
        this.requestUpdate();
    }

    onAddValues(e) {
        // https://lit-element.polymer-project.org/guide/templates#accessing-nodes-in-the-shadow-dom
        // https://lit.dev/docs/templates/directives/#ref
        if (e.keyCode === 13) {
            console.log("OnAddValue", this.nameValue);
            this.values = [...this.values, this.nameValue];
            this.nameValue = "";
            this.querySelector("#itemInput").value = "";
            this.onSendValues();
            e.preventDefault();
        }
    }

    handleInput(e) {
        console.log("onInputValue: ", e.target.value);
        const value = e.target.value;
        this.nameValue = value;
    }

    onSendValues() {
        LitUtils.dispatchCustomEvent(this, "addItem", this.values);
    }

    render() {


        return html`

        <!-- <style>
        .no-border {
            border: 0;
            box-shadow: none; /* You may want to include this as bootstrap applies these styles too */
        }
        </style> -->

        <div class="row">
            <!-- <div class="col-md-2" style="padding: 10px 20px">
                <h3>\${this.type}</h3>
            </div> -->
            <!-- <div class="clearfix"></div> -->

            <div class="col-md-12" style="padding: 10px 20px">
                ${this.values?.map(item => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item}
                        <span class="badge" style="cursor:pointer">X</span>
                    </span>`
                )}
            </div>
            <div class="col-md-12" style="padding: 10px 20px">
                <div class="form-inline form-group">
                    <input id="itemInput" class="form-control no-border" .value="${this.nameValue}" @input="${e => this.handleInput(e)}" @keyup="${e => this.onAddValues(e)}">
                    <!-- <button type="button" class="btn btn-primary ripple" @click="\${this.onAddValues}">
                        Add Value
                    </button> -->
                </div>
            </div>
        </div>
    `;
    }

}

customElements.define("variable-type-values", VariableTypeValue);
