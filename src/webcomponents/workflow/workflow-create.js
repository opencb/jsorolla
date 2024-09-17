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

import {LitElement, html} from "lit";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils";
import "../commons/filters/catalog-search-autocomplete.js";


export default class WorkflowCreate extends LitElement {

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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.individual = {};
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
            titleWidth: 3,
            with: "8",
            defaultValue: "",
            defaultLayout: "horizontal"
        };
        this.updatedFields = {};
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this.individual = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear individual",
            message: "Are you sure to clear?",
            ok: () => {
                this.individual = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.individuals()
            .create(this.individual, params)
            .then(() => {
                this.individual = {};
                this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Individual Create",
                    message: "New Individual created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "individualCreate", this.individual, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.individual}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add an ID",
                                },
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the Individual name...",
                            },
                        },
                        {
                            title: "Father ID",
                            field: "father",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: (father, dataFormFilterChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${father?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange({id: e.detail.value})}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Mother ID",
                            field: "mother",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: (mother, dataFormFilterChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${mother?.id}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange({id: e.detail.value})}">
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
                            elements: [
                                {
                                    name: "ID",
                                    field: "sex.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add short id...",
                                    }
                                },
                                {
                                    name: "Name",
                                    field: "sex.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name..."
                                    }
                                },
                                {
                                    name: "Source",
                                    field: "sex.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source..."
                                    }
                                },
                                {
                                    name: "Description",
                                    field: "sex.description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity",
                            type: "object",
                            elements: [
                                {
                                    name: "ID",
                                    field: "ethnicity.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add short id...",
                                    }
                                },
                                {
                                    name: "Name",
                                    field: "ethnicity.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name..."
                                    }
                                },
                                {
                                    name: "Source",
                                    field: "ethnicity.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source..."
                                    }
                                },
                                {
                                    name: "Description",
                                    field: "ethnicity.description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                        {
                            title: "Parental Consanguinity",
                            field: "parentalConsanguinity",
                            type: "checkbox",
                            checked: false,
                        },
                        {
                            title: "Karyotypic Sex",
                            field: "karyotypicSex",
                            type: "select",
                            allowedValues: ["UNKNOWN", "XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER"],
                            display: {
                                placeholder: "Select the Karyotypic Sex...",
                            },
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus",
                            type: "select",
                            allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                            display: {
                                placeholder: "Select the life status...",
                            },
                        },
                        {
                            title: "Location",
                            field: "location",
                            type: "object",
                            elements: [
                                {
                                    title: "Address",
                                    field: "location.address",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the location info...",
                                    },
                                },
                                {
                                    title: "Postal code",
                                    field: "location.postalCode",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the postal code...",
                                    },
                                },
                                {
                                    title: "City",
                                    field: "location.city",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the city name...",
                                    },
                                },
                                {
                                    title: "State",
                                    field: "location.state",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the state name...",
                                    },
                                },
                                {
                                    title: "Country",
                                    field: "location.country",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the country name...",
                                    },
                                },
                            ]
                        },
                        {
                            title: "Population",
                            field: "population",
                            type: "object",
                            elements: [
                                {
                                    title: "Population Name",
                                    field: "population.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the population name...",
                                    },
                                },
                                {
                                    title: "Sub-population",
                                    field: "population.subpopulation",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the sub-population name...",
                                    },
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
                                        placeholder: "Add a description about the population...",
                                    },
                                },
                            ]
                        }
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
                                // CAUTION 20231024 Vero: "collapsedUpdate" not considered in data-form.js. Perhaps "collapsed" (L1324 in data-form.js) ?
                                collapsedUpdate: true,
                                view: phenotype => html`
                                    <div>${phenotype.id} - ${phenotype?.name}</div>
                                `,
                                search: {
                                    title: "Autocomplete",
                                    button: false,
                                    render: (currentData, dataFormFilterChange) => html`
                                        <cellbase-search-autocomplete
                                            .resource="${"PHENOTYPE"}"
                                            .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.data)}">
                                        </cellbase-search-autocomplete>
                                    `,
                                },
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
                                    title: "Name",
                                    field: "phenotypes[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype name...",
                                    }
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
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an age of onset...",
                                    },
                                },
                                {
                                    title: "Status",
                                    field: "phenotypes[].status",
                                    type: "select",
                                    allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                                    display: {
                                        placeholder: "Select a status...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "phenotypes[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description...",
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
                                view: disorder => html`
                                    <div>${disorder.id} - ${disorder?.name}</div>
                                `,
                                search: {
                                    title: "Autocomplete",
                                    button: false,
                                    render: (currentData, dataFormFilterChange) => html`
                                        <cellbase-search-autocomplete
                                            .resource="${"DISORDER"}"
                                            .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.data)}">
                                        </cellbase-search-autocomplete>
                                    `,
                                },

                            },
                            elements: [
                                {
                                    title: "Disorder ID",
                                    field: "disorders[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "disorders[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "disorders[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "disorders[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                    ],
                },
            ]
        });
    }

}

customElements.define("workflow-create", WorkflowCreate);
