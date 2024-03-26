const JOB_BROWSER_SETTINGS = {
    menu: {
        sections: [
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string).
            // Sections and filter order is respected.
            {
                filters: ["id", "tool", "input", "internalStatus", "priority", "tags", "creationDate", "annotation"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: [
        ]
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
            showRefresh: true,
            autorefreshTiming: 60000, // 60s
            exportTabs: ["download", "link", "code"],
        },
        skipExtensions: false,

        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        columns: ["id", "toolId", "params", "output", "dependsOn", "status", "executionR", "executionD", "creationDate", "actions"]
    },

    // merge criterium: uses this array as filter for internal 1D array.
    details: ["job-view", "job-log", "json-view"]
};
