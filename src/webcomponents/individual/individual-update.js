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
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
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
            individualId: {
                type: String
            },
            active: {
                type: Boolean,
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
        this._individual = {};
        this.individualId = "";
        this.displayConfig = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onComponentIdObserver(e) {
        this._individual = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <opencga-update
                .resource="${"INDIVIDUAL"}"
                .componentId="${this.individualId}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}"
                @componentIdObserver="${e => this.onComponentIdObserver(e)}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Individual ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                                placeholder: "Add a short ID...",
                                helpMessage: this._individual.creationDate ? `Created on ${UtilsNew.dateFormatter(this._individual.creationDate)}` : "No creation date",
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
                                placeholder: "Add an individual name..."
                            },
                        },
                        {
                            title: "Father ID",
                            field: "father.id",
                            type: "custom",
                            display: {
                                placeholder: "Select the father ID ...",
                                render: (fatherId, dataFormFilterChange, updateParams) => {
                                    return html`
                                    <catalog-search-autocomplete
                                        .value="${fatherId}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${updateParams["father.id"] ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                                }
                            },
                        },
                        {
                            title: "Mother ID",
                            field: "mother.id",
                            type: "custom",
                            display: {
                                placeholder: "Select the mother ID ...",
                                render: (motherId, dataFormFilterChange, updateParams) => {
                                    return html`
                                    <catalog-search-autocomplete
                                        .value="${motherId}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${updateParams["mother.id"] ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                                }
                            },
                        },
                        {
                            title: "Sample ID(s)",
                            field: "samples",
                            type: "custom",
                            display: {
                                placeholder: "Select the sample IDs ...",
                                render: (samples, dataFormFilterChange, updateParams) => {
                                    const handleSamplesFilterChange = e => {
                                        // We need to convert value from a string wth commas to an array of IDs
                                        const sampleList = (e.detail.value?.split(",") || [])
                                            .filter(sampleId => sampleId)
                                            .map(sampleId => ({id: sampleId}));
                                        dataFormFilterChange(sampleList);
                                    };
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${samples?.map(s => s.id).join(",")}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .classes="${updateParams.samples ? "selection-updated" : ""}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => handleSamplesFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
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
                                    type: "input-text",
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
