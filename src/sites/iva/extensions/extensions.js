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
            tools: [],
            maintainer: "",
            version: "",
            compatibleWith: "",
            render: (html, opencgaSession) => html`
                <div>
                    <h1>Hello ${opencgaSession.user.name}</h1>
                </div>
            `,
        },
        // {
        //     id: "custom-column",
        //     name: "New Column",
        //     description: "Example column",
        //     type: "column",
        //     components: [
        //         "variant-browser-grid",
        //     ],
        //     columnTitle: "New Column",
        //     columnRowspan: 2,
        //     columnFormatter: (value, row, index) => {
        //         return `Row ${index}`;
        //     },
        // },
        {
            id: "custom-columns",
            name: "Custom columns",
            description: "Example columns for Variant Browser",
            type: "column",
            components: [
                "variant-browser-grid",
            ],
            maintainer: "",
            version: "",
            compatibleWith: "",
            columns: [
                [
                    {
                        id: "new-column-1",
                        title: "Extra column",
                        field: "",
                        rowspan: 2,
                        colspan: 1,
                        align: "center",
                        formatter: (value, row, index) => `Row ${index}`,
                        _injectPosition: -4,
                    },
                    {
                        id: "new-column-2",
                        title: "Extra columns",
                        field: "",
                        rowspan: 1,
                        colspan: 2,
                        align: "center",
                        _injectPosition: -2,
                    },
                ],
                [
                    {
                        id: "new-subcolumn-1",
                        title: "Column 1",
                        field: "",
                        colspan: 1,
                        rowspan: 1,
                        formatter: (value, row, index) => `Row ${index}.1`,
                        align: "center",
                        // visible: true,
                        // _injectPosition: -1,
                    },
                    {
                        id: "new-subcolumn-2",
                        title: "Column 2",
                        field: "",
                        colspan: 1,
                        rowspan: 1,
                        formatter: (value, row, index) => `Row ${index}.2`,
                        align: "center",
                        // visible: true,
                        // _injectPosition: -1,
                    },
                ],
            ],
        },
    ],
};
