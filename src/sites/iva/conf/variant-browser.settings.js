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

const VARIANT_BROWSER_SETTINGS = {
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
        ],
        // Default filter displayed in Variant Browser
        // defaultFilter: {
        //     type: "SNV",
        // },
    },
    table: {
        pageSize: 10,
        pageList: [5, 10, 25],
        showToolbar: true,
        showActions: true,
        toolbar: {
            showSettings: true,
            showExport: true,
            exportTabs: ["download", "export", "link", "code"]
        },
        skipExtensions: false,

        showSelectCheckbox: false,
        genotype: {
            type: "VCF_CALL"
        },
        alleleStringLengthMax: 15,
        geneSet: {
            ensembl: true,
            refseq: true,
        },
        consequenceType: {
            maneTranscript: true,
            gencodeBasicTranscript: true,
            ensemblCanonicalTranscript: true,
            refseqTranscript: true, // Fixme: not considered in variant-interpreter-grid-config?
            ccdsTranscript: false,
            ensemblTslTranscript: false,
            proteinCodingTranscript: false,
            highImpactConsequenceTypeTranscript: false,
            showNegativeConsequenceTypes: true
        },
        populationFrequenciesConfig: {
            displayMode: "FREQUENCY_BOX" // Options: FREQUENCY_BOX | FREQUENCY_NUMBER
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
        // columns: ["id", "gene", "type", "consequenceType", "deleteriousness", "conservation", "samples", "cohorts", "popfreq", "clinicalInfo", "actions"]
    },

    // merge criterium: uses this array as filter for internal 1D array.
    details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "cohortStats", "samples", "beacon", "json-view"]
};
