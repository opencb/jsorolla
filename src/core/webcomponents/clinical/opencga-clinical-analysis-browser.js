/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "../../utils.js";
import "../commons/opencga-browser.js";


export default class OpencgaClinicalAnalysisBrowser extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            query: {
                type: Object
            },
            search: {
                type: Object
            },
            config: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },
            resource: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        this.checkProjects = false;

        this.activeFilterAlias = {
            "annot-xref": "XRef",
            "biotype": "Biotype",
            "annot-ct": "Consequence Types",
            "alternate_frequency": "Population Frequency",
            "annot-functional-score": "CADD",
            "protein_substitution": "Protein Substitution",
            "annot-go": "GO",
            "annot-hpo": "HPO"
        };

        this.fixedFilters = ["studies"];

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;

        this.facets = new Set();
        this.facetFilters = [];

        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

    }

    // eslint-disable-next-line require-jsdoc
    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    getDefaultConfig() {
        return {
            title: "Clinical Analysis Browser",
            searchButtonText: "Run",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    active: true
                },/*
                {
                    id: "facet-tab",
                    name: "Aggregation stats"
                },*/
                {
                    id: "comparator-tab",
                    name: "Comparator"
                }
            ],
            filter: {
                sections: [
                    {
                        name: "section title",
                        fields: [
                            {
                                id: "id",
                                name: "Clinical Analysis ID",
                                type: "string",
                                placeholder: "CA-1234,CA-2345...",
                                description: ""
                            },
                            {
                                id: "family",
                                name: "Family ID",
                                type: "string",
                                placeholder: "FAM123, FAM124...",
                                description: ""
                            },
                            {
                                id: "proband",
                                name: "Proband ID",
                                placeholder: "LP-1234, LP-2345...",
                                description: ""
                            },
                            {
                                id: "samples",
                                name: "Sample ID",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "priority",
                                name: "Priority",
                                allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                                description: ""
                            },
                            {
                                id: "type",
                                name: "Analysis type",
                                allowedValues: ["SINGLE", "DUO", "TRIO", "FAMILY", "AUTO", "MULTISAMPLE"],
                                description: ""
                            },
                            {
                                id: "date",
                                name: "Date",
                                description: ""
                            }
                        ]
                    }
                ],
                grid: {
                    pageSize: 10,
                    pageList: [10, 25, 50],
                    detailView: false,
                    multiSelection: false
                }
            },
            aggregation: {
                default: [],
                sections: [
                    {
                        name: "section title",
                        fields: [
                            {
                                id: "include",
                                name: "include",
                                type: "string",
                                description: "Fields included in the response, whole JSON path must be provided"
                            },
                            {
                                id: "exclude",
                                name: "exclude",
                                type: "string",
                                description: "Fields excluded in the response, whole JSON path must be provided"
                            },
                            {
                                name: "limit",
                                type: "integer",
                                description: "Number of results to be returned"
                            },
                            {
                                name: "skip",
                                type: "integer",
                                description: "Number of results to skip"
                            },
                            {
                                name: "count",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Get the total number of results matching the query. Deactivated by default."
                            },
                            {
                                name: "sort",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Sort the results"
                            },
                            {
                                name: "approximateCount",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Get an approximate count, instead of an exact total count. Reduces execution time"
                            },
                            {
                                name: "approximateCountSamplingSize",
                                type: "integer",
                                description: "Sampling size to get the approximate count. Larger values increase accuracy but also increase execution time"
                            },
                            {
                                name: "id",
                                type: "string",
                                description: "List of IDs, these can be rs IDs (dbSNP) or variants in the format chrom:start:ref:alt, e.g. rs116600158,19:7177679:C:T"
                            },
                            {
                                name: "region",
                                type: "string",
                                description: "List of regions, these can be just a single chromosome name or regions in the format chr:start-end, e.g.: 2,3:100000-200000"
                            },
                            {
                                name: "type",
                                type: "string",
                                description: "List of types, accepted values are SNV, MNV, INDEL, SV, CNV, INSERTION, DELETION, e.g. SNV,INDEL"
                            },
                            {
                                name: "reference",
                                type: "string",
                                description: "Reference allele"
                            },
                            {
                                name: "alternate",
                                type: "string",
                                description: "Main alternate allele"
                            },
                            {
                                name: "project",
                                type: "string",
                                description: "Project [user@]project where project can be either the ID or the alias"
                            },
                            {
                                name: "study",
                                type: "string",
                                description: "Filter variants from the given studies, these can be either the numeric ID or the alias with the format user@project:study"
                            },
                            {
                                name: "file",
                                type: "string",
                                description: "Filter variants from the files specified. This will set includeFile parameter when not provided"
                            },
                            {
                                name: "filter",
                                type: "string",
                                description: "Specify the FILTER for any of the files. If 'file' filter is provided, will match the file and the filter. e.g.: PASS,LowGQX"
                            },
                            {
                                name: "qual",
                                type: "string",
                                description: "Specify the QUAL for any of the files. If 'file' filter is provided, will match the file and the qual. e.g.: >123.4"
                            },
                            {
                                name: "info",
                                type: "string",
                                description: "Filter by INFO attributes from file. [{file}:]{key}{op}{value}[,;]* . If no file is specified, will use all files from \"file\" filter. e.g. AN>200 or file_1.vcf:AN>200;file_2.vcf:AN<10 . Many INFO fields can be combined. e.g. file_1.vcf:AN>200;DB=true;file_2.vcf:AN<10"
                            },
                            {
                                name: "sample",
                                type: "string",
                                description: "Filter variants where the samples contain the variant (HET or HOM_ALT). Accepts AND (;) and OR (,) operators. This will automatically set 'includeSample' parameter when not provided"
                            },
                            {
                                name: "genotype",
                                type: "string",
                                description: "Samples with a specific genotype: {samp_1}:{gt_1}(,{gt_n})*(;{samp_n}:{gt_1}(,{gt_n})*)* e.g. HG0097:0/0;HG0098:0/1,1/1. Unphased genotypes (e.g. 0/1, 1/1) will also include phased genotypes (e.g. 0|1, 1|0, 1|1), but not vice versa. When filtering by multi-allelic genotypes, any secondary allele will match, regardless of its position e.g. 1/2 will match with genotypes 1/2, 1/3, 1/4, .... Genotype aliases accepted: HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT and MISS  e.g. HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT. This will automatically set 'includeSample' parameter when not provided"
                            },
                            {
                                name: "format",
                                type: "string",
                                description: "Filter by any FORMAT field from samples. [{sample}:]{key}{op}{value}[,;]* . If no sample is specified, will use all samples from \"sample\" or \"genotype\" filter. e.g. DP>200 or HG0097:DP>200,HG0098:DP<10 . Many FORMAT fields can be combined. e.g. HG0097:DP>200;GT=1/1,0/1,HG0098:DP<10"
                            },
                            {
                                name: "sampleAnnotation",
                                type: "string",
                                description: "Selects some samples using metadata information from Catalog. e.g. age>20;phenotype=hpo:123,hpo:456;name=smith"
                            },
                            {
                                name: "sampleMetadata",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Return the samples metadata group by study. Sample names will appear in the same order as their corresponding genotypes."
                            },
                            {
                                name: "unknownGenotype",
                                type: "string",
                                description: "Returned genotype for unknown genotypes. Common values: [0/0, 0|0, ./.]"
                            },
                            {
                                name: "sampleLimit",
                                type: "integer",
                                description: "Limit the number of samples to be included in the result"
                            },
                            {
                                name: "sampleSkip",
                                type: "integer",
                                description: "Skip some samples from the result. Useful for sample pagination."
                            },
                            {
                                name: "cohort",
                                type: "string",
                                description: "Select variants with calculated stats for the selected cohorts"
                            },
                            {
                                name: "cohortStatsRef",
                                type: "string",
                                description: "Reference Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4"
                            },
                            {
                                name: "cohortStatsAlt",
                                type: "string",
                                description: "Alternate Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4"
                            },
                            {
                                name: "cohortStatsMaf",
                                type: "string",
                                description: "Minor Allele Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4"
                            },
                            {
                                name: "cohortStatsMgf",
                                type: "string",
                                description: "Minor Genotype Frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL<=0.4"
                            },
                            {
                                name: "cohortStatsPass",
                                type: "string",
                                description: "Filter PASS frequency: [{study:}]{cohort}[<|>|<=|>=]{number}. e.g. ALL>0.8"
                            },
                            {
                                name: "missingAlleles",
                                type: "string",
                                description: "Number of missing alleles: [{study:}]{cohort}[<|>|<=|>=]{number}"
                            },
                            {
                                name: "missingGenotypes",
                                type: "string",
                                description: "Number of missing genotypes: [{study:}]{cohort}[<|>|<=|>=]{number}"
                            },
                            {
                                name: "score",
                                type: "string",
                                description: "Filter by variant score: [{study:}]{score}[<|>|<=|>=]{number}"
                            },
                            {
                                name: "includeStudy",
                                type: "string",
                                description: "List of studies to include in the result. Accepts 'all' and 'none'."
                            },
                            {
                                name: "includeFile",
                                type: "string",
                                description: "List of files to be returned. Accepts 'all' and 'none'."
                            },
                            {
                                name: "includeSample",
                                type: "string",
                                description: "List of samples to be included in the result. Accepts 'all' and 'none'."
                            },
                            {
                                name: "includeFormat",
                                type: "string",
                                description: "List of FORMAT names from Samples Data to include in the output. e.g: DP,AD. Accepts 'all' and 'none'."
                            },
                            {
                                name: "includeGenotype",
                                type: "string",
                                description: "Include genotypes, apart of other formats defined with includeFormat"
                            },
                            {
                                name: "annotationExists",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Return only annotated variants"
                            },
                            {
                                name: "gene",
                                type: "string",
                                description: "List of genes, most gene IDs are accepted (HGNC, Ensembl gene, ...). This is an alias to 'xref' parameter"
                            },
                            {
                                name: "ct",
                                type: "string",
                                description: "List of SO consequence types, e.g. missense_variant,stop_lost or SO:0001583,SO:0001578"
                            },
                            {
                                name: "xref",
                                type: "string",
                                description: "List of any external reference, these can be genes, proteins or variants. Accepted IDs include HGNC, Ensembl genes, dbSNP, ClinVar, HPO, Cosmic, ..."
                            },
                            {
                                name: "biotype",
                                type: "string",
                                description: "List of biotypes, e.g. protein_coding"
                            },
                            {
                                name: "proteinSubstitution",
                                type: "string",
                                description: "Protein substitution scores include SIFT and PolyPhen. You can query using the score {protein_score}[<|>|<=|>=]{number} or the description {protein_score}[~=|=]{description} e.g. polyphen>0.1,sift=tolerant"
                            },
                            {
                                name: "conservation",
                                type: "string",
                                description: "Filter by conservation score: {conservation_score}[<|>|<=|>=]{number} e.g. phastCons>0.5,phylop<0.1,gerp>0.1"
                            },
                            {
                                name: "populationFrequencyAlt",
                                type: "string",
                                description: "Alternate Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g. 1kG_phase3:ALL<0.01"
                            },
                            {
                                name: "populationFrequencyRef",
                                type: "string",
                                description: "Reference Population Frequency: {study}:{population}[<|>|<=|>=]{number}. e.g. 1kG_phase3:ALL<0.01"
                            },
                            {
                                name: "populationFrequencyMaf",
                                type: "string",
                                description: "Population minor allele frequency: {study}:{population}[<|>|<=|>=]{number}. e.g. 1kG_phase3:ALL<0.01"
                            },
                            {
                                name: "transcriptFlag",
                                type: "string",
                                description: "List of transcript annotation flags. e.g. CCDS, basic, cds_end_NF, mRNA_end_NF, cds_start_NF, mRNA_start_NF, seleno"
                            },
                            {
                                name: "geneTraitId",
                                type: "string",
                                description: "List of gene trait association id. e.g. \"umls:C0007222\" , \"OMIM:269600\""
                            },
                            {
                                name: "go",
                                type: "string",
                                description: "List of GO (Gene Ontology) terms. e.g. \"GO:0002020\""
                            },
                            {
                                name: "expression",
                                type: "string",
                                description: "List of tissues of interest. e.g. \"lung\""
                            },
                            {
                                name: "proteinKeyword",
                                type: "string",
                                description: "List of Uniprot protein variant annotation keywords"
                            },
                            {
                                name: "drug",
                                type: "string",
                                description: "List of drug names"
                            },
                            {
                                name: "functionalScore",
                                type: "string",
                                description: "Functional score: {functional_score}[<|>|<=|>=]{number} e.g. cadd_scaled>5.2 , cadd_raw<=0.3"
                            },
                            {
                                name: "clinicalSignificance",
                                type: "string",
                                description: "Clinical significance: benign, likely_benign, likely_pathogenic, pathogenic"
                            },
                            {
                                name: "customAnnotation",
                                type: "string",
                                description: "Custom annotation: {key}[<|>|<=|>=]{number} or {key}[~=|=]{text}"
                            },
                            {
                                name: "trait",
                                type: "string",
                                description: "List of traits, based on ClinVar, HPO, COSMIC, i.e.: IDs, histologies, descriptions,..."
                            },
                            {
                                name: "field",
                                type: "string",
                                description: "Facet field for categorical fields"
                            },
                            {
                                name: "fieldRange",
                                type: "string",
                                description: "Facet field range for continuous fields"
                            },
                            {
                                name: "study",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                name: "clinicalAnalysisId",
                                type: "string",
                                description: "Clinical analysis ID"
                            },
                            {
                                name: "disease",
                                type: "string",
                                description: "Disease (HPO term)"
                            },
                            {
                                name: "familyId",
                                type: "string",
                                description: "Family ID"
                            },
                            {
                                name: "subjectIds",
                                type: "string",
                                description: "Comma separated list of subject IDs"
                            },
                            {
                                name: "type",
                                type: "string",
                                description: "Clinical analysis type, e.g. DUO, TRIO, ..."
                            },
                            {
                                name: "panelId",
                                type: "string",
                                description: "Panel ID"
                            },
                            {
                                name: "panelVersion",
                                type: "string",
                                description: "Panel version"
                            },
                            {
                                name: "save",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Save interpretation in Catalog"
                            },
                            {
                                name: "interpretationId",
                                type: "string",
                                description: "ID of the stored interpretation"
                            },
                            {
                                name: "interpretationName",
                                type: "string",
                                description: "Name of the stored interpretation"
                            }]
                    }

                ]
            },
            // TODO recheck (they come from clinical-analysis-browser and used in opencga-clinical-analysis-filter and opencga-clinical-analysis-grid now they have been moved in config)
            analyses: [],
            analysis: {},

            gridComparator: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: true,
                multiSelection: true
            }
        };
    }

    render() {
        return this._config ? html`
            <opencga-browser  resource="clinical-analysis"
                            .opencgaSession="${this.opencgaSession}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .query="${this.query}"
                            .config="${this._config}"
                            .cellbaseClient="${this.cellbaseClient}">
            </opencga-browser>` : null;
    }

}


customElements.define("opencga-clinical-analysis-browser", OpencgaClinicalAnalysisBrowser);
