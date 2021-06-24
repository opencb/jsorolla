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
import UtilsNew from "./../../utilsNew.js";
import "../commons/manager/phenotype-manager.js";
import "../individual/disorder-manager.js";
import FormUtils from "../../form-utils.js";

export default class IndividualCreate extends LitElement {

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
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.individual = {
            phenotypes: [],
            disorders: []
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e) {
        const [field, prop] = e.detail.param.split(".");
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
                this.individual[field] = e.detail.value;
                break;
            case "location.address":
            case "location.postalCode":
            case "location.city":
            case "location.state":
            case "location.country":
            case "population.name":
            case "population.subpopulation":
            case "population.description":
            case "status.name":
            case "status.description":
                this.individual[field] = {
                    ...this.individual[field],
                    [prop]: e.detail.value
                };
                // if (!this.individual[field]) {
                //     this.individual[field] = {};
                // }
                // this.individual[field][prop] = e.detail.value;
                break;
        }
    }

    onRemovePhenotype(e) {
        this.individual = {
            ...this.individual,
            phenotypes: this.individual.phenotypes
                .filter(item => item !== e.detail.value)
        };
        this.requestUpdate();
    }

    onAddPhenotype(e) {
        this.individual.phenotypes.push(e.detail.value);
        this.requestUpdate();
    }

    onClear(e) {
        console.log("onClear individual form");
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.individuals().create(this.individual, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.individual = {};
                this.requestUpdate();

                // this.dispatchSessionUpdateRequest();
                FormUtils.showAlert("New Individual", "New Individual created correctly.", "success");
            })
            .catch(err => {
                console.error(err);
            });
    }

    getDefaultConfig() {
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
                labelWidth: 3,
                with: "8",
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    title: "Individual General Information",
                    elements: [
                        {
                            name: "Individual id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    text: "short individual id for..."
                                }
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
                            name: "Father id",
                            field: "father",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
                            }
                        },
                        {
                            name: "Mother id",
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
                            allowedValues: ["MALE", "FEMALE", "UNKNOWN", "UNDETERMINED"],
                            display: {}
                        },
                        {
                            name: "Birth",
                            field: "dateOfBirth",
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
                            name: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            checked: false,
                            display: {}
                        },
                        {
                            name: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {}
                        },
                        {
                            name: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {}
                        }
                    ]
                },
                {
                    title: "Location Info",
                    elements: [
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
                        }
                    ]
                },
                {
                    title: "Population Info",
                    elements: [
                        {
                            name: "Population name",
                            field: "population.name",
                            type: "input-text",
                            display: {}
                        },
                        {
                            name: "Subpopulation",
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
                                placeholder: "add a description..."
                            }
                        }
                    ]
                },
                {
                    elements: [
                        {
                            field: "phenotype",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                        <phenotype-manager
                                            .phenotypes="${this.individual?.phenotypes}"
                                            .opencgaSession="${this.opencgaSession}"
                                            @addItem="${e => this.onAddPhenotype(e)}"
                                            @removeItem="${e => this.onRemovePhenotype(e)}">
                                        </phenotype-manager>`
                            }
                        },
                        {
                            field: "disorder",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                        <disorder-manager
                                            .disorders="${this.individual?.disorders}"
                                            .opencgaSession="${this.opencgaSession}" >
                                        </disorder-manager>`
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form
                .data=${this.individual}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

}

customElements.define("individual-create", IndividualCreate);
