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

export default class DisorderManager extends LitElement {

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
            phenotypes: {
                type: Array
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
        this.phenotypes = []
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
                classes: "pull-right"
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

    onRemoveItem(item, e) {
        this.dispatchEvent(new CustomEvent("removeItem", {
            detail: {
                phenotype: item
            },
            bubbles: false,
            composed: true
        }));
    }

    onClearForm(e) {
        console.log("OnClear Phenotype form ", e)
        this.onShowForm()
        e.stopPropagation()
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
                ${this.phenotypes?.map((item) => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.ageOfOnset}
                        <span class="badge" style="cursor:pointer" @click=${() => this.onRemoveItem(item, this)}>X</span>
                    </span>`
    )}
            </div>
        </div>

        <div class="subform-test" style="${this.showSubForm ? "display:block" : "display:none"}">
            <data-form  
                .data=${this.phenotypes}
                .config="${this._config}"
                @clear="${this.onClearForm}">
            </data-form>
        </div>
    `;
}

}

customElements.define("disorder-manager", DisorderManager);
