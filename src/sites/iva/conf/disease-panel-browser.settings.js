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

const DISEASE_PANEL_BROWSER_SETTINGS = {
    menu: {
        sections: [
            // merge criterium: internal sections and filters are used to hydrates the external filters list for each section (which is a list of string).
            // Sections and filter order is respected.
            {
                filters: ["id", "source", "disorders", "genes", "region", "categories", "tags", "date"]
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
            exportTabs: ["download", "link", "code"],
        },
        skipExtensions: false,

        // Merge criteria: uses this array as filter for internal 1D/2D array. It handles row/col span
        columns: ["name", "disorders", "stats", "source", "actions"]
    },

    // merge criterium: uses this array as filter for internal 1D array.
    details: ["disease-panel-view", "disease-panel-genes", "disease-panel-regions", "disease-panel-variants", "json-view"]
};
