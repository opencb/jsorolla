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


import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import {BaseManagerMixin} from "./base-manager.js";
import "../commons/tool-header.js";

// eslint-disable-next-line new-cap
export default class PhenotypeManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            phenotypes: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.phenotypes = [];
        this.phenotype = {};

    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Age of on set",
                            field: "phenotype.ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Status",
                            field: "phenotype.status",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                            display: {
                                placeholder: "select a status..."
                            }
                        }
                    ]
                }
            ]
        };
    }

    onClearForm(e) {
        console.log("OnClear Phenotype form ", this);
        this.phenotype = {};
        this.onShow();
        e.stopPropagation();
    }

    onAddPhenotype(e, item) {
        // super or this.onAddItem(item) //it's the same?
        this.onAddItem(item);
        this.phenotype = {};
        this.onShow(); // it's from BaseManager.
    }

    onPhenotypeChange(e) {
        console.log("onPhenotypeChange ", e.detail.param, e.detail.value);
        let field = "";
        switch (e.detail.param) {
            case "phenotype.ageOfOnset":
            case "phenotype.status":
                field = e.detail.param.split(".")[1];
                if (!this.phenotype[field]) {
                    this.phenotype[field] = {};
                }
                this.phenotype[field] = e.detail.value;
                break;
        }
        // To stop the bubbles when dispatched this method
        e.stopPropagation();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Phenotype</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                    Add Phenotype
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px"> 
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.phenotypes?.map(item => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.ageOfOnset}
                        <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                    </span>`
        )}
            </div>
        </div>

        <div class="subform-test" style="${this.isShow ? "display:block" : "display:none"}">
            <data-form  
                .data=${this.phenotypes}
                .config="${this._config}"
                @fieldChange="${this.onPhenotypeChange}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onAddPhenotype(e, this.phenotype)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("phenotype-manager", PhenotypeManager);
