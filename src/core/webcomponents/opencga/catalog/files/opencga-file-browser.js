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
import Utils from "./../../../../utils.js";
import "../../commons/opencga-facet.js";

export default class OpencgaFileBrowser extends LitElement {

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

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    getDefaultConfig() {
        return {
            title: "File Browser",
            //active: false,
            icon: "fas fa-chart-bar",
            description: "",
            searchButtonText: "Run",
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        fields: [
                            {
                                id: "name",
                                name: "Name",
                                type: "string",
                                placeholder: "accepted_hits.bam, phenotypes.vcf...",
                                description: ""
                            },
                            {
                                id: "path",
                                name: "Path",
                                type: "string",
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "sample",
                                name: "Sample",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "format",
                                name: "Format",
                                type: "category",
                                allowedValues: ["VCF", "BCF", "GVCF", "TBI", "BIGWIG", "SAM", "BAM", "BAI", "CRAM", "CRAI", "FASTQ", "FASTA", "PED", "TAB_SEPARATED_VALUES", "COMMA_SEPARATED_VALUES", "XML", "PROTOCOL_BUFFER", "JSON", "AVRO", "PARQUET", "IMAGE", "PLAIN", "BINARY", "EXECUTABLE", "GZIP", "NONE", "UNKNOWN"],
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "bioformat",
                                name: "Bioformat",
                                type: "string",
                                placeholder: "ALIGNMENT,VARIANT...",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "File annotations",
                                description: ""
                            },
                            {
                                id: "date",
                                name: "Date",
                                type: "date",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: "Full",
                        active: false,
                        query: {
                            name: "bam",
                            path: "genomes",
                            sample: "hg3333",
                            format: "VCF,BCF,GVCF,BIGWIG",
                            bioformat: "ALIGNMENT",
                            creationDate: ">=20200216"
                        }
                    }
                ],
                result: {
                    grid: {}
                },
                detail: []
            },
            aggregation: {
                default: ["type", "study>>bioformat"],
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "File attributes",
                        // collapsed: false,
                        fields: [
                            {
                                id: "study",
                                name: "study",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                id: "name",
                                name: "name",
                                type: "string",
                                description: "Name"
                            },
                            {
                                id: "type",
                                name: "type",
                                type: "string",
                                description: "Type"
                            },
                            {
                                id: "format",
                                name: "Format",
                                type: "category",
                                allowedValues: ["VCF", "BCF", "GVCF", "TBI", "BIGWIG", "SAM", "BAM", "BAI", "CRAM", "CRAI", "FASTQ", "FASTA", "PED", "TAB_SEPARATED_VALUES", "COMMA_SEPARATED_VALUES", "XML", "PROTOCOL_BUFFER", "JSON", "AVRO", "PARQUET", "IMAGE", "PLAIN", "BINARY", "EXECUTABLE", "GZIP", "NONE", "UNKNOWN"],
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "bioformat",
                                name: "bioformat",
                                type: "string",
                                description: "Bioformat"
                            },
                            {
                                id: "creationYear",
                                name: "creationYear",
                                type: "string",
                                description: "Creation year"
                            },
                            {
                                id: "creationMonth",
                                name: "creationMonth",
                                type: "string",
                                description: "Creation month (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "creationDay",
                                name: "creationDay",
                                type: "string",
                                description: "Creation day"
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "creationDayOfWeek",
                                type: "string",
                                description: "Creation day of week (MONDAY, TUESDAY...)"
                            },
                            {
                                id: "status",
                                name: "status",
                                type: "string",
                                description: "Status"
                            },
                            {
                                id: "release",
                                name: "release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "external",
                                name: "external",
                                type: "category",
                                allowedValues: ["true", "false"],
                                defaultValue: "false",
                                description: "External"
                            },
                            {
                                id: "size",
                                name: "size",
                                type: "string",
                                description: "Size"
                            },
                            {
                                id: "software",
                                name: "software",
                                type: "string",
                                description: "Software"
                            },
                            {
                                id: "experiment",
                                name: "experiment",
                                type: "string",
                                description: "Experiment"
                            },
                            {
                                id: "numSamples",
                                name: "numSamples",
                                type: "string",
                                description: "Number of samples"
                            },
                            {
                                id: "numRelatedFiles",
                                name: "numRelatedFiles",
                                type: "string",
                                description: "Number of related files"
                            },
                            {
                                id: "annotation",
                                name: "annotation",
                                type: "string",
                                description: "Annotation, e.g: key1=value(,key2=value)"
                            },
                            {
                                id: "field",
                                name: "field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    },
                    {
                        name: "Advanced",
                        fields: [
                            {
                                id: "field",
                                name: "field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    }
                ]
            }
        };
    }


    render() {
        return this._config ? html`
            <opencga-facet  resource="files"
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.query}"
                            .config="${this._config}">
            </opencga-facet>` : null;
    }

}

customElements.define("opencga-file-browser", OpencgaFileBrowser);
