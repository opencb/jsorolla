
const SETTINGS_NAME = "IVA_CONFIG_TEST_24";

const CATALOG_SETTINGS = {
    INDIVIDUAL_BROWSER: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
        // TODO clinical-analysis-grid has no action column here
        menu: {
            sections: [
                {
                    filters: ["id", "samples", "father", "mother", "phenotypes", "disorders", "sex", "karyotypicSex", "ethnicity", "lifeStatus", "date", "annotations"]
                }
            ],
            examples: []
        },
        table: {
            toolbar: {
                showColumns: true,
                showDownload: false,
                showExport: true,
                exportTabs: ["download", "link", "code"]
            },
            // It is supported either columns[] or hiddenColumns[].
            columns: ["id", "samples", "father", "mother", "disorders", "phenotypes", "caseId", "sex", "ethnicity", "dateOfBirth", "creationDate", "actions"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["individual-view", "clinical-analysis-grid", "individual-inferred-sex", "individual-mendelian-error", "json-view"]
    },
    COHORT_BROWSER: {
        /**
         *  Full settings
         */
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["id", "samples", "type", "date", "annotations"]
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
                exportTabs: ["download", "link", "code"]
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
            // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
            // It is supported either columns[] or hiddenColumns[].
            columns: ["id", "numSamples", "creationDate", "type"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["cohort-view", "sample-view", "json-view"]
    },
    FAMILY_BROWSER: {
        /**
         *  Full settings
         */
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["id", "members", "phenotypes", "disorders", "date", "annotations"]
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
                exportTabs: ["download", "link", "code"]
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
            // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
            // It is supported either columns[] or hiddenColumns[].
            columns: ["id", "members", "disorders", "phenotypes", "caseId", "customAnnotation", "creationDate", "actions"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["family-view", "family-relatedness", "json-view"]
    },
    SAMPLE_BROWSER: {
        /**
         *  Full settings
         */
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
            columns: ["id", "individualId", "fileIds", "caseId", "collection.method", "processing.preparationMethod", "cellLine", "creationDate", "actions"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        detail: ["sample-view", "sample-variant-stats-view", "samtools-flags-stats-view", "individual-view", "file-view", "json-view"]

    },
    FILE_BROWSER: {
        /**
         *  Full settings
         */
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["name", "sampleIds", /* "path",*/ "directory", "jobId", "format", "bioformat", "internal.index.status.name", "date", "annotations"]
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
            columns: ["name", "directory", "size", "format", "bioformat", "index", "creationDate", "actions"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["file-view", "file-preview", "json-view"]
    },
    JOB_BROWSER: {
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
    },
    VARIANT_BROWSER: {
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    title: "Study and Cohorts",
                    filters: ["study", "sample", "cohort"]
                },
                {
                    title: "Genomic",
                    collapsed: true,
                    filters: ["region", "feature", "biotype", "type"]
                },
                {
                    title: "Consequence Type",
                    collapsed: true,
                    filters: ["consequence-type"]
                },
                {
                    title: "Population Frequency",
                    collapsed: true,
                    filters: ["populationFrequency"]
                },
                {
                    title: "Clinical",
                    collapsed: true,
                    filters: ["diseasePanels", "clinical-annotation", "role-in-cancer", "fullTextSearch"]
                },
                {
                    title: "Phenotype",
                    collapsed: true,
                    filters: ["go", "hpo"]
                },
                {
                    title: "Deleteriousness",
                    collapsed: true,
                    filters: ["proteinSubstitutionScore", "cadd"]
                },
                {
                    title: "Conservation",
                    collapsed: true,
                    filters: ["conservation"]
                }
            ],
            // merge criterium: full outer join like. it adds objects presents in internal array only and in external array only. In case of objects with same id, the external values overwrite the internal.
            examples: [
                {
                    id: "Intellectual disability2",
                    active: false,
                    query: {
                        disorder: "Intellectual disability"
                    }
                }
            ]
        },
        table: {
            // merge criterium: spread operator
            toolbar: {
                showColumns: true,
                showExport: true,
                showDownload: false
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
            // Highlight conditions for Variant Browser
            // highlights: [
            //     {
            //         id: "highlight1",
            //         name: "Test highlight 1",
            //         description: "",
            //         condition: () => true,
            //         style: {
            //             rowBackgroundColor: "#cfe2ff",
            //             rowOpacity: 0.5,
            //             icon: "circle",
            //             iconColor: "blue",
            //         },
            //     },
            // ],
            // activeHighlights: ["highlight1"],
            // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span.
            // It is supported either columns[] or hiddenColumns[].
            // columns: ["id", "gene", "type", "consequenceType", "deleteriousness", "conservation", "samples", "cohorts", "popfreq", "clinicalInfo", "actions"]
            // hiddenColumns: ["id", "gene", "type"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        // It is supported either details[] or hiddenDetails[].
        details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "cohortStats", "samples", "beacon", "json-view"]
        // hiddenDetails: ["json-view"]
    },
    DISEASE_PANEL_BROWSER: {
        /**
         *  Full settings
         */
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["id", "disorders", "genes", "region", "source", "categories", "tags", "date"]
                }
            ],
            // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
            examples: []
        },
        table: {
            // Merge criteria: spread operator
            toolbar: {
                showColumns: true,
                showDownload: false,
                showExport: true,
                exportTabs: ["download", "link", "code"]
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
            // Merge criteria: uses this array as filter for internal 1D/2D array. It handles row/col span
            // It is supported either columns[] or hiddenColumns[].
            columns: ["id", "name", "stats", "source", "actions"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["disease-panel-view", "disease-panel-genes", "disease-panel-regions", "disease-panel-variants", "json-view"]
    },
    CLINICAL_ANALYSIS_BROWSER: {
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["id", "family", "proband", "sample", "status", "priority", "type", "creationDate", "dueDate"]
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
            // Merge criteria: uses this array as filter for internal 1D/2D array. It handles row/col span.
            // It is supported either columns[] or hiddenColumns[].
            // TODO NOTE this refers to clinical-analysis-grid (same list in review-cases.settings)
            // columns: ["caseId", "probandId", "familyId", "disorderId", "interpretation", "action"]
        },
        // merge criterium: uses this array as filter for internal 1D array.
        details: ["clinical-analysis-view", "json-view"]
    },
    CLINICAL_ANALYSIS_PORTAL_BROWSER: {
        title: "Case Portal",
        icon: "fas fa-window-restore",
        menu: {
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string). Sections and filter order is respected.
            sections: [
                {
                    filters: ["id", "family", "proband", "sample", "status", "priority", "type", "creationDate", "dueDate"],
                },
            ],
            // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
            examples: [
                /* {
                    id: "Intellectual disability2",
                    active: false,
                    query: {
                        disorder: "Intellectual disability"
                    }
                }*/
            ],
        },
        table: {
            // merge criterium: spread operator
            toolbar: {
                showColumns: true,
                showCreate: false,
                showExport: true,
                showDownload: false,
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
            // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
            // It is supported either columns[] or hiddenColumns[].
            // TODO NOTE this refers to clinical-analysis-grid (same list in clinical-analysis-browser.settings)
            // columns: ["caseId", "probandId", "familyId", "disorderId", "interpretation", "actions"]
        },
        details: ["clinical-analysis-view"],
    },
    // RGA_BROWSER: {},
    // CLINICAL_ANALYSIS_VIEW: {
    //     /** clinical-analysis-view settings
    //      * works either with:
    //      * - `fields` an explicit list of ids. In this case each field in DataForm needs an id.
    //      * - `hiddenFields` a list of fields to exclude
    //      */
    //     // GEL settings
    //     hiddenFields: ["type", "flags", "status.name", "description", "priority", "analyst.assignee", "creationDate", "dueDate", "pedigree"]
    // }
};

const USER_SETTINGS = {
    // With a comment
    USER_PROFILE_SETTINGS: {
        items: ["user-projects", "user-password-change"]
    }
};

const ABOUT_SETTINGS = {
    CUSTOM_PAGES_SETTINGS: [
        {
            url: "about",
            title: "About",
            content: "Content of the <b>About</b> page.",
        },
        {
            url: "contact",
            title: "Contact",
            content: "Content of the <b>Contact</b> page.",
        },
        {
            url: "terms",
            title: "Terms of service",
            content: "Content of the <b>Terms of service</b> page.",
        },
        {
            url: "faq",
            title: "Frequently Asked Questions",
            content: "Content of the <b>FAQ</b> page.",
        },
        {
            url: "getting-started",
            title: "Getting Started",
            content: `
            <h3>Login</h3>
            <p>Welcome to ....</p>
            <h3>Menu</h3>
            ...
        `,
        },
    ],
};

const DEFAULT_SETTINGS = {
    catalog: {
        ...CATALOG_SETTINGS,
    },
    user: {
        ...USER_SETTINGS,
    },
    about: {
        ...ABOUT_SETTINGS
    },
    // FIXME: In Variant interpreter settings, solve dependencies?
};
