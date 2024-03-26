/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const FAMILY_BROWSER_SETTINGS = {

    menu: {
        // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string).
        // Sections and filter order is respected.
        sections: [
            {
                filters: ["id", "members", "disorders", "phenotypes", "date", "annotations"]
            }
        ],
        // merge criterium: full outer join-like. it adds objects presents in internal array only and in external array only. In case of same id, the external value overwrite the internal.
        examples: [
        ]
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
        columns: ["id", "members", "disorders", "phenotypes", "caseId", "creationDate", "actions"],

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
    details: ["family-view", "family-relatedness", "json-view"]
};
