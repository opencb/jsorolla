const OPENCGA_INDIVIDUAL_BROWSER_SETTINGS = {
    /**
     *  Full settings
     */

    // TODO clinical-analysis-grid has no action column here

    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "samples", "father", "mother", "phenotypes", "disorders", "sex", "karyotypicSex", "ethnicity", "lifeStatus", "date", "annotations"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: []
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showDownload: false,
            showExport: true,
            exportTabs: ["download", "link", "code"]
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        columns: ["id", "samples", "father", "mother", "disorders", "phenotypes", "caseId", "sex", "ethnicity", "dateOfBirth", "creationDate", "actions"]

        // Example:
        // annotations: [
        //     {
        //         title: "Cardiology Tests",
        //         position: 3,
        //         variableSetId: "cardiology_tests_checklist",
        //         variables: ["ecg_test", "echo_test"]
        //     },
        //     {
        //         title: "Risk Assessment",
        //         position: 5,
        //         variableSetId: "risk_assessment",
        //         variables: ["vf_cardiac_arrest_events"]
        //     }
        // ]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["individual-view", "clinical-analysis-grid", "individual-inferred-sex", "individual-mendelian-error", "json-view"]
};
