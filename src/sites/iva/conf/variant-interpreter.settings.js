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
                {id: "cancerQCPlots"},
                {id: "mutationalSignature"},
                {id: "sampleVariantStats"},
                {id: "somaticVariantStats"},
                {id: "germlineVariantStats"},
                {id: "geneCoverage"}
            ],
        },
        {
            id: "methods"
        },
        {
            id: "variant-browser",
            browsers: {
                CANCER_SNV: VARIANT_INTERPRETER_BROWSER_CANCER_SNV_SETTINGS,
                CANCER_CNV: VARIANT_INTERPRETER_BROWSER_CANCER_CNV_SETTINGS,
                RD: VARIANT_INTERPRETER_BROWSER_RD_SETTINGS,
                REARRANGEMENT: VARIANT_INTERPRETER_BROWSER_REARRANGEMENT_SETTINGS,
            },
            // hideGenomeBrowser: false
        },
        {
            id: "report"
        }
    ]
};
