const variantInterpreterSettings = {
    tools: [
        {
            id: "select"
        },
        {
            id: "qc",
            tabs: ["overview", "sampleVariantStats", /* "cancerQCPlots",*/ "somaticVariantStats", "germlineVariantStats"/* "geneCoverage"*/],
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
