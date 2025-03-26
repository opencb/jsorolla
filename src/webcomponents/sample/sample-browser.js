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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/opencga-browser.js";
import "../commons/aggregation-stats.js";
import "./sample-grid.js";
import "./sample-view.js";

export default class SampleBrowser extends LitElement {

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
        this.COMPONENT_ID = "sample-browser";
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
        // this._config = UtilsNew.mergeTableSetting(this._config, this.settings);

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

    onSampleUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                resource="SAMPLE"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @sampleUpdate="${this.onSampleUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Sample Browser",
            views: [
                {
                    id: "table-tab",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <sample-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .active="${true}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @sampleUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </sample-grid>
                        ${params?.detail ? html`
                            <sample-view
                                .sampleId="${params.detail?.id}"
                                .opencgaSession="${params.opencgaSession}">
                            </sample-view>
                        ` : nothing}
                    `,
                },
                {
                    id: "facet-tab",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
                    render: params => html `
                        <aggregation-stats
                            resource="${params.resource}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.aggregation}">
                        </aggregation-stats>
                    `,
                }
            ],
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "id",
                                title: "Sample ID",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "individualId",
                                title: "Individual ID",
                                placeholder: "LP-1234, LP-4567...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "fileIds",
                                title: "File Name",
                                placeholder: "file.vcf, ...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "phenotypes",
                                title: "Phenotypes",
                                placeholder: "Full-text search, e.g. melanoma",
                                description: ""
                            },
                            {
                                id: "somatic",
                                title: "Somatic",
                                description: ""
                            },
                            {
                                id: "date",
                                title: "Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                title: "Sample Annotations",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        multiSelection: false,
                        showSelectCheckbox: false,
                        showToolbar: true,
                        showCreate: true,
                        showExport: true,
                        showSettings: true,
                        exportTabs: ["download", "link", "code"]
                    }
                },
                view: {
                    displayConfig: {

                    },
                },
            },
            aggregation: {
                default: ["somatic", "creationYear[MONTH]"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Sample Attributes",
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
                            //     id: "status.id",
                            //     name: "Status",
                            //     type: "category",
                            //     allowedValues: ["READY", "DELETED"],
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
                                id: "version",
                                name: "Version",
                                type: "string",
                                // sort: "key",
                                description: "Version"
                            },
                            {
                                id: "somatic",
                                name: "Somatic",
                                type: "string",
                                // allowedValues: ["true", "false"],
                                description: "Somatic"
                            },
                            // {
                            //     id: "product",
                            //     name: "Product",
                            //     type: "string",
                            //     description: "Product"
                            // },
                            // {
                            //     id: "preparationMethod",
                            //     name: "Preparation Method",
                            //     type: "string",
                            //     description: "Preparation method"
                            // },
                            // {
                            //     id: "extractionMethod",
                            //     name: "Extraction Method",
                            //     type: "string",
                            //     description: "Extraction method"
                            // },
                            // {
                            //     id: "labSampleId",
                            //     name: "Lab Sample Id",
                            //     type: "string",
                            //     description: "Lab sample Id"
                            // },
                            // {
                            //     id: "tissue",
                            //     name: "Tissue",
                            //     type: "string",
                            //     description: "Tissue"
                            // },
                            // {
                            //     id: "organ",
                            //     name: "Organ",
                            //     type: "string",
                            //     description: "Organ"
                            // },
                            // {
                            //     id: "method",
                            //     name: "Method",
                            //     type: "string",
                            //     description: "Method"
                            // },
                            // {
                            //     id: "phenotypes",
                            //     name: "Phenotypes",
                            //     type: "string",
                            //     description: "Phenotypes"
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

customElements.define("sample-browser", SampleBrowser);
