const VARIANT_INTERPRETER_BROWSER_REARRANGEMENT_SETTINGS = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []

        sections: [ // sections and subsections, structure and order is respected
            {
                title: "Sample And File",
                filters: ["variant-file", "variant-file-info-filter"],
            },
            {
                title: "Genomic",
                filters: ["region", "feature", "biotype", "diseasePanels"]
            },
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        }
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []

};
