window.IVA_EXTENSIONS = {
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
            type: "tool", // {tool | detail_tab | view}
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
            id: "variant-browser-columns",
            name: "Custom columns",
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
            id: "variant-browser-detail",
            name: "New Variant Browser Tab",
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
            id: "custom-columns-file-grid",
            name: "Custom columns",
            description: "Example columns for File Grid",
            type: "column",
            components: [
                "file-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                {
                    position: -4,
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
            id: "custom-tabs-file-detail",
            name: "Custom Tab",
            description: "Example detail tab for File Detail",
            type: "detail_tab",
            components: [
                "file-detail",
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
};
