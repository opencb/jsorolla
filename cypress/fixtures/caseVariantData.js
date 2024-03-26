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

const caseFilterVariant = {
    diseasePanel: {
        disease_panel: ["Albinism or congenital nystagmus"],
        feature_type: ["Region"],
        genes_by_moi: ["X-linked Dominant"],
        genes_by_confidence: ["LOW"],
        genes_by_roles_in_cancer: ["TUMOR_SUPPRESSOR_GENE"],
        panel_intersection: "ON"
    },
    clinicalAnnotation: {
        clinical_database: "ClinVar",
        clinical_significance: ["Likely benign", "Benign", "Pathogenic"],
        clinical_status: false
    },
    consequenceType: {
        coding_sequence: true,
        terms_manual: ["coding_sequence_variant"]
    }

};


module.exports = {
    caseFilterVariant
};
