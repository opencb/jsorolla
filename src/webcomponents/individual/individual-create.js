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
import UtilsNew from "./../../core/utilsNew.js";
import "../study/phenotype/phenotype-list-update.js";
import "../study/annotationset/annotation-set-update.js";
import "../individual/disorder/disorder-list-update.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";

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
            individual: {
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
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

        if (UtilsNew.isUndefined(this.individual)) {
            this.individual = {};
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
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
    }

    onClear(e) {
        console.log("onClear individual form", this);
        this.individual = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.individuals().create(this.individual, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.individual = { };
                this.requestUpdate();
                console.log("New individual", this.individual);
                FormUtils.showAlert("New Individual", "New Individual created correctly.", "success");
            })
            .catch(err => {
                console.error(err);
            });
    }

    onSync(e, type) {
        e.stopPropagation();
        switch (type) {
            case "phenotypes":
                this.individual = {...this.individual, phenotypes: e.detail.value};
                break;
            case "disorders":
                this.individual = {...this.individual, disorders: e.detail.value};
                break;
            case "annotationsets":
                this.individual = {...this.individual, annotationSets: e.detail.value};
                break;
        }
        this.requestUpdate();
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
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add an ID"
                                }
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the Individual name..."
                            }
                        },
                        {
                            name: "Father id",
                            field: "father",
                            type: "input-text",
                            display: {
                                placeholder: "Add the individual father ID..."
                            }
                        },
                        {
                            name: "Mother id",
                            field: "mother",
                            type: "input-text",
                            display: {
                                placeholder: "Add the individual mother ID..."
                            }
                        },
                        {
                            name: "Sex",
                            field: "sex",
                            type: "select",
                            allowedValues: ["MALE", "FEMALE", "UNKNOWN", "UNDETERMINED"],
                            display: {
                                placeholder: "Select the sex..."
                            }
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
                            display: {
                                placeholder: "Add an Ethnicity..."
                            }
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
                            display: {
                                placeholder: "Select the Karyotypic Sex..."
                            }
                        },
                        {
                            name: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {
                                placeholder: "Select the life status..."
                            }
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
                            display: {
                                placeholder: "Add the location info..."
                            }
                        },
                        {
                            name: "Portal code",
                            field: "location.postalCode",
                            type: "input-text",
                            display: {
                                placeholder: "Add the portal code..."
                            }
                        },
                        {
                            name: "City",
                            field: "location.city",
                            type: "input-text",
                            display: {
                                placeholder: "Add the city name..."
                            }
                        },
                        {
                            name: "State",
                            field: "location.state",
                            type: "input-text",
                            display: {
                                placeholder: "Add the state name..."
                            }
                        },
                        {
                            name: "Country",
                            field: "location.country",
                            type: "input-text",
                            display: {
                                placeholder: "Add the country name..."
                            }
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
                            display: {
                                placeholder: "Add the population name..."
                            }
                        },
                        {
                            name: "Subpopulation",
                            field: "population.subpopulation",
                            type: "input-text",
                            display: {
                                placeholder: "Add the sub-population name..."
                            }
                        },
                        {
                            name: "populaton description",
                            field: "population.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description about the population..."
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
                                        @changePhenotypes="${e => this.onSync(e, "phenotypes")}">
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
                                        @changeDisorders="${e => this.onSync(e, "disorders")}">
                                    </disorder-list-update>`
                            }
                        }
                    ]
                },
                // {
                //     title: "Annotation Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: () => html`
                //                     <annotation-set-update
                //                         .annotationSets="${this.individual?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets=${e => this.onSync(e,"annotationsets")}>
                //                     </annotation-set-update>`
                //             }
                //         }
                //     ]
                // }
            ]
        };
    }

    render() {
        return html`
            <data-form
                .data=${this.individual}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

}

customElements.define("individual-create", IndividualCreate);
