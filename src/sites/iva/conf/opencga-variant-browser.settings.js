const OpencgaVariantBrowserSettings = {
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                title: "Study and Cohorts",
                filters: ["study", "cohort"]
            },
            {
                title: "Genomic",
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Consequence Type",
                filters: ["consequenceTypeSelect"]
            },
            {
                title: "Population Frequency",
                filters: ["populationFrequency"]
            },
            {
                title: "Clinical",
                filters: ["diseasePanels", "clinical-annotation", "fullTextSearch"]
            },
            {
                title: "Phenotype",
                filters: ["go", "hpo"]
            },
            {
                title: "Deleteriousness",
                filters: ["proteinSubstitutionScore", "cadd"]
            },
            {
                title: "Conservation",
                filters: ["conservation"]
            }
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
