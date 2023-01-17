// import UtilsNew from "../../../core/utils-new";

const DATA_FORM_EXAMPLE = {
    display: this.displayConfig,
    sections: [
        {
            title: "General Information",
            elements: [
                {
                    title: "Sample ID",
                    field: "id",
                    type: "input-text",
                    required: true,
                    display: {
                        placeholder: "Add a short ID...",
                        helpMessage: "Created on ...",
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
                        disabled: true,
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
                            title: "Name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add source name"
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
                                placeholder: "Add phenotype ID...",
                            },
                        },
                        {
                            title: "name",
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
                                    <div class="help-block">${phenotype?.description}</div>`,
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
                                placeholder: "Add a description...",
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
