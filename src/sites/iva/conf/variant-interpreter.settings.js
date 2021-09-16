const variantInterpreterSettings = {
    tools: [
        {
            id: "select"
        },
        {
            id: "qc",
            tabs: [
                {
                    id: "overview",
                    settings: variantInterpreterQcOverviewSettings
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
                CANCER: variantInterpreterBrowserCancerSettings,
                FAMILY: variantInterpreterBrowserRdSettings,
                SINGLE: variantInterpreterBrowserRdSettings
            }
        }
        /* {
            id: "review"
        },
        {
            id: "report"
        }*/
    ]
};
