const variantInterpreterBrowserRdSettings = {
    menu: {
        filters: [
            {
                id: "sample-genotype"
            },
            {
                id: "sample"
            },
            {
                id: "file-quality",
                showDepth: false
            },
            {
                id: "cohort"
            },
            {
                id: "region"
            },
            {
                id: "feature"
            },
            {
                id: "biotype"
            },
            {
                id: "type"
            },
            {
                id: "diseasePanels"
            },
            {
                id: "clinvar"
            },
            {
                id: "consequenceTypeSelect"
            },
            {
                id: "populationFrequency"
            },
            {
                id: "go"
            },
            {
                id: "hpo"
            },
            {
                id: "proteinSubstitutionScore"
            },
            {
                id: "cadd"
            },
            {
                id: "conservation"
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
