const OpencgaVariantBrowserSettings = {
    menu: {
        // merge criterium: it uses this `filters` array as filter for internal one. Each object is merged with spread operator
        filters: [
            {id: "study"},
            {id: "cohort"},
            {id: "region"},
            {id: "feature"},
            {id: "biotype"},
            {id: "type"},
            {id: "consequenceTypeSelect"},
            {id: "populationFrequency"},
            {id: "diseasePanels"},
            {id: "clinical-annotation"},
            {id: "fullTextSearch"},
            {id: "go"},
            {id: "hpo"},
            {id: "proteinSubstitutionScore"},
            {id: "cadd"},
            {id: "conservation"}
        ],
        // merge criterium: full outer join like. it adds objects presents in internal array only and in external array only. In case of objects with same id, the external values overwrite the internal.
        examples: [
            {
                id: "Intellectual disability2",
                active: false,
                query: {
                    disorder: "Intellectual disability"
                }
            }
        ]
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
        columns: ["id", "gene", "type", "consequenceType", "deleteriousness", "conservation", "samples", "cohorts", "popfreq", "clinicalInfo"]
        // hiddenColumns: ["id", "gene", "type"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "cohortStats", "samples", "beacon", "json-view"]
};
