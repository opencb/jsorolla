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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";
import "../phenotype/phenotype-manager.js";

export default class IndividualCreate extends LitElement {

    static CREATE_MODE = "create";
    static UPDATE_MODE = "update";

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individual: {
                type: Object
            },
            study: {
                type: Object
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
        this.individual = {
            phenotypes: []
        }
        this.phenotypes = {}
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
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
                let cat = e.detail.param.split(".")[0];
                param = e.detail.param.split(".")[1];
                if (!this.individual[cat]) {
                    this.individual[cat] = {};
                }
                this.individual[cat][param] = e.detail.value;
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

    saveIndividual() {
        // this.opencgaSession.opencgaClient.projects().create(this.project)
        //     .then(res => {
        //         this.sample = {};
        //         this.requestUpdate();

        //         this.dispatchSessionUpdateRequest();

        //         Swal.fire(
        //             "New Sample",
        //             "New Sample created correctly.",
        //             "success"
        //         );
        //     })
        //     .catch(err => {
        //         console.error(err);
        //         params.error(err);
        //     });
    }

    updateIndividual() {
        // this.opencgaSession.opencgaClient.projects().update(this.Sample?.fqn,this.Sample)
        //     .then(res => {
        //         this.Sample = {};
        //         this.requestUpdate();

        //         this.dispatchSessionUpdateRequest();

        //         Swal.fire(
        //             "Edit Sample",
        //             "Sample updated correctly.",
        //             "success"
        //         );
        //     })
        //     .catch(err => {
        //         console.error(err);
        //         params.error(err);
        //     });
    }

    onSave(e) {
        // if (mode === SampleForm.CREATE_MODE) {
        //     this.saveIndividual()
        // } else {
        //     this.updateIndividual()
        // }
    }

    onClear() {
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

                // mode: {
                //     type: "modal",
                //     title: "Review Variant",
                //     buttonClass: "btn-link"
                // },
                labelWidth: 3,
                with: "8",
                labelAlign: "right",
                defaultLayout: "horizontal",
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
                        },
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
                                placeholder: "add a description...",
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
                                            .opencgaSession="${this.opencgaSession}" >
                                        </phenotype-manager>`
                            }
                        }
                    ]
                },
            ]
        }
    }

    render() {

        return html`
            <data-form  .data=${this.individual}
                        .config="${this._config}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @clear="${this.onHide}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("individual-create", IndividualCreate);
