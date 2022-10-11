const DISEASE_PANEL_BROWSER_SETTINGS = {
    /**
     *  Full settings
     */
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "disorders", "genes", "region", "source", "categories", "tags", "date"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: []
    },
    table: {
        // Merge criteria: spread operator
        toolbar: {
            showColumns: true,
            showDownload: false,
            showExport: true,
            exportTabs: ["download", "link", "code"]
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        // Merge criteria: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        columns: ["id", "name", "stats", "source"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["disease-panel-view", "disease-panel-genes", "disease-panel-regions", "disease-panel-variants", "json-view"]
};

