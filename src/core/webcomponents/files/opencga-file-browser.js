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
import UtilsNew from "../../utilsNew.js";
import "../commons/opencga-browser.js";

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
            query: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "fb" + UtilsNew.randomString(6);

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.facets = new Set();
        this.facetFilters = [];

        this.facetActive = true;
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            title: "File Browser",
            //active: false,
            icon: "fab fa-searchengin",
            description: "",
            searchButtonText: "Search",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true
                },
                {
                    id: "facet-tab",
                    name: "Aggregation stats",
                    icon: "fas fa-chart-bar"
                }
            ],
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        fields: [
                            {
                                id: "annotations",
                                name: "File annotations",
                                description: ""
                            },
                            {
                                id: "name",
                                name: "Name",
                                type: "string",
                                placeholder: "accepted_hits.bam, phenotypes.vcf...",
                                description: ""
                            },
                            {
                                id: "directory",
                                name: "Directory",
                                type: "string",
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "samples",
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
                                id: "internal.index.status.name",
                                name: "Index Status",
                                allowedValues: ["READY", "DELETED", "TRASHED", "STAGE", "MISSING", "PENDING_DELETE", "DELETING", "REMOVED", "NONE"],
                                type: "category"
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
                        name: "Alignment",
                        active: false,
                        query: {
                            format: "BAM,SAM,BIGWIG",
                            bioformat: "ALIGNMENT",
                            creationDate: ">=20200216"
                        }
                    }
                ],
                result: {
                    grid: {}
                },
                detail: {
                    title: "File",
                    showTitle: true,
                    items: [
                        {
                            id: "file-view",
                            name: "Overview",
                            active: true,
                            render: (file, active, opencgaSession) => {
                                return html` <opencga-file-view .opencgaSession="${opencgaSession}" .file="${file}"></opencga-file-view>`;
                            }
                        },
                        {
                            id: "file-preview",
                            name: "Preview",
                            render: (file, active, opencgaSession) => {
                                return html`<opencga-file-preview .opencgaSession=${opencgaSession} .active="${active}" .file="${file}"></opencga-file-preview>`;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: ["type", "format"],
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
            <opencga-browser  resource="files"
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.query}"
                            .config="${this._config}">
            </opencga-browser>` : null;
    }

}

customElements.define("opencga-file-browser", OpencgaFileBrowser);
