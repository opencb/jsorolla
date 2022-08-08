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
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/ontology-term-annotation/ontology-term-annotation-create.js";
import "../study/ontology-term-annotation/ontology-term-annotation-update.js";


export default class IndividualCreate extends LitElement {

    constructor() {
        super();
        this.#init();
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

    #init() {
        this._config = this.getDefaultConfig();
        this.individual = {};
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.individual = {
                ...FormUtils.createObject(
                    this.individual,
                    param,
                    e.detail.value,
                )};
        }
        this.requestUpdate();
    }

    onClear(e) {
        this.individual = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        console.log("saved", this.individual);
        this.opencgaSession.opencgaClient.individuals()
            .create(this.individual, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.individual = {};
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Individual",
                    message: "New Individual created correctly"
                });
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    onAddOrUpdateItem(e) {
        console.log("Test onAddOrUpdateItem", e);
        const param = e.detail.param;
        const value = e.detail.value;
        if (UtilsNew.isNotEmpty(value)) {
            switch (param) {
                case "disorders":
                    this.individual = {...this.individual, disorders: value};
                    break;
                case "phenotypes":
                    this.individual = {...this.individual, phenotypes: value};
                    break;
            }
        } else {
            this.individual = {
                ...this.individual,
                [param]: []
            };
            delete this.individual[param];
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.individual}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @addOrUpdateItem="${e => this.onAddOrUpdateItem(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Create",
                titleWidth: 3,
                with: "8",
                defaultValue: "",
                defaultLayout: "horizontal"
            },
            // validation: {
            //     validate: individual => (UtilsNew.isEmpty(individual.father) || UtilsNew.isEmpty(individual.mother)) || individual.father !== individual.mother,
            //     message: "The father and mother must be different individuals",
            // },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.individual).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add an ID"
                                }
                            }
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the Individual name..."
                            }
                        },
                        {
                            title: "Father ID",
                            field: "father",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: father => html`
                                    <catalog-search-autocomplete
                                        .value="${father}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "father",
                                                value: {id: e.detail.value}
                                            }
                                        })}">
                                    </catalog-search-autocomplete>
                                `,
                            }
                        },
                        {
                            title: "Mother ID",
                            field: "mother",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: mother => html`
                                    <catalog-search-autocomplete
                                        .value="${mother}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "mother",
                                                value: {id: e.detail.value}
                                            }
                                        })}">
                                    </catalog-search-autocomplete>
                                `,
                            }
                        },
                        {
                            title: "Date of Birth",
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
                            title: "Sex",
                            field: "sex",
                            type: "custom",
                            display: {
                                render: sex => html`
                                    <ontology-term-annotation-create
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "sex")}">
                                    </ontology-term-annotation-create>
                                `,
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "custom",
                            display: {
                                render: ethnicity => html`
                                    <ontology-term-annotation-create
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "ethnicity")}">
                                    </ontology-term-annotation-create>
                                `,
                            }
                        },
                        {
                            title: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {
                                placeholder: "Select the Karyotypic Sex..."
                            }
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {
                                placeholder: "Select the life status..."
                            }
                        },
                        {
                            title: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            checked: false
                        },
                    ]
                },
                {
                    title: "Location Info",
                    elements: [
                        {
                            title: "Address",
                            field: "location.address",
                            type: "input-text",
                            display: {
                                placeholder: "Add the location info..."
                            }
                        },
                        {
                            title: "Postal code",
                            field: "location.postalCode",
                            type: "input-text",
                            display: {
                                placeholder: "Add the postal code..."
                            }
                        },
                        {
                            title: "City",
                            field: "location.city",
                            type: "input-text",
                            display: {
                                placeholder: "Add the city name..."
                            }
                        },
                        {
                            title: "State",
                            field: "location.state",
                            type: "input-text",
                            display: {
                                placeholder: "Add the state name..."
                            }
                        },
                        {
                            title: "Country",
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
                            title: "Population Name",
                            field: "population.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the population name..."
                            }
                        },
                        {
                            title: "Sub-population",
                            field: "population.subpopulation",
                            type: "input-text",
                            display: {
                                placeholder: "Add the sub-population name..."
                            }
                        },
                        {
                            title: "Population Description",
                            field: "population.description",
                            type: "input-text",
                            validation: {
                                validate: () => this.individual?.population?.description ? !!this.individual?.population?.name : true,
                                message: "The population name must be filled",
                            },
                            display: {
                                rows: 3,
                                placeholder: "Add a description about the population..."
                            }
                        }
                    ]
                },
                {
                    title: "Phenotypes",
                    elements: [
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: pheno => html`
                                    <div>${pheno.id} - ${pheno?.name}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Phenotype ID",
                                    field: "phenotypes[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    }
                                },
                                {
                                    title: "name",
                                    field: "phenotypes[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    }
                                },
                                {
                                    title: "Source",
                                    field: "phenotypes[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    }
                                },
                                {
                                    title: "Age of onset",
                                    field: "phenotypes[].ageOfOnset",
                                    type: "input-num",
                                    display: {
                                        placeholder: "Add an age of onset..."
                                    }
                                },
                                {
                                    title: "Status",
                                    field: "phenotypes[].status",
                                    type: "select",
                                    allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                                    display: {
                                        placeholder: "Select a status..."
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "phenotypes[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ]
                },
                // {
                //     title: "Phenotypes",
                //     elements: [
                //         {
                //             title: "Phenotype",
                //             field: "phenotypes",
                //             type: "custom-list",
                //             display: {
                //                 style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                //                 collapsedUpdate: true,
                //                 renderUpdate: (pheno, callback) => html`
                //                     <ontology-term-annotation-update
                //                         .ontology="${pheno}"
                //                         .entity="${"phenotype"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Save",
                //                             buttonClearText: "",
                //                         }}"
                //                         @updateItem="${callback}">
                //                     </ontology-term-annotation-update>
                //                 `,
                //                 renderCreate: (pheno, callback) => html`
                //                     <label>Create new item</label>
                //                     <ontology-term-annotation-create
                //                         .entity="${"phenotype"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Add",
                //                             buttonClearText: "",
                //                         }}"
                //                         @addItem="${callback}">
                //                     </ontology-term-annotation-create>
                //                 `
                //             }
                //         },
                //     ]
                // },
                // {
                //     title: "Disorder",
                //     elements: [
                //         {
                //             title: "",
                //             type: "notification",
                //             text: "Empty, create a new disorder",
                //             display: {
                //                 visible: individual => !(individual?.diosrders && individual?.disorders.length > 0),
                //                 notificationType: "info",
                //             }
                //         },
                //         {
                //             field: "disorders",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: individual => html`
                //                 <!-- Pass 'this.individual' to reflect the changes -->
                //                     <disorder-list-update
                //                         .disorders="${this.individual?.disorders}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeDisorders="${e => this.onFieldChange(e, "disorders")}">
                //                     </disorder-list-update>`
                //             }
                //         }
                //     ]
                // },
                // {
                //     title: "Disorders",
                //     elements: [
                //         {
                //             title: "Disorder",
                //             field: "disorders",
                //             type: "custom-list",
                //             display: {
                //                 style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                //                 collapsedUpdate: true,
                //                 renderUpdate: (disorder, callback) => html`
                //                     <ontology-term-annotation-update
                //                         .ontology="${disorder}"
                //                         .entity="${"disorder"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Save",
                //                             buttonClearText: "",
                //                         }}"
                //                         @updateItem="${callback}">
                //                     </ontology-term-annotation-update>
                //                 `,
                //                 renderCreate: (disorder, callback) => html`
                //                     <label>Create new item</label>
                //                     <ontology-term-annotation-create
                //                         .entity="${"disorder"}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Add",
                //                             buttonClearText: "",
                //                         }}"
                //                         @addItem="${callback}">
                //                     </ontology-term-annotation-create>
                //                 `
                //             }
                //         },
                //     ]
                // },
                {
                    title: "Disorders",
                    elements: [
                        {
                            title: "Disorders",
                            field: "disorders",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: disorder => html`
                                    <div>${disorder.id} - ${disorder?.name}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Disorder ID",
                                    field: "disorders[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    }
                                },
                                {
                                    title: "name",
                                    field: "disorders[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    }
                                },
                                {
                                    title: "Source",
                                    field: "disorders[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "disorders[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ]
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: individual => html`
                //                     <annotation-set-update
                //                         .annotationSets="${individual?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onFieldChange(e, "annotationsets")}">
                //                     </annotation-set-update>
                //                 `
                //             }
                //         }
                //     ]
                // }
            ]
        });
    }

}

customElements.define("individual-create", IndividualCreate);
