const variantInterpreterBrowserCancerSettings = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: false,
            showDownload: true
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        }
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []

};
