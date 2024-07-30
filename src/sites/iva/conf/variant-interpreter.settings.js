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

const BROWSER_CANCER_CNV_SETTINGS = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []

        sections: [ // sections and subsections, structure and order is respected
            {
                title: "Sample And File",
                filters: ["sample-genotype", "variant-file", "variant-file-info-filter"],
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels"]
            },
            {
                title: "Phenotype",
                collapsed: true,
                filters: ["go", "hpo"]
            },
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        }
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []
};

const BROWSER_CANCER_SNV_SETTINGS = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []

        sections: [ // sections and subsections, structure and order is respected
            {
                title: "Sample And File",
                filters: ["sample-genotype", "variant-file", "variant-file-sample-filter", "variant-file-info-filter", "cohort"],
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels", "clinical-annotation", "role-in-cancer"]
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

        highlights: [
            {
                id: "highlightVariant",
                // description: "highlight variants with a dp<5",
                active: true,
                // name: "Low depth variant (DP<5)",
                limit: 5,
                param: "DP",
                comparator: "lt",
                paramDescription: "Low depth variant",
                description: "Highlight variants with a ",
                style: {
                    // Row style
                    // rowBackgroundColor: "#ededed",
                    rowOpacity: 0.5,
                    icon: "circle",
                    iconColor: "blue",
                },
            },
        ],
        activeHighlights: ["highlightVariant"],

        /*
        highlights: [
            {
                id: "Low depth variant",
                name: "Low depth variant (DP<5)",
                description: "Highlight variants with a DP<5",
                active: true,
                condition: variant => {
                    const index = variant.studies[0]?.sampleDataKeys?.findIndex(key => key === "DP");
                    if (index > -1) {
                        return Number(variant.studies[0].samples[0]?.data[index]) < 5;
                    } else {
                        return false;
                    }
                },
                style: {
                    // Row style
                    // rowBackgroundColor: "#FEF9E7",
                    rowOpacity: 0.5,
                },
            }
        ],
*/
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []

};

const BROWSER_RD_SETTINGS = {
    menu: {
        sections: [
            {
                title: "Sample",
                filters: ["sample-genotype", "family-genotype", "individual-hpo", "variant-file-sample-filter", "variant-file-info-filter", "cohort"]
            },
            {
                title: "Genomic",
                collapsed: true,
                filters: ["region", "feature", "biotype", "type"]
            },
            {
                title: "Clinical",
                collapsed: true,
                filters: ["diseasePanels", "clinical-annotation"]
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
        highlights: [
            {
                id: "highlightVariantDP",
                name: "Low depth variant (DP<20)",
                description: "Highlight variants with a DP<20",
                actionId: "highlightVariant",
                filters: ["DP<20", "GQX<10"],
                // filters: ["GQX<10", "GT==0/1"],
                // filters: ["FILTER==LowGQX"],
                active: true,
                style: {
                    // Row style
                    rowBackgroundColor: "#ededed",
                    rowOpacity: 0.5,
                },
            },
            {
                id: "highlightVariantQual",
                name: "Low QUAL variant (QUAL<10)",
                description: "Low QUAL variant with a QUAL<10",
                actionId: "highlightVariant",
                filters: ["QUAL<10"],
                active: false,
                style: {
                    // Row style
                    rowBackgroundColor: "#d28888",
                    rowOpacity: 0.5,
                },
            },
        ],
        // activeHighlights: ["highlightVariantDP"],

        copies: [
            {
                id: "copyEpic",
                name: "Copy EGLH Epic",
                description: "Description of the Schema",
            }
        ]
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id", "gene", "type", "consequenceType", "zygosity", "evidences", "VCF_Data", "frequencies", "clinicalInfo", "interpretation", "review", "actions"]
    },
    // merge criterium: uses this array as filter for internal 1D array.
    // details: ["annotationSummary", "annotationConsType", "annotationPropFreq", "annotationClinical", "fileMetrics", "cohortStats", "samples", "beacon"]

};

const BROWSER_REARRANGEMENT_SETTINGS = {
    menu: {
        // add all filters and let variant-interpreter-browser-cancer handle the visibility based on callers
        // filters: []

        sections: [ // sections and subsections, structure and order is respected
            // {
            //     title: "Sample And File",
            //     filters: ["variant-file-info-filter"],
            // },
            {
                title: "Genomic",
                filters: ["region", "feature", "biotype", "diseasePanels"]
            },
            // {
            //     title: "Clinical",
            //     filters: ["diseasePanels", "clinical-annotation"]
            // },
            // {
            //     title: "Phenotype",
            //     filters: ["go", "hpo"]
            // },
        ]
    },
    table: {
        // merge criterium: spread operator
        toolbar: {
            showColumns: true,
            showExport: true,
            showDownload: false
            // columns list for the dropdown will be added in grid components based on settings.table.columns
        }
        // merge criterium: uses this array as filter for internal 1D/2D array. It handles row/col span
        // It is supported either columns[] or hiddenColumns[].
        // columns: ["id"]
    }
    // merge criterium: uses this array as filter for internal 1D array.
    // details: []

};

const QC_OVERVIEW_SETTINGS = {
    // for both cancer and family cases
    tabs: ["Summary", "AscatMetrics", "VariantStats", "SamtoolsPlots", "Alignment", "InferredSex", "MendelianErrors", "Relatedness", "AlignmentStats", "GenomicContext"]
};

const VARIANT_INTERPRETER_SETTINGS = {
    tools: [
        {
            id: "select"
        },
        {
            id: "qc",
            tabs: [
                {
                    id: "overview",
                    settings: QC_OVERVIEW_SETTINGS,
                },
                {id: "cancerQCPlots"},
                {id: "mutationalSignature"},
                {id: "sampleVariantStats"},
                {id: "somaticVariantStats"},
                {id: "germlineVariantStats"},
                {id: "geneCoverage"}
            ],
        },
        {
            id: "methods",
            items: [
                {
                    type: "SINGLE",
                    methods: [
                        {id: "exomiser"},
                    ],
                },
                {
                    type: "FAMILY",
                    methods: [
                        {id: "exomiser"},
                    ],
                },
                {
                    type: "CANCER",
                    methods: [],
                },
            ],
        },
        {
            id: "variant-browser",
            browsers: {
                RD: BROWSER_RD_SETTINGS,
                CANCER_SNV: BROWSER_CANCER_SNV_SETTINGS,
                CANCER_CNV: BROWSER_CANCER_CNV_SETTINGS,
                REARRANGEMENT: BROWSER_REARRANGEMENT_SETTINGS,
            },
            // hideGenomeBrowser: false
        },
        {
            id: "report"
        }
    ],
};
