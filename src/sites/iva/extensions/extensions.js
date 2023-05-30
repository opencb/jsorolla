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
        {
            id: "custom-column",
            name: "New Column",
            description: "Example column",
            type: "column",
            components: [
                "variant-browser-grid",
            ],
            columnTitle: "New Column",
            columnRowspan: 2,
            columnFormatter: (value, row, index) => {
                return `Row ${index}`;
            },
        },
    ],
};
