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
import "../commons/phenotype/phenotype-list-update.js";
import "../commons/annotationset/annotation-set-update.js";
import "../individual/disorder/disorder-list-update.js";

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
            annotationSets: [],
            disorders: []
        };
        // Individual -> list disorders -> description, evidences (list of phenotypes)
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e) {
        const [field, prop] = e.detail.param.split(".");
        if (e.detail.value) {
            if (prop) {
                this.individual[field] = {
                    ...this.individual[field],
                    [prop]: e.detail.value
                };
            } else {
                this.individual = {
                    ...this.individual,
                    [field]: e.detail.value
                };
            }
        } else {
            if (prop) {
                delete this.individual[field][prop];
            } else {
                delete this.individual[field];
            }
        }

        console.log("New Individual: ", this.individual);
    }

    onClear(e) {
        console.log("onClear individual form");
    }

    onSubmit(e) {
        e.stopPropagation();
        console.log("New individual", this.individual);
        this.individual = {
            phenotypes: [],
            disorders: [],
            annotationSets: []
        };
        // this.opencgaSession.opencgaClient.individuals().create(this.individual, {study: this.opencgaSession.study.fqn})
        //     .then(res => {
        //         this.individual = {};
        //         this.requestUpdate();

        //         // this.dispatchSessionUpdateRequest();
        //         FormUtils.showAlert("New Individual", "New Individual created correctly.", "success");
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    }

    onSyncPhenotypes(e) {
        e.stopPropagation();
        console.log("Updated list", this);
        this.individual = {...this.individual, phenotypes: e.detail.value};
        this.requestUpdate();
    }

    onSyncDisorders(e) {
        e.stopPropagation();
        console.log("Updated list", this);
        this.individual = {...this.individual, disorders: e.detail.value};
    }

    onSyncAnnotationSets(e) {
        e.stopPropagation();
        console.log("Updated list", this);
        this.individual = {...this.individual, annotationSets: e.detail.value};
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
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
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
                    title: "Phenotype",
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
                                    <phenotype-list-update
                                        .phenotypes="${this.individual?.phenotypes}"
                                        @changePhenotypes="${e => this.onSyncPhenotypes(e)}">
                                    </phenotype-list-update>`
                            }
                        },
                    ]
                },
                {
                    title: "Disorder",
                    elements: [
                        {
                            field: "disorder",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <disorder-list-update
                                        .disorders="${this.individual?.disorders}"
                                        .evidences="${this.individual?.phenotypes}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeDisorders="${e => this.onSyncDisorders(e)}">
                                    </disorder-list-update>`
                            }
                        }
                    ]
                },
                {
                    title: "Annotation Sets",
                    elements: [
                        {
                            field: "annotationSets",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <annotation-set-update
                                        .annotationSets="${this.individual?.annotationSets}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeAnnotationSets=${e => this.onSyncAnnotationSets(e)}>
                                    </annotation-set-update>`
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
