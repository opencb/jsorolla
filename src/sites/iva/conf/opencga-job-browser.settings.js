const OPENCGA_JOB_BROWSER_SETTINGS = {
    /**
     *  Full settings
     */
    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "tool", "input", "internalStatus", "priority", "tags", "creationDate", "visited"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: [
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showDownload: false,
            showExport: true,
            exportTabs: ["download", "link", "code"],
            autorefreshTiming: 60000, // 60s
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        },
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        columns: ["id", "toolId", "status", "priority", "dependsOn", "output", "execution", "creationDate", "actions"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    details: ["job-view", "job-log", "json-view"]
};
