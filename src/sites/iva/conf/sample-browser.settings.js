// const OPENCGA_SAMPLE_BROWSER_SETTINGS = {
//     menu: {
//         // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
//         sections: [
//             {
//                 filters: ["id", "individualId", "fileIds", "phenotypes", "somatic", "date", "annotations"]
//             }
//         ],
//         // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
//         examples: []
//     },
//     table: {
//         // merge criterium: spread operator
//         toolbar: {
//             showColumns: true,
//             showDownload: false,
//             showExport: true,
//             exportTabs: ["download", "link", "code"]
//             // columns list for the dropdown will be added in grid components based on settings.table.columns
//         },
//         // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
//         // It is supported either columns[] or hiddenColumns[].
//         columns: ["id", "individualId", "fileIds", "caseId", "collection.method", "processing.preparationMethod", "cellLine", "creationDate", "actions"]
//     },
//     // merge criterium: uses this array as filter for internal 1D array.
//     detail: ["sample-view", "sample-variant-stats-view", "samtools-flags-stats-view", "individual-view", "file-view", "json-view"]
//
// };

const SAMPLE_BROWSER = {
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "individualId", "fileIds", "phenotypes", "somatic", "date", "annotations"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: []
    },
    table: {
        // Browser parameters per study that an admin can configure.
        pageSize: 4,
        pageList: [4, 10, 25],
        showToolbar: true,
        showActions: true,
        toolbar: {
            showCreate: true,
            showSettings: true,
            showExport: true,
            exportTabs: ["download", "link", "code"]
        },
        skipExtensions: false,
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // Columns list for the dropdown will be added in grid components based on settings.table.columns
        columns: ["id", "individualId", "fileIds", "caseId", "collection.method", "processing.preparationMethod", "cellLine", "creationDate", "actions"],
        annotations: [],
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
    detail: ["sample-view", "sample-variant-stats-view", "samtools-flags-stats-view", "individual-view", "file-view", "json-view"]
};
