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


import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "./file-preview.js";
import "./file-view.js";
import "../commons/opencga-browser.js";
import "../commons/opencb-facet-results.js";
import "../commons/facet-filter.js";
import "./file-grid.js";
import "./file-detail.js";

export default class FileBrowser extends LitElement {

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
            /* facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },*/
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "fb" + UtilsNew.randomString(6);

        // These are for making the queries to server
        /* this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.facets = new Set();
        this.facetFilters = [];

        this.facetActive = true;
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;*/

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    // NOTE turn updated into update here reduces the number of remote requests from 2 to 1 as in the grid components propertyObserver()
    // is executed twice in case there is external settings
    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {...this.getDefaultConfig()};
        // merge filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }
        if (this.settings?.table) {
            this._config.filter.result.grid = {...this._config.filter.result.grid, ...this.settings.table};
        }
        if (this.settings?.table?.toolbar) {
            this._config.filter.result.grid.toolbar = {...this._config.filter.result.grid.toolbar, ...this.settings.table.toolbar};
        }
    }

    render() {

        if (!this.opencgaSession || !this._config) {
            return "";
        }

        return html`
            <opencga-browser
                resource="FILE"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "File Browser",
            icon: "fab fa-searchengin",
            description: "",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <file-grid
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .query="${params.executedQuery}"
                            .eventNotifyName="${params.eventNotifyName}"
                            @selectrow="${e => params.onClickRow(e, "file")}">
                        </file-grid>
                        <file-detail
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.detail}"
                            .fileId="${params.detail.file?.id}">
                        </file-detail>`
                },
                {
                    id: "facet-tab",
                    name: "Aggregation stats",
                    icon: "fas fa-chart-bar",
                    render: params => html`
                        <opencb-facet-results
                            resource="${params.resource}"
                            .opencgaSession="${params.opencgaSession}"
                            .active="${params.active}"
                            .query="${params.facetQuery}"
                            .data="${params.facetResults}">
                        </opencb-facet-results>
                    `
                }
            ],
            filter: {
                searchButton: false,
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "name",
                                name: "Name",
                                type: "string",
                                placeholder: "accepted_hits.bam, phenotypes.vcf...",
                                description: ""
                            },
                            {
                                id: "sampleIds",
                                name: "Sample ID",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            }, /*
                            {
                                id: "path",
                                name: "Path",
                                type: "string",
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },*/
                            {
                                id: "directory",
                                name: "Directory",
                                type: "string",
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "format",
                                name: "Format",
                                type: "category",
                                multiple: true,
                                allowedValues: ["VCF", "BCF", "GVCF", "TBI", "BIGWIG", "SAM", "BAM", "BAI", "CRAM", "CRAI", "FASTQ", "FASTA", "PED", "TAB_SEPARATED_VALUES",
                                    "COMMA_SEPARATED_VALUES", "XML", "PROTOCOL_BUFFER", "JSON", "AVRO", "PARQUET", "IMAGE", "PLAIN", "BINARY", "EXECUTABLE", "GZIP", "NONE", "UNKNOWN"],
                                placeholder: "genomes/resources/files/...",
                                description: ""
                            },
                            {
                                id: "bioformat",
                                name: "Bioformat",
                                type: "category",
                                multiple: true,
                                allowedValues: ["MICROARRAY_EXPRESSION_ONECHANNEL_AGILENT", "MICROARRAY_EXPRESSION_ONECHANNEL_AFFYMETRIX", "MICROARRAY_EXPRESSION_ONECHANNEL_GENEPIX",
                                    "MICROARRAY_EXPRESSION_TWOCHANNELS_AGILENT", "MICROARRAY_EXPRESSION_TWOCHANNELS_GENEPIX", "DATAMATRIX_EXPRESSION", "IDLIST", "IDLIST_RANKED",
                                    "ANNOTATION_GENEVSANNOTATION", "OTHER_NEWICK", "OTHER_BLAST", "OTHER_INTERACTION", "OTHER_GENOTYPE", "OTHER_PLINK", "OTHER_VCF", "OTHER_PED",
                                    "VARIANT", "ALIGNMENT", "COVERAGE", "SEQUENCE", "PEDIGREE", "REFERENCE_GENOME", "NONE", "UNKNOWN"],
                                placeholder: "ALIGNMENT,VARIANT...",
                                description: ""
                            },
                            {
                                id: "internal.index.status.name",
                                name: "Index Status",
                                multiple: true,
                                allowedValues: ["READY", "DELETED", "TRASHED", "STAGE", "MISSING", "PENDING_DELETE", "DELETING", "REMOVED", "NONE"],
                                type: "category"
                            },
                            {
                                id: "date",
                                name: "Date",
                                type: "date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "File Annotations",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Alignment",
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
                            render: (file, active, opencgaSession) => html`
                                <file-view
                                    .opencgaSession="${opencgaSession}"
                                    .file="${file}">
                                </file-view>
                            `,
                        },
                        {
                            id: "file-preview",
                            name: "Preview",
                            render: (file, active, opencgaSession) => {
                                let title = "";
                                switch (file.format) {
                                    case "VCF":
                                        title = "VCF HEAD";
                                        break;
                                    case "IMAGE":
                                        title = "IMAGE";
                                        break;
                                }
                                return html`
                                    <div><h3>${title}</h3></div>
                                    <file-preview
                                        .active="${active}"
                                        .file="${file}"
                                        .opencgaSession="${opencgaSession}">
                                    </file-preview>
                                `;
                            }
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            mode: "development",
                            render: (file, active) => html`
                                <json-viewer
                                    .data="${file}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        }
                    ]
                }
            },
            aggregation: {
                default: ["creationYear>>creationMonth", "format", "bioformat", "format>>bioformat", "status", "size[0..214748364800]:10737418240", "numSamples[0..10]:1"],
                // default: ["type>>size[0..214748364800]:10737418240", "format>>avg(size)", "release"],
                render: params => html `
                    <facet-filter
                        .config="${params.config.aggregation}"
                        .selectedFacet="${params.selectedFacet}"
                        @facetQueryChange="${params.onFacetQueryChange}">
                    </facet-filter>`,
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "File attributes",
                        // collapsed: false,
                        fields: [
                            {
                                id: "studyId",
                                name: "Study id",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                id: "creationYear",
                                name: "Creation Year",
                                type: "string",
                                description: "Creation year"
                            },
                            {
                                id: "creationMonth",
                                name: "Creation Month",
                                type: "category",
                                multiple: true,
                                allowedValues: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
                                description: "Creation month (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "creationDay",
                                name: "Creation Day",
                                type: "category",
                                allowedValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                                description: "Creation day"
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "Creation Day Of Week",
                                type: "category",
                                allowedValues: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                                description: "Creation day of week (MONDAY, TUESDAY...)"
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["READY", "DELETED", "TRASHED", "STAGE", "MISSING", "PENDING_DELETE", "DELETING", "REMOVED"],
                                description: "Status"
                            },
                            {
                                id: "release",
                                name: "Release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "name",
                                name: "Name",
                                type: "string",
                                description: "Name"
                            },
                            {
                                id: "type",
                                name: "Type",
                                type: "category",
                                allowedValues: ["FILE", "DIRECTORY"],
                                description: "Type"
                            },
                            {
                                id: "format",
                                name: "Format",
                                type: "category",
                                allowedValues: ["VCF", "BCF", "GVCF", "TBI", "BIGWIG", "SAM", "BAM", "BAI", "CRAM", "CRAI", "FASTQ", "FASTA", "PED", "TAB_SEPARATED_VALUES",
                                    "COMMA_SEPARATED_VALUES", "XML", "PROTOCOL_BUFFER", "JSON", "AVRO", "PARQUET", "IMAGE", "PLAIN", "BINARY", "EXECUTABLE", "GZIP", "NONE", "UNKNOWN"],
                                description: "Format"
                            },
                            {
                                id: "bioformat",
                                name: "Bioformat",
                                type: "category",
                                allowedValues: ["MICROARRAY_EXPRESSION_ONECHANNEL_AGILENT", "MICROARRAY_EXPRESSION_ONECHANNEL_AFFYMETRIX", "MICROARRAY_EXPRESSION_ONECHANNEL_GENEPIX",
                                    "MICROARRAY_EXPRESSION_TWOCHANNELS_AGILENT", "MICROARRAY_EXPRESSION_TWOCHANNELS_GENEPIX", "DATAMATRIX_EXPRESSION", "IDLIST", "IDLIST_RANKED",
                                    "ANNOTATION_GENEVSANNOTATION", "OTHER_NEWICK", "OTHER_BLAST", "OTHER_INTERACTION", "OTHER_GENOTYPE", "OTHER_PLINK", "OTHER_VCF", "OTHER_PED",
                                    "VARIANT", "ALIGNMENT", "COVERAGE", "SEQUENCE", "PEDIGREE", "REFERENCE_GENOME", "NONE", "UNKNOWN"],
                                description: "Bioformat"
                            },
                            {
                                id: "external",
                                name: "External",
                                type: "category",
                                allowedValues: ["true", "false"],
                                defaultValue: "false",
                                description: "External"
                            },
                            {
                                id: "size",
                                name: "Size",
                                type: "integer",
                                defaultValue: "[0..214748364800]:10737418240",
                                description: "Size"
                            },
                            {
                                id: "softwareName",
                                name: "Software Name",
                                type: "string",
                                description: "Software name"
                            },
                            {
                                id: "softwareVersion",
                                name: "Software Version",
                                type: "string",
                                description: "Software version"
                            },
                            {
                                id: "experimentTechnology",
                                name: "Experiment Technology",
                                type: "string",
                                description: "Experiment technology"
                            },
                            {
                                id: "experimentMethod",
                                name: "Experiment Method",
                                type: "string",
                                description: "Experiment method"
                            },
                            {
                                id: "experimentNucleicAcidType",
                                name: "Experiment Nucleic Acid Type",
                                type: "string",
                                description: "Experiment nucleic acid type"
                            },
                            {
                                id: "experimentManufacturer",
                                name: "Experiment Manufacturer",
                                type: "string",
                                description: "Experiment manufacturer"
                            },
                            {
                                id: "experimentPlatform",
                                name: "Experiment Platform",
                                type: "string",
                                description: "Experiment platform"
                            },
                            {
                                id: "experimentLibrary",
                                name: "Experiment Library",
                                type: "string",
                                description: "Experiment library"
                            },
                            {
                                id: "experimentCenter",
                                name: "Experiment Center",
                                type: "string",
                                description: "Experiment center"
                            },
                            {
                                id: "experimentLab",
                                name: "Experiment Lab",
                                type: "string",
                                description: "Experiment lab"
                            },
                            {
                                id: "experimentResponsible",
                                name: "Experiment Responsible",
                                type: "string",
                                description: "Experiment responsible"
                            },
                            {
                                id: "tags",
                                name: "Tags",
                                type: "string",
                                description: "Tags"
                            },
                            {
                                id: "numSamples",
                                name: "Number Of Samples",
                                type: "integer",
                                description: "Number of samples",
                                defaultValue: "[0..10]:1"
                            },
                            {
                                id: "numRelatedFiles",
                                name: "Number Of Related Files",
                                type: "string",
                                description: "Number of related files"
                            },
                            {
                                id: "annotations",
                                name: "Annotations",
                                type: "string",
                                description: "Annotations, e.g: key1=value(,key2=value)"
                            }
                        ]
                    },
                    {
                        name: "Advanced",
                        fields: [
                            {
                                id: "field",
                                name: "Field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    }
                ]
            }
        };
    }


}

customElements.define("file-browser", FileBrowser);
