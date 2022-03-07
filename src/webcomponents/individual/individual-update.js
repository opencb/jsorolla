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
import "../study/phenotype/phenotype-list-update.js";
import "../individual/disorder/disorder-list-update.js";
import "../commons/tool-header.js";
import "../study/ontology-term-annotation/ontology-term-annotation-update.js";


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

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            this.individualObserver();
        }
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
            this._individual = JSON.parse(JSON.stringify(this.individual));
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
            case "sex":
            case "ethnicity":
            // case "dateOfBirth": Problems
                this.updateParams = FormUtils.updateScalar(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            // case "phenotypes":
            //     this.updateParams = {...this.updateParams, phenotypes: e.detail.value};
            //     this.individual = {...this.individual, phenotypes: e.detail.value};
            //     break;
            // case "disorders":
            //     this.updateParams = {...this.updateParams, disorders: e.detail.value};
            //     this.individual = {...this.individual, disorders: e.detail.value};
            //     break;
            // case "annotationSets":
            //     this.updateParams = {...this.updateParams, annotationSets: e.detail.value};
            //     break;
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
                this.updateParams = FormUtils.updateObjectWithProps(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.individual = JSON.parse(JSON.stringify(this._individual));
        this.updateParams = {};
        this.individualId = "";
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            phenotypesAction: "SET"
        };
        console.log("individualId", this.individual.id, "updateParams:", this.updateParams, "param:", params);
        this.opencgaSession.opencgaClient.individuals()
            .update(this.individual.id, this.updateParams, params)
            .then(() => {
                // TODO get individual from database, ideally it should be returned by OpenCGA
                this._individual = JSON.parse(JSON.stringify(this.individual));
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
                this.individual = {...this.individual, disorders: e.detail.value};
                break;
            case "phenotypes":
                this.individual = {...this.individual, phenotypes: e.detail.value};
                break;
            case "annotationSets":
                console.log("for annotationSets array");
                break;
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data=${this.individual}
                .config="${this._config}"
                .updateParams=${this.updateParams}
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
                buttonClearText: "Cancel",
                buttonOkText: "Save",
                titleWidth: 3,
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "Individual General Information",
                    elements: [
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: this.individual.creationDate? "Created on " + UtilsNew.dateFormatter(this.individual.creationDate):"No creation date",
                                // disabled: true,
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
                                    <individual-id-autocomplete
                                        .value="${father?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams.individualId ? "selection-updated" : ""}"
                                        .config=${{
                                            // This is the default value, but it is safe to leave it
                                            multiple: false,
                                        }}
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "father",
                                                value: {id: e.detail.value}
                                            }
                                        })}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            title: "Mother ID",
                            field: "mother",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: mother => html`
                                    <individual-id-autocomplete
                                        .value="${mother?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            // This is the default value, but it is safe to leave it
                                            multiple: false,
                                        }}
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "mother",
                                                value: {id: e.detail.value}
                                            }
                                        })}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            title: "Birth",
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
                                        .ontology=${sex}
                                        .displayConfig="${{
                                                buttonsVisible: false,
                                                style: "border-left: 2px solid #0c2f4c",
                                            }}"
                                        @fieldChange=${e => this.onFieldChange(e, "sex")}
                                    ></ontology-term-annotation-update>`
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "custom",
                            display: {
                                render: ethnicity => html`
                                    <ontology-term-annotation-update
                                        .ontology=${ethnicity}
                                        .displayConfig="${{
                                                buttonsVisible: false,
                                                style: "border-left: 2px solid #0c2f4c",
                                            }}"
                                        @fieldChange=${e => this.onFieldChange(e, "ethnicity")}
                                    ></ontology-term-annotation-update>`
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
                //             title: "",
                //             type: "notification",
                //             text: "Empty, create a new phenotype",
                //             display: {
                //                 visible: individual => !(individual?.phenotypes && individual?.phenotypes.length > 0),
                //                 notificationType: "info",
                //             }
                //         },
                //         {
                //             field: "phenotypes",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: phenotypes => html`
                //                 <phenotype-list-update
                //                     .phenotypes="${phenotypes}"
                //                     .opencgaSession="${this.opencgaSession}"
                //                     @changePhenotypes="${e => this.onFieldChange(e, "phenotypes")}">
                //                 </phenotype-list-update>`
                //             }
                //         },
                //     ]
                // },
                {
                    title: "Phenotypes",
                    elements: [
                        {
                            title: "Phenotype",
                            field: "phenotypes",
                            type: "custom-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                renderUpdate: (pheno, callback) => {
                                    return html`
                                    <ontology-term-annotation-update
                                        .ontology=${pheno}
                                        .entity="${"phenotype"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Save",
                                            buttonClearText: "",
                                        }}"
                                        @updateItem="${callback}">
                                    </ontology-term-annotation-update>
                                `;
                                },
                                renderCreate: (pheno, callback) => html`
                                    <label>Create new item</label>
                                    <ontology-term-annotation-create
                                        .entity="${"phenotype"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Add",
                                            buttonClearText: "",
                                        }}"
                                        @addItem="${callback}">
                                    </ontology-term-annotation-create>
                                `
                            }
                        },
                    ]
                },
                // {
                //     title: "Disorder",
                //     elements: [
                //         {
                //             field: "disorders",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: disorders => html`
                //                     <disorder-list-update
                //                         .disorders="${disorders}"
                //                         .evidences="${this.updateParams?.phenotypes}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeDisorders="${e => this.onFieldChange(e, "disorders")}">
                //                     </disorder-list-update>`
                //             }
                //         }
                //     ]
                // },
                {
                    title: "Disorders",
                    elements: [
                        {
                            title: "Disorder",
                            field: "disorders",
                            type: "custom-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                renderUpdate: (disorder, callback) => html`
                                    <ontology-term-annotation-update
                                        .ontology=${disorder}
                                        .entity="${"disorder"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Save",
                                            buttonClearText: "",
                                        }}"
                                        @updateItem="${callback}">
                                    </ontology-term-annotation-update>
                                `,
                                renderCreate: (disorder, callback) => html`
                                    <label>Create new item</label>
                                    <ontology-term-annotation-create
                                        .entity="${"disorder"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Add",
                                            buttonClearText: "",
                                        }}"
                                        @addItem="${callback}">
                                    </ontology-term-annotation-create>
                                `
                            }
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
                //                 render: annotationSets => html`
                //                     <annotation-set-update
                //                         .annotationSets="${annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onSync(e, "annotationsets")}">
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

customElements.define("individual-update", IndividualUpdate);
