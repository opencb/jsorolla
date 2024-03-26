const INDIVIDUAL_BROWSER_SETTINGS = {
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string).
        // Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "samples", "father", "mother", "disorders", "phenotypes", "sex", "karyotypicSex", "ethnicity", "lifeStatus", "date", "annotations"]
            }
        ],
        examples: []
    },
    table: {
        // Browser parameters per study that an admin can configure.
        pageSize: 10,
        pageList: [5, 10, 25],
        showToolbar: true,
        showActions: true,
        toolbar: {
            showCreate: true,
            showSettings: true,
            showExport: true,
            exportTabs: ["download", "link", "code"]
        },
        skipExtensions: false,

        // Columns list for the dropdown will be added in grid components based on settings.table.columns
        columns: ["id", "samples", "father", "mother", "disorders", "phenotypes", "ethnicity", "caseId", "creationDate", "actions"],

        // Annotations Example:
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
    details: ["individual-view", "clinical-analysis-grid", "individual-inferred-sex", "individual-mendelian-error", "json-view"],
};
