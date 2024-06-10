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


import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
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
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this.COMPONENT_ID = "file-browser";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = this.getDefaultConfig();

        // Apply Study settings
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        // Grid configuration and take out toolbar admin/user settings to grid level.
        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply User grid configuration. Only 'pageSize' and 'columns' are set
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid
        });

        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
    }

    onFileUpdate() {
        this.settingsObserver();
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
                .config="${this._config}"
                @fileUpdate="${this.onFileUpdate}">
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
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @fileUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </file-grid>
                        ${params?.detail ? html`
                            <file-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .fileId="${params.detail?.id}">
                            </file-detail>
                        ` : nothing}
                    `,
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
                            },
                            {
                                id: "jobId",
                                name: "Job ID",
                                type: "string",
                                placeholder: "Job ID ...",
                                description: "",
                            },
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
                                type: "string",
                                placeholder: "Format ...",
                                description: ""
                            },
                            {
                                id: "internalVariantIndexStatus",
                                name: "Variant Index Status",
                                multiple: true,
                                // NOTE 20230310 Vero: The current internalVariantIndexStatus (internal.variant.index.status) vocabulary is:
                                // "READY", "DELETED", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"
                                // But the DELETED status gets mapped in opencga to NONE (Jacobo)
                                allowedValues: ["READY", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"],
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
                                description: "",
                            }
                        ]
                    }
                ],
                examples: [],
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
                            render: (file, active) => html`
                                <json-viewer
                                    .data="${file}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        },
                    ]
                }
            },
            aggregation: {
                default: ["creationYear>>creationMonth", "format", "status", "size[0..214748364800]:10737418240", "numSamples[0..10]:1"],
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
