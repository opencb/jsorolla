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
import "./cohort-grid.js";
import "./cohort-detail.js";

export default class CohortBrowser extends LitElement {

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
        this.COMPONENT_ID = "cohort-browser";
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

    onCohortUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                resource="COHORT"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @cohortUpdate="${this.onCohortUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Cohort Browser",
            views: [
                {
                    id: "table-tab",
                    name: "Table View",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html `
                        <cohort-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .search="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .active="${true}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @cohortUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </cohort-grid>
                        ${params?.detail ? html`
                            <cohort-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .cohortId="${params.detail?.id}">
                            </cohort-detail>
                        ` : nothing}
                    `,
                },
                {
                    id: "facet-tab",
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
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "id",
                                title: "Cohort ID",
                                type: "string",
                                placeholder: "Start typing...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "samples",
                                title: "Samples",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "type",
                                title: "Type",
                                type: "string",
                                multiple: true,
                                description: "",
                                quick: true,
                            },
                            {
                                id: "date",
                                title: "Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                title: "Cohort annotations",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {}
                },
                detail: {
                    title: "Cohort",
                    showTitle: true,
                    display: {
                        titleClass: "mt-4",
                        contentClass: "p-3"
                    },
                    items: [
                        {
                            id: "cohort-view",
                            name: "Overview",
                            active: true,
                            render: (cohort, active, opencgaSession) => {
                                return html`
                                    <cohort-view
                                        .opencgaSession="${opencgaSession}"
                                        .cohort="${cohort}">
                                    </cohort-view>
                                `;
                            }
                        },
                        {
                            id: "sample-view",
                            name: "Samples",
                            render: (cohort, active, opencgaSession) => {
                                return html`
                                    <sample-grid
                                        .opencgaSession="${opencgaSession}"
                                        .query="${{cohortIds: cohort.id}}"
                                        .config="${{showSelectCheckbox: false}}"
                                        .active="${active}">
                                    </sample-grid>
                                `;
                            }
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (cohort, active, opencgaSession) => {
                                return html`
                                    <json-viewer
                                        .data="${cohort}"
                                        .active="${active}">
                                    </json-viewer>
                                `;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: ["creationYear[MONTH]", "numSamples[0..10]:1"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Cohort Attributes",
                        filters: [
                            {
                                id: "creationDate",
                                name: "Creation Date",
                                type: "date",
                                allowedValues: ["YEAR", "MONTH", "DAY"],
                                multiple: false,
                                description: "Creation date, you can use 'day', 'month' or 'year' to group by"
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["READY", "DELETED", "NONE", "CALCULATING", "INVALID"],
                                description: "Status"
                            },
                            {
                                id: "type",
                                name: "Type",
                                type: "category",
                                allowedValues: ["CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO", "COLLECTION"],
                                description: "Type"
                            },
                            {
                                id: "numSamples",
                                name: "Number Of Samples",
                                type: "number",
                                description: "Number of samples"
                            },
                            // {
                            //     id: "annotations",
                            //     name: "Aannotations",
                            //     type: "string",
                            //     description: "Annotations, e.g: key1=value(,key2=value)"
                            // }
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

customElements.define("cohort-browser", CohortBrowser);
