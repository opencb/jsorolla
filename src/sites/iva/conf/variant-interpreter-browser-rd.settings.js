const variantInterpreterBrowserRdSettings = {
    menu: {
        sections: [
            {
                title: "Sample",
                // file-quality: showDepth: false
                fields: ["sample-genotype", "sample", "file-quality", "cohort"]
            },
            {
                title: "Genomic",
                fields: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                fields: ["diseasePanels", "clinical-annotation"]
            },
            {
                title: "Consequence Type",
                fields: ["consequenceTypeSelect"]
            },
            {
                title: "Population Frequency",
                fields: ["populationFrequency"]
            },
            {
                title: "Phenotype",
                fields: ["go", "hpo"]
            },
            {
                title: "Deleteriousness",
                fields: ["proteinSubstitutionScore", "cadd"]
            },
            {
                title: "Conservation",
                fields: ["conservation"]
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
