window.IVA_EXTENSIONS.push({
    id: "opencb",
    name: "OpenCB",
    description: "",
    commercial: false,
    license: "",
    extensions: [
        {
            id: "custom-tool",
            name: "Custom Tool",
            description: "Example Tool extension",
            type: "tool",
            components: [],
            maintainer: "",
            version: "",
            compatibleWith: "",
            render: params => params.html`
                <div>
                    <h1>Hello ${params.opencgaSession.user.name}</h1>
                </div>
            `,
        },
        {
            id: "variant-columns",
            name: "Variant Columns",
            description: "Example columns for Variant Browser",
            type: "column",
            components: [
                "variant-browser-grid",
                "variant-interpreter-rd-grid",
                "variant-interpreter-cancer-snv-grid",
                "variant-interpreter-cancer-cnv-grid",
                "variant-interpreter-rearrangement-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                [
                    {
                        position: -2,
                        config: {
                            id: "new-column-1",
                            title: "Extra column",
                            field: "",
                            rowspan: 2,
                            colspan: 1,
                            align: "center",
                            formatter: (value, row, index) => `Row ${index}`,
                        },
                    },
                ],
            ],
        },
        {
            id: "variant-detail",
            name: "New Variant Tab",
            description: "Example detail_tab extension for Variant Browser",
            type: "detail_tab",
            components: [
                "variant-browser-detail",
                "variant-interpreter-rd-detail",
                "variant-interpreter-cancer-snv-detail",
                "variant-interpreter-cancer-cnv-detail",
                "variant-interpreter-rearrangement-detail",
            ],
            compatibleWith: "",
            render: params => params.html`
                <div>Content of the new detail tab for <b>Variant Browser</b></div>
            `,
        },
        {
            id: "catalog-columns",
            name: "Catalog Columns",
            description: "Example columns for Catalog Grids",
            type: "column",
            components: [
                "clinical-analysis-grid",
                "cohort-grid",
                "family-grid",
                "file-grid",
                "individual-grid",
                "job-grid",
                "sample-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                {
                    // position: 0,
                    config: {
                        id: "new-column-1",
                        title: "Extra column",
                        field: "",
                        align: "center",
                        formatter: (value, row, index) => `Row ${index}`,
                    },
                },
            ],
        },
        {
            id: "catalog-columns-multiple",
            name: "Catalog Columns",
            description: "Example columns for Catalog Grids",
            type: "column",
            components: [
                "disease-panel-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                [
                    {
                        // position: 0,
                        config: {
                            id: "new-column-1",
                            title: "Extra column",
                            field: "",
                            align: "center",
                            rowspan: 2,
                            colspan: 1,
                            formatter: (value, row, index) => `Row ${index}`,
                        },
                    },
                ],
            ],
        },
        {
            id: "catalog-detail",
            name: "New Catalog Tab",
            description: "Example detail tab for Catalog Details",
            type: "detail_tab",
            components: [
                "clinical-analysis-detail",
                "cohort-detail",
                "disease-panel-detail",
                "family-detail",
                "file-detail",
                "individual-detail",
                "job-detail",
                "sample-detail",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            render: params => {
                return params.html`
                    <div>Hello world</div>
                `;
            },
        },
    ],
});
