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
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utilsNew.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../study/ontology-term-annotation/ontology-term-annotation-update.js";
import "../commons/filters/catalog-search-autocomplete.js";


export default class IndividualUpdate extends LitElement {

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
            individualId: {
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
        this.individual = {};
        this.updateParams = {};
        this._config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("individual")) {
            this.individualObserver();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    individualObserver() {
        if (this.individual) {
            this._individual = UtilsNew.objectClone(this.individual);
        }
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            const query = {
                study: this.opencgaSession.study.fqn,
            };
            this.opencgaSession.opencgaClient.individuals().info(this.individualId, query)
                .then(response => {
                    this.individual = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "name":
            case "father":
            case "mother":
            case "parentalConsanguinity":
            case "karyotypicSex":
            case "lifeStatus":
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
            // case "dateOfBirth": Problem
                this.updateParams = FormUtils.updateObjectParams(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "sex": // object
            case "ethnicity": // object
                this.updateParams = FormUtils.updateObjectWithObj(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "phenotypes": // arrays
            case "disorders": // arrays
                this.updateParams = FormUtils.updateArraysObject(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.individual = UtilsNew.objectClone(this._individual);
        this.updateParams = {};
        this.individualId = "";
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            phenotypesAction: "SET",
            disordersAction: "SET"
        };
        console.log("individualId", this.individual.id, "updateParams:", this.updateParams, "param:", params);
        this.opencgaSession.opencgaClient.individuals()
            .update(this.individual.id, this.updateParams, params)
            .then(() => {
                // TODO get individual from database, ideally it should be returned by OpenCGA
                this._individual = UtilsNew.objectClone(this.individual);
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Individual Updated",
                    message: "Individual updated correctly",
                });
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onAddOrUpdateItem(e) {
        switch (e.detail.param) {
            case "disorders":
            case "phenotypes":
                this.updateParams = FormUtils.updateArraysObject(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );
                break;
            case "annotationSets":
                break;
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.individual}"
                .config="${this._config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @addOrUpdateItem="${e => this.onAddOrUpdateItem(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Update",
                titleWidth: 3,
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: this.individual.creationDate? "Created on " + UtilsNew.dateFormatter(this.individual.creationDate):"No creation date",
                                help: {
                                    text: "short individual id for..."
                                },
                            }
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
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
                                        .value="${father?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams?.individualId ? "selection-updated" : ""}"
                                        .config="${{
                                            // This is the default value, but it is safe to leave it
                                            multiple: false,
                                        }}"
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
                                        .value="${mother?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams.individualId ? "selection-updated" : ""}"
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
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            }
                        },
                        {
                            title: "Sex",
                            field: "sex",
                            type: "custom",
                            display: {
                                render: sex => html`
                                    <ontology-term-annotation-update
                                        .ontology="${sex}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            style: "border-left: 2px solid #0c2f4c padding-left:12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "sex")}">
                                    </ontology-term-annotation-update>
                                `,
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "custom",
                            display: {
                                render: ethnicity => html`
                                    <ontology-term-annotation-update
                                        .ontology="${ethnicity}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            style: "border-left: 2px solid #0c2f4c padding-left:12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "ethnicity")}">
                                    </ontology-term-annotation-update>
                                `,
                            }
                        },
                        {
                            title: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            display: {}
                        },
                        {
                            title: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {}
                        },
                        {
                            title: "Life Status",
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
                            title: "Address",
                            field: "location.address",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "Portal Code",
                            field: "location.postalCode",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "City",
                            field: "location.city",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "State",
                            field: "location.state",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "Country",
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
                            title: "Population Name",
                            field: "population.name",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "Subpopulation",
                            field: "population.subpopulation",
                            type: "input-text",
                            display: {}
                        },
                        {
                            title: "Populaton Description",
                            field: "population.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "add a description...",
                            }
                        }
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
                //                 renderUpdate: (pheno, callback) => {
                //                     return html`
                //                         <ontology-term-annotation-update
                //                             .ontology="${pheno}"
                //                             .entity="${"phenotype"}"
                //                             .displayConfig="${{
                //                                 defaultLayout: "vertical",
                //                                 buttonOkText: "Save",
                //                                 buttonClearText: "",
                //                             }}"
                //                             @updateItem="${callback}">
                //                         </ontology-term-annotation-update>
                //                     `;
                //                 },
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
                //                 `,
                //             }
                //         },
                //     ]
                // },
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
                //                 `,
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
            ]
        });
    }

}

customElements.define("individual-update", IndividualUpdate);
