const opencgaClinicalAnalysisBrowserSettings = {
    menu: {
        // merge criterium: it uses this `filters` array as filter for internal one. Each object is merged with spread operator
        filters: [
            {
                id: "id"
            },
            {
                id: "family"
            },
            {
                id: "proband"
            },
            {
                id: "sample"
            },
            {
                id: "status"
            },
            {
                id: "priority"
            },
            {
                id: "type"
            },
            {
                id: "date"
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: []
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: false,
            showDownload: true
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span.
        // It is supported either columns[] or hiddenColumns[].
        // TODO NOTE this refers to clinical-analysis-grid (same list in review-cases.settings)
        columns: ["caseId", "probandId", "familyId", "disorderId", "interpretation", "action"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["clinical-analysis-view", "json-view"]
};
