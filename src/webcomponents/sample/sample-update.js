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
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/opencga-update.js";

export default class SampleUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sampleId: {
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
            },
        };
    }

    #init() {
        this._sample = {};
        this.sampleId = "";
        this.displayConfig = {};
        this.updatedFields = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    // This observer fetches the object fetched from the server.
    // Uncomment when using 'onComponentFieldChange' to post-process data-from manipulation.
    onComponentIdObserver(e) {
        this._sample = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    // Uncomment to post-process data-from manipulation
    // onComponentFieldChange(e) {
    //     debugger
    //     this.updatedFields = e.detail?.updatedFields || {};
    //     this.requestUpdate();
    // }

    render() {
        return html `
            <opencga-update
                .resource="${"SAMPLE"}"
                .componentId="${this.sampleId}"
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
                            title: "Sample ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a sample ID...",
                                helpMessage: (fieldValue, sample) => {
                                    return sample.creationDate ? "Created on " + UtilsNew.dateFormatter(sample.creationDate) : "No creation date";
                                },
                                disabled: true,
                            },
                        },
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "Individual ID ...",
                                render: (individualId, dataFormFilterChange, updateParams) => html`
                                    <catalog-search-autocomplete
                                        .value="${individualId}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${updateParams?.individualId ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Somatic",
                            field: "somatic",
                            type: "checkbox",
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "Source",
                            field: "source",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "source.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "source.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add source name"
                                    }
                                },
                                {
                                    title: "Source",
                                    field: "source.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "External source name"
                                    }
                                },
                                {
                                    title: "URL",
                                    field: "source.url",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a URL"
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "source.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
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
                {
                    title: "Processing Info",
                    elements: [
                        {
                            title: "Product Processing",
                            field: "processing.product",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "ID",
                                    field: "processing.product.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a processing ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "processing.product.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a processing name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "processing.product.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ontology source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "processing.product.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a processing description..."
                                    },
                                },
                            ]
                        },
                        {
                            title: "Preparation Method",
                            field: "processing.preparationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a preparation method...",
                            },
                        },
                        {
                            title: "Extraction Method",
                            field: "processing.extractionMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add an extraction method...",
                            },
                        },
                        {
                            title: "Lab Sample ID",
                            field: "processing.labSampleId",
                            type: "input-text",
                            display: {
                                placeholder: "Add the lab sample ID...",
                            },
                        },
                        {
                            title: "Quantity",
                            field: "processing.quantity",
                            type: "input-num",
                            allowedValues: [0, 10],
                            step: 0.01,
                            display: {
                                placeholder: "Add a quantity...",
                            },
                        },
                        {
                            title: "Date",
                            field: "processing.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            },
                        },
                    ],
                },
                {
                    title: "Collection Info",
                    elements: [
                        {
                            title: "Collection",
                            field: "collection.from",
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
                                    title: "Collection ID",
                                    field: "collection.from[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add collection ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "collection.from[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "collection.from[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "collection.from[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                        {
                            title: "Type",
                            field: "collection.type",
                            type: "input-text",
                            display: {
                                placeholder: "Add the type of sample collection...",
                            },
                        },
                        {
                            title: "Quantity",
                            field: "collection.quantity",
                            type: "input-num",
                            display: {
                                placeholder: "Add a quantity...",
                            },
                        },
                        {
                            title: "Method",
                            field: "collection.method",
                            type: "input-text",
                            display: {
                                placeholder: "Add a method...",
                            },
                        },
                        {
                            title: "Date",
                            field: "collection.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            },
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
                                showAddItemListButton: true,
                                showAddBatchListButton: true,
                                showResetListButton: true,
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
                                        placeholder: "Add a description...",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("sample-update", SampleUpdate);
