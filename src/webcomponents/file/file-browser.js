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
import "../commons/opencga-browser.js";
import "../commons/aggregation-stats.js";
import "../commons/filters/file-filter.js";
import "./file-grid.js";
import "./file-tree.js";

export default class FileBrowser extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            query: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "file-browser";
        this._lastCreatedPath = null;
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
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onFileUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onTreePathChange(event, params) {
        // note: clicking on a folder in the tree will clear the current query
        const query = {};

        // only include the directory field if the event.detail.value is not empty
        if (event.detail.value) {
            query.directory = event.detail.value;
        }

        // execute the onQuerySearch method of OpencgaBrowser
        params.onQuerySearch({
            detail: {
                query: query,
            },
        });
    }

    onTreePathCreate(event) {
        this._lastCreatedPath = event.detail.value;
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                .resource="${"FILE"}"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config || {}}"
                @fileUpdate="${this.onFileUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "File Manager",
            views: [
                {
                    id: "table-tab-file",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <div class="row">
                            <div class="col-md-2 my-2">
                                <file-tree
                                    .opencgaSession="${params.opencgaSession}"
                                    .rootDirectoryId="${":"}"
                                    .currentPath="${params.executedQuery?.directory}"
                                    .lastCreatedPath="${this._lastCreatedPath}"
                                    .config="${{
                                        rootDirectoryName: "DATA",
                                        rootDirectoryIcon: "fa-hdd",
                                    }}"
                                    @pathChange="${event => this.onTreePathChange(event, params)}">
                                </file-tree>
                            </div>
                            <div class="col-md-10">
                                <file-grid
                                    .toolId="${this.COMPONENT_ID || ""}"
                                    .opencgaSession="${params.opencgaSession}"
                                    .query="${params.executedQuery}"
                                    .config="${params.config.filter.result.grid}"
                                    .eventNotifyName="${params.eventNotifyName}"
                                    @queryComplete="${e => params.onQueryComplete(e)}"
                                    @selectrow="${e => params.onClickRow(e)}"
                                    @fileUpdate="${e => params.onComponentUpdate(e)}"
                                    @settingsUpdate="${() => this.onSettingsUpdate()}"
                                    @pathChange="${e => this.onTreePathChange(e, params)}"
                                    @pathClear="${e => this.onTreePathClear(e, params)}"
                                    @pathCreate="${e => this.onTreePathCreate(e)}">
                                </file-grid>
                            </div>
                        </div>
                    `,
                },
                {
                    id: "facet-tab-file",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
                    render: params => html`
                        <aggregation-stats
                            resource="${params.resource}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.aggregation}">
                        </aggregation-stats>
                    `
                }
            ],
            filter: {
                activeFilters: {
                    alias: {
                        path: "name",
                    },
                },
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "name",
                                title: "File",
                                type: "string",
                                placeholder: "accepted_hits.bam, phenotypes.vcf...",
                                description: "",
                                render: (onFilterChange, query, opencgaSession) => {
                                    return html`
                                        <file-filter
                                            .opencgaSession="${opencgaSession}"
                                            .query="${query}"
                                            @filterChange="${event => onFilterChange(event.detail.field, event.detail.value)}">
                                        </file-filter>
                                    `;
                                },
                                quick: true,
                            },
                            {
                                id: "directory",
                                title: "Directory",
                                type: "string",
                                placeholder: "genomes/resources/files/...",
                                description: "",
                                quick: true,
                                multiple: false,
                            },
                            {
                                id: "format",
                                title: "Format",
                                type: "string",
                                placeholder: "Format ...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "sampleIds",
                                title: "Sample ID",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "jobId",
                                title: "Job ID",
                                type: "string",
                                placeholder: "Job ID ...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "internalVariantIndexStatus",
                                title: "Variant Index Status",
                                multiple: true,
                                // NOTE 20230310 Vero: The current internalVariantIndexStatus (internal.variant.index.status) vocabulary is:
                                // "READY", "DELETED", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"
                                // But the DELETED status gets mapped in opencga to NONE (Jacobo)
                                allowedValues: ["READY", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"],
                                type: "category",
                                quick: true,
                            },
                            {
                                id: "type",
                                title: "Type",
                                multiple: true,
                                allowedValues: ["FILE", "DIRECTORY"],
                                type: "category",
                                quick: true,
                            },
                            {
                                id: "tags",
                                title: "Tags",
                                multiple: true,
                                quick: true,
                            },
                            {
                                id: "date",
                                title: "Date",
                                type: "date",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "annotations",
                                title: "File Annotations",
                                description: "",
                                quick: true,
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
                default: ["format", "status", "size[0..214748364800]:10737418240"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "File attributes",
                        // collapsed: false,
                        fields: [
                            {
                                id: "creationDate",
                                name: "Creation Date",
                                type: "date",
                                allowedValues: ["YEAR", "MONTH", "DAY"],
                                multiple: false,
                                description: "Creation date, you can use 'day', 'month' or 'year' to group by"
                            },
                            // {
                            //     id: "status",
                            //     name: "Status",
                            //     type: "category",
                            //     allowedValues: ["READY", "DELETED", "TRASHED", "STAGE", "MISSING", "PENDING_DELETE", "DELETING", "REMOVED"],
                            //     description: "Status"
                            // },
                            {
                                id: "internal.variant.index.status.id",
                                name: "Variant Index Status",
                                type: "string",
                                // allowedValues: ["READY", "DELETED"],
                                description: "Variant database index status"
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
                                id: "size",
                                name: "Size",
                                type: "integer",
                                defaultValue: "[0..214748364800]:1073741824",
                                description: "Size"
                            },
                            {
                                id: "software.name",
                                name: "Software Name",
                                type: "string",
                                description: "Software name"
                            },
                            {
                                id: "tags",
                                name: "Tags",
                                type: "string",
                                description: "Tags"
                            },
                            // {
                            //     id: "softwareVersion",
                            //     name: "Software Version",
                            //     type: "string",
                            //     description: "Software version"
                            // },
                            // {
                            //     id: "experimentTechnology",
                            //     name: "Experiment Technology",
                            //     type: "string",
                            //     description: "Experiment technology"
                            // },
                            // {
                            //     id: "experimentMethod",
                            //     name: "Experiment Method",
                            //     type: "string",
                            //     description: "Experiment method"
                            // },
                            // {
                            //     id: "experimentNucleicAcidType",
                            //     name: "Experiment Nucleic Acid Type",
                            //     type: "string",
                            //     description: "Experiment nucleic acid type"
                            // },
                            // {
                            //     id: "experimentManufacturer",
                            //     name: "Experiment Manufacturer",
                            //     type: "string",
                            //     description: "Experiment manufacturer"
                            // },
                            // {
                            //     id: "experimentPlatform",
                            //     name: "Experiment Platform",
                            //     type: "string",
                            //     description: "Experiment platform"
                            // },
                            // {
                            //     id: "experimentLibrary",
                            //     name: "Experiment Library",
                            //     type: "string",
                            //     description: "Experiment library"
                            // },
                            // {
                            //     id: "experimentCenter",
                            //     name: "Experiment Center",
                            //     type: "string",
                            //     description: "Experiment center"
                            // },
                            // {
                            //     id: "experimentLab",
                            //     name: "Experiment Lab",
                            //     type: "string",
                            //     description: "Experiment lab"
                            // },
                            // {
                            //     id: "experimentResponsible",
                            //     name: "Experiment Responsible",
                            //     type: "string",
                            //     description: "Experiment responsible"
                            // },
                            // {
                            //     id: "annotations",
                            //     name: "Annotations",
                            //     type: "string",
                            //     description: "Annotations, e.g: key1=value(,key2=value)"
                            // }
                        ]
                    },
                    // {
                    //     name: "Advanced",
                    //     fields: [
                    //         {
                    //             id: "field",
                    //             name: "Field",
                    //             type: "string",
                    //             description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                    //         }
                    //     ]
                    // }
                ]
            }
        };
    }

}

customElements.define("file-browser", FileBrowser);
