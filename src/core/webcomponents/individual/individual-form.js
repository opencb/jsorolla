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
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";

export default class IndividualForm extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.individual = {}
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    onFieldChange(e) {
        let param;
        switch (e.detail.param) {
            case "id":
            case "name":
            case "father":
            case "mother":
            case "sex":
            case "ethnicity":
            case "parentalConsanguinity":
            case "karyotypicSex":
            case "lifeStatus":
                this.individual[e.detail.param] = e.detail.value;
                break;
            case "location.address":
            case "location.postalCode":
            case "location.city":
            case "location.state":
            case "location.country":
                param = e.detail.param.split(".")[1];
                if (!this.individual.location) {
                    this.individual.location = {};
                }
                this.individual.location[param] = e.detail.value;
                break;
            case "population.name":
            case "population.subpopulation":
            case "population.description":
                param = e.detail.param.split(".")[1];
                if (!this.individual.population) {
                    this.individual.population = {};
                }
                this.individual.population[param] = e.detail.value;
                break;
            case "status.name":
            case "status.description":
                param = e.detail.param.split(".")[1];
                if (!this.individual.status) {
                    this.individual.status = {};
                }
                this.individual.status[param] = e.detail.value;
                break;

        }
    }


    onSave(e) {
        console.log(e.detail.param)
    }

    onHide() {
        this.dispatchEvent(new CustomEvent("hide", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    getIndividualFormConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 25px 50px 0px 0px",
                // mode: {
                //     type: "modal",
                //     title: "Review Variant",
                //     buttonClass: "btn-link"
                // },
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Individual id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: this.mode === "UPDATE",
                                help: {
                                    text: "shor individual id for..."
                                },
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
                            }
                        },
                        {
                            name: "father id",
                            field: "father",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
                            }
                        },
                        {
                            name: "mother id",
                            field: "mother",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
                            }
                        },
                        {
                            name: "Sex",
                            field: "sex",
                            type: "select",
                            allowedValues: ["M", "F", "None"],
                            display: {}
                        },
                        {
                            name: "Ethnicity",
                            field: "ethnicity",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Ethnicity",
                            field: "ethnicity",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "life Status",
                            field: "lifeStatus",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Address",
                            field: "location.address",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Portal code",
                            field: "location.postalCode",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "City",
                            field: "location.city",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "State",
                            field: "location.state",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Country",
                            field: "location.country",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Population name",
                            field: "population.name",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "subpopulation",
                            field: "population.subpopulation",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "populaton description",
                            field: "population.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "add a description...",
                            }
                        },
                    ]
                }
            ]
        }
    }

    render() {

        return html`
            <data-form  .data=${this.individual}
                        .config="${this.getIndividualFormConfig()}"
                        @clear="${this.onHide}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("individual-form", IndividualForm);
