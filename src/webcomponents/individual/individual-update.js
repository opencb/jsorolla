/**
 * Copyright 2015-2022 OpenCB
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

import {html, LitElement} from "lit";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utilsNew.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";


export default class IndividualUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.individual = {};
        this.updateParams = {};
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Update",
            titleWidth: 3,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("individual")) {
            this.initOriginalObject();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    initOriginalObject() {
        if (this.individual) {
            this._individual = UtilsNew.objectClone(this.individual);
        }
    }

    individualIdObserver() {
        if (this.individualId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, params)
                .then(response => {
                    this.individual = response.responses[0].results[0];
                    this.initOriginalObject();
                })
                .catch(reason => {
                    this.individual = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "individualSearch", this.individual, {query: {...params}}, error);
                    this.#setLoading(false);
                });
        } else {
            this.individual = {};
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "name":
            case "father.id":
            case "mother.id":
            case "parentalConsanguinity":
            case "karyotypicSex":
            case "lifeStatus":
            case "population": // object
            case "location": // object
            case "sex": // object
            case "ethnicity": // object
            case "samples": // arrays
            case "phenotypes": // arrays
            case "disorders": // arrays
                this.updateParams = FormUtils.updateObjExperimental(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "dateOfBirth": // date
                const value = e.detail.value.substring(0, 8);
                this.updateParams = FormUtils.updateObjExperimental(
                    this._individual,
                    this.individual,
                    this.updateParams,
                    param,
                    value);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = this.getDefaultConfig();
        this.updateParams = {};
        this.individualId = "";
        this.individual = UtilsNew.objectClone(this._individual);
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            samplesAction: "SET",
            phenotypesAction: "SET",
            disordersAction: "SET",
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        // FIXME CAUTION: workaround for avoiding overwrite non updated keys in an object.
        //  Remove when form-utils.js revisited
        // Object.keys(this.updateParams).forEach(key => {
        //     this.updateParams[key] = this.individual[key];
        // });
        this.opencgaSession.opencgaClient.individuals()
            .update(this.individual.id, this.updateParams, params)
            .then(response => {
                this._individual = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Individual Update",
                    message: "Individual updated correctly",
                });
            })
            .catch(reason => {
                this.individual = {};
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this._config = this.getDefaultConfig();
                LitUtils.dispatchCustomEvent(this, "individualUpdate", this.individual, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.individual?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    The sample does not have an Individual ID.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.individual}"
                .config="${this._config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
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
                            },
                        },
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                                placeholder: "Add a short ID...",
                                helpMessage: this.individual.creationDate ? `Created on ${UtilsNew.dateFormatter(this.individual.creationDate)}` : "No creation date",
                                help: {
                                    text: "Short individual ID for..."
                                },
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "individual name..."
                            },
                        },
                        {
                            title: "Father ID",
                            field: "father",
                            type: "custom",
                            display: {
                                placeholder: "Select the father ID ...",
                                render: father => html`
                                    <catalog-search-autocomplete
                                        .value="${father?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams?.father?.id ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFieldChange(e, "father.id")}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Mother ID",
                            field: "mother",
                            type: "custom",
                            display: {
                                placeholder: "Select the mother ID ...",
                                render: mother => html`
                                    <catalog-search-autocomplete
                                        .value="${mother?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams?.mother ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFieldChange(e, "mother.id")}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Sample ID(s)",
                            field: "samples",
                            type: "custom",
                            display: {
                                placeholder: "Select the sample IDs ...",
                                render: samples => html`
                                    <catalog-search-autocomplete
                                        .value="${samples.map(s => s.id).join(",")}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${this.updateParams.samples ? "selection-updated" : ""}"
                                        .config="${{multiple: true}}"
                                        @filterChange="${e => {
                                    // We need to convert value from a string wth commas to an array of IDs
                                    e.detail.value = e.detail.value
                                        ?.split(",")
                                        .map(sampleId => {
                                            return {id: sampleId};
                                        });
                                    this.onFieldChange(e, "samples");
                                }}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Date of Birth",
                            field: "dateOfBirth",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            },
                        },
                        {
                            title: "Sex",
                            field: "sex",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "ID",
                                    field: "sex.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "sex.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "sex.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ontology source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "sex.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ]
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "ID",
                                    field: "ethnicity.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "ethnicity.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "ethnicity.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ontology source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "ethnicity.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ]
                        },
                        {
                            title: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            display: {},
                        },
                        {
                            title: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {},
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {},
                        },
                        {
                            title: "Location",
                            field: "location",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "Address",
                                    field: "location.address",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "Postal Code",
                                    field: "location.postalCode",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "City",
                                    field: "location.city",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "State",
                                    field: "location.state",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "Country",
                                    field: "location.country",
                                    type: "input-text",
                                    display: {},
                                },
                            ]
                        },
                        {
                            title: "Population Info",
                            field: "population",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "Population Name",
                                    field: "population.name",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "Subpopulation",
                                    field: "population.subpopulation",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "Population Description",
                                    field: "population.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description...",
                                    },
                                },
                            ]
                        },
                    ],
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
                                view: pheno => html`<div>${pheno.id} - ${pheno?.name}</div>`,
                            },
                            elements: [
                                {
                                    title: "Phenotype ID",
                                    field: "phenotypes[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "phenotypes[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "phenotypes[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    },
                                },
                                {
                                    title: "Age of onset",
                                    field: "phenotypes[].ageOfOnset",
                                    type: "input-num",
                                    allowedValues: [0],
                                    display: {
                                        placeholder: "Add an age of onset..."
                                    },
                                },
                                {
                                    title: "Status",
                                    field: "phenotypes[].status",
                                    type: "select",
                                    allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                                    display: {
                                        placeholder: "Select a status..."
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "phenotypes[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                    ],
                },
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
                                view: disorder => html`<div>${disorder.id} - ${disorder?.name}</div>`,
                            },
                            elements: [
                                {
                                    title: "Disorder ID",
                                    field: "disorders[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disorder ID...",
                                    }
                                },
                                {
                                    title: "Name",
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
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("individual-update", IndividualUpdate);
