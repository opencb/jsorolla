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

const OPENCGA_CLINICAL_ANALYSIS_VIEW_SETTINGS = {
    // merge criterium: uses this array as filter for internal 1D array. Same as settings.table.columns in `clinical-review-cases.settings`.
    /** clinical-analysis-view settings
     * works either with:
     * - `fields` an explicit list of ids. In this case each field in DataForm needs an id.
     * - `hiddenFields` a list of fields to exclude
     */
    // GEL settings
    hiddenFields: ["type", "flags", "status.name", "description", "priority", "analyst.assignee", "creationDate", "dueDate", "pedigree"]
};
