const CLINICAL_ANALYSIS_BROWSER_SETTINGS = {
    menu: {
        sections: [
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string).
            // Sections and filter order is respected.
            {
                filters: ["id", "family", "proband", "sample", "status", "priority", "type", "creationDate", "dueDate"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: []
    },
    table: {
        pageSize: 10,
        pageList: [5, 10, 25],
        showToolbar: true,
        showActions: true,
        toolbar: {
            showCreate: true, // If true, the  button will be displayed but disabled
            showSettings: true,
            showExport: true,
            exportTabs: ["download", "link", "code"]
        },
        skipExtensions: false,

        readOnlyMode: false, // It hides priority and status selectors even if the user has permissions

        // Merge criteria: uses this array as filter for internal 1D/2D array. It handles row/col span.
        columns: ["caseId", "probandId", "disorderId", "interpretation", "status", "priority", "analysts", "dates", "action"]

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
    details: ["clinical-analysis-view", "json-view"]
};
