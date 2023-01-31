const VARIANT_INTERPRETER_BROWSER_RD_SETTINGS = {
    menu: {
        sections: [
            {
                title: "Sample",
                filters: ["sample-genotype", "family-genotype", "individual-hpo", "variant-file-sample-filter", "variant-file-info-filter", "cohort"]
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels", "clinical-annotation"]
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
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        highlights: [
            {
                id: "highlightVariantDP",
                name: "Low depth variant (DP<20)",
                description: "Highlight variants with a DP<20",
                actionId: "highlightVariant",
                filters: ["DP<20", "GQX<10"],
                // filters: ["GQX<10", "GT==0/1"],
                // filters: ["FILTER==LowGQX"],
                active: true,
                style: {
                    // Row style
                    rowBackgroundColor: "#ededed",
                    rowOpacity: 0.5,
                },
            },
            {
                id: "highlightVariantQual",
                name: "Low QUAL variant (QUAL<10)",
                description: "Low QUAL variant with a QUAL<10",
                actionId: "highlightVariant",
                filters: ["QUAL<10"],
                active: false,
                style: {
                    // Row style
                    rowBackgroundColor: "#d28888",
                    rowOpacity: 0.5,
                },
            },
        ],
        activeHighlights: ["highlightVariantDP"],

        copies: [
            {
                id: "copyEpic",
                name: "Copy EGLH Epic",
                description: "Description of the Schema",
            }
        ]
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id", "gene", "type", "consequenceType", "zygosity", "evidences", "VCF_Data", "frequencies", "clinicalInfo", "interpretation", "review", "actions"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    // details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "fileMetrics", "cohortStats", "samples", "beacon"]

};
