const VARIANT_INTERPRETER_BROWSER_RD_SETTINGS = {
    menu: {
        sections: [
            {
                title: "Sample",
                // TODO file-quality: showDepth: false
                filters: ["sample-genotype", "sample", "file-quality", "cohort"]
            },
            {
                title: "Genomic",
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                filters: ["diseasePanels", "clinical-annotation"]
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
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        columns: ["id", "gene", "type", "consequenceType", "zygosity", "evidences", "VCF_Data", "frequencies", "clinicalInfo", "interpretation", "review", "actions"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "fileMetrics", "cohortStats", "samples", "beacon"]

};
