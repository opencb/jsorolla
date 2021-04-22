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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/tool-header.js";

export default class PhenotypeForm extends LitElement {

    // static VIEW_MODE = "view";
    static UPDATE_MODE = "update";
    static CREATE_MODE = "create";

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sample: {
                type: Object
            },
            mode: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        // We initialise the sample in for CREATE
        // this.sample = {}
        // this.phenotype = {}
        this.showSubForm = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes:"pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Age of on set",
                            field: "phenotype.ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                        {
                            name: "Status",
                            field: "phenotype.status",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOW"],
                            display: {
                                placeholder: "select a status...",
                            }
                        },
                    ]
                }
            ]
        }
    }

    onSubmit(e) {
        // TODO: refactor parentNode (look another way to get values from subform instead this.parentNode)
        // this inside this function is: data-form (subform)
        // this.parentNode is: this class sample-form

        // The properties of the sample-form can be accessed this way. 
        // I had to do it this way just because of the phenotype property.
        //the phenotype property has a fixed instance (even if you leave it empty or create a new instance), 
        //trying to add the element in the list of phenotypes inside sample will overwrite the first element of the array (line #130).
        let parentForm = document.querySelector("sample-form")

        if (!this.sample.phenotype) {
            this.sample.phenotype = []
        }
        
        // this.sample.phenotype.push(this.phenotype) Override the first element of the array
        // this.phenotype = {} or this.phenotype = new Object() it's not work
        
        this.sample.phenotype.push(parentForm.phenotype)
        // maybe this work
        // this.sample.phenotype = {... this.sample.phenotype,phenotype: this.phenotype}
        parentForm.phenotype = {}

        console.log("added Item and close", this.sample)
        
        document.querySelector(".subform-test select-field-filter").value = ""
        document.querySelector(".subform-test text-field-filter").value = ""
        this.onShowForm()

    }

    onClear(e) {
        // self = this component (Phenotype-form)
        let self = this
        let parentForm = document.querySelector("sample-form-create")
        console.log("Cancel Subform phenotype", self)
        
        // TODO: look how to binding property with data-form to avoid use querySelector
        //to clear input text..
        
        self.querySelector("input").value = ""
        self.querySelector(".subform-test text-field-filter").value = ""
        
        parentForm.phenotype = {}

        // avoid to execute other components listen this function too
        // sample-form has this function too.. 
        //without e.stopPropagation both function are called
        this.onShowForm()
        e.stopPropagation()
    }
    
    onRemoveItem(item,e){
        console.log("Elemento: ", item)
        
        this.sample = {
            ...this.sample,
            phenotype: this.sample.phenotype.filter(element => element !== item)
        };
    }

    onShowForm() {
        console.log("show: ", this.showSubForm)
        this.showSubForm = !this.showSubForm;
        this.requestUpdate();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Phenotype</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShowForm}">
                    Add Phenotype
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px"> 
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.sample?.phenotype?.map((item) => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.ageOfOnset}
                        <span class="badge" style="cursor:pointer" @click=${() => this.onRemoveItem(item, this)}>X</span>
                    </span>`
                )}
            </div>
        </div>

        <div class="subform-test" style="${this.showSubForm ? "display:block" : "display:none"}">
            <data-form  
                .data=${this.sample}
                .config="${this._config}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("phenotype-form", PhenotypeForm);
