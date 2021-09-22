const VARIANT_INTERPRETER_SETTINGS = {
    tools: [
        {
            id: "select"
        },
        {
            id: "qc",
            tabs: [
                {
                    id: "overview",
                    settings: VARIANT_INTERPRETER_QC_OVERVIEW_SETTINGS
                },
                {id: "sampleVariantStats"},
                /* {id: "cancerQCPlots"},*/
                {id: "somaticVariantStats"},
                {id: "germlineVariantStats"}
                /* "{id: geneCoverage"}*/
            ],
        },
        /* {
            id: "methods"
        },*/
        {
            id: "variant-browser",
            browsers: {
                CANCER: VARIANT_INTERPRETER_BROWSER_CANCER_SETTINGS,
                FAMILY: VARIANT_INTERPRETER_BROWSER_RD_SETTINGS,
                SINGLE: VARIANT_INTERPRETER_BROWSER_RD_SETTINGS
            }
        },
        {
            id: "review"
        },
        {
            id: "report"
        }
    ]
};
