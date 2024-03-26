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

const CLINICAL_ANALYSIS_PORTAL_SETTINGS = {
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
        // CAUTION 20240108 Vero: No table settings in the component <clinical-analysis-portal>
        // toolbar: {
        //     showSettings: true,
        //     showColumns: false,
        //     showCreate: true,
        //     showExport: true,
        //     showDownload: false,
        //     // columns list for the dropdown will be added in grid components based on settings.table.columns
        // },
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // TODO NOTE this refers to clinical-analysis-grid (same list in clinical-analysis-browser.settings)
        // columns: ["caseId", "probandId", "familyId", "disorderId", "interpretation", "actions"]
    },
    details: ["clinical-analysis-view"],
};

