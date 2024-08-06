const OPENCGA_VARIANT_BROWSER_SETTINGS = {
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                title: "Study and Cohorts",
                filters: ["study", "sample", "cohort"]
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Consequence Type",
                collapsed: true,
                filters: ["consequence-type"]
            },
            {
                title: "Population Frequency",
                collapsed: true,
                filters: ["populationFrequency"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels", "clinical-annotation", "role-in-cancer", "fullTextSearch"]
            },
            {
                title: "Phenotype",
                collapsed: true,
                filters: ["go", "hpo"]
            },
            {
                title: "Deleteriousness",
                collapsed: true,
                filters: ["proteinSubstitutionScore", "cadd"]
            },
            {
                title: "Conservation",
                collapsed: true,
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
        ],
        // Default filter displayed in Variant Browser
        // defaultFilter: {
        //     type: "SNV",
        // },
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        // Highlight conditions for Variant Browser
        // highlights: [
        //     {
        //         id: "highlight1",
        //         name: "Test highlight 1",
        //         description: "",
        //         condition: () => true,
        //         style: {
        //             rowBackgroundColor: "#cfe2ff",
        //             rowOpacity: 0.5,
        //             icon: "circle",
        //             iconColor: "blue",
        //         },
        //     },
        // ],
        // activeHighlights: ["highlight1"],
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span.
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id", "gene", "type", "consequenceType", "deleteriousness", "conservation", "samples", "cohorts", "popfreq", "clinicalInfo", "actions"]
        // hiddenColumns: ["id", "gene", "type"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    // It is supported either details[] or hiddenDetails[].
    details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "annotationPharmacogenomics", "cohortStats", "samples", "beacon", "json-view"]
    // hiddenDetails: ["json-view"]
};
