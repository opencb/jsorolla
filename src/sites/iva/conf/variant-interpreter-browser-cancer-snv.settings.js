const VARIANT_INTERPRETER_BROWSER_CANCER_SNV_SETTINGS = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []

        sections: [ // sections and subsections, structure and order is respected
            {
                title: "Sample And File",
                filters: ["sample-genotype", "variant-file", "variant-file-sample-filter", "variant-file-info-filter", "cohort"],
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels", "clinical-annotation", "role-in-cancer"]
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
                id: "highlightVariant",
                // description: "highlight variants with a dp<5",
                active: true,
                // name: "Low depth variant (DP<5)",
                limit: 5,
                param: "DP",
                comparator: "lt",
                paramDescription: "Low depth variant",
                description: "Highlight variants with a ",
                style: {
                    // Row style
                    // rowBackgroundColor: "#ededed",
                    rowOpacity: 0.5,
                    icon: "circle",
                    iconColor: "blue",
                },
            },
        ],
        activeHighlights: ["highlightVariant"],

        /*
        highlights: [
            {
                id: "Low depth variant",
                name: "Low depth variant (DP<5)",
                description: "Highlight variants with a DP<5",
                active: true,
                condition: variant => {
                    const index = variant.studies[0]?.sampleDataKeys?.findIndex(key => key === "DP");
                    if (index > -1) {
                        return Number(variant.studies[0].samples[0]?.data[index]) < 5;
                    } else {
                        return false;
                    }
                },
                style: {
                    // Row style
                    // rowBackgroundColor: "#FEF9E7",
                    rowOpacity: 0.5,
                },
            }
        ],
*/
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []

};
