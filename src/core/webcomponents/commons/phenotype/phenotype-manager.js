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
// import UtilsNew from "../../../utilsNew.js";
import LitUtils from "../../commons/utils/lit-utils.js";


// eslint-disable-next-line new-cap
export default class PhenotypeManager extends LitElement {

    constructor() {
        super();
        this._init();
    }


    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            phenotype: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.phenotypes = [];
        this.phenotype = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onClearForm(e) {
        console.log("OnClear Phenotype form ", this);
        this.phenotype = {};
        this.onShow();
        e.stopPropagation();
    }

    onAddPhenotype(e, item) {
        // super or this.onAddItem(item) //it's the same?
        console.log("Execute addPhenotype from Phenotype-Manager");
        this.onAddItem(item);
        this.phenotype = {};
        // this.requestUpdate();
        this.onShow(); // it's from BaseManager.
    }

    onFieldChangePhenotype(e) {
        const field = e.detail.param;
        this.phenotype = {
            ...this.phenotype,
            [field]: e.detail.value
        };
    }

    // DEPRECATED
    onPhenotypeChange(e) {
        console.log("onPhenotypeChange ", e.detail.param, e.detail.value);
        let field = "";
        switch (e.detail.param) {
            case "phenotype.id":
            case "phenotype.name":
            case "phenotype.ageOfOnset":
            case "phenotype.source":
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
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Age of on set",
                            field: "ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Status",
                            field: "status",
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

    onSendPhenotype(e) {
        // Send the variable to the upper component
        console.log("onSendPhenotype Phenotype: ", this.phenotype);
        LitUtils.dispatchEventCustom(this, "addItem", this.phenotype);
    }

    render() {
        return html`
        <div class="subform-test">
            <data-form
                .data=${this.phenotype}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangePhenotype(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendPhenotype(e)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("phenotype-manager", PhenotypeManager);
